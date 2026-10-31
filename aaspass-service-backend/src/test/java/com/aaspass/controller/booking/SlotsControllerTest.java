package com.aaspass.controller.booking;

import com.aaspass.booking.StoreTime;
import com.aaspass.entity.Store;
import com.aaspass.repository.StoreRepository;
import com.aaspass.repository.UserRepository;
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
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
class SlotsControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private StoreRepository storeRepository;

    /** Priya's store, forced active and un-hidden so tests do not depend on seed/other-test state. */
    private Long priyaStoreId() {
        Long uid = userRepository.findByUsername("priya").orElseThrow().getId();
        Store store = storeRepository.findByUserId(uid).get(0);
        store.setIsActive(true);
        store.setAdminBlocked(false);
        return storeRepository.saveAndFlush(store).getId();
    }

    private Cookie[] priya() throws Exception {
        return AuthTestSupport.login(mockMvc, "priya", "password123");
    }

    @Test
    @DisplayName("Anonymous gets open:false when no availability")
    void closedWhenNoAvailability() throws Exception {
        Long id = priyaStoreId();
        mockMvc.perform(put("/api/stores/" + id + "/availability").with(csrf()).cookie(priya())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"slotMinutes\":30,\"maxBookingMinutes\":60,\"ranges\":[]}"))
                .andExpect(status().isOk());
        LocalDate tomorrow = StoreTime.today(Clock.systemUTC()).plusDays(1);
        mockMvc.perform(get("/api/stores/" + id + "/slots").param("date", tomorrow.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.open", is(false)))
                .andExpect(jsonPath("$.data.slots", hasSize(0)));
    }

    @Test
    @DisplayName("Date beyond 30 days is rejected")
    void rejectsDatePlus31() throws Exception {
        LocalDate far = StoreTime.today(Clock.systemUTC()).plusDays(31);
        mockMvc.perform(get("/api/stores/" + priyaStoreId() + "/slots").param("date", far.toString()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("within the next 30 days")));
    }

    @Test
    @DisplayName("Invalid duration is rejected")
    void rejectsBadDuration() throws Exception {
        LocalDate tomorrow = StoreTime.today(Clock.systemUTC()).plusDays(1);
        mockMvc.perform(get("/api/stores/" + priyaStoreId() + "/slots")
                        .param("date", tomorrow.toString()).param("duration", "45"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Monday 09-12 gives six 30-minute slots next Monday")
    void sixSlotsAfterAvailability() throws Exception {
        Long id = priyaStoreId();
        mockMvc.perform(put("/api/stores/" + id + "/availability").with(csrf()).cookie(priya())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"slotMinutes\":30,\"maxBookingMinutes\":60,\"ranges\":"
                                + "[{\"day\":\"MONDAY\",\"start\":\"09:00\",\"end\":\"12:00\"}]}"))
                .andExpect(status().isOk());
        LocalDate monday = StoreTime.today(Clock.systemUTC()).with(TemporalAdjusters.next(DayOfWeek.MONDAY));
        mockMvc.perform(get("/api/stores/" + id + "/slots").param("date", monday.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.open", is(true)))
                .andExpect(jsonPath("$.data.slots", hasSize(6)))
                .andExpect(jsonPath("$.data.startTimes", hasSize(6)));
    }
}
