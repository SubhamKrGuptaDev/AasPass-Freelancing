package com.aaspass.dto.booking;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record BookingDecisionRequest(@NotNull BookingAction action, @Size(max = 500) String ownerNote) {
}
