package com.aaspass.dto.booking;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/** Slots of a store for one date plus the start times valid for the requested duration. */
public record DaySlotsResponse(LocalDate date, boolean open, int slotMinutes, int maxBookingMinutes,
                               List<SlotView> slots, List<LocalTime> startTimes) {
}
