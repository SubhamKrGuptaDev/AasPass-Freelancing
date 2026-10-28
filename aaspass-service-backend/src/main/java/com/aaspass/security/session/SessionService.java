package com.aaspass.security.session;

import com.aaspass.config.security.SecurityProperties;
import com.aaspass.entity.User;
import com.aaspass.exception.ErrorCode;
import com.aaspass.exception.SessionRevokedException;
import com.aaspass.exception.UnauthorizedException;
import com.aaspass.security.token.JwtTokenService;
import com.aaspass.security.token.TokenHashing;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Creates, rotates and revokes login sessions. Refresh tokens are stored only as SHA-256
 * hashes and rotated on every use; a replayed (previous) token revokes the whole session, except
 * within a short grace window after the rotation, where it is treated as a benign multi-tab race or
 * lost response and rejected without revoking.
 * Revocation is permanent and a new login always gets a brand-new session id.
 * Tokens and token hashes are never logged.
 */
@Service
public class SessionService {

    private static final Logger log = LoggerFactory.getLogger(SessionService.class);
    private static final int MAX_USER_AGENT = 255;
    private static final int MAX_IP = 45;
    /** How long after a rotation the previous token is answered with 401 instead of a revocation. */
    static final Duration REUSE_GRACE = Duration.ofSeconds(20);

    private final UserSessionRepository repository;
    private final JwtTokenService jwtTokenService;
    private final SecurityProperties properties;
    private final Clock clock;

    public SessionService(UserSessionRepository repository, JwtTokenService jwtTokenService,
                          SecurityProperties properties, Clock clock) {
        this.repository = repository;
        this.jwtTokenService = jwtTokenService;
        this.properties = properties;
        this.clock = clock;
    }

    /** Opens a brand-new session (new id, new refresh token) for {@code user}. */
    @Transactional
    public IssuedSession open(User user, String userAgent, String ip) {
        Instant now = clock.instant();
        String refreshToken = TokenHashing.newRefreshToken();

        UserSession session = new UserSession();
        session.setSessionId(UUID.randomUUID().toString());
        session.setUser(user);
        session.setRefreshTokenHash(TokenHashing.sha256Hex(refreshToken));
        session.setUserAgent(truncate(userAgent, MAX_USER_AGENT));
        session.setIpAddress(truncate(ip, MAX_IP));
        session.setLastUsedAt(now);
        session.setExpiresAt(now.plus(properties.refreshTokenTtl()));
        UserSession saved = repository.save(session);

        String access = jwtTokenService.issueAccessToken(
                user.getId(), user.getUsername(), saved.getSessionId(), now);
        log.info("Opened session {} for user {}", saved.getSessionId(), user.getId());
        return new IssuedSession(saved, refreshToken, access);
    }

    /**
     * Exchanges a refresh token for a new one under a row lock. The expiry is not extended.
     * Reuse of an already-rotated token revokes the session; that revoke must commit even
     * though an exception is thrown, hence {@code noRollbackFor}.
     */
    @Transactional(noRollbackFor = SessionRevokedException.class)
    public IssuedSession rotate(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new UnauthorizedException("Missing refresh token", ErrorCode.UNAUTHENTICATED);
        }
        String hash = TokenHashing.sha256Hex(refreshToken);
        Instant now = clock.instant();

        UserSession session = repository.findForUpdateByRefreshTokenHash(hash)
                .orElseThrow(() -> unknownTokenFailure(hash, now));
        if (!session.isActive(now)) {
            throw new SessionRevokedException("Session revoked or expired");
        }

        String newToken = TokenHashing.newRefreshToken();
        session.setPreviousRefreshTokenHash(session.getRefreshTokenHash());
        session.setRefreshTokenHash(TokenHashing.sha256Hex(newToken));
        session.setLastUsedAt(now);
        UserSession saved = repository.save(session);

        User user = saved.getUser();
        String access = jwtTokenService.issueAccessToken(
                user.getId(), user.getUsername(), saved.getSessionId(), now);
        return new IssuedSession(saved, newToken, access);
    }

    /**
     * Builds the failure for a token matching no current hash. A previous token presented within
     * {@link #REUSE_GRACE} of the last rotation of an active session is a benign race (another tab
     * rotated first, or the rotation response was lost) and is rejected without revoking; any other
     * replay revokes the session.
     */
    private UnauthorizedException unknownTokenFailure(String hash, Instant now) {
        return repository.findForUpdateByPreviousRefreshTokenHash(hash)
                .<UnauthorizedException>map(session -> {
                    if (isWithinReuseGrace(session, now)) {
                        log.info("Previous refresh token presented within grace window for session {}; not revoking",
                                session.getSessionId());
                        return new UnauthorizedException("Refresh token already rotated", ErrorCode.UNAUTHENTICATED);
                    }
                    if (session.getRevokedAt() == null) {
                        revoke(session, SessionRevokeReason.REUSE_DETECTED, now);
                    }
                    log.warn("Refresh token reuse detected; revoked session {}", session.getSessionId());
                    return new SessionRevokedException("Session revoked");
                })
                .orElseGet(() -> new UnauthorizedException("Invalid refresh token", ErrorCode.UNAUTHENTICATED));
    }

    private static boolean isWithinReuseGrace(UserSession session, Instant now) {
        Instant lastUsed = session.getLastUsedAt();
        return session.isActive(now) && lastUsed != null && !now.isAfter(lastUsed.plus(REUSE_GRACE));
    }

    /** Permanently revokes the session matching the current or previous token hash; no-op if unknown. */
    @Transactional
    public void revokeByRefreshToken(String refreshToken, SessionRevokeReason reason) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return;
        }
        String hash = TokenHashing.sha256Hex(refreshToken);
        Optional<UserSession> found = repository.findForUpdateByRefreshTokenHash(hash);
        if (found.isEmpty()) {
            found = repository.findForUpdateByPreviousRefreshTokenHash(hash);
        }
        found.ifPresent(session -> {
            if (session.getRevokedAt() == null) {
                revoke(session, reason, clock.instant());
                log.info("Revoked session {} ({})", session.getSessionId(), reason);
            }
        });
    }

    /** @return true when the session exists, is not revoked and has not expired. */
    @Transactional(readOnly = true)
    public boolean isActive(String sessionId) {
        if (sessionId == null) {
            return false;
        }
        Instant now = clock.instant();
        return repository.findBySessionId(sessionId).map(s -> s.isActive(now)).orElse(false);
    }

    private void revoke(UserSession session, SessionRevokeReason reason, Instant now) {
        session.setRevokedAt(now);
        session.setRevokeReason(reason);
        repository.save(session);
    }

    private static String truncate(String value, int max) {
        if (value == null) {
            return null;
        }
        return value.length() <= max ? value : value.substring(0, max);
    }
}
