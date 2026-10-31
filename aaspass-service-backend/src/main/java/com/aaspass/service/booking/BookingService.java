package com.aaspass.service.booking;

import com.aaspass.booking.AvailabilityRules;
import com.aaspass.booking.SlotCalculator;
import com.aaspass.booking.StoreTime;
import com.aaspass.booking.TimeRange;
import com.aaspass.dto.booking.DaySlotsResponse;
import com.aaspass.dto.booking.SlotView;
import com.aaspass.entity.Store;
import com.aaspass.entity.booking.Booking;
import com.aaspass.entity.booking.BookingStatus;
import com.aaspass.dto.booking.BookingCreateRequest;
import com.aaspass.dto.booking.BookingResponse;
import com.aaspass.entity.StoreServiceItem;
import com.aaspass.entity.User;
import com.aaspass.entity.booking.BookingFunnelEvent;
import com.aaspass.entity.booking.FunnelStep;
import com.aaspass.exception.BadRequestException;
import com.aaspass.exception.ForbiddenException;
import com.aaspass.repository.StoreServiceItemRepository;
import com.aaspass.repository.UserRepository;
import com.aaspass.repository.booking.BookingFunnelEventRepository;
import com.aaspass.service.mapper.DtoMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import com.aaspass.exception.ResourceNotFoundException;
import com.aaspass.repository.StoreRepository;
import com.aaspass.repository.booking.BookingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Objects;

/** Public booking reads and (later) user booking actions. */
@Service
public class BookingService {

    private static final int WINDOW_DAYS = 30;
    private static final List<BookingStatus> BLOCKING_VIEW = List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED);

    private final StoreRepository storeRepository;
    private final BookingRepository bookingRepository;
    private final StoreAvailabilityService availabilityService;
    private final StoreServiceItemRepository serviceItemRepository;
    private final UserRepository userRepository;
    private final BookingFunnelEventRepository funnelEventRepository;
    private final Clock clock;

    public BookingService(StoreRepository storeRepository,
                          StoreServiceItemRepository serviceItemRepository,
                          UserRepository userRepository,
                          BookingFunnelEventRepository funnelEventRepository,
                          BookingRepository bookingRepository,
                          StoreAvailabilityService availabilityService,
                          Clock clock) {
        this.storeRepository = storeRepository;
        this.serviceItemRepository = serviceItemRepository;
        this.userRepository = userRepository;
        this.funnelEventRepository = funnelEventRepository;
        this.bookingRepository = bookingRepository;
        this.availabilityService = availabilityService;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public DaySlotsResponse slots(Long storeId, LocalDate date, Integer duration) {
        Store store = bookableStore(storeId);
        if (date == null) {
            throw new BadRequestException("Date is required");
        }
        requireWithinWindow(date);
        int slot = AvailabilityRules.slotOrDefault(store.getSlotMinutes());
        int max = AvailabilityRules.maxOrDefault(store.getMaxBookingMinutes(), slot);
        int length = requireValidDuration(duration == null ? Integer.valueOf(slot) : duration, slot, max);

        List<TimeRange> effective = availabilityService.effectiveRanges(store, date);
        List<Booking> bookings = effective.isEmpty() ? List.of()
                : bookingRepository.findOverlapping(storeId, BLOCKING_VIEW,
                        date.atStartOfDay(), date.plusDays(1).atStartOfDay());
        LocalDateTime now = StoreTime.now(clock);
        List<SlotView> slots = SlotCalculator.slots(date, effective, slot, bookings, now);
        List<LocalTime> startTimes = SlotCalculator.startTimes(date, effective, slot, bookings, now, length);
        return new DaySlotsResponse(date, !effective.isEmpty(), slot, max, slots, startTimes);
    }

    private void requireWithinWindow(LocalDate date) {
        LocalDate today = StoreTime.today(clock);
        if (date.isBefore(today) || date.isAfter(today.plusDays(WINDOW_DAYS))) {
            throw new BadRequestException("Date must be within the next 30 days");
        }
    }

    /** Service price is an hourly rate; charge it pro rata for the booked minutes. */
    static BigDecimal totalPrice(BigDecimal hourlyRate, int minutes) {
        if (hourlyRate == null) {
            return null;
        }
        return hourlyRate.multiply(BigDecimal.valueOf(minutes))
                .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
    }

    private int requireValidDuration(Integer duration, int slot, int max) {
        if (duration == null || duration < slot || duration > max || duration % slot != 0) {
            throw new BadRequestException("Duration must be a multiple of the slot length up to the maximum");
        }
        return duration;
    }

    @Transactional
    public BookingResponse create(Long callerId, BookingCreateRequest req, String ip) {
        Store store = bookableStore(req.storeId());
        if (store.getUser() != null && Objects.equals(store.getUser().getId(), callerId)) {
            throw new BadRequestException("You can't book your own store");
        }
        StoreServiceItem service = serviceItemRepository.findById(req.serviceId())
                .filter(item -> item.getStore() != null && Objects.equals(item.getStore().getId(), store.getId()))
                .orElseThrow(() -> new BadRequestException("Service does not belong to this store"));
        LocalDateTime startAt = req.startAt();
        LocalDate date = startAt.toLocalDate();
        requireWithinWindow(date);
        int slot = AvailabilityRules.slotOrDefault(store.getSlotMinutes());
        int max = AvailabilityRules.maxOrDefault(store.getMaxBookingMinutes(), slot);
        int length = requireValidDuration(req.durationMinutes(), slot, max);

        List<TimeRange> effective = availabilityService.effectiveRanges(store, date);
        List<Booking> bookings = effective.isEmpty() ? List.of()
                : bookingRepository.findOverlapping(store.getId(), BLOCKING_VIEW,
                        date.atStartOfDay(), date.plusDays(1).atStartOfDay());
        List<LocalTime> startTimes = SlotCalculator.startTimes(date, effective, slot, bookings,
                StoreTime.now(clock), length);
        if (!startTimes.contains(startAt.toLocalTime())) {
            throw new BadRequestException("This time is no longer available");
        }
        LocalDateTime endAt = startAt.plusMinutes(length);
        boolean hasOwnPending = bookingRepository
                .findOverlapping(store.getId(), List.of(BookingStatus.PENDING), startAt, endAt).stream()
                .anyMatch(b -> b.getUser() != null && Objects.equals(b.getUser().getId(), callerId));
        if (hasOwnPending) {
            throw new BadRequestException("You already have a pending request at this time");
        }

        User user = userRepository.findById(callerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", callerId));
        Booking saved = bookingRepository.save(Booking.builder()
                .store(store).service(service).user(user)
                .startAt(startAt).endAt(endAt).durationMinutes(length)
                .status(BookingStatus.PENDING)
                .note(req.note())
                .priceAtBooking(totalPrice(service.getPrice(), length))
                .serviceNameAtBooking(service.getName())
                .build());

        String visitor = req.visitorId() == null || req.visitorId().isBlank() ? "user-" + callerId : req.visitorId();
        funnelEventRepository.save(BookingFunnelEvent.builder()
                .store(store).serviceId(service.getId()).step(FunnelStep.BOOKED)
                .visitorId(visitor).userId(callerId).occurredAt(StoreTime.now(clock))
                .submitterIp(ip).build());
        return DtoMapper.toBookingResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<BookingResponse> mine(Long callerId, BookingStatus status, Pageable pageable) {
        Pageable sorted = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "creationDateTime").and(Sort.by(Sort.Direction.DESC, "id")));
        Page<Booking> page = status == null
                ? bookingRepository.findByUserId(callerId, sorted)
                : bookingRepository.findByUserIdAndStatus(callerId, status, sorted);
        return page.map(DtoMapper::toBookingResponse);
    }

    /**
     * Takes the same store row lock as OwnerBookingService.decide and runs at READ_COMMITTED (see there for why),
     * so a cancel and an owner decision on the same store serialize and the status is re-checked after the lock.
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public BookingResponse cancel(Long bookingId, Long callerId) {
        Long storeId = bookingRepository.findStoreIdById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
        storeRepository.findByIdForUpdate(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store", "id", storeId));
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
        if (booking.getUser() == null || !Objects.equals(booking.getUser().getId(), callerId)) {
            throw new ForbiddenException("You can only cancel your own bookings");
        }
        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new BadRequestException("Only pending or confirmed bookings can be cancelled");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        return DtoMapper.toBookingResponse(bookingRepository.save(booking));
    }

    private Store bookableStore(Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store", "id", storeId));
        if (!Boolean.TRUE.equals(store.getIsActive()) || store.isAdminHidden(clock.instant())) {
            throw new ResourceNotFoundException("Store", "id", storeId);
        }
        return store;
    }
}
