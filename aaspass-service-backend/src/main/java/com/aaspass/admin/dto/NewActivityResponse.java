package com.aaspass.admin.dto;

import java.util.List;

/** Users and stores created within the selected period: totals plus the newest rows of each. */
public record NewActivityResponse(
        ActivityPeriod period,
        long newUsers,
        long newStores,
        List<AdminUserSummary> recentUsers,
        List<AdminStoreSummary> recentStores) {
}
