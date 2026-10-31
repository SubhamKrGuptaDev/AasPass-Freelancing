package com.aaspass.dto.booking;

import com.aaspass.booking.TimeRange;

import java.time.LocalDate;
import java.util.List;

public record ScheduleDay(LocalDate date,
                          List<TimeRange> openRanges,
                          List<AvailabilityExceptionResponse> exceptions,
                          List<ScheduleBooking> bookings,
                          int laneCount) {
}
