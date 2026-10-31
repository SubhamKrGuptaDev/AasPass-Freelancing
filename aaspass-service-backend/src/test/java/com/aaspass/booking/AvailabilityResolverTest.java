package com.aaspass.booking;

import com.aaspass.entity.booking.AvailabilityExceptionType;
import com.aaspass.entity.booking.StoreAvailabilityException;
import com.aaspass.entity.booking.StoreAvailabilityRange;
import org.junit.jupiter.api.Test;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class AvailabilityResolverTest {

    // 2026-11-02 is a Monday.
    private static final LocalDate MONDAY_DATE = LocalDate.of(2026, 11, 2);

    private static TimeRange r(String s, String e) {
        return new TimeRange(LocalTime.parse(s), LocalTime.parse(e));
    }

    private static StoreAvailabilityRange weeklyRange(DayOfWeek d, String s, String e) {
        return StoreAvailabilityRange.builder().dayOfWeek(d)
                .startTime(LocalTime.parse(s)).endTime(LocalTime.parse(e)).build();
    }

    private static StoreAvailabilityException exc(LocalDate date, AvailabilityExceptionType t, String s, String e) {
        return StoreAvailabilityException.builder().date(date).type(t)
                .startTime(s == null ? null : LocalTime.parse(s))
                .endTime(e == null ? null : LocalTime.parse(e)).build();
    }

    @Test
    void weeklyRangesForWeekday() {
        List<StoreAvailabilityRange> weekly = List.of(
                weeklyRange(DayOfWeek.MONDAY, "16:00", "20:00"),
                weeklyRange(DayOfWeek.MONDAY, "09:00", "13:00"),
                weeklyRange(DayOfWeek.TUESDAY, "09:00", "10:00"));
        assertEquals(List.of(r("09:00", "13:00"), r("16:00", "20:00")),
                AvailabilityResolver.effectiveRanges(MONDAY_DATE, weekly, List.of()));
    }

    @Test
    void openExceptionAddsAndMerges() {
        List<StoreAvailabilityRange> weekly = List.of(weeklyRange(DayOfWeek.MONDAY, "09:00", "13:00"));
        List<StoreAvailabilityException> ex = List.of(exc(MONDAY_DATE, AvailabilityExceptionType.OPEN, "12:00", "15:00"));
        assertEquals(List.of(r("09:00", "15:00")), AvailabilityResolver.effectiveRanges(MONDAY_DATE, weekly, ex));
    }

    @Test
    void blockedWholeDayEmpties() {
        List<StoreAvailabilityRange> weekly = List.of(weeklyRange(DayOfWeek.MONDAY, "09:00", "13:00"));
        List<StoreAvailabilityException> ex = List.of(exc(MONDAY_DATE, AvailabilityExceptionType.BLOCKED, null, null));
        assertEquals(List.of(), AvailabilityResolver.effectiveRanges(MONDAY_DATE, weekly, ex));
    }

    @Test
    void blockedPartialSplits() {
        List<StoreAvailabilityRange> weekly = List.of(weeklyRange(DayOfWeek.MONDAY, "09:00", "18:00"));
        List<StoreAvailabilityException> ex = List.of(exc(MONDAY_DATE, AvailabilityExceptionType.BLOCKED, "12:00", "13:00"));
        assertEquals(List.of(r("09:00", "12:00"), r("13:00", "18:00")),
                AvailabilityResolver.effectiveRanges(MONDAY_DATE, weekly, ex));
    }

    @Test
    void otherDatesExceptionsIgnored() {
        List<StoreAvailabilityRange> weekly = List.of(weeklyRange(DayOfWeek.MONDAY, "09:00", "13:00"));
        List<StoreAvailabilityException> ex = List.of(
                exc(MONDAY_DATE.plusDays(7), AvailabilityExceptionType.BLOCKED, null, null),
                exc(MONDAY_DATE.plusDays(1), AvailabilityExceptionType.OPEN, "14:00", "16:00"));
        assertEquals(List.of(r("09:00", "13:00")), AvailabilityResolver.effectiveRanges(MONDAY_DATE, weekly, ex));
    }

    @Test
    void openExceptionOnDayWithoutWeeklyRanges() {
        List<StoreAvailabilityException> ex = List.of(exc(MONDAY_DATE, AvailabilityExceptionType.OPEN, "10:00", "12:00"));
        assertEquals(List.of(r("10:00", "12:00")), AvailabilityResolver.effectiveRanges(MONDAY_DATE, List.of(), ex));
    }

    @Test
    void nullInputsYieldEmpty() {
        assertEquals(List.of(), AvailabilityResolver.effectiveRanges(MONDAY_DATE, null, null));
    }
}
