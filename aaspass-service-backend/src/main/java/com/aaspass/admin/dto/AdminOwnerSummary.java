package com.aaspass.admin.dto;

import java.time.Instant;

/** Owner details shown beside a store (no phone/PAN/Aadhaar values). */
public record AdminOwnerSummary(Long id, String name, String username, String email, boolean verified,
                                Instant suspendedUntil) {
}
