package com.aaspass.booking;

import com.aaspass.dto.booking.SlotView;
import com.aaspass.entity.booking.Booking;
import com.aaspass.entity.booking.BookingStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/** Pure slot status and start-time computation for one store-local date. */
public final class SlotCalculator {

    private SlotCalculator() {
    }

    /** Slots laid from each range start in slotMinutes steps; only full slots fit. */
    public static List<SlotView> slots(LocalDate date, List<TimeRange> effective, int slotMinutes,
                                       List<Booking> pendingAndConfirmed, LocalDateTime now) {
        List<SlotView> result = new ArrayList<>();
        for (List<SlotView> range : slotsPerRange(date, effective, slotMinutes, pendingAndConfirmed, now)) {
            result.addAll(range);
        }
        return result;
    }

    /** Slot starts where start + duration stays inside the same range and no covered slot is BOOKED or CLOSED. */
    public static List<LocalTime> startTimes(LocalDate date, List<TimeRange> effective, int slotMinutes,
                                             List<Booking> pendingAndConfirmed, LocalDateTime now,
                                             int durationMinutes) {
        List<LocalTime> result = new ArrayList<>();
        if (slotMinutes <= 0 || durationMinutes < slotMinutes || durationMinutes % slotMinutes != 0) {
            return result;
        }
        int covered = durationMinutes / slotMinutes;
        for (List<SlotView> range : slotsPerRange(date, effective, slotMinutes, pendingAndConfirmed, now)) {
            for (int i = 0; i + covered <= range.size(); i++) {
                boolean ok = true;
                for (int j = i; j < i + covered; j++) {
                    SlotStatus s = range.get(j).status();
                    if (s == SlotStatus.BOOKED || s == SlotStatus.CLOSED) {
                        ok = false;
                        break;
                    }
                }
                if (ok) {
                    result.add(range.get(i).time());
                }
            }
        }
        return result;
    }

    private static List<List<SlotView>> slotsPerRange(LocalDate date, List<TimeRange> effective, int slotMinutes,
                                                      List<Booking> bookings, LocalDateTime now) {
        List<List<SlotView>> result = new ArrayList<>();
        if (date == null || effective == null || slotMinutes <= 0) {
            return result;
        }
        List<Booking> list = bookings == null ? List.of() : bookings;
        for (TimeRange range : effective) {
            if (range == null) {
                continue;
            }
            List<SlotView> slots = new ArrayList<>();
            LocalTime t = range.start();
            // wrap-around guard: plusMinutes past midnight yields an earlier time
            while (!t.plusMinutes(slotMinutes).isAfter(range.end()) && t.plusMinutes(slotMinutes).isAfter(t)) {
                slots.add(view(date, t, slotMinutes, list, now));
                t = t.plusMinutes(slotMinutes);
            }
            result.add(slots);
        }
        return result;
    }

    private static SlotView view(LocalDate date, LocalTime time, int slotMinutes, List<Booking> bookings,
                                 LocalDateTime now) {
        LocalDateTime start = LocalDateTime.of(date, time);
        LocalDateTime end = start.plusMinutes(slotMinutes);
        if (now != null && !start.isAfter(now)) {
            return new SlotView(time, SlotStatus.CLOSED, 0);
        }
        int pending = 0;
        for (Booking b : bookings) {
            if (b == null || b.getStartAt() == null || b.getEndAt() == null
                    || !b.getStartAt().isBefore(end) || !b.getEndAt().isAfter(start)) {
                continue;
            }
            if (b.getStatus() == BookingStatus.CONFIRMED) {
                return new SlotView(time, SlotStatus.BOOKED, 0);
            }
            if (b.getStatus() == BookingStatus.PENDING) {
                pending++;
            }
        }
        return pending > 0
                ? new SlotView(time, SlotStatus.REQUESTED, pending)
                : new SlotView(time, SlotStatus.FREE, 0);
    }
}
