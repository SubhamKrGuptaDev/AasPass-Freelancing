package com.aaspass.security.crypto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.aaspass.config.security.SecurityProperties;
import java.time.Duration;
import java.util.Base64;
import org.junit.jupiter.api.Test;

class KycCryptoServiceTest {

    private static final String KEY = Base64.getEncoder().encodeToString(new byte[32]);
    private static final String JWT = Base64.getEncoder().encodeToString(new byte[32]);

    private final KycCryptoService service = new KycCryptoService(
            new SecurityProperties(JWT, KEY, "", Duration.ofMinutes(15), Duration.ofDays(30)));

    @Test
    void roundTrip() {
        assertEquals("999988887777", service.decrypt(service.encrypt("999988887777")));
    }

    @Test
    void ciphertextHasPrefix() {
        assertTrue(service.encrypt("999988887777").startsWith("enc:v1:"));
    }

    @Test
    void sameInputDifferentCiphertext() {
        assertNotEquals(service.encrypt("ABCDE1234F"), service.encrypt("ABCDE1234F"));
    }

    @Test
    void tamperedCiphertextThrows() {
        String enc = service.encrypt("999988887777");
        int idx = "enc:v1:".length() + 20;
        char flipped = enc.charAt(idx) == 'A' ? 'B' : 'A';
        String tampered = enc.substring(0, idx) + flipped + enc.substring(idx + 1);
        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> service.decrypt(tampered));
        assertEquals("KYC value could not be decrypted", ex.getMessage());
    }

    @Test
    void nullAndBlankReturnNull() {
        assertNull(service.encrypt(null));
        assertNull(service.encrypt("  "));
        assertNull(service.decrypt(null));
        assertNull(service.decrypt(""));
    }

    @Test
    void isEncryptedDetectsPrefix() {
        assertTrue(KycCryptoService.isEncrypted("enc:v1:abc"));
        assertFalse(KycCryptoService.isEncrypted("999988887777"));
        assertFalse(KycCryptoService.isEncrypted(null));
    }
}
