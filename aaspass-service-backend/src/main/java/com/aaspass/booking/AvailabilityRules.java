package com.aaspass.booking;

import com.aaspass.entity.booking.AvailabilityExceptionType;
import com.aaspass.exception.BadRequestException;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

/** Pure validation and normalisation rules for availability and slot settings. */
public final class AvailabilityRules {

    public static final List<Integer> SLOT_OPTIONS = List.of(15, 30, 45, 60, 90, 120);
    public static final int DEFAULT_SLOT_MINUTES = 30;
    public static final int DEFAULT_MAX_BOOKING_MINUTES = 120;
    public static final int MAX_BOOKING_MINUTES_CAP = 720;
    public static final int MAX_RANGES_PER_DAY = 4;

    private AvailabilityRules() {
    }

    public static int slotOrDefault(Integer slot) {
        return slot == null ? DEFAULT_SLOT_MINUTES : slot;
    }

    /** Null gives the default; otherwise rounds down to a multiple of slot, never below slot. */
    public static int maxOrDefault(Integer max, int slot) {
        int value = max == null ? DEFAULT_MAX_BOOKING_MINUTES : max;
        int rounded = (value / slot) * slot;
        return Math.max(rounded, slot);
    }

    public static void validateSlotMinutes(Integer slot) {
        if (slot == null || !SLOT_OPTIONS.contains(slot)) {
            throw new BadRequestException("Slot length must be one of 15, 30, 45, 60, 90, 120");
        }
    }

    public static void validateRanges(Map<DayOfWeek, List<TimeRange>> byDay) {
        if (byDay == null) {
            return;
        }
        for (List<TimeRange> ranges : byDay.values()) {
            if (ranges == null || ranges.isEmpty()) {
                continue;
            }
            if (ranges.size() > MAX_RANGES_PER_DAY) {
                throw new BadRequestException("At most 4 time ranges per day");
            }
            for (TimeRange r : ranges) {
                validateTimes(r == null ? null : r.start(), r == null ? null : r.end());
            }
            List<TimeRange> sorted = new ArrayList<>(ranges);
            sorted.sort(Comparator.comparing(TimeRange::start));
            for (int i = 1; i < sorted.size(); i++) {
                if (sorted.get(i - 1).overlaps(sorted.get(i))) {
                    throw new BadRequestException("Time ranges on the same day must not overlap");
                }
            }
        }
    }

    /** OPEN needs both times; BLOCKED needs both or neither (whole day). */
    public static void validateException(AvailabilityExceptionType type, LocalTime start, LocalTime end) {
        if (type == AvailabilityExceptionType.BLOCKED && start == null && end == null) {
            return;
        }
        validateTimes(start, end);
    }

    private static void validateTimes(LocalTime start, LocalTime end) {
        if (start == null || end == null) {
            throw new BadRequestException("Start and end time are required");
        }
        if (!onGrid(start) || !onGrid(end)) {
            throw new BadRequestException("Times must be on 15-minute boundaries");
        }
        if (!end.isAfter(start)) {
            throw new BadRequestException("End time must be after start time");
        }
    }

    private static boolean onGrid(LocalTime t) {
        return t.getMinute() % 15 == 0 && t.getSecond() == 0 && t.getNano() == 0;
    }
}
