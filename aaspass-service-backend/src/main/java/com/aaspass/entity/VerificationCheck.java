package com.aaspass.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Admin verification state of a single identifier. Column names are supplied per use
 * through {@code @AttributeOverrides} on the owning entity.
 */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VerificationCheck {

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false,
            columnDefinition = "VARCHAR(16) NOT NULL DEFAULT 'UNVERIFIED'")
    private VerificationStatus status = VerificationStatus.UNVERIFIED;

    @Column(name = "verification_reason", length = 500)
    private String reason;

    @Column(name = "verified_at")
    private Instant decidedAt;

    @Column(name = "verified_by_admin_id")
    private Long decidedByAdminId;

    /** Returns the check to its initial unverified state, clearing any prior decision. */
    public void reset() {
        this.status = VerificationStatus.UNVERIFIED;
        this.reason = null;
        this.decidedAt = null;
        this.decidedByAdminId = null;
    }

    public void decide(VerificationStatus status, String reason, Long adminId, Instant at) {
        this.status = status == null ? VerificationStatus.UNVERIFIED : status;
        this.reason = reason;
        this.decidedByAdminId = adminId;
        this.decidedAt = at;
    }

    public boolean isVerified() {
        return status == VerificationStatus.VERIFIED;
    }
}
