package com.aaspass.dto.booking;

public record ScheduleBooking(BookingResponse booking, int lane, int conflictGroup) {
}
