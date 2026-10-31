package com.aaspass.booking;

import com.aaspass.entity.booking.AvailabilityExceptionType;
import com.aaspass.entity.booking.StoreAvailabilityException;
import com.aaspass.entity.booking.StoreAvailabilityRange;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/** Pure: effective availability of a date = weekly ranges + OPEN exceptions - BLOCKED exceptions. */
public final class AvailabilityResolver {

    private AvailabilityResolver() {
    }

    public static List<TimeRange> effectiveRanges(LocalDate date,
                                                  List<StoreAvailabilityRange> weekly,
                                                  List<StoreAvailabilityException> exceptions) {
        if (date == null) {
            return List.of();
        }
        List<TimeRange> open = new ArrayList<>();
        if (weekly != null) {
            for (StoreAvailabilityRange w : weekly) {
                if (w != null && date.getDayOfWeek() == w.getDayOfWeek()
                        && w.getStartTime() != null && w.getEndTime() != null) {
                    open.add(new TimeRange(w.getStartTime(), w.getEndTime()));
                }
            }
        }
        List<TimeRange> blocked = new ArrayList<>();
        if (exceptions != null) {
            for (StoreAvailabilityException e : exceptions) {
                if (e == null || !date.equals(e.getDate())) {
                    continue;
                }
                if (e.getType() == AvailabilityExceptionType.OPEN) {
                    if (e.getStartTime() != null && e.getEndTime() != null) {
                        open.add(new TimeRange(e.getStartTime(), e.getEndTime()));
                    }
                } else if (e.getType() == AvailabilityExceptionType.BLOCKED) {
                    if (e.getStartTime() == null || e.getEndTime() == null) {
                        return List.of();
                    }
                    blocked.add(new TimeRange(e.getStartTime(), e.getEndTime()));
                }
            }
        }
        List<TimeRange> result = merge(open);
        for (TimeRange b : blocked) {
            result = subtract(result, b);
        }
        return result;
    }

    private static List<TimeRange> merge(List<TimeRange> ranges) {
        List<TimeRange> sorted = new ArrayList<>(ranges);
        sorted.sort(Comparator.comparing(TimeRange::start));
        List<TimeRange> merged = new ArrayList<>();
        for (TimeRange r : sorted) {
            if (!merged.isEmpty()) {
                TimeRange last = merged.get(merged.size() - 1);
                if (!r.start().isAfter(last.end())) {
                    LocalTime end = r.end().isAfter(last.end()) ? r.end() : last.end();
                    merged.set(merged.size() - 1, new TimeRange(last.start(), end));
                    continue;
                }
            }
            merged.add(r);
        }
        return merged;
    }

    private static List<TimeRange> subtract(List<TimeRange> ranges, TimeRange block) {
        List<TimeRange> out = new ArrayList<>();
        for (TimeRange r : ranges) {
            if (!r.overlaps(block)) {
                out.add(r);
                continue;
            }
            if (r.start().isBefore(block.start())) {
                out.add(new TimeRange(r.start(), block.start()));
            }
            if (r.end().isAfter(block.end())) {
                out.add(new TimeRange(block.end(), r.end()));
            }
        }
        return out;
    }
}
