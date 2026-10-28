package com.aaspass.config.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Duration;
import java.util.Base64;
import org.junit.jupiter.api.Test;

class SecurityPropertiesTest {

    private static String b64(int bytes) {
        return Base64.getEncoder().encodeToString(new byte[bytes]);
    }

    @Test
    void rejectsShortJwtSecret() {
        assertThrows(IllegalStateException.class,
                () -> new SecurityProperties(b64(16), b64(32), "", null, null));
    }

    @Test
    void rejectsWrongLengthKycKey() {
        assertThrows(IllegalStateException.class,
                () -> new SecurityProperties(b64(48), b64(31), "", null, null));
    }

    @Test
    void acceptsValidKeys() {
        SecurityProperties p = new SecurityProperties(b64(48), b64(32), "", null, null);
        assertTrue(p.jwtSecretBytes().length >= 32);
        assertEquals(32, p.kycKeyBytes().length);
    }

    @Test
    void appliesDefaults() {
        SecurityProperties p = new SecurityProperties(b64(48), b64(32), null, null, null);
        assertEquals("", p.cookieDomain());
        assertEquals(Duration.ofMinutes(15), p.accessTokenTtl());
        assertEquals(Duration.ofDays(30), p.refreshTokenTtl());
    }

    @Test
    void toStringRedactsSecrets() {
        String jwt = Base64.getEncoder().encodeToString("j".repeat(48).getBytes());
        String kyc = Base64.getEncoder().encodeToString("k".repeat(32).getBytes());
        String s = new SecurityProperties(jwt, kyc, "example.com", null, null).toString();
        assertFalse(s.contains(jwt));
        assertFalse(s.contains(kyc));
        assertTrue(s.contains("example.com"));
    }
}
