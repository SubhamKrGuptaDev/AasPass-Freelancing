package com.aaspass.controller.booking;

import com.aaspass.booking.StoreTime;
import com.aaspass.entity.Store;
import com.aaspass.entity.booking.BookingFunnelEvent;
import com.aaspass.entity.booking.FunnelStep;
import com.aaspass.repository.StoreRepository;
import com.aaspass.repository.UserRepository;
import com.aaspass.repository.booking.BookingFunnelEventRepository;
import com.aaspass.support.AuthTestSupport;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
class FunnelControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private StoreRepository storeRepository;
    @Autowired
    private BookingFunnelEventRepository eventRepository;

    private Store priyaStore() {
        Long uid = userRepository.findByUsername("priya").orElseThrow().getId();
        Store store = storeRepository.findByUserId(uid).get(0);
        store.setIsActive(true);
        store.setAdminBlocked(false);
        return storeRepository.saveAndFlush(store);
    }

    private ResultActions send(Long storeId, String visitor, String step, Cookie... cookies) throws Exception {
        MockHttpServletRequestBuilder req = post("/api/stores/" + storeId + "/funnel-events").with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"step\":\"" + step + "\",\"visitorId\":\"" + visitor + "\"}");
        if (cookies.length > 0) {
            req.cookie(cookies);
        }
        return mockMvc.perform(req);
    }

    private long count(Long storeId, String visitor) {
        return eventRepository.findAll().stream()
                .filter(e -> e.getStore().getId().equals(storeId) && visitor.equals(e.getVisitorId())).count();
    }

    @Test
    @DisplayName("Anonymous click is recorded with null user")
    void anonymousClickRecorded() throws Exception {
        Long id = priyaStore().getId();
        send(id, "v-anon", "BOOK_CLICK").andExpect(status().isNoContent());
        List<BookingFunnelEvent> rows = eventRepository.findAll().stream()
                .filter(e -> "v-anon".equals(e.getVisitorId())).toList();
        assertEquals(1, rows.size());
        assertNull(rows.get(0).getUserId());
        assertEquals(FunnelStep.BOOK_CLICK, rows.get(0).getStep());
    }

    @Test
    @DisplayName("Owner events are skipped")
    void ownerEventSkipped() throws Exception {
        Long id = priyaStore().getId();
        Cookie[] priya = AuthTestSupport.login(mockMvc, "priya", "password123");
        send(id, "v-owner", "BOOK_CLICK", priya).andExpect(status().isNoContent());
        assertEquals(0, count(id, "v-owner"));
    }

    @Test
    @DisplayName("Identical event within 30 minutes is skipped")
    void duplicateWithin30MinSkipped() throws Exception {
        Long id = priyaStore().getId();
        send(id, "v-dup", "BOOKING_PAGE_VIEW").andExpect(status().isNoContent());
        send(id, "v-dup", "BOOKING_PAGE_VIEW").andExpect(status().isNoContent());
        send(id, "v-dup", "SLOT_SELECTED").andExpect(status().isNoContent());
        assertEquals(2, count(id, "v-dup"));
    }

    @Test
    @DisplayName("BOOKED cannot be reported by clients")
    void bookedRefused400() throws Exception {
        Long id = priyaStore().getId();
        send(id, "v-booked", "BOOKED").andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("BOOKED is recorded by the server")));
        assertEquals(0, count(id, "v-booked"));
    }

    @Test
    @DisplayName("Unknown store is 404")
    void unknownStore404() throws Exception {
        send(999999L, "v-x", "BOOK_CLICK").andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("IP with 120 events in the last hour is throttled")
    void throttledAfter120() throws Exception {
        Store store = priyaStore();
        List<BookingFunnelEvent> seed = new ArrayList<>();
        for (int i = 0; i < 120; i++) {
            seed.add(BookingFunnelEvent.builder().store(store).step(FunnelStep.BOOK_CLICK)
                    .visitorId("seed-" + i).occurredAt(StoreTime.now(Clock.systemUTC()))
                    .submitterIp("127.0.0.1").build());
        }
        eventRepository.saveAllAndFlush(seed);
        send(store.getId(), "v-throttled", "BOOK_CLICK").andExpect(status().isTooManyRequests());
        assertEquals(0, count(store.getId(), "v-throttled"));
    }
}
