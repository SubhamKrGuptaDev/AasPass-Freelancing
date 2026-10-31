package com.aaspass.controller.booking;

import com.aaspass.booking.StoreTime;
import com.aaspass.entity.Store;
import com.aaspass.entity.StoreServiceItem;
import com.aaspass.entity.booking.Booking;
import com.aaspass.entity.booking.BookingStatus;
import com.aaspass.repository.StoreRepository;
import com.aaspass.repository.StoreServiceItemRepository;
import com.aaspass.repository.UserRepository;
import com.aaspass.repository.booking.BookingRepository;
import com.aaspass.support.AuthTestSupport;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Deliberately NOT @Transactional: decide() must open its own READ_COMMITTED transaction, proving the
 * JpaTransactionManager accepts the custom isolation level. Created bookings are deleted afterwards.
 */
@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class OwnerBookingStandaloneTxTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private StoreRepository storeRepository;
    @Autowired
    private StoreServiceItemRepository serviceItemRepository;
    @Autowired
    private BookingRepository bookingRepository;

    private final List<Long> created = new ArrayList<>();

    @AfterEach
    void cleanUp() {
        bookingRepository.deleteAllById(created);
        created.clear();
    }

    private Booking insert(Store store, StoreServiceItem service, String username, LocalDateTime start, int minutes) {
        Booking saved = bookingRepository.saveAndFlush(Booking.builder()
                .store(store).service(service).user(userRepository.findByUsername(username).orElseThrow())
                .startAt(start).endAt(start.plusMinutes(minutes)).durationMinutes(minutes)
                .status(BookingStatus.PENDING).serviceNameAtBooking(service.getName()).build());
        created.add(saved.getId());
        return saved;
    }

    @Test
    void confirmWorksInStandaloneTransaction() throws Exception {
        Long uid = userRepository.findByUsername("priya").orElseThrow().getId();
        Store store = storeRepository.findByUserId(uid).get(0);
        StoreServiceItem service = serviceItemRepository.findByStoreId(store.getId()).get(0);
        LocalDateTime start = StoreTime.now(Clock.systemUTC()).plusDays(3).withHour(10).withMinute(0).withSecond(0).withNano(0);
        Booking a = insert(store, service, "aman", start, 60);
        Booking b = insert(store, service, "rohan", start.plusMinutes(30), 60);

        mockMvc.perform(patch("/api/bookings/" + a.getId()).with(csrf())
                        .cookie(AuthTestSupport.login(mockMvc, "priya", "password123"))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"action\":\"CONFIRM\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.booking.status", is("CONFIRMED")))
                .andExpect(jsonPath("$.data.autoRejectedCount", is(1)));

        assertEquals(BookingStatus.CONFIRMED, bookingRepository.findById(a.getId()).orElseThrow().getStatus());
        Booking rb = bookingRepository.findById(b.getId()).orElseThrow();
        assertEquals(BookingStatus.REJECTED, rb.getStatus());
        assertEquals("Slot no longer available", rb.getOwnerNote());
    }
}
