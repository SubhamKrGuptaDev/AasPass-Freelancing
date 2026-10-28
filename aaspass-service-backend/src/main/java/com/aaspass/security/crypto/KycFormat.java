package com.aaspass.security.crypto;

import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Single source of truth for KYC identifier normalisation and format checks: Aadhaar is 12 digits
 * (spaces and dashes removed), PAN is {@code ABCDE1234F} (trimmed, upper-cased).
 */
public final class KycFormat {

    private static final Pattern AADHAAR = Pattern.compile("^\\d{12}$");
    private static final Pattern PAN = Pattern.compile("^[A-Z]{5}[0-9]{4}[A-Z]$");

    private KycFormat() {
    }

    /** @return the Aadhaar without spaces/dashes, or null for null input */
    public static String normaliseAadhaar(String raw) {
        return raw == null ? null : raw.replaceAll("[\\s-]", "");
    }

    /** @return the PAN trimmed and upper-cased, or null for null input */
    public static String normalisePan(String raw) {
        return raw == null ? null : raw.trim().toUpperCase(Locale.ROOT);
    }

    /** @return true when the already-normalised value is exactly 12 digits */
    public static boolean isValidAadhaar(String normalised) {
        return normalised != null && AADHAAR.matcher(normalised).matches();
    }

    /** @return true when the already-normalised value looks like {@code ABCDE1234F} */
    public static boolean isValidPan(String normalised) {
        return normalised != null && PAN.matcher(normalised).matches();
    }
}
