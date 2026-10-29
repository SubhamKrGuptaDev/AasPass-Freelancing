package com.aaspass.admin.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Duration;
import java.util.Base64;
import org.junit.jupiter.api.Test;

class AdminPropertiesTest {

    private static String b64(int bytes) {
        return Base64.getEncoder().encodeToString(new byte[bytes]);
    }

    @Test
    void rejectsShortSecret() {
        assertThrows(IllegalStateException.class,
                () -> new AdminProperties(b64(16), null, null, null, null, null));
    }

    @Test
    void rejectsMissingSecret() {
        assertThrows(IllegalStateException.class,
                () -> new AdminProperties("", null, null, null, null, null));
    }

    @Test
    void appliesDefaults() {
        AdminProperties p = new AdminProperties(b64(48), null, null, null, null, null);
        assertEquals(Duration.ofMinutes(15), p.accessTokenTtl());
        assertEquals(Duration.ofHours(12), p.refreshTokenTtl());
        assertEquals("AasPass Admin", p.bootstrapName());
        assertTrue(p.jwtSecretBytes().length >= 32);
    }

    @Test
    void toStringRedactsSecrets() {
        String secret = Base64.getEncoder().encodeToString("s".repeat(48).getBytes());
        String s = new AdminProperties(secret, null, null, "a@b.c", "pw-secret-1", null).toString();
        assertTrue(s.contains("***"));
        assertFalse(s.contains(secret));
        assertFalse(s.contains("pw-secret-1"));
    }
}
