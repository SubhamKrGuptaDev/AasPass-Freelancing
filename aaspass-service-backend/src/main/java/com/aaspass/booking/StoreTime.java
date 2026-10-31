package com.aaspass.booking;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;

/** Store-local (IST) time helpers; all booking logic derives "now" from the injected Clock. */
public final class StoreTime {

    public static final ZoneId ZONE = ZoneId.of("Asia/Kolkata");

    private StoreTime() {
    }

    public static LocalDateTime now(Clock clock) {
        return LocalDateTime.now(clock.withZone(ZONE));
    }

    public static LocalDate today(Clock clock) {
        return LocalDate.now(clock.withZone(ZONE));
    }
}
