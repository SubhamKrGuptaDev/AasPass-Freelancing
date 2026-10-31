package com.aaspass.dto.booking;

import com.aaspass.entity.booking.AvailabilityExceptionType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AvailabilityExceptionRequest(
        @NotNull(message = "Date is required") LocalDate date,
        @NotNull(message = "Type is required") AvailabilityExceptionType type,
        LocalTime start,
        LocalTime end,
        @Size(max = 200, message = "Reason must be at most 200 characters") String reason) {
}
