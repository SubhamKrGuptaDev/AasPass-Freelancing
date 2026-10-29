package com.aaspass.security.session;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.aaspass.config.security.SecurityProperties;
import com.aaspass.entity.User;
import com.aaspass.exception.ErrorCode;
import com.aaspass.exception.SessionRevokedException;
import com.aaspass.exception.UnauthorizedException;
import com.aaspass.repository.UserRepository;
import com.aaspass.security.token.JwtTokenService;
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
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class SessionServiceTest {

    @Autowired SessionService sessions;
    @Autowired UserSessionRepository repository;
    @Autowired UserRepository users;
    @Autowired JwtTokenService jwtTokenService;
    @Autowired SecurityProperties properties;

    private User user;

    @BeforeEach
    void loadUser() {
        user = users.findByUsername("aman").orElseThrow();
    }

    @Test
    void openCreatesNewSessionIdEachTime() {
        IssuedSession a = sessions.open(user, "ua", "1.1.1.1");
        IssuedSession b = sessions.open(user, "ua", "1.1.1.1");
        assertNotEquals(a.session().getSessionId(), b.session().getSessionId());
        assertNotEquals(a.refreshToken(), b.refreshToken());
    }

    @Test
    void refreshTokenStoredOnlyAsHash() {
        IssuedSession a = sessions.open(user, "ua", "1.1.1.1");
        assertEquals(TokenHashing.sha256Hex(a.refreshToken()), a.session().getRefreshTokenHash());
        assertNotEquals(a.refreshToken(), a.session().getRefreshTokenHash());
    }

    @Test
    void rotateIssuesNewTokenAndKeepsExpiry() {
        IssuedSession a = sessions.open(user, "ua", "1.1.1.1");
        Instant expiry = a.session().getExpiresAt();
        String oldHash = a.session().getRefreshTokenHash();
        IssuedSession b = sessions.rotate(a.refreshToken());
        assertNotEquals(a.refreshToken(), b.refreshToken());
        assertEquals(expiry, b.session().getExpiresAt());
        assertEquals(oldHash, b.session().getPreviousRefreshTokenHash());
        assertEquals(a.session().getSessionId(), b.session().getSessionId());
    }

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void rotateTwiceWithSameTokenRevokesSession() {
        IssuedSession a = sessions.open(user, "ua", "1.1.1.1");
        try {
            IssuedSession b = sessions.rotate(a.refreshToken());
            // Move past the benign-race grace window so the replay counts as reuse.
            UserSession rotated = repository.findBySessionId(a.session().getSessionId()).orElseThrow();
            rotated.setLastUsedAt(rotated.getLastUsedAt().minus(Duration.ofSeconds(21)));
            repository.saveAndFlush(rotated);
            assertThrows(SessionRevokedException.class, () -> sessions.rotate(a.refreshToken()));

            // No surrounding test transaction: this re-read observes committed state.
            UserSession stored = repository.findBySessionId(a.session().getSessionId()).orElseThrow();
            assertEquals(SessionRevokeReason.REUSE_DETECTED, stored.getRevokeReason());
            assertFalse(sessions.isActive(a.session().getSessionId()));
            assertThrows(SessionRevokedException.class, () -> sessions.rotate(b.refreshToken()));
        } finally {
            repository.findBySessionId(a.session().getSessionId()).ifPresent(repository::delete);
        }
    }

    @Test
    void rotateAfterRevokeFails() {
        IssuedSession a = sessions.open(user, "ua", "1.1.1.1");
        sessions.revokeByRefreshToken(a.refreshToken(), SessionRevokeReason.LOGOUT);
        assertThrows(SessionRevokedException.class, () -> sessions.rotate(a.refreshToken()));
    }

    @Test
    void rotateAfterExpiryFails() {
        IssuedSession a = sessions.open(user, "ua", "1.1.1.1");
        a.session().setExpiresAt(Instant.now().minusSeconds(60));
        repository.saveAndFlush(a.session());
        assertThrows(SessionRevokedException.class, () -> sessions.rotate(a.refreshToken()));
    }

    @Test
    void revokedSessionNeverReactivates() {
        IssuedSession a = sessions.open(user, "ua", "1.1.1.1");
        sessions.revokeByRefreshToken(a.refreshToken(), SessionRevokeReason.LOGOUT);
        IssuedSession b = sessions.open(user, "ua", "1.1.1.1");
        assertNotEquals(a.session().getSessionId(), b.session().getSessionId());
        assertFalse(sessions.isActive(a.session().getSessionId()));
        assertTrue(sessions.isActive(b.session().getSessionId()));
    }

    @Test
    void previousTokenWithinGraceWindowIsUnauthenticatedWithoutRevoking() {
        MutableClock clock = new MutableClock(Instant.parse("2026-10-28T10:00:00Z"));
        SessionService timed = new SessionService(repository, jwtTokenService, properties, clock);
        IssuedSession a = timed.open(user, "ua", "1.1.1.1");
        IssuedSession b = timed.rotate(a.refreshToken());

        clock.advance(Duration.ofSeconds(20));
        UnauthorizedException e = assertThrows(UnauthorizedException.class, () -> timed.rotate(a.refreshToken()));

        assertFalse(e instanceof SessionRevokedException, "a benign race must not be treated as reuse");
        assertEquals(ErrorCode.UNAUTHENTICATED, e.code());
        UserSession stored = repository.findBySessionId(a.session().getSessionId()).orElseThrow();
        assertEquals(null, stored.getRevokedAt());
        assertEquals(null, stored.getRevokeReason());
        // The winning token still works.
        IssuedSession c = timed.rotate(b.refreshToken());
        assertEquals(a.session().getSessionId(), c.session().getSessionId());
    }

    @Test
    void previousTokenAfterGraceWindowRevokesSession() {
        MutableClock clock = new MutableClock(Instant.parse("2026-10-28T10:00:00Z"));
        SessionService timed = new SessionService(repository, jwtTokenService, properties, clock);
        IssuedSession a = timed.open(user, "ua", "1.1.1.1");
        IssuedSession b = timed.rotate(a.refreshToken());

        clock.advance(Duration.ofSeconds(21));
        assertThrows(SessionRevokedException.class, () -> timed.rotate(a.refreshToken()));

        UserSession stored = repository.findBySessionId(a.session().getSessionId()).orElseThrow();
        assertEquals(SessionRevokeReason.REUSE_DETECTED, stored.getRevokeReason());
        assertThrows(SessionRevokedException.class, () -> timed.rotate(b.refreshToken()));
    }

    /** A clock the test moves explicitly. */
    @Test
    void revokeAllForUserRevokesEveryActiveSession() {
        // Clear any sessions committed by non-transactional tests so the count is exact.
        sessions.revokeAllForUser(user.getId(), SessionRevokeReason.LOGOUT);
        IssuedSession a = sessions.open(user, "ua", "1.1.1.1");
        IssuedSession b = sessions.open(user, "ua", "1.1.1.1");

        int count = sessions.revokeAllForUser(user.getId(), SessionRevokeReason.SUSPENDED);

        assertEquals(2, count);
        for (IssuedSession s : new IssuedSession[] {a, b}) {
            UserSession stored = repository.findBySessionId(s.session().getSessionId()).orElseThrow();
            assertNotNull(stored.getRevokedAt());
            assertEquals(SessionRevokeReason.SUSPENDED, stored.getRevokeReason());
        }
    }

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
