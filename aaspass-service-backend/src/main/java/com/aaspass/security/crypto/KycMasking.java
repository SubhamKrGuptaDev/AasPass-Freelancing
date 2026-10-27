package com.aaspass.security.crypto;

/**
 * Masks KYC identifiers for API responses: Aadhaar becomes {@code XXXXXXXX} + last 4,
 * PAN becomes {@code XXXXXX} + last 4. Values shorter than 4 characters are fully masked.
 */
public final class KycMasking {

    private static final int VISIBLE = 4;

    private KycMasking() {
    }

    public static String maskAadhaar(String plain) {
        return mask(plain, "XXXXXXXX");
    }

    public static String maskPan(String plain) {
        return mask(plain, "XXXXXX");
    }

    private static String mask(String plain, String prefix) {
        if (plain == null) {
            return null;
        }
        if (plain.length() < VISIBLE) {
            return "X".repeat(plain.length());
        }
        return prefix + plain.substring(plain.length() - VISIBLE);
    }
}
