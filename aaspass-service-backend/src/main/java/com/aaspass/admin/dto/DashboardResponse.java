package com.aaspass.admin.dto;

import java.util.List;

/** Headline moderation counts plus the newest items awaiting admin attention. */
public record DashboardResponse(
        long totalUsers,
        long totalStores,
        long activeStores,
        long pendingUsers,
        long unreviewedStores,
        long blockedStores,
        long suspendedUsers,
        long newContactRequests,
        List<AdminUserSummary> recentPendingUsers,
        List<AdminStoreSummary> recentUnreviewedStores) {
}
