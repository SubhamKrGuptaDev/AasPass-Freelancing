package com.aaspass.controller.booking;

import com.aaspass.booking.StoreTime;
import com.aaspass.entity.Store;
import com.aaspass.entity.booking.FunnelStep;
import com.aaspass.repository.StoreRepository;
import com.aaspass.repository.StoreServiceItemRepository;
import com.aaspass.repository.UserRepository;
import com.aaspass.repository.booking.BookingFunnelEventRepository;
import com.aaspass.support.AuthTestSupport;
import com.jayway.jsonpath.JsonPath;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
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
import java.time.temporal.TemporalAdjusters;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private StoreRepository storeRepository;
    @Autowired
    private StoreServiceItemRepository serviceItemRepository;
    @Autowired
    private BookingFunnelEventRepository funnelEventRepository;

    private Long storeId;
    private Long serviceId;
    private LocalDate monday;

    @BeforeEach
    void setUp() throws Exception {
        Long uid = userRepository.findByUsername("priya").orElseThrow().getId();
        Store store = storeRepository.findByUserId(uid).get(0);
        store.setIsActive(true);
        store.setAdminBlocked(false);
        storeId = storeRepository.saveAndFlush(store).getId();
        serviceId = serviceItemRepository.findByStoreId(storeId).get(0).getId();
        monday = StoreTime.today(Clock.systemUTC()).with(TemporalAdjusters.next(DayOfWeek.MONDAY));
        setRange("09:00", "13:00");
    }

    private void setRange(String start, String end) throws Exception {
        mockMvc.perform(put("/api/stores/" + storeId + "/availability").with(csrf()).cookie(login("priya"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"slotMinutes\":30,\"maxBookingMinutes\":120,\"ranges\":"
                                + "[{\"day\":\"MONDAY\",\"start\":\"" + start + "\",\"end\":\"" + end + "\"}]}"))
                .andExpect(status().isOk());
    }

    private Cookie[] login(String username) throws Exception {
        return AuthTestSupport.login(mockMvc, username, "password123");
    }

    private ResultActions book(String user, LocalDate date, String time, int minutes) throws Exception {
        return mockMvc.perform(post("/api/bookings").with(csrf()).cookie(login(user))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"storeId\":" + storeId + ",\"serviceId\":" + serviceId
                        + ",\"startAt\":\"" + date + "T" + time + ":00\",\"durationMinutes\":" + minutes + "}"));
    }

    @Test
    @DisplayName("Create gives PENDING booking and a BOOKED funnel event")
    void createsPendingAndBookedEvent() throws Exception {
        Long amanId = userRepository.findByUsername("aman").orElseThrow().getId();
        long before = funnelEventRepository.findAll().stream()
                .filter(e -> e.getStep() == FunnelStep.BOOKED).count();
        book("aman", monday, "10:00", 60).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("PENDING")))
                .andExpect(jsonPath("$.data.userId", is(amanId.intValue())))
                .andExpect(jsonPath("$.data.endAt", is(monday + "T11:00:00")));
        var booked = funnelEventRepository.findAll().stream()
                .filter(e -> e.getStep() == FunnelStep.BOOKED).toList();
        assertEquals(before + 1, booked.size());
        assertEquals(amanId, booked.get(booked.size() - 1).getUserId());
    }

    @Test
    void anonymousGets401() throws Exception {
        mockMvc.perform(post("/api/bookings").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"storeId\":1,\"serviceId\":1,\"startAt\":\"" + monday
                                + "T10:00:00\",\"durationMinutes\":60}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void rejectsOwnStore() throws Exception {
        book("priya", monday, "10:00", 60).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("own store")));
    }

    @Test
    void rejectsStartNotInStartTimes() throws Exception {
        book("aman", monday, "12:30", 60).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("no longer available")));
    }

    @Test
    void rejectsBeyond30Days() throws Exception {
        book("aman", StoreTime.today(Clock.systemUTC()).plusDays(31), "10:00", 60)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("within the next 30 days")));
    }

    @Test
    void rejectsOverlappingOwnPending() throws Exception {
        book("aman", monday, "10:00", 60).andExpect(status().isOk());
        // 10:30 is blocked by the caller's own pending request; error must be the pending-specific one
        book("aman", monday, "10:30", 60).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("already have a pending request")));
    }

    @Test
    void twoUsersMayRequestSameSlot() throws Exception {
        book("aman", monday, "10:00", 60).andExpect(status().isOk());
        book("rohan", monday, "10:00", 60).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("PENDING")));
    }

    @Test
    void mineListsNewestFirst() throws Exception {
        book("aman", monday, "10:00", 60).andExpect(status().isOk());
        book("aman", monday, "11:00", 60).andExpect(status().isOk());
        mockMvc.perform(get("/api/bookings/mine").cookie(login("aman")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].startAt", is(monday + "T11:00:00")))
                .andExpect(jsonPath("$.data.content[1].startAt", is(monday + "T10:00:00")));
    }

    @Test
    void cancelByOtherUserForbidden() throws Exception {
        String body = book("aman", monday, "10:00", 60).andReturn().getResponse().getContentAsString();
        int id = JsonPath.read(body, "$.data.id");
        mockMvc.perform(patch("/api/bookings/" + id + "/cancel").with(csrf()).cookie(login("rohan")))
                .andExpect(status().isForbidden());
    }

    @Test
    void cancelTwiceRejected() throws Exception {
        String body = book("aman", monday, "10:00", 60).andReturn().getResponse().getContentAsString();
        int id = JsonPath.read(body, "$.data.id");
        Cookie[] aman = login("aman");
        mockMvc.perform(patch("/api/bookings/" + id + "/cancel").with(csrf()).cookie(aman))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.status", is("CANCELLED")));
        mockMvc.perform(patch("/api/bookings/" + id + "/cancel").with(csrf()).cookie(aman))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Only pending or confirmed")));
    }
}
