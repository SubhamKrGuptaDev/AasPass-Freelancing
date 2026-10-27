package com.aaspass.security.session;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.aaspass.entity.User;
import com.aaspass.exception.SessionRevokedException;
import com.aaspass.repository.UserRepository;
import com.aaspass.security.token.TokenHashing;
import java.time.Instant;
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
        IssuedSession b = sessions.rotate(a.refreshToken());
        assertThrows(SessionRevokedException.class, () -> sessions.rotate(a.refreshToken()));

        // No surrounding test transaction: this re-read observes committed state.
        UserSession stored = repository.findBySessionId(a.session().getSessionId()).orElseThrow();
        assertEquals(SessionRevokeReason.REUSE_DETECTED, stored.getRevokeReason());
        assertFalse(sessions.isActive(a.session().getSessionId()));
        assertThrows(SessionRevokedException.class, () -> sessions.rotate(b.refreshToken()));
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
}
