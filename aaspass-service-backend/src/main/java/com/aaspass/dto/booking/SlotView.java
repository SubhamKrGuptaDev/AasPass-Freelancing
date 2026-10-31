package com.aaspass.dto.booking;

import com.aaspass.booking.SlotStatus;

import java.time.LocalTime;

/** One slot of a day with its status and the number of pending requests overlapping it. */
public record SlotView(LocalTime time, SlotStatus status, int pendingCount) {
}
