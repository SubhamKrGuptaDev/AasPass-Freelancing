package com.aaspass.admin.dto;

import java.time.LocalDate;
import java.util.List;

/**
 * Time-bucketed admin statistics. Every series list is aligned with {@code buckets}: index
 * {@code i} holds the count for the day, week (Monday start) or month starting at {@code buckets[i]}.
 * Verification counts reflect each item's current decision, so a rejection the user has since
 * replaced with a new value is no longer counted.
 */
public record AdminChartsResponse(
        ActivityPeriod period,
        List<LocalDate> buckets,
        List<Long> newUsers,
        List<Long> newStores,
        List<Long> userItemsVerified,
        List<Long> userItemsRejected,
        List<Long> storesReviewed,
        List<CityCount> topUserCities,
        List<CityCount> topStoreCities) {
}
