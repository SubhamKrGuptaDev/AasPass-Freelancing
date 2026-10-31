package com.aaspass.booking;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import com.aaspass.entity.Store;
import com.aaspass.entity.StoreServiceItem;
import com.aaspass.entity.User;
import com.aaspass.entity.booking.AvailabilityExceptionType;
import com.aaspass.entity.booking.Booking;
import com.aaspass.entity.booking.BookingFunnelEvent;
import com.aaspass.entity.booking.FunnelStep;
import com.aaspass.entity.booking.StoreAvailabilityException;
import com.aaspass.entity.booking.StoreAvailabilityRange;
import com.aaspass.repository.StoreRepository;
import com.aaspass.repository.booking.BookingFunnelEventRepository;
import com.aaspass.repository.booking.BookingRepository;
import com.aaspass.repository.booking.StoreAvailabilityExceptionRepository;
import com.aaspass.repository.booking.StoreAvailabilityRangeRepository;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

/** Deleting a store must remove its services, bookings (FK to services), availability and funnel events. */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class StoreDeleteCascadeTest {

    @Autowired StoreRepository storeRepository;
    @Autowired BookingRepository bookingRepository;
    @Autowired StoreAvailabilityRangeRepository rangeRepository;
    @Autowired StoreAvailabilityExceptionRepository exceptionRepository;
    @Autowired BookingFunnelEventRepository funnelRepository;
    @Autowired EntityManager em;

    @Test
    void deletingStoreCascadesBookingsBeforeServices() {
        User owner = storeRepository.findAll().stream().map(Store::getUser).findFirst().orElseThrow();

        Store store = Store.builder().user(owner).storeName("Cascade Test").category("Test")
                .area("Area").city("City").build();
        StoreServiceItem service = StoreServiceItem.builder()
                .name("Svc").price(new BigDecimal("100.00")).build();
        store.addService(service);
        store = storeRepository.saveAndFlush(store);
        service = store.getServices().get(0);

        Booking booking = Booking.builder().store(store).service(service).user(owner)
                .startAt(LocalDateTime.of(2030, 1, 7, 10, 0)).endAt(LocalDateTime.of(2030, 1, 7, 10, 30))
                .durationMinutes(30).serviceNameAtBooking("Svc").build();
        store.getBookings().add(booking);
        store.getAvailabilityRanges().add(StoreAvailabilityRange.builder().store(store)
                .dayOfWeek(DayOfWeek.MONDAY).startTime(LocalTime.of(9, 0)).endTime(LocalTime.of(12, 0)).build());
        store.getAvailabilityExceptions().add(StoreAvailabilityException.builder().store(store)
                .date(LocalDate.of(2030, 1, 8)).type(AvailabilityExceptionType.BLOCKED).build());
        store.getFunnelEvents().add(BookingFunnelEvent.builder().store(store).serviceId(service.getId())
                .step(FunnelStep.BOOK_CLICK).visitorId("v1").occurredAt(LocalDateTime.of(2030, 1, 1, 9, 0)).build());
        store = storeRepository.saveAndFlush(store);
        Long storeId = store.getId();

        assertEquals(1, bookingRepository.count());

        storeRepository.delete(store);
        storeRepository.flush();
        em.clear();

        assertFalse(storeRepository.findById(storeId).isPresent());
        assertEquals(0, bookingRepository.count());
        assertEquals(0, rangeRepository.findByStoreId(storeId).size());
        assertEquals(0, exceptionRepository.findByStoreIdAndDate(storeId, LocalDate.of(2030, 1, 8)).size());
        assertEquals(0, funnelRepository.count());
    }
}
