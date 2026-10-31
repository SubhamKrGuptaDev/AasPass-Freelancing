package com.aaspass.dto.booking;

import com.aaspass.entity.booking.AvailabilityExceptionType;

import java.time.LocalDate;
import java.time.LocalTime;

public record AvailabilityExceptionResponse(
        Long id,
        LocalDate date,
        AvailabilityExceptionType type,
        LocalTime start,
        LocalTime end,
        String reason,
        long confirmedOutsideCount) {
}
