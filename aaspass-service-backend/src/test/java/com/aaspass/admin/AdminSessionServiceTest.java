package com.aaspass.admin;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.aaspass.admin.config.AdminProperties;
import com.aaspass.admin.entity.AdminSession;
import com.aaspass.admin.entity.AdminUser;
import com.aaspass.admin.repository.AdminSessionRepository;
import com.aaspass.admin.repository.AdminUserRepository;
import com.aaspass.admin.security.AdminIssuedSession;
import com.aaspass.admin.security.AdminJwtTokenService;
import com.aaspass.admin.security.AdminSessionService;
import com.aaspass.exception.ErrorCode;
import com.aaspass.exception.SessionRevokedException;
import com.aaspass.exception.UnauthorizedException;
import com.aaspass.security.session.SessionRevokeReason;
import com.aaspass.security.token.TokenHashing;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AdminSessionServiceTest {

    @Autowired AdminSessionService sessions;
    @Autowired AdminSessionRepository repository;
    @Autowired AdminUserRepository admins;
    @Autowired AdminJwtTokenService jwtTokenService;
    @Autowired AdminProperties properties;

    private AdminUser admin;

    @BeforeEach
    void loadAdmin() {
        admin = admins.findByEmailIgnoreCase("admin@test.local").orElseThrow();
    }

    @Test
    void openStoresOnlyHashAndUsesAdminTtl() {
        AdminIssuedSession a = sessions.open(admin, "ua", "1.1.1.1");
        assertEquals(TokenHashing.sha256Hex(a.refreshToken()), a.session().getRefreshTokenHash());
        assertEquals(a.session().getLastUsedAt().plus(Duration.ofHours(12)), a.session().getExpiresAt());
        assertTrue(sessions.isActive(a.session().getSessionId()));
    }

    @Test
    void rotateIssuesNewTokenAndKeepsExpiry() {
        AdminIssuedSession a = sessions.open(admin, "ua", "1.1.1.1");
        Instant expiry = a.session().getExpiresAt();
        String oldHash = a.session().getRefreshTokenHash();
        AdminIssuedSession b = sessions.rotate(a.refreshToken());
        assertNotEquals(a.refreshToken(), b.refreshToken());
        assertEquals(expiry, b.session().getExpiresAt());
        assertEquals(oldHash, b.session().getPreviousRefreshTokenHash());
        assertEquals(a.session().getSessionId(), b.session().getSessionId());
    }

    @Test
    void previousTokenWithinGraceWindowIsUnauthenticatedWithoutRevoking() {
        MutableClock clock = new MutableClock(Instant.parse("2026-10-29T10:00:00Z"));
        AdminSessionService timed = new AdminSessionService(repository, jwtTokenService, properties, clock);
        AdminIssuedSession a = timed.open(admin, "ua", "1.1.1.1");
        AdminIssuedSession b = timed.rotate(a.refreshToken());

        clock.advance(Duration.ofSeconds(20));
        UnauthorizedException e = assertThrows(UnauthorizedException.class, () -> timed.rotate(a.refreshToken()));

        assertFalse(e instanceof SessionRevokedException, "a benign race must not be treated as reuse");
        assertEquals(ErrorCode.UNAUTHENTICATED, e.code());
        AdminSession stored = repository.findBySessionId(a.session().getSessionId()).orElseThrow();
        assertNull(stored.getRevokedAt());
        AdminIssuedSession c = timed.rotate(b.refreshToken());
        assertEquals(a.session().getSessionId(), c.session().getSessionId());
    }

    @Test
    void previousTokenAfterGraceWindowRevokesSession() {
        MutableClock clock = new MutableClock(Instant.parse("2026-10-29T10:00:00Z"));
        AdminSessionService timed = new AdminSessionService(repository, jwtTokenService, properties, clock);
        AdminIssuedSession a = timed.open(admin, "ua", "1.1.1.1");
        AdminIssuedSession b = timed.rotate(a.refreshToken());

        clock.advance(Duration.ofSeconds(21));
        assertThrows(SessionRevokedException.class, () -> timed.rotate(a.refreshToken()));

        AdminSession stored = repository.findBySessionId(a.session().getSessionId()).orElseThrow();
        assertEquals(SessionRevokeReason.REUSE_DETECTED, stored.getRevokeReason());
        assertThrows(SessionRevokedException.class, () -> timed.rotate(b.refreshToken()));
    }

    @Test
    void rotateAfterRevokeFails() {
        AdminIssuedSession a = sessions.open(admin, "ua", "1.1.1.1");
        sessions.revokeByRefreshToken(a.refreshToken());
        assertThrows(SessionRevokedException.class, () -> sessions.rotate(a.refreshToken()));
        assertFalse(sessions.isActive(a.session().getSessionId()));
    }

    @Test
    void rotateForInactiveAdminFails() {
        AdminIssuedSession a = sessions.open(admin, "ua", "1.1.1.1");
        admin.setActive(false);
        admins.saveAndFlush(admin);
        assertThrows(SessionRevokedException.class, () -> sessions.rotate(a.refreshToken()));
        assertFalse(sessions.isActive(a.session().getSessionId()));
    }

    @Test
    void missingRefreshTokenIsUnauthenticated() {
        UnauthorizedException e = assertThrows(UnauthorizedException.class, () -> sessions.rotate(" "));
        assertEquals(ErrorCode.UNAUTHENTICATED, e.code());
    }

    /** A clock the test moves explicitly. */
    private static final class MutableClock extends Clock {
        private Instant now;

        MutableClock(Instant start) {
            this.now = start;
        }

        void advance(Duration by) {
            now = now.plus(by);
        }

        @Override
        public ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return now;
        }
    }
}
