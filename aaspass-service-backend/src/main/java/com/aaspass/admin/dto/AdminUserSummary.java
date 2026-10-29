package com.aaspass.admin.dto;

import com.aaspass.entity.VerificationStatus;
import java.time.Instant;
import java.time.LocalDateTime;

/** One row of the admin user list (no phone/PAN/Aadhaar values). */
public record AdminUserSummary(Long id, String name, String username, String email, String city, String country,
                               VerificationStatus phoneStatus, VerificationStatus panStatus,
                               VerificationStatus aadharStatus, Instant suspendedUntil, int storeCount,
                               LocalDateTime creationDateTime) {
}
