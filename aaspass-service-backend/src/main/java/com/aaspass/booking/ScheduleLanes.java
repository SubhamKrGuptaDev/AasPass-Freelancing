package com.aaspass.booking;

import com.aaspass.entity.booking.Booking;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Pure lane + conflict-group assignment for bookings already sorted by (startAt, endAt). */
public final class ScheduleLanes {

    /** Lane index within a day and the connected-overlap cluster the booking belongs to. */
    public record Placement(int lane, int conflictGroup) {
    }

    private ScheduleLanes() {
    }

    public static Map<Long, Placement> assign(List<Booking> sortedByStart) {
        Map<Long, Placement> result = new LinkedHashMap<>();
        if (sortedByStart == null) {
            return result;
        }
        List<LocalDateTime> lanesEnd = new ArrayList<>();
        int group = -1;
        LocalDateTime groupEnd = LocalDateTime.MIN;
        for (Booking b : sortedByStart) {
            if (b == null || b.getId() == null || b.getStartAt() == null || b.getEndAt() == null) {
                continue;
            }
            if (!b.getStartAt().isBefore(groupEnd)) {
                group++;
                lanesEnd.clear();
            }
            int lane = -1;
            for (int i = 0; i < lanesEnd.size(); i++) {
                if (!lanesEnd.get(i).isAfter(b.getStartAt())) {
                    lane = i;
                    break;
                }
            }
            if (lane < 0) {
                lanesEnd.add(b.getEndAt());
                lane = lanesEnd.size() - 1;
            } else {
                lanesEnd.set(lane, b.getEndAt());
            }
            if (b.getEndAt().isAfter(groupEnd)) {
                groupEnd = b.getEndAt();
            }
            result.put(b.getId(), new Placement(lane, group));
        }
        return result;
    }
}
