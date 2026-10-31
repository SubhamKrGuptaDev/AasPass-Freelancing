package com.aaspass.booking;

import com.aaspass.entity.booking.Booking;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ScheduleLanesTest {

    private static final LocalDate DAY = LocalDate.of(2026, 11, 2);

    private static Booking b(long id, String start, String end) {
        Booking booking = new Booking();
        org.springframework.test.util.ReflectionTestUtils.setField(booking, "id", id);
        booking.setStartAt(LocalDateTime.of(DAY, LocalTime.parse(start)));
        booking.setEndAt(LocalDateTime.of(DAY, LocalTime.parse(end)));
        return booking;
    }

    @Test
    void emptyYieldsEmptyMap() {
        assertTrue(ScheduleLanes.assign(List.of()).isEmpty());
    }

    @Test
    void nonOverlappingShareLane0() {
        Map<Long, ScheduleLanes.Placement> p = ScheduleLanes.assign(
                List.of(b(1, "09:00", "10:00"), b(2, "10:30", "11:00")));
        assertEquals(0, p.get(1L).lane());
        assertEquals(0, p.get(2L).lane());
    }

    @Test
    void threeMutualOverlapsGetLanes012SameGroup() {
        Map<Long, ScheduleLanes.Placement> p = ScheduleLanes.assign(
                List.of(b(1, "10:00", "11:00"), b(2, "10:00", "11:00"), b(3, "10:00", "11:00")));
        assertEquals(0, p.get(1L).lane());
        assertEquals(1, p.get(2L).lane());
        assertEquals(2, p.get(3L).lane());
        assertEquals(p.get(1L).conflictGroup(), p.get(2L).conflictGroup());
        assertEquals(p.get(1L).conflictGroup(), p.get(3L).conflictGroup());
    }

    @Test
    void chainOverlapSameGroup() {
        Map<Long, ScheduleLanes.Placement> p = ScheduleLanes.assign(
                List.of(b(1, "10:00", "11:00"), b(2, "10:30", "11:30"), b(3, "11:15", "12:00")));
        assertEquals(0, p.get(1L).lane());
        assertEquals(1, p.get(2L).lane());
        assertEquals(0, p.get(3L).lane());
        assertEquals(0, p.get(1L).conflictGroup());
        assertEquals(0, p.get(2L).conflictGroup());
        assertEquals(0, p.get(3L).conflictGroup());
    }

    @Test
    void touchingIsNewGroup() {
        Map<Long, ScheduleLanes.Placement> p = ScheduleLanes.assign(
                List.of(b(1, "10:00", "11:00"), b(2, "11:00", "12:00")));
        assertEquals(0, p.get(1L).conflictGroup());
        assertEquals(1, p.get(2L).conflictGroup());
    }
}
