package com.aaspass.booking;

import com.aaspass.entity.booking.AvailabilityExceptionType;
import com.aaspass.exception.BadRequestException;
import org.junit.jupiter.api.Test;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class AvailabilityRulesTest {

    private static TimeRange r(String s, String e) {
        return new TimeRange(LocalTime.parse(s), LocalTime.parse(e));
    }

    private static String messageOf(Map<DayOfWeek, List<TimeRange>> m) {
        return assertThrows(BadRequestException.class, () -> AvailabilityRules.validateRanges(m)).getMessage();
    }

    @Test
    void maxRoundsDownToSlotMultiple() {
        assertEquals(90, AvailabilityRules.maxOrDefault(120, 45));
    }

    @Test
    void maxFloorsAtSlot() {
        assertEquals(90, AvailabilityRules.maxOrDefault(30, 90));
    }

    @Test
    void nullsUseDefaults() {
        assertEquals(30, AvailabilityRules.slotOrDefault(null));
        assertEquals(120, AvailabilityRules.maxOrDefault(null, 30));
    }

    @Test
    void rejectsOverlapSameDay() {
        String msg = messageOf(Map.of(DayOfWeek.MONDAY, List.of(r("09:00", "12:00"), r("11:00", "14:00"))));
        assertEquals("Time ranges on the same day must not overlap", msg);
    }

    @Test
    void rejectsFifthRange() {
        String msg = messageOf(Map.of(DayOfWeek.MONDAY, List.of(
                r("06:00", "07:00"), r("08:00", "09:00"), r("10:00", "11:00"),
                r("12:00", "13:00"), r("14:00", "15:00"))));
        assertEquals("At most 4 time ranges per day", msg);
    }

    @Test
    void rejectsOffGrid() {
        String msg = messageOf(Map.of(DayOfWeek.MONDAY, List.of(r("09:10", "12:00"))));
        assertEquals("Times must be on 15-minute boundaries", msg);
    }

    @Test
    void rejectsEndNotAfterStart() {
        String msg = messageOf(Map.of(DayOfWeek.MONDAY, List.of(r("12:00", "12:00"))));
        assertEquals("End time must be after start time", msg);
    }

    @Test
    void touchingRangesAllowed() {
        assertDoesNotThrow(() -> AvailabilityRules.validateRanges(
                Map.of(DayOfWeek.MONDAY, List.of(r("09:00", "12:00"), r("12:00", "14:00")))));
    }

    @Test
    void rejectsInvalidSlotLength() {
        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> AvailabilityRules.validateSlotMinutes(50));
        assertEquals("Slot length must be one of 15, 30, 45, 60, 90, 120", ex.getMessage());
    }

    @Test
    void blockedWholeDayAllowedButOpenNeedsTimes() {
        assertDoesNotThrow(() -> AvailabilityRules.validateException(AvailabilityExceptionType.BLOCKED, null, null));
        assertThrows(BadRequestException.class,
                () -> AvailabilityRules.validateException(AvailabilityExceptionType.OPEN, null, null));
        assertThrows(BadRequestException.class,
                () -> AvailabilityRules.validateException(AvailabilityExceptionType.BLOCKED,
                        LocalTime.of(9, 0), null));
    }
}
