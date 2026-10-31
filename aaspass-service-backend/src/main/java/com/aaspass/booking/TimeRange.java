package com.aaspass.booking;

import java.time.LocalTime;

/** Half-open time-of-day range [start, end). */
public record TimeRange(LocalTime start, LocalTime end) {

    public boolean overlaps(TimeRange o) {
        return o != null && start.isBefore(o.end) && end.isAfter(o.start);
    }
}
