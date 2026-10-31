package com.aaspass.dto.booking;

/** Inbox row: a booking plus how many competing requests it overlaps. */
public record OwnerBookingRow(BookingResponse booking, long overlapPendingCount, long overlapConfirmedCount,
                              boolean outsideAvailability) {
}
