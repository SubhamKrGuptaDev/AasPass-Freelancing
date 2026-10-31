package com.aaspass.dto.booking;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record BookingCreateRequest(
        @NotNull Long storeId,
        @NotNull Long serviceId,
        @NotNull LocalDateTime startAt,
        @NotNull Integer durationMinutes,
        @Size(max = 500) String note,
        @Size(max = 64) String visitorId) {
}
