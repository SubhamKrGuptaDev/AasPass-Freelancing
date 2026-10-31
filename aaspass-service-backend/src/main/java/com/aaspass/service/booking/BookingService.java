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
import com.aaspass.exception.BadRequestException;
import com.aaspass.exception.ResourceNotFoundException;
import com.aaspass.repository.StoreRepository;
import com.aaspass.repository.booking.BookingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/** Public booking reads and (later) user booking actions. */
@Service
public class BookingService {

    private static final int WINDOW_DAYS = 30;

    private final StoreRepository storeRepository;
    private final BookingRepository bookingRepository;
    private final StoreAvailabilityService availabilityService;
    private final Clock clock;

    public BookingService(StoreRepository storeRepository,
                          BookingRepository bookingRepository,
                          StoreAvailabilityService availabilityService,
                          Clock clock) {
        this.storeRepository = storeRepository;
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
        LocalDate today = StoreTime.today(clock);
        if (date.isBefore(today) || date.isAfter(today.plusDays(WINDOW_DAYS))) {
            throw new BadRequestException("Date must be within the next 30 days");
        }
        int slot = AvailabilityRules.slotOrDefault(store.getSlotMinutes());
        int max = AvailabilityRules.maxOrDefault(store.getMaxBookingMinutes(), slot);
        int length = duration == null ? slot : duration;
        if (length < slot || length > max || length % slot != 0) {
            throw new BadRequestException("Duration must be a multiple of the slot length up to the maximum");
        }

        List<TimeRange> effective = availabilityService.effectiveRanges(store, date);
        List<Booking> bookings = effective.isEmpty() ? List.of()
                : bookingRepository.findOverlapping(storeId,
                        List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED),
                        date.atStartOfDay(), date.plusDays(1).atStartOfDay());
        LocalDateTime now = StoreTime.now(clock);
        List<SlotView> slots = SlotCalculator.slots(date, effective, slot, bookings, now);
        List<LocalTime> startTimes = SlotCalculator.startTimes(date, effective, slot, bookings, now, length);
        return new DaySlotsResponse(date, !effective.isEmpty(), slot, max, slots, startTimes);
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
