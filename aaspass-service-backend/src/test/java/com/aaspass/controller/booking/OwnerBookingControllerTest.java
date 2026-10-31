package com.aaspass.controller.booking;

import com.aaspass.booking.StoreTime;
import com.aaspass.entity.Store;
import com.aaspass.entity.StoreServiceItem;
import com.aaspass.entity.User;
import com.aaspass.entity.booking.Booking;
import com.aaspass.entity.booking.BookingStatus;
import com.aaspass.repository.StoreRepository;
import com.aaspass.repository.StoreServiceItemRepository;
import com.aaspass.repository.UserRepository;
import com.aaspass.repository.booking.BookingRepository;
import com.aaspass.support.AuthTestSupport;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
class OwnerBookingControllerTest {

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

    private Store store;
    private StoreServiceItem service;
    private LocalDate monday;

    @BeforeEach
    void setUp() throws Exception {
        Long uid = userRepository.findByUsername("priya").orElseThrow().getId();
        store = storeRepository.findByUserId(uid).get(0);
        store.setIsActive(true);
        store.setAdminBlocked(false);
        store = storeRepository.saveAndFlush(store);
        service = serviceItemRepository.findByStoreId(store.getId()).get(0);
        monday = StoreTime.today(Clock.systemUTC()).with(TemporalAdjusters.next(DayOfWeek.MONDAY));
        mockMvc.perform(put("/api/stores/" + store.getId() + "/availability").with(csrf()).cookie(login("priya"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"slotMinutes\":30,\"maxBookingMinutes\":120,\"ranges\":"
                                + "[{\"day\":\"MONDAY\",\"start\":\"09:00\",\"end\":\"13:00\"}]}"))
                .andExpect(status().isOk());
    }

    private Cookie[] login(String username) throws Exception {
        return AuthTestSupport.login(mockMvc, username, "password123");
    }

    private Booking insert(String username, LocalDateTime start, int minutes, BookingStatus status) {
        User user = userRepository.findByUsername(username).orElseThrow();
        return bookingRepository.saveAndFlush(Booking.builder()
                .store(store).service(service).user(user)
                .startAt(start).endAt(start.plusMinutes(minutes)).durationMinutes(minutes)
                .status(status).serviceNameAtBooking(service.getName()).priceAtBooking(service.getPrice())
                .build());
    }

    private LocalDateTime at(String time) {
        return LocalDateTime.of(monday, java.time.LocalTime.parse(time));
    }

    private ResultActions decide(Long id, String action, String note) throws Exception {
        return mockMvc.perform(patch("/api/bookings/" + id).with(csrf()).cookie(login("priya"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"action\":\"" + action + "\"" + (note == null ? "" : ",\"ownerNote\":\"" + note + "\"") + "}"));
    }

    @Test
    void listShowsOverlapCounts() throws Exception {
        insert("aman", at("10:00"), 60, BookingStatus.PENDING);
        insert("rohan", at("10:30"), 60, BookingStatus.PENDING);
        insert("aman", at("10:30"), 30, BookingStatus.PENDING);
        mockMvc.perform(get("/api/stores/" + store.getId() + "/bookings?status=PENDING").cookie(login("priya")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(3)))
                .andExpect(jsonPath("$.data.content[0].overlapPendingCount", is(2)))
                .andExpect(jsonPath("$.data.content[1].overlapPendingCount", is(2)))
                .andExpect(jsonPath("$.data.content[2].overlapPendingCount", is(2)))
                .andExpect(jsonPath("$.data.content[0].overlapConfirmedCount", is(0)))
                .andExpect(jsonPath("$.data.totalElements", is(3)));
    }

    @Test
    void previewListsAutoRejects() throws Exception {
        Booking a = insert("aman", at("10:00"), 60, BookingStatus.PENDING);
        Booking b = insert("rohan", at("10:30"), 60, BookingStatus.PENDING);
        insert("rohan", at("12:00"), 30, BookingStatus.PENDING);
        mockMvc.perform(get("/api/stores/" + store.getId() + "/bookings/" + a.getId() + "/confirm-preview")
                        .cookie(login("priya")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.canConfirm", is(true)))
                .andExpect(jsonPath("$.data.conflictingConfirmed", hasSize(0)))
                .andExpect(jsonPath("$.data.willAutoReject", hasSize(1)))
                .andExpect(jsonPath("$.data.willAutoReject[0].id", is(b.getId().intValue())));
        mockMvc.perform(get("/api/stores/" + store.getId() + "/bookings/" + a.getId() + "/overlaps")
                        .cookie(login("priya")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)));
    }

    @Test
    void confirmAutoRejectsOverlapsOnly() throws Exception {
        Booking a = insert("aman", at("10:00"), 60, BookingStatus.PENDING);
        Booking b = insert("rohan", at("10:30"), 60, BookingStatus.PENDING);
        Booking c = insert("rohan", at("12:00"), 30, BookingStatus.PENDING);
        decide(a.getId(), "CONFIRM", null).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.booking.status", is("CONFIRMED")))
                .andExpect(jsonPath("$.data.autoRejectedCount", is(1)));
        Booking rb = bookingRepository.findById(b.getId()).orElseThrow();
        assertEquals(BookingStatus.REJECTED, rb.getStatus());
        assertTrue(Boolean.TRUE.equals(rb.getAutoRejected()));
        assertEquals("Slot no longer available", rb.getOwnerNote());
        assertEquals(BookingStatus.PENDING, bookingRepository.findById(c.getId()).orElseThrow().getStatus());
    }

    @Test
    void confirmSecondOverlapGets409() throws Exception {
        Booking a = insert("aman", at("10:00"), 60, BookingStatus.PENDING);
        decide(a.getId(), "CONFIRM", null).andExpect(status().isOk());
        Booking b = insert("rohan", at("10:30"), 60, BookingStatus.PENDING);
        decide(b.getId(), "CONFIRM", null).andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", is("This time overlaps a confirmed booking")));
    }

    @Test
    void nonOwnerForbidden() throws Exception {
        Booking a = insert("rohan", at("10:00"), 60, BookingStatus.PENDING);
        mockMvc.perform(get("/api/stores/" + store.getId() + "/bookings").cookie(login("aman")))
                .andExpect(status().isForbidden());
        mockMvc.perform(patch("/api/bookings/" + a.getId()).with(csrf()).cookie(login("aman"))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"action\":\"CONFIRM\"}"))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/stores/" + store.getId() + "/bookings"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void rejectStoresNote() throws Exception {
        Booking a = insert("aman", at("10:00"), 60, BookingStatus.PENDING);
        decide(a.getId(), "REJECT", "Closed that day").andExpect(status().isOk())
                .andExpect(jsonPath("$.data.booking.status", is("REJECTED")))
                .andExpect(jsonPath("$.data.booking.ownerNote", is("Closed that day")))
                .andExpect(jsonPath("$.data.autoRejectedCount", is(0)));
        decide(a.getId(), "REJECT", null).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("Booking is no longer pending")));
    }

    @Test
    void completeFutureRejected() throws Exception {
        Booking a = insert("aman", at("10:00"), 60, BookingStatus.CONFIRMED);
        decide(a.getId(), "COMPLETE", null).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("Only past confirmed bookings can be completed")));
    }

    @Test
    void completePastConfirmedSucceeds() throws Exception {
        LocalDateTime past = StoreTime.now(Clock.systemUTC()).minusDays(2).withHour(10).withMinute(0).withSecond(0).withNano(0);
        Booking a = insert("aman", past, 60, BookingStatus.CONFIRMED);
        decide(a.getId(), "COMPLETE", null).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.booking.status", is("COMPLETED")));
    }

    @Test
    void confirmOutsideAvailabilityAllowedAndFlagged() throws Exception {
        Booking a = insert("aman", at("14:00"), 60, BookingStatus.PENDING);
        mockMvc.perform(get("/api/stores/" + store.getId() + "/bookings?status=PENDING").cookie(login("priya")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].outsideAvailability", is(true)));
        decide(a.getId(), "CONFIRM", null).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.booking.status", is("CONFIRMED")));
    }

    @Test
    void deletingServiceKeepsBookingSnapshot() throws Exception {
        insert("aman", at("10:00"), 60, BookingStatus.PENDING);
        String name = service.getName();
        mockMvc.perform(delete("/api/stores/" + store.getId() + "/services/" + service.getId())
                        .with(csrf()).cookie(login("priya")))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/bookings/mine").cookie(login("aman")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].serviceName", is(name)))
                .andExpect(jsonPath("$.data.content[0].serviceId", nullValue()));
    }
}
