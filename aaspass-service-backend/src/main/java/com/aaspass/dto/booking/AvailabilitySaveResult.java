package com.aaspass.dto.booking;

/** Saved availability plus the number of future CONFIRMED bookings now outside it (for a warning). */
public record AvailabilitySaveResult(StoreAvailabilityDto availability, long confirmedOutsideCount) {
}
