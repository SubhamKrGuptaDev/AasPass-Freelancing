package com.aaspass.admin.dto;

import java.time.Instant;

/** Full admin view of a single store. */
public record AdminStoreDetail(AdminStoreSummary summary, String tagline, String description,
                               String googleMapLink, String adminBlockReason, Instant adminBlockedAt,
                               Instant adminReviewedAt, AdminOwnerSummary owner) {
}
