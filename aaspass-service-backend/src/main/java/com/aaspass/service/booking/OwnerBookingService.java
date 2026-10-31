package com.aaspass.service.booking;

import com.aaspass.booking.AvailabilityRules;
import com.aaspass.booking.ScheduleLanes;
import com.aaspass.booking.StoreTime;
import com.aaspass.booking.TimeRange;
import com.aaspass.dto.booking.AvailabilityExceptionResponse;
import com.aaspass.dto.booking.ScheduleBooking;
import com.aaspass.dto.booking.ScheduleDay;
import com.aaspass.dto.booking.ScheduleResponse;
import com.aaspass.dto.booking.BookingDecisionRequest;
import com.aaspass.dto.booking.BookingDecisionResult;
import com.aaspass.dto.booking.BookingResponse;
import com.aaspass.dto.booking.ConfirmPreview;
import com.aaspass.dto.booking.OwnerBookingRow;
import com.aaspass.entity.Store;
import com.aaspass.entity.booking.Booking;
import com.aaspass.entity.booking.BookingStatus;
import com.aaspass.exception.BadRequestException;
import com.aaspass.exception.ConflictException;
import com.aaspass.exception.ResourceNotFoundException;
import com.aaspass.repository.StoreRepository;
import com.aaspass.repository.booking.BookingRepository;
import com.aaspass.service.StoreService;
import com.aaspass.service.mapper.DtoMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/** Owner-side booking workflow: inbox, overlaps, confirm preview and decisions. */
@Service
public class OwnerBookingService {

    private static final Logger log = LoggerFactory.getLogger(OwnerBookingService.class);
    private static final List<BookingStatus> ACTIVE = List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED);
    private static final int MAX_SCHEDULE_SPAN_DAYS = 6;
    private static final String AUTO_REJECT_NOTE = "Slot no longer available";

    private final BookingRepository bookingRepository;
    private final StoreRepository storeRepository;
    private final StoreService storeService;
    private final StoreAvailabilityService availabilityService;
    private final Clock clock;

    public OwnerBookingService(BookingRepository bookingRepository,
                               StoreRepository storeRepository,
                               StoreService storeService,
                               StoreAvailabilityService availabilityService,
                               Clock clock) {
        this.bookingRepository = bookingRepository;
        this.storeRepository = storeRepository;
        this.storeService = storeService;
        this.availabilityService = availabilityService;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public Page<OwnerBookingRow> list(Long storeId, Long callerId, BookingStatus status,
                                      LocalDate from, LocalDate to, Pageable pageable) {
        storeService.assertStoreOwner(storeId, callerId);
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store", "id", storeId));
        List<BookingStatus> statuses = status == null ? Arrays.asList(BookingStatus.values()) : List.of(status);
        LocalDateTime start = from == null ? LocalDateTime.of(1970, 1, 1, 0, 0) : from.atStartOfDay();
        LocalDateTime end = to == null ? LocalDateTime.of(9999, 1, 1, 0, 0) : to.plusDays(1).atStartOfDay();
        Sort.Direction dir = status == BookingStatus.PENDING ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable sorted = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                Sort.by(dir, "startAt").and(Sort.by(dir, "id")));
        return bookingRepository.findInbox(storeId, statuses, start, end, sorted)
                .map(b -> toRow(store, b));
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> overlaps(Long storeId, Long bookingId, Long callerId) {
        storeService.assertStoreOwner(storeId, callerId);
        Booking booking = findInStore(storeId, bookingId);
        return competing(booking, ACTIVE).stream().map(DtoMapper::toBookingResponse).toList();
    }

    @Transactional(readOnly = true)
    public ConfirmPreview preview(Long storeId, Long bookingId, Long callerId) {
        storeService.assertStoreOwner(storeId, callerId);
        Booking booking = findInStore(storeId, bookingId);
        requirePending(booking);
        List<BookingResponse> blockers = competing(booking, List.of(BookingStatus.CONFIRMED)).stream()
                .map(DtoMapper::toBookingResponse).toList();
        List<BookingResponse> rejects = competing(booking, List.of(BookingStatus.PENDING)).stream()
                .map(DtoMapper::toBookingResponse).toList();
        return new ConfirmPreview(blockers.isEmpty(), blockers, rejects);
    }

    /**
     * READ_COMMITTED on purpose: MySQL's default REPEATABLE READ fixes the snapshot at the first plain SELECT,
     * so after waiting on the store lock the reads below would still see pre-commit data and could overwrite a
     * concurrent decision. Under READ_COMMITTED every statement after the lock sees committed rows.
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public BookingDecisionResult decide(Long bookingId, Long callerId, BookingDecisionRequest req) {
        if (req == null || req.action() == null) {
            throw new BadRequestException("Action is required");
        }
        Long storeId = bookingRepository.findStoreIdById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
        // Ownership first so non-owners can never take the store row lock.
        storeService.assertStoreOwner(storeId, callerId);
        // Serialize concurrent decisions per store before reading any booking state.
        storeRepository.findByIdForUpdate(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store", "id", storeId));
        Booking booking = bookingRepository.findById(bookingId)
                .filter(b -> b.getStore() != null && Objects.equals(b.getStore().getId(), storeId))
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
        String note = req.ownerNote() == null || req.ownerNote().isBlank() ? null : req.ownerNote().trim();
        LocalDateTime now = StoreTime.now(clock);

        int autoRejected = 0;
        switch (req.action()) {
            case CONFIRM -> {
                requirePending(booking);
                if (!competing(booking, List.of(BookingStatus.CONFIRMED)).isEmpty()) {
                    throw new ConflictException("This time overlaps a confirmed booking");
                }
                booking.setStatus(BookingStatus.CONFIRMED);
                booking.setDecidedAt(now);
                booking.setOwnerNote(note);
                for (Booking other : competing(booking, List.of(BookingStatus.PENDING))) {
                    other.setStatus(BookingStatus.REJECTED);
                    other.setAutoRejected(true);
                    other.setOwnerNote(AUTO_REJECT_NOTE);
                    other.setDecidedAt(now);
                    autoRejected++;
                }
            }
            case REJECT -> {
                requirePending(booking);
                booking.setStatus(BookingStatus.REJECTED);
                booking.setDecidedAt(now);
                booking.setOwnerNote(note);
            }
            case COMPLETE -> {
                if (booking.getStatus() != BookingStatus.CONFIRMED
                        || booking.getStartAt() == null || !booking.getStartAt().isBefore(now)) {
                    throw new BadRequestException("Only past confirmed bookings can be completed");
                }
                booking.setStatus(BookingStatus.COMPLETED);
                if (note != null) {
                    booking.setOwnerNote(note);
                }
            }
        }
        bookingRepository.saveAndFlush(booking);
        log.info("[BOOKING] Owner {} {} booking {} (auto-rejected {})", callerId, req.action(), bookingId, autoRejected);
        return new BookingDecisionResult(DtoMapper.toBookingResponse(booking), autoRejected);
    }

    @Transactional(readOnly = true)
    public ScheduleResponse schedule(Long storeId, Long callerId, LocalDate from, LocalDate to) {
        if (from == null || to == null) {
            throw new BadRequestException("Schedule start and end dates are required");
        }
        if (to.isBefore(from)) {
            throw new BadRequestException("Schedule end date must not be before start date");
        }
        if (from.plusDays(MAX_SCHEDULE_SPAN_DAYS).isBefore(to)) {
            throw new BadRequestException("Schedule range is at most 7 days");
        }
        storeService.assertStoreOwner(storeId, callerId);
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store", "id", storeId));
        List<AvailabilityExceptionResponse> exceptions = availabilityService.listExceptions(storeId, callerId, from, to);
        int slotMinutes = AvailabilityRules.slotOrDefault(store.getSlotMinutes());
        List<ScheduleDay> days = new ArrayList<>();
        for (LocalDate date = from; !date.isAfter(to); date = date.plusDays(1)) {
            final LocalDate day = date;
            List<Booking> bookings = bookingRepository
                    .findOverlapping(storeId, ACTIVE, day.atStartOfDay(), day.plusDays(1).atStartOfDay()).stream()
                    .filter(b -> b.getStartAt() != null && b.getEndAt() != null)
                    .sorted(Comparator.comparing(Booking::getStartAt).thenComparing(Booking::getEndAt))
                    .toList();
            Map<Long, ScheduleLanes.Placement> placements = ScheduleLanes.assign(bookings);
            List<ScheduleBooking> scheduled = new ArrayList<>();
            int laneCount = 0;
            for (Booking b : bookings) {
                ScheduleLanes.Placement p = placements.get(b.getId());
                if (p == null) {
                    continue;
                }
                laneCount = Math.max(laneCount, p.lane() + 1);
                scheduled.add(new ScheduleBooking(DtoMapper.toBookingResponse(b), p.lane(), p.conflictGroup()));
            }
            List<TimeRange> open = availabilityService.effectiveRanges(store, day);
            days.add(new ScheduleDay(day, open == null ? List.of() : open,
                    exceptions.stream().filter(e -> day.equals(e.date())).toList(), scheduled, laneCount));
        }
        return new ScheduleResponse(slotMinutes, days);
    }

    // ---- helpers ----

    private OwnerBookingRow toRow(Store store, Booking b) {
        long pending = competing(b, List.of(BookingStatus.PENDING)).size();
        long confirmed = competing(b, List.of(BookingStatus.CONFIRMED)).size();
        return new OwnerBookingRow(DtoMapper.toBookingResponse(b), pending, confirmed,
                availabilityService.isOutsideAvailability(store, b));
    }

    /** Other bookings of the same store in the statuses that intersect this booking's time. */
    private List<Booking> competing(Booking booking, List<BookingStatus> statuses) {
        if (booking.getStore() == null || booking.getStartAt() == null || booking.getEndAt() == null) {
            return List.of();
        }
        return bookingRepository.findOverlapping(booking.getStore().getId(), statuses,
                        booking.getStartAt(), booking.getEndAt()).stream()
                .filter(o -> !Objects.equals(o.getId(), booking.getId()))
                .sorted(Comparator.comparing(Booking::getStartAt).thenComparing(Booking::getId))
                .toList();
    }

    private Booking findInStore(Long storeId, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
        if (booking.getStore() == null || !Objects.equals(booking.getStore().getId(), storeId)) {
            throw new ResourceNotFoundException("Booking", "id", bookingId);
        }
        return booking;
    }

    private static void requirePending(Booking booking) {
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Booking is no longer pending");
        }
    }
}
