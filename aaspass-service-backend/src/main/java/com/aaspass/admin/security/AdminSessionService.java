package com.aaspass.admin.security;

import com.aaspass.admin.config.AdminProperties;
import com.aaspass.admin.entity.AdminSession;
import com.aaspass.admin.entity.AdminUser;
import com.aaspass.admin.repository.AdminSessionRepository;
import com.aaspass.exception.ErrorCode;
import com.aaspass.exception.SessionRevokedException;
import com.aaspass.exception.UnauthorizedException;
import com.aaspass.security.session.SessionRevokeReason;
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
 * Creates, rotates and revokes admin login sessions with the same semantics as the user
 * {@code SessionService}: refresh tokens are stored only as SHA-256 hashes and rotated on every use;
 * a replayed (previous) token revokes the session, except within {@link #REUSE_GRACE} of the last
 * rotation. Additionally a session is only active while its admin account is active.
 * Tokens and token hashes are never logged.
 */
@Service
public class AdminSessionService {

    private static final Logger log = LoggerFactory.getLogger(AdminSessionService.class);
    private static final int MAX_USER_AGENT = 255;
    private static final int MAX_IP = 45;
    /** How long after a rotation the previous token is answered with 401 instead of a revocation. */
    static final Duration REUSE_GRACE = Duration.ofSeconds(20);

    private final AdminSessionRepository repository;
    private final AdminJwtTokenService jwtTokenService;
    private final AdminProperties properties;
    private final Clock clock;

    public AdminSessionService(AdminSessionRepository repository, AdminJwtTokenService jwtTokenService,
                               AdminProperties properties, Clock clock) {
        this.repository = repository;
        this.jwtTokenService = jwtTokenService;
        this.properties = properties;
        this.clock = clock;
    }

    /** Opens a brand-new session (new id, new refresh token) for {@code admin}. */
    @Transactional
    public AdminIssuedSession open(AdminUser admin, String userAgent, String ip) {
        if (admin == null || admin.getId() == null) {
            throw new IllegalArgumentException("A persisted admin is required");
        }
        Instant now = clock.instant();
        String refreshToken = TokenHashing.newRefreshToken();

        AdminSession session = new AdminSession();
        session.setSessionId(UUID.randomUUID().toString());
        session.setAdmin(admin);
        session.setRefreshTokenHash(TokenHashing.sha256Hex(refreshToken));
        session.setUserAgent(truncate(userAgent, MAX_USER_AGENT));
        session.setIpAddress(truncate(ip, MAX_IP));
        session.setLastUsedAt(now);
        session.setExpiresAt(now.plus(properties.refreshTokenTtl()));
        AdminSession saved = repository.save(session);

        String access = jwtTokenService.issueAccessToken(admin.getId(), admin.getEmail(), saved.getSessionId(), now);
        log.info("Opened admin session {} for admin {}", saved.getSessionId(), admin.getId());
        return new AdminIssuedSession(saved, refreshToken, access);
    }

    /**
     * Exchanges a refresh token for a new one under a row lock. The expiry is not extended.
     * Reuse of an already-rotated token revokes the session; that revoke must commit even
     * though an exception is thrown, hence {@code noRollbackFor}. A deactivated admin cannot rotate.
     */
    @Transactional(noRollbackFor = SessionRevokedException.class)
    public AdminIssuedSession rotate(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new UnauthorizedException("Missing refresh token", ErrorCode.UNAUTHENTICATED);
        }
        String hash = TokenHashing.sha256Hex(refreshToken);
        Instant now = clock.instant();

        AdminSession session = repository.findForUpdateByRefreshTokenHash(hash)
                .orElseThrow(() -> unknownTokenFailure(hash, now));
        if (!session.isActive(now)) {
            throw new SessionRevokedException("Session revoked or expired");
        }
        AdminUser admin = session.getAdmin();
        if (!isAdminActive(admin)) {
            log.warn("Refresh refused for admin session {}: admin account inactive", session.getSessionId());
            throw new SessionRevokedException("Session revoked or expired");
        }

        String newToken = TokenHashing.newRefreshToken();
        session.setPreviousRefreshTokenHash(session.getRefreshTokenHash());
        session.setRefreshTokenHash(TokenHashing.sha256Hex(newToken));
        session.setLastUsedAt(now);
        AdminSession saved = repository.save(session);

        String access = jwtTokenService.issueAccessToken(admin.getId(), admin.getEmail(), saved.getSessionId(), now);
        return new AdminIssuedSession(saved, newToken, access);
    }

    /**
     * Builds the failure for a token matching no current hash: a previous token within
     * {@link #REUSE_GRACE} of the last rotation of an active session is a benign race (401 without
     * revoking); any other replay revokes the session.
     */
    private UnauthorizedException unknownTokenFailure(String hash, Instant now) {
        return repository.findForUpdateByPreviousRefreshTokenHash(hash)
                .<UnauthorizedException>map(session -> {
                    if (isWithinReuseGrace(session, now)) {
                        log.info("Previous admin refresh token presented within grace window for session {}; not revoking",
                                session.getSessionId());
                        return new UnauthorizedException("Refresh token already rotated", ErrorCode.UNAUTHENTICATED);
                    }
                    if (session.getRevokedAt() == null) {
                        revoke(session, SessionRevokeReason.REUSE_DETECTED, now);
                    }
                    log.warn("Admin refresh token reuse detected; revoked session {}", session.getSessionId());
                    return new SessionRevokedException("Session revoked");
                })
                .orElseGet(() -> new UnauthorizedException("Invalid refresh token", ErrorCode.UNAUTHENTICATED));
    }

    private static boolean isWithinReuseGrace(AdminSession session, Instant now) {
        Instant lastUsed = session.getLastUsedAt();
        return session.isActive(now) && lastUsed != null && !now.isAfter(lastUsed.plus(REUSE_GRACE));
    }

    /** Permanently revokes (reason {@code LOGOUT}) the session matching the current or previous token hash; no-op if unknown. */
    @Transactional
    public void revokeByRefreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return;
        }
        String hash = TokenHashing.sha256Hex(refreshToken);
        Optional<AdminSession> found = repository.findForUpdateByRefreshTokenHash(hash);
        if (found.isEmpty()) {
            found = repository.findForUpdateByPreviousRefreshTokenHash(hash);
        }
        found.ifPresent(session -> {
            if (session.getRevokedAt() == null) {
                revoke(session, SessionRevokeReason.LOGOUT, clock.instant());
                log.info("Revoked admin session {} ({})", session.getSessionId(), SessionRevokeReason.LOGOUT);
            }
        });
    }

    /** @return true when the session exists, is not revoked, has not expired and its admin is active. */
    @Transactional(readOnly = true)
    public boolean isActive(String sessionId) {
        if (sessionId == null) {
            return false;
        }
        Instant now = clock.instant();
        return repository.findBySessionId(sessionId)
                .map(s -> s.isActive(now) && isAdminActive(s.getAdmin()))
                .orElse(false);
    }

    private static boolean isAdminActive(AdminUser admin) {
        return admin != null && Boolean.TRUE.equals(admin.getActive());
    }

    private void revoke(AdminSession session, SessionRevokeReason reason, Instant now) {
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
