package com.aaspass.dto.booking;

public record ServiceFunnelRow(Long serviceId, String name, long clicks, long bookings, long confirmed,
                               double conversionPercent) {
}
