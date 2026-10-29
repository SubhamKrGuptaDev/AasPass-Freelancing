package com.aaspass.admin.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.aaspass.admin.dto.ActivityPeriod;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;

/** Bucket boundaries for the admin Charts screen. */
class AdminChartServiceBucketTest {

    // A Thursday.
    private static final LocalDate TODAY = LocalDate.of(2026, 10, 29);

    @Test
    void dailyBucketsAreTheLastThirtyDaysEndingToday() {
        List<LocalDate> buckets = AdminChartService.buckets(ActivityPeriod.DAILY, TODAY);
        assertEquals(30, buckets.size());
        assertEquals(LocalDate.of(2026, 9, 30), buckets.get(0));
        assertEquals(TODAY, buckets.get(29));
        assertEquals(29, AdminChartService.bucketIndex(buckets, ActivityPeriod.DAILY, TODAY));
        assertEquals(0, AdminChartService.bucketIndex(buckets, ActivityPeriod.DAILY, LocalDate.of(2026, 9, 30)));
        assertEquals(-1, AdminChartService.bucketIndex(buckets, ActivityPeriod.DAILY, LocalDate.of(2026, 9, 29)));
        assertEquals(-1, AdminChartService.bucketIndex(buckets, ActivityPeriod.DAILY, TODAY.plusDays(1)));
    }

    @Test
    void weeklyBucketsStartOnMonday() {
        List<LocalDate> buckets = AdminChartService.buckets(ActivityPeriod.WEEKLY, TODAY);
        assertEquals(12, buckets.size());
        assertEquals(LocalDate.of(2026, 10, 26), buckets.get(11));
        assertEquals(LocalDate.of(2026, 8, 10), buckets.get(0));
        assertEquals(11, AdminChartService.bucketIndex(buckets, ActivityPeriod.WEEKLY, LocalDate.of(2026, 11, 1)));
        assertEquals(10, AdminChartService.bucketIndex(buckets, ActivityPeriod.WEEKLY, LocalDate.of(2026, 10, 25)));
        assertEquals(-1, AdminChartService.bucketIndex(buckets, ActivityPeriod.WEEKLY, LocalDate.of(2026, 8, 9)));
    }

    @Test
    void monthlyBucketsStartOnTheFirst() {
        List<LocalDate> buckets = AdminChartService.buckets(ActivityPeriod.MONTHLY, TODAY);
        assertEquals(12, buckets.size());
        assertEquals(LocalDate.of(2025, 11, 1), buckets.get(0));
        assertEquals(LocalDate.of(2026, 10, 1), buckets.get(11));
        assertEquals(11, AdminChartService.bucketIndex(buckets, ActivityPeriod.MONTHLY, TODAY));
        assertEquals(0, AdminChartService.bucketIndex(buckets, ActivityPeriod.MONTHLY, LocalDate.of(2025, 11, 30)));
        assertEquals(-1, AdminChartService.bucketIndex(buckets, ActivityPeriod.MONTHLY, LocalDate.of(2025, 10, 31)));
    }
}
