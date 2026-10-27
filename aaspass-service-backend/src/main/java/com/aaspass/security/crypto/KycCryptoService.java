package com.aaspass.security.crypto;

import com.aaspass.config.security.SecurityProperties;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Component;

/**
 * Encrypts and decrypts sensitive KYC values (Aadhaar, PAN) with AES-256-GCM.
 * Stored format is {@code enc:v1:} + base64(iv(12) || ciphertext || tag(128 bit)).
 * Plaintext and ciphertext are never logged or included in exception messages.
 */
@Component
public class KycCryptoService {

    static final String PREFIX = "enc:v1:";
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int IV_BYTES = 12;
    private static final int TAG_BITS = 128;

    private final SecretKeySpec key;
    private final SecureRandom random = new SecureRandom();

    public KycCryptoService(SecurityProperties properties) {
        this.key = new SecretKeySpec(properties.kycKeyBytes(), "AES");
    }

    /** @return the encrypted form of {@code plain}, or {@code null} when it is null/blank. */
    public String encrypt(String plain) {
        if (plain == null || plain.isBlank()) {
            return null;
        }
        try {
            byte[] iv = new byte[IV_BYTES];
            random.nextBytes(iv);
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(TAG_BITS, iv));
            byte[] encrypted = cipher.doFinal(plain.getBytes(StandardCharsets.UTF_8));
            byte[] out = ByteBuffer.allocate(iv.length + encrypted.length).put(iv).put(encrypted).array();
            return PREFIX + Base64.getEncoder().encodeToString(out);
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("KYC value could not be encrypted", e);
        }
    }

    /**
     * @return the decrypted value, or {@code null} when {@code stored} is null/blank.
     * @throws IllegalStateException if the value is malformed, tampered with, or the key is wrong
     */
    public String decrypt(String stored) {
        if (stored == null || stored.isBlank()) {
            return null;
        }
        try {
            if (!isEncrypted(stored)) {
                throw new IllegalArgumentException("missing prefix");
            }
            byte[] raw = Base64.getDecoder().decode(stored.substring(PREFIX.length()));
            if (raw.length <= IV_BYTES) {
                throw new IllegalArgumentException("too short");
            }
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(TAG_BITS, raw, 0, IV_BYTES));
            byte[] plain = cipher.doFinal(raw, IV_BYTES, raw.length - IV_BYTES);
            return new String(plain, StandardCharsets.UTF_8);
        } catch (GeneralSecurityException | IllegalArgumentException e) {
            throw new IllegalStateException("KYC value could not be decrypted");
        }
    }

    /** @return true when {@code stored} carries the encrypted-value prefix. */
    public static boolean isEncrypted(String stored) {
        return stored != null && stored.startsWith(PREFIX);
    }
}
