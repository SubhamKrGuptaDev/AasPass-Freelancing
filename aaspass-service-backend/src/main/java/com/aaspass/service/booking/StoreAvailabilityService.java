package com.aaspass.service.booking;

import com.aaspass.booking.AvailabilityResolver;
import com.aaspass.booking.AvailabilityRules;
import com.aaspass.booking.StoreTime;
import com.aaspass.booking.TimeRange;
import com.aaspass.dto.booking.AvailabilityExceptionRequest;
import com.aaspass.dto.booking.AvailabilityExceptionResponse;
import com.aaspass.dto.booking.AvailabilityRangeDto;
import com.aaspass.dto.booking.AvailabilitySaveResult;
import com.aaspass.dto.booking.StoreAvailabilityDto;
import com.aaspass.entity.Store;
import com.aaspass.entity.booking.Booking;
import com.aaspass.entity.booking.BookingStatus;
import com.aaspass.entity.booking.StoreAvailabilityException;
import com.aaspass.entity.booking.StoreAvailabilityRange;
import com.aaspass.exception.BadRequestException;
import com.aaspass.exception.ForbiddenException;
import com.aaspass.exception.ResourceNotFoundException;
import com.aaspass.repository.StoreRepository;
import com.aaspass.repository.booking.BookingRepository;
import com.aaspass.repository.booking.StoreAvailabilityExceptionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/** Owner-managed weekly availability, slot settings and date exceptions of a store. */
@Service
public class StoreAvailabilityService {

    private static final Logger log = LoggerFactory.getLogger(StoreAvailabilityService.class);
    private static final int DEFAULT_LIST_DAYS = 60;

    private final StoreRepository storeRepository;
    private final StoreAvailabilityExceptionRepository exceptionRepository;
    private final BookingRepository bookingRepository;
    private final Clock clock;

    public StoreAvailabilityService(StoreRepository storeRepository,
                                    StoreAvailabilityExceptionRepository exceptionRepository,
                                    BookingRepository bookingRepository,
                                    Clock clock) {
        this.storeRepository = storeRepository;
        this.exceptionRepository = exceptionRepository;
        this.bookingRepository = bookingRepository;
        this.clock = clock;
    }

    /** Public read of a store's weekly availability. */
    @Transactional(readOnly = true)
    public StoreAvailabilityDto get(Long storeId) {
        return toDto(findStore(storeId));
    }

    @Transactional
    public AvailabilitySaveResult replace(Long storeId, Long callerId, StoreAvailabilityDto dto) {
        Store store = findOwnedStore(storeId, callerId);
        if (dto == null) {
            throw new BadRequestException("Availability is required");
        }
        replace(store, dto);
        log.info("[AVAILABILITY] Replaced availability of store {}", storeId);
        return new AvailabilitySaveResult(toDto(store), outsideBookings(store).size());
    }

    /** Replaces slot settings and weekly ranges; no ownership check (used inside store create/update). */
    @Transactional
    public void replace(Store store, StoreAvailabilityDto dto) {
        if (store == null || dto == null) {
            return;
        }
        Integer slotInput = dto.slotMinutes() == null ? AvailabilityRules.DEFAULT_SLOT_MINUTES : dto.slotMinutes();
        AvailabilityRules.validateSlotMinutes(slotInput);
        int slot = slotInput;
        Integer maxInput = dto.maxBookingMinutes() == null
                ? null : Math.min(dto.maxBookingMinutes(), AvailabilityRules.MAX_BOOKING_MINUTES_CAP);
        int max = AvailabilityRules.maxOrDefault(maxInput, slot);

        Map<DayOfWeek, List<TimeRange>> byDay = new EnumMap<>(DayOfWeek.class);
        for (AvailabilityRangeDto r : dto.ranges()) {
            if (r == null || r.day() == null) {
                throw new BadRequestException("Each time range needs a day");
            }
            if (r.start() == null || r.end() == null) {
                throw new BadRequestException("Start and end time are required");
            }
            byDay.computeIfAbsent(r.day(), d -> new ArrayList<>()).add(new TimeRange(r.start(), r.end()));
        }
        AvailabilityRules.validateRanges(byDay);

        store.setSlotMinutes(slot);
        store.setMaxBookingMinutes(max);
        if (store.getAvailabilityRanges() == null) {
            store.setAvailabilityRanges(new ArrayList<>());
        }
        store.getAvailabilityRanges().clear();
        for (Map.Entry<DayOfWeek, List<TimeRange>> e : byDay.entrySet()) {
            for (TimeRange tr : e.getValue()) {
                store.getAvailabilityRanges().add(StoreAvailabilityRange.builder()
                        .store(store)
                        .dayOfWeek(e.getKey())
                        .startTime(tr.start())
                        .endTime(tr.end())
                        .build());
            }
        }
    }

    @Transactional(readOnly = true)
    public List<AvailabilityExceptionResponse> listExceptions(Long storeId, Long callerId, LocalDate from, LocalDate to) {
        Store store = findOwnedStore(storeId, callerId);
        LocalDate today = StoreTime.today(clock);
        LocalDate start = from != null ? from : today;
        LocalDate end = to != null ? to : today.plusDays(DEFAULT_LIST_DAYS);
        List<Booking> outside = outsideBookings(store);
        List<AvailabilityExceptionResponse> result = new ArrayList<>();
        for (StoreAvailabilityException e : exceptionsOf(store)) {
            if (e.getDate() == null || e.getDate().isBefore(start) || e.getDate().isAfter(end)) {
                continue;
            }
            result.add(toResponse(e, countOnDate(outside, e.getDate())));
        }
        result.sort(Comparator.comparing(AvailabilityExceptionResponse::date)
                .thenComparing(r -> r.start() == null ? LocalTime.MIN : r.start()));
        return result;
    }

    @Transactional
    public AvailabilityExceptionResponse addException(Long storeId, Long callerId, AvailabilityExceptionRequest req) {
        Store store = findOwnedStore(storeId, callerId);
        if (req == null || req.date() == null || req.type() == null) {
            throw new BadRequestException("Date and type are required");
        }
        if (req.date().isBefore(StoreTime.today(clock))) {
            throw new BadRequestException("Date must be today or later");
        }
        AvailabilityRules.validateException(req.type(), req.start(), req.end());
        boolean wholeDay = req.start() == null && req.end() == null;
        String reason = req.reason() == null || req.reason().isBlank() ? null : req.reason().trim();

        StoreAvailabilityException entity = StoreAvailabilityException.builder()
                .store(store)
                .date(req.date())
                .type(req.type())
                .startTime(wholeDay ? null : req.start())
                .endTime(wholeDay ? null : req.end())
                .reason(reason)
                .build();
        if (store.getAvailabilityExceptions() == null) {
            store.setAvailabilityExceptions(new ArrayList<>());
        }
        store.getAvailabilityExceptions().add(entity);
        exceptionRepository.saveAndFlush(entity);
        log.info("[AVAILABILITY] Added {} exception {} for store {}", req.type(), req.date(), storeId);
        return toResponse(entity, countOnDate(outsideBookings(store), entity.getDate()));
    }

    @Transactional
    public void deleteException(Long storeId, Long exceptionId, Long callerId) {
        Store store = findOwnedStore(storeId, callerId);
        StoreAvailabilityException target = exceptionsOf(store).stream()
                .filter(e -> Objects.equals(e.getId(), exceptionId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("AvailabilityException", "id", exceptionId));
        store.getAvailabilityExceptions().remove(target);
        log.info("[AVAILABILITY] Deleted exception {} of store {}", exceptionId, storeId);
    }

    /** True when the store has at least one weekly opening range (bookings can be offered). */
    public static boolean hasAnyAvailability(Store store) {
        return store != null && store.getAvailabilityRanges() != null && !store.getAvailabilityRanges().isEmpty();
    }

    /** Single entry point for the effective opening ranges of a store on a date. */
    @Transactional(readOnly = true)
    public List<TimeRange> effectiveRanges(Store store, LocalDate date) {
        if (store == null || date == null) {
            return List.of();
        }
        return AvailabilityResolver.effectiveRanges(date, store.getAvailabilityRanges(), store.getAvailabilityExceptions());
    }

    // ---- helpers ----

    private Store findStore(Long storeId) {
        return storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store", "id", storeId));
    }

    private Store findOwnedStore(Long storeId, Long callerId) {
        Store store = findStore(storeId);
        Long ownerId = store.getUser() != null ? store.getUser().getId() : null;
        if (ownerId == null || !ownerId.equals(callerId)) {
            log.warn("[AVAILABILITY] User {} attempted to manage availability of store {} owned by {}",
                    callerId, storeId, ownerId);
            throw new ForbiddenException("You don't own this store");
        }
        return store;
    }

    private static List<StoreAvailabilityException> exceptionsOf(Store store) {
        return store.getAvailabilityExceptions() != null ? store.getAvailabilityExceptions() : List.of();
    }

    private StoreAvailabilityDto toDto(Store store) {
        int slot = AvailabilityRules.slotOrDefault(store.getSlotMinutes());
        int max = AvailabilityRules.maxOrDefault(store.getMaxBookingMinutes(), slot);
        List<AvailabilityRangeDto> ranges = new ArrayList<>();
        if (store.getAvailabilityRanges() != null) {
            store.getAvailabilityRanges().stream()
                    .filter(r -> r != null && r.getDayOfWeek() != null && r.getStartTime() != null && r.getEndTime() != null)
                    .sorted(Comparator.comparing(StoreAvailabilityRange::getDayOfWeek)
                            .thenComparing(StoreAvailabilityRange::getStartTime))
                    .forEach(r -> ranges.add(new AvailabilityRangeDto(r.getDayOfWeek(), r.getStartTime(), r.getEndTime())));
        }
        return new StoreAvailabilityDto(slot, max, ranges);
    }

    private AvailabilityExceptionResponse toResponse(StoreAvailabilityException e, long outsideCount) {
        return new AvailabilityExceptionResponse(e.getId(), e.getDate(), e.getType(),
                e.getStartTime(), e.getEndTime(), e.getReason(), outsideCount);
    }

    private static long countOnDate(List<Booking> bookings, LocalDate date) {
        return bookings.stream()
                .filter(b -> b.getStartAt() != null && date.equals(b.getStartAt().toLocalDate()))
                .count();
    }

    /** Future CONFIRMED bookings not fully inside one effective range of their date. */
    private List<Booking> outsideBookings(Store store) {
        if (store.getId() == null) {
            return List.of();
        }
        LocalDateTime now = StoreTime.now(clock);
        List<Booking> confirmed = bookingRepository.findOverlapping(
                store.getId(), List.of(BookingStatus.CONFIRMED), now, now.plusYears(5));
        List<Booking> outside = new ArrayList<>();
        for (Booking b : confirmed) {
            if (b.getStartAt() == null || b.getEndAt() == null) {
                continue;
            }
            if (isOutsideAvailability(store, b)) {
                outside.add(b);
            }
        }
        return outside;
    }

    /** True when the booking is not fully inside one effective range of its date. */
    public boolean isOutsideAvailability(Store store, Booking b) {
        if (b == null || b.getStartAt() == null || b.getEndAt() == null) {
            return false;
        }
        LocalDate date = b.getStartAt().toLocalDate();
        boolean sameDay = date.equals(b.getEndAt().toLocalDate());
        LocalTime s = b.getStartAt().toLocalTime();
        LocalTime e = b.getEndAt().toLocalTime();
        return !(sameDay && effectiveRanges(store, date).stream()
                .anyMatch(r -> !s.isBefore(r.start()) && !e.isAfter(r.end())));
    }
}
