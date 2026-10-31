package com.aaspass.service.booking;

import com.aaspass.booking.AbandonedAttempts;
import com.aaspass.booking.AbandonedAttempts.Attempt;
import com.aaspass.booking.AnalyticsPeriod;
import com.aaspass.booking.StoreTime;
import com.aaspass.dto.booking.AbandonedAttemptRow;
import com.aaspass.dto.booking.BookingAnalyticsResponse;
import com.aaspass.dto.booking.FunnelStepCount;
import com.aaspass.dto.booking.ServiceFunnelRow;
import com.aaspass.entity.StoreServiceItem;
import com.aaspass.entity.User;
import com.aaspass.entity.booking.Booking;
import com.aaspass.entity.booking.BookingFunnelEvent;
import com.aaspass.entity.booking.BookingStatus;
import com.aaspass.entity.booking.FunnelStep;
import com.aaspass.repository.StoreServiceItemRepository;
import com.aaspass.repository.UserRepository;
import com.aaspass.repository.booking.BookingFunnelEventRepository;
import com.aaspass.repository.booking.BookingRepository;
import com.aaspass.service.StoreService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import com.aaspass.util.AvatarGenerator;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Owner booking analytics. Every visitor-based figure (funnel, trend clicks/bookings, per-service clicks/bookings)
 * counts DISTINCT visitors; abandoned figures count attempts (see {@link AbandonedAttempts}).
 */
@Service
public class BookingAnalyticsService {

    private static final LocalDateTime EPOCH = LocalDateTime.of(2000, 1, 1, 0, 0);
    private static final List<BookingStatus> CONFIRMED_STATUSES =
            List.of(BookingStatus.CONFIRMED, BookingStatus.COMPLETED);
    private static final String DELETED_SERVICE = "Deleted service";

    private final BookingFunnelEventRepository eventRepository;
    private final BookingRepository bookingRepository;
    private final StoreServiceItemRepository serviceItemRepository;
    private final UserRepository userRepository;
    private final StoreService storeService;
    private final Clock clock;

    public BookingAnalyticsService(BookingFunnelEventRepository eventRepository, BookingRepository bookingRepository,
                                   StoreServiceItemRepository serviceItemRepository, UserRepository userRepository,
                                   StoreService storeService, Clock clock) {
        this.eventRepository = eventRepository;
        this.bookingRepository = bookingRepository;
        this.serviceItemRepository = serviceItemRepository;
        this.userRepository = userRepository;
        this.storeService = storeService;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public BookingAnalyticsResponse analytics(Long storeId, Long callerId, AnalyticsPeriod period) {
        storeService.assertStoreOwner(storeId, callerId);
        LocalDateTime now = StoreTime.now(clock);
        LocalDate today = now.toLocalDate();
        LocalDate startDate = period.start(today);
        LocalDateTime periodStart = startDate == null ? EPOCH : startDate.atStartOfDay();

        List<BookingFunnelEvent> loaded = loadEvents(storeId, startDate);
        List<BookingFunnelEvent> events = loaded.stream()
                .filter(e -> e.getOccurredAt() != null && !e.getOccurredAt().isBefore(periodStart))
                .toList();

        // Funnel: distinct visitors per step.
        Map<FunnelStep, Set<String>> byStep = new HashMap<>();
        for (BookingFunnelEvent e : events) {
            if (e.getStep() != null) {
                byStep.computeIfAbsent(e.getStep(), k -> new HashSet<>()).add(e.getVisitorId());
            }
        }
        List<FunnelStepCount> funnel = new ArrayList<>();
        long previous = 0;
        for (FunnelStep step : FunnelStep.values()) {
            long visitors = byStep.getOrDefault(step, Set.of()).size();
            double pct = step == FunnelStep.BOOK_CLICK ? 100.0 : percent(visitors, previous);
            funnel.add(new FunnelStepCount(step, visitors, pct));
            previous = visitors;
        }

        // Attempts clicked within the period.
        List<Attempt> attempts = AbandonedAttempts.group(loaded, now).stream()
                .filter(a -> !a.clickedAt().isBefore(periodStart))
                .toList();
        long abandonedCount = attempts.stream().filter(a -> !a.booked()).count();
        // Denominator is attempts in the period (each starts with a click), so the percent never exceeds 100.
        double abandonedPercent = percent(abandonedCount, attempts.size());

        // Daily trend, oldest first, today inclusive.
        LocalDate trendStart = period.trendStart(today);
        int days = (int) (today.toEpochDay() - trendStart.toEpochDay()) + 1;
        List<LocalDate> buckets = new ArrayList<>(days);
        for (int i = 0; i < days; i++) {
            buckets.add(trendStart.plusDays(i));
        }
        List<Long> clicks = dailyDistinct(events, FunnelStep.BOOK_CLICK, trendStart, days);
        List<Long> bookings = dailyDistinct(events, FunnelStep.BOOKED, trendStart, days);
        long[] abandonedDaily = new long[days];
        for (Attempt a : attempts) {
            int idx = (int) (a.clickedAt().toLocalDate().toEpochDay() - trendStart.toEpochDay());
            if (!a.booked() && idx >= 0 && idx < days) {
                abandonedDaily[idx]++;
            }
        }
        List<Long> abandoned = new ArrayList<>(days);
        for (long v : abandonedDaily) {
            abandoned.add(v);
        }

        List<Booking> confirmedBookings = bookingRepository.findDecidedSince(storeId, CONFIRMED_STATUSES, periodStart);

        return new BookingAnalyticsResponse(period.param(), funnel, confirmedBookings.size(), abandonedCount,
                abandonedPercent, buckets, clicks, bookings, abandoned,
                services(storeId, events, confirmedBookings),
                bookingRepository.countByStoreIdAndStatus(storeId, BookingStatus.PENDING));
    }

    @Transactional(readOnly = true)
    public Page<AbandonedAttemptRow> abandoned(Long storeId, Long callerId, AnalyticsPeriod period,
                                               Pageable pageable) {
        storeService.assertStoreOwner(storeId, callerId);
        LocalDateTime now = StoreTime.now(clock);
        LocalDate startDate = period.start(now.toLocalDate());
        LocalDateTime periodStart = startDate == null ? EPOCH : startDate.atStartOfDay();

        List<Attempt> all = AbandonedAttempts.group(loadEvents(storeId, startDate), now).stream()
                .filter(a -> !a.booked() && a.userId() != null && !a.clickedAt().isBefore(periodStart))
                .sorted(Comparator.comparing(Attempt::clickedAt).reversed())
                .toList();
        int from = (int) Math.min(pageable.getOffset(), all.size());
        int to = Math.min(from + pageable.getPageSize(), all.size());
        List<Attempt> slice = all.subList(from, to);

        Map<Long, User> users = userRepository.findAllById(
                        slice.stream().map(Attempt::userId).collect(Collectors.toSet())).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));
        Map<Long, String> serviceNames = serviceNames(storeId);

        List<AbandonedAttemptRow> rows = slice.stream().map(a -> {
            User user = users.get(a.userId());
            return new AbandonedAttemptRow(a.userId(),
                    user != null ? user.getName() : null,
                    user != null ? AvatarGenerator.getOrDefault(user.getAvatarUrl(), user.getUsername()) : null,
                    a.serviceId() == null ? null : serviceNames.getOrDefault(a.serviceId(), DELETED_SERVICE),
                    a.lastStep(), a.clickedAt());
        }).toList();
        return new PageImpl<>(rows, pageable, all.size());
    }

    /** Events from one hour before the period start, so attempts straddling the boundary group correctly. */
    private List<BookingFunnelEvent> loadEvents(Long storeId, LocalDate startDate) {
        LocalDateTime from = startDate == null ? EPOCH : startDate.atStartOfDay().minusHours(1);
        return eventRepository.findByStoreIdAndOccurredAtGreaterThanEqualOrderByVisitorIdAscOccurredAtAsc(
                storeId, from);
    }

    private List<Long> dailyDistinct(List<BookingFunnelEvent> events, FunnelStep step, LocalDate start, int days) {
        List<Set<String>> sets = new ArrayList<>(days);
        for (int i = 0; i < days; i++) {
            sets.add(new HashSet<>());
        }
        for (BookingFunnelEvent e : events) {
            if (e.getStep() != step || e.getOccurredAt() == null) {
                continue;
            }
            int idx = (int) (e.getOccurredAt().toLocalDate().toEpochDay() - start.toEpochDay());
            if (idx >= 0 && idx < days) {
                sets.get(idx).add(e.getVisitorId());
            }
        }
        List<Long> out = new ArrayList<>(days);
        for (Set<String> s : sets) {
            out.add((long) s.size());
        }
        return out;
    }

    private List<ServiceFunnelRow> services(Long storeId, List<BookingFunnelEvent> events, List<Booking> confirmed) {
        Map<Long, Set<String>> clickVisitors = new LinkedHashMap<>();
        Map<Long, Set<String>> bookedVisitors = new LinkedHashMap<>();
        for (BookingFunnelEvent e : events) {
            if (e.getServiceId() == null) {
                continue;
            }
            if (e.getStep() == FunnelStep.BOOK_CLICK) {
                clickVisitors.computeIfAbsent(e.getServiceId(), k -> new HashSet<>()).add(e.getVisitorId());
            } else if (e.getStep() == FunnelStep.BOOKED) {
                bookedVisitors.computeIfAbsent(e.getServiceId(), k -> new HashSet<>()).add(e.getVisitorId());
            }
        }
        Map<Long, Long> confirmedByService = new HashMap<>();
        Map<Long, String> snapshotNames = new HashMap<>();
        Map<String, Long> detachedByName = new LinkedHashMap<>();
        for (Booking b : confirmed) {
            String snapshot = b.getServiceNameAtBooking() == null || b.getServiceNameAtBooking().isBlank()
                    ? null : b.getServiceNameAtBooking();
            if (b.getService() != null && b.getService().getId() != null) {
                confirmedByService.merge(b.getService().getId(), 1L, Long::sum);
                if (snapshot != null) {
                    snapshotNames.put(b.getService().getId(), snapshot);
                }
            } else {
                // Service deleted after booking: bucket by the snapshot name so totals still reconcile.
                detachedByName.merge(snapshot == null ? DELETED_SERVICE : snapshot, 1L, Long::sum);
            }
        }
        Set<Long> ids = new TreeSet<>();
        ids.addAll(clickVisitors.keySet());
        ids.addAll(bookedVisitors.keySet());
        ids.addAll(confirmedByService.keySet());

        Map<Long, String> names = serviceNames(storeId);
        List<ServiceFunnelRow> rows = new ArrayList<>();
        for (Long id : ids) {
            long clicks = clickVisitors.getOrDefault(id, Set.of()).size();
            long booked = bookedVisitors.getOrDefault(id, Set.of()).size();
            String name = names.getOrDefault(id, snapshotNames.getOrDefault(id, DELETED_SERVICE));
            rows.add(new ServiceFunnelRow(id, name, clicks, booked,
                    confirmedByService.getOrDefault(id, 0L), percent(booked, clicks)));
        }
        detachedByName.forEach((name, count) -> rows.add(new ServiceFunnelRow(null, name, 0, 0, count, 0.0)));
        rows.sort(Comparator.comparingLong(ServiceFunnelRow::clicks).reversed()
                .thenComparing(ServiceFunnelRow::serviceId, Comparator.nullsLast(Comparator.naturalOrder())));
        return rows;
    }

    private Map<Long, String> serviceNames(Long storeId) {
        Map<Long, String> names = new HashMap<>();
        for (StoreServiceItem item : serviceItemRepository.findByStoreId(storeId)) {
            names.put(item.getId(), item.getName());
        }
        return names;
    }

    private static double percent(long part, long whole) {
        if (whole <= 0) {
            return 0.0;
        }
        return Math.round(part * 1000.0 / whole) / 10.0;
    }
}
