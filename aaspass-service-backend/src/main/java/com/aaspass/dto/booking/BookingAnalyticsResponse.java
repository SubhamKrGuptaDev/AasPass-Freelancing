package com.aaspass.dto.booking;

import java.time.LocalDate;
import java.util.List;

public record BookingAnalyticsResponse(String period, List<FunnelStepCount> funnel, long confirmed,
                                       long abandonedCount, double abandonedPercent, List<LocalDate> buckets,
                                       List<Long> clicks, List<Long> bookings, List<Long> abandoned,
                                       List<ServiceFunnelRow> services, long pendingCount) {
}
