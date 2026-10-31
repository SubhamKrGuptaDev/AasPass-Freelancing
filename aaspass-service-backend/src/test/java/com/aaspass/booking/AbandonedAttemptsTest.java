package com.aaspass.booking;

import com.aaspass.entity.booking.BookingFunnelEvent;
import com.aaspass.entity.booking.FunnelStep;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AbandonedAttemptsTest {

    private static final LocalDateTime NOW = LocalDateTime.of(2026, 11, 2, 12, 0);
    private static final LocalDateTime T0 = NOW.minusHours(5);

    private static BookingFunnelEvent ev(String visitor, FunnelStep step, LocalDateTime at, Long userId) {
        return BookingFunnelEvent.builder().visitorId(visitor).step(step).occurredAt(at).userId(userId)
                .serviceId(1L).build();
    }

    @Test
    void clickWithoutBookingIsAbandoned() {
        var list = AbandonedAttempts.group(List.of(ev("v", FunnelStep.BOOK_CLICK, T0, null)), NOW);
        assertEquals(1, list.size());
        assertFalse(list.get(0).booked());
    }

    @Test
    void bookingWithinHourNotAbandoned() {
        var list = AbandonedAttempts.group(List.of(
                ev("v", FunnelStep.BOOK_CLICK, T0, null),
                ev("v", FunnelStep.BOOKED, T0.plusMinutes(59), 3L)), NOW);
        assertEquals(1, list.size());
        assertTrue(list.get(0).booked());
        assertEquals(3L, list.get(0).userId());
    }

    @Test
    void bookingAfterHourStillAbandoned() {
        var list = AbandonedAttempts.group(List.of(
                ev("v", FunnelStep.BOOK_CLICK, T0, null),
                ev("v", FunnelStep.BOOKED, T0.plusMinutes(61), null)), NOW);
        assertEquals(1, list.size());
        assertFalse(list.get(0).booked());
    }

    @Test
    void recentClickExcluded() {
        var list = AbandonedAttempts.group(List.of(
                ev("v", FunnelStep.BOOK_CLICK, NOW.minusMinutes(30), null)), NOW);
        assertTrue(list.isEmpty());
    }

    @Test
    void abandonedAttributedViaLaterLoggedInEvent() {
        var list = AbandonedAttempts.group(List.of(
                ev("v", FunnelStep.BOOK_CLICK, T0, null),
                ev("v", FunnelStep.SLOT_SELECTED, T0.plusMinutes(5), 5L)), NOW);
        assertEquals(1, list.size());
        assertEquals(5L, list.get(0).userId());
        assertEquals(FunnelStep.SLOT_SELECTED, list.get(0).lastStep());
    }

    @Test
    void secondClickAfterWindowStartsNewAttempt() {
        var list = AbandonedAttempts.group(List.of(
                ev("v", FunnelStep.BOOK_CLICK, T0, null),
                ev("v", FunnelStep.BOOK_CLICK, T0.plusMinutes(30), null),
                ev("v", FunnelStep.BOOK_CLICK, T0.plusMinutes(70), null),
                ev("w", FunnelStep.BOOK_CLICK, T0, null)), NOW);
        assertEquals(3, list.size());
    }
}
