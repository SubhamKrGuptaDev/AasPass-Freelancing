package com.aaspass.dto.booking;

public record BookingDecisionResult(BookingResponse booking, int autoRejectedCount) {
}
