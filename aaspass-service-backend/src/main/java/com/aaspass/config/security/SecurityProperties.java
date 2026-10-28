package com.aaspass.config.security;

import java.time.Duration;
import java.util.Base64;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Typed security settings bound from the {@code aaspass.security.*} properties.
 * Holds the base64-encoded JWT signing secret and KYC encryption key, the optional
 * cookie domain, and the access/refresh token lifetimes. Keys are validated at startup
 * so a misconfigured deployment fails fast instead of at first use.
 */
@ConfigurationProperties(prefix = "aaspass.security")
public record SecurityProperties(
        String jwtSecret,
        String kycKey,
        String cookieDomain,
        Duration accessTokenTtl,
        Duration refreshTokenTtl) {

    private static final int MIN_JWT_SECRET_BYTES = 32;
    private static final int KYC_KEY_BYTES = 32;

    public SecurityProperties {
        cookieDomain = cookieDomain == null ? "" : cookieDomain;
        accessTokenTtl = accessTokenTtl == null ? Duration.ofMinutes(15) : accessTokenTtl;
        refreshTokenTtl = refreshTokenTtl == null ? Duration.ofDays(30) : refreshTokenTtl;
        if (decode(jwtSecret, "aaspass.security.jwt-secret").length < MIN_JWT_SECRET_BYTES) {
            throw new IllegalStateException(
                    "aaspass.security.jwt-secret must decode to at least " + MIN_JWT_SECRET_BYTES + " bytes");
        }
        if (decode(kycKey, "aaspass.security.kyc-key").length != KYC_KEY_BYTES) {
            throw new IllegalStateException(
                    "aaspass.security.kyc-key must decode to exactly " + KYC_KEY_BYTES + " bytes");
        }
    }

    /** Redacts secrets so they never reach logs. */
    @Override
    public String toString() {
        return "SecurityProperties[jwtSecret=***, kycKey=***, cookieDomain=" + cookieDomain
                + ", accessTokenTtl=" + accessTokenTtl + ", refreshTokenTtl=" + refreshTokenTtl + "]";
    }

    /** @return the base64-decoded JWT signing secret. */
    public byte[] jwtSecretBytes() {
        return decode(jwtSecret, "aaspass.security.jwt-secret");
    }

    /** @return the base64-decoded AES KYC encryption key. */
    public byte[] kycKeyBytes() {
        return decode(kycKey, "aaspass.security.kyc-key");
    }

    private static byte[] decode(String value, String name) {
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(name + " is not configured");
        }
        try {
            return Base64.getDecoder().decode(value.trim());
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException(name + " is not valid base64", e);
        }
    }
}
