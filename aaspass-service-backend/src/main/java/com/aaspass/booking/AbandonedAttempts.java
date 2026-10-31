package com.aaspass.booking;

import com.aaspass.entity.booking.BookingFunnelEvent;
import com.aaspass.entity.booking.FunnelStep;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/** Groups raw funnel events into booking attempts. Pure. */
public final class AbandonedAttempts {

    public static final Duration WINDOW = Duration.ofHours(1);

    private AbandonedAttempts() {
    }

    public record Attempt(String visitorId, Long userId, Long serviceId, LocalDateTime clickedAt,
                          FunnelStep lastStep, boolean booked) {
    }

    /**
     * Each BOOK_CLICK not inside a previous attempt's 1-hour window starts an attempt; events of the same visitor in
     * [click, click+1h) join it. Unbooked attempts whose click is within the last hour are still in progress and are
     * excluded. Abandoned means {@code !booked}.
     *
     * @param events sorted by visitor, then time
     */
    public static List<Attempt> group(List<BookingFunnelEvent> events, LocalDateTime now) {
        List<Attempt> attempts = new ArrayList<>();
        if (events == null || events.isEmpty()) {
            return attempts;
        }
        LocalDateTime inProgressAfter = now.minus(WINDOW);
        int i = 0;
        while (i < events.size()) {
            BookingFunnelEvent click = events.get(i);
            if (click == null || click.getStep() != FunnelStep.BOOK_CLICK || click.getOccurredAt() == null) {
                i++;
                continue;
            }
            LocalDateTime windowEnd = click.getOccurredAt().plus(WINDOW);
            Long userId = null;
            FunnelStep last = FunnelStep.BOOK_CLICK;
            boolean booked = false;
            int j = i;
            while (j < events.size()) {
                BookingFunnelEvent e = events.get(j);
                if (e == null || e.getOccurredAt() == null
                        || !Objects.equals(e.getVisitorId(), click.getVisitorId())
                        || !e.getOccurredAt().isBefore(windowEnd)) {
                    break;
                }
                if (userId == null && e.getUserId() != null) {
                    userId = e.getUserId();
                }
                if (e.getStep() != null && e.getStep().ordinal() > last.ordinal()) {
                    last = e.getStep();
                }
                if (e.getStep() == FunnelStep.BOOKED) {
                    booked = true;
                }
                j++;
            }
            boolean inProgress = !booked && click.getOccurredAt().isAfter(inProgressAfter);
            if (!inProgress) {
                attempts.add(new Attempt(click.getVisitorId(), userId, click.getServiceId(),
                        click.getOccurredAt(), last, booked));
            }
            i = Math.max(j, i + 1);
        }
        return attempts;
    }
}
