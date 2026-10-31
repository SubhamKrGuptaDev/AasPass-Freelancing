package com.aaspass.dto.booking;

import java.time.DayOfWeek;
import java.time.LocalTime;

/** One weekly opening range in store-local time. */
public record AvailabilityRangeDto(DayOfWeek day, LocalTime start, LocalTime end) {
}
