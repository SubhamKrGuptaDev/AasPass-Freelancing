package com.aaspass.dto.booking;

import com.aaspass.entity.booking.FunnelStep;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** One client-reported funnel step; {@code BOOKED} is recorded by the server only. */
public record FunnelEventRequest(
        @NotNull FunnelStep step,
        Long serviceId,
        @NotBlank @Size(max = 64) String visitorId) {
}
