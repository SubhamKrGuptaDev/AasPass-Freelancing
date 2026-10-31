package com.aaspass.booking;

import com.aaspass.dto.booking.SlotView;
import com.aaspass.entity.booking.Booking;
import com.aaspass.entity.booking.BookingStatus;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SlotCalculatorTest {

    private static final LocalDate DATE = LocalDate.of(2030, 1, 7);
    private static final LocalDateTime LONG_AGO = LocalDateTime.of(2020, 1, 1, 0, 0);

    private static TimeRange r(int sh, int sm, int eh, int em) {
        return new TimeRange(LocalTime.of(sh, sm), LocalTime.of(eh, em));
    }

    private static Booking b(BookingStatus status, int sh, int sm, int eh, int em) {
        return Booking.builder().status(status)
                .startAt(LocalDateTime.of(DATE, LocalTime.of(sh, sm)))
                .endAt(LocalDateTime.of(DATE, LocalTime.of(eh, em))).build();
    }

    private static SlotView at(List<SlotView> slots, int h, int m) {
        return slots.stream().filter(s -> s.time().equals(LocalTime.of(h, m))).findFirst().orElseThrow();
    }

    @Test
    void fortyFiveMinuteSlotsDropRemainder() {
        // 240 min / 45 = 5 full slots (last 12:00-12:45); the 15 min remainder is dropped
        List<SlotView> slots = SlotCalculator.slots(DATE, List.of(r(9, 0, 13, 0)), 45, List.of(), LONG_AGO);
        assertEquals(List.of(LocalTime.of(9, 0), LocalTime.of(9, 45), LocalTime.of(10, 30), LocalTime.of(11, 15),
                LocalTime.of(12, 0)),
                slots.stream().map(SlotView::time).toList());
    }

    @Test
    void startTimesNeverCrossRangeEnd() {
        List<LocalTime> times = SlotCalculator.startTimes(DATE, List.of(r(9, 0, 13, 0), r(14, 0, 18, 0)), 30,
                List.of(), LONG_AGO, 60);
        assertTrue(times.contains(LocalTime.of(12, 0)));
        assertFalse(times.contains(LocalTime.of(12, 30)));
        assertFalse(times.contains(LocalTime.of(13, 30)));
    }

    @Test
    void confirmedBlocksPendingCounts() {
        List<Booking> bookings = List.of(b(BookingStatus.CONFIRMED, 10, 0, 11, 0),
                b(BookingStatus.PENDING, 11, 0, 12, 0), b(BookingStatus.PENDING, 11, 0, 12, 0));
        List<SlotView> slots = SlotCalculator.slots(DATE, List.of(r(9, 0, 13, 0)), 30, bookings, LONG_AGO);
        assertEquals(SlotStatus.BOOKED, at(slots, 10, 0).status());
        assertEquals(SlotStatus.BOOKED, at(slots, 10, 30).status());
        assertEquals(SlotStatus.REQUESTED, at(slots, 11, 0).status());
        assertEquals(2, at(slots, 11, 0).pendingCount());
        assertEquals(SlotStatus.FREE, at(slots, 9, 30).status());
    }

    @Test
    void bookedUsesIntervalsNotGrid() {
        List<SlotView> slots = SlotCalculator.slots(DATE, List.of(r(9, 0, 13, 0)), 30,
                List.of(b(BookingStatus.CONFIRMED, 10, 15, 11, 0)), LONG_AGO);
        assertEquals(SlotStatus.BOOKED, at(slots, 10, 0).status());
        assertEquals(SlotStatus.BOOKED, at(slots, 10, 30).status());
        assertEquals(SlotStatus.FREE, at(slots, 11, 0).status());
    }

    @Test
    void pastSlotsClosed() {
        LocalDateTime now = LocalDateTime.of(DATE, LocalTime.of(10, 5));
        List<SlotView> slots = SlotCalculator.slots(DATE, List.of(r(9, 0, 13, 0)), 30, List.of(), now);
        assertEquals(SlotStatus.CLOSED, at(slots, 9, 0).status());
        assertEquals(SlotStatus.CLOSED, at(slots, 9, 30).status());
        assertEquals(SlotStatus.CLOSED, at(slots, 10, 0).status());
        assertEquals(SlotStatus.FREE, at(slots, 10, 30).status());
    }
}
