package com.aaspass.admin.config;

import java.time.Duration;
import java.util.Base64;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Typed admin-panel settings bound from {@code aaspass.admin.*}. The JWT secret is validated at
 * startup so a misconfigured deployment fails fast. Bootstrap credentials seed the first admin.
 */
@ConfigurationProperties(prefix = "aaspass.admin")
public record AdminProperties(
        String jwtSecret,
        Duration accessTokenTtl,
        Duration refreshTokenTtl,
        String bootstrapEmail,
        String bootstrapPassword,
        String bootstrapName) {

    private static final int MIN_JWT_SECRET_BYTES = 32;

    public AdminProperties {
        accessTokenTtl = accessTokenTtl == null ? Duration.ofMinutes(15) : accessTokenTtl;
        refreshTokenTtl = refreshTokenTtl == null ? Duration.ofHours(12) : refreshTokenTtl;
        bootstrapName = bootstrapName == null || bootstrapName.isBlank() ? "AasPass Admin" : bootstrapName;
        if (decode(jwtSecret).length < MIN_JWT_SECRET_BYTES) {
            throw new IllegalStateException(
                    "aaspass.admin.jwt-secret must decode to at least " + MIN_JWT_SECRET_BYTES + " bytes");
        }
    }

    /** Redacts secrets so they never reach logs. */
    @Override
    public String toString() {
        return "AdminProperties[jwtSecret=***, accessTokenTtl=" + accessTokenTtl
                + ", refreshTokenTtl=" + refreshTokenTtl + ", bootstrapEmail=" + bootstrapEmail
                + ", bootstrapPassword=***, bootstrapName=" + bootstrapName + "]";
    }

    /** @return the base64-decoded JWT signing secret. */
    public byte[] jwtSecretBytes() {
        return decode(jwtSecret);
    }

    private static byte[] decode(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalStateException("aaspass.admin.jwt-secret is not configured");
        }
        try {
            return Base64.getDecoder().decode(value.trim());
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException("aaspass.admin.jwt-secret is not valid base64", e);
        }
    }
}
