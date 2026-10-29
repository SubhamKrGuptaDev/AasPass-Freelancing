package com.aaspass.admin.dto;

import com.aaspass.exception.BadRequestException;
import java.util.Locale;

/** The user identifiers an admin can verify or reject. */
public enum VerificationItem {
    PHONE("Phone"),
    PAN("PAN"),
    AADHAR("Aadhaar");

    private final String label;

    VerificationItem(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }

    /**
     * Parses the {@code {item}} path segment.
     *
     * @throws BadRequestException when the value is not phone, pan or aadhar (case-insensitive)
     */
    public static VerificationItem fromPath(String value) {
        if (value != null) {
            String v = value.trim().toLowerCase(Locale.ROOT);
            for (VerificationItem item : values()) {
                if (item.name().toLowerCase(Locale.ROOT).equals(v)) {
                    return item;
                }
            }
        }
        throw new BadRequestException("Unknown verification item: " + value);
    }
}
