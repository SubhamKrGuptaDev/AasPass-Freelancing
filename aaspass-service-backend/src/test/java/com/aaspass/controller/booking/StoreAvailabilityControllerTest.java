package com.aaspass.controller.booking;

import com.aaspass.booking.StoreTime;
import com.aaspass.entity.Store;
import com.aaspass.entity.booking.Booking;
import com.aaspass.entity.booking.BookingStatus;
import com.aaspass.repository.StoreRepository;
import com.aaspass.repository.UserRepository;
import com.aaspass.repository.booking.BookingRepository;
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
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
class StoreAvailabilityControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private StoreRepository storeRepository;
    @Autowired
    private BookingRepository bookingRepository;

    private Cookie[] login(String username) throws Exception {
        return AuthTestSupport.login(mockMvc, username, "password123");
    }

    private Long id(String username) {
        return userRepository.findByUsername(username).orElseThrow().getId();
    }

    private Store priyaStore() {
        return storeRepository.findByUserId(id("priya")).get(0);
    }

    private String path(Long storeId) {
        return "/api/stores/" + storeId + "/availability";
    }

    private static final String MONDAY_BODY = """
            {"slotMinutes":45,"maxBookingMinutes":120,
             "ranges":[{"day":"MONDAY","start":"09:00","end":"13:00"}]}""";

    private LocalDate nextMonday() {
        return StoreTime.today(Clock.systemUTC()).with(TemporalAdjusters.next(DayOfWeek.MONDAY));
    }

    @Test
    @DisplayName("GET availability is public")
    void getIsPublic() throws Exception {
        mockMvc.perform(get(path(priyaStore().getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.slotMinutes", is(30)));
    }

    @Test
    @DisplayName("PUT replaces ranges and slot, rounding max")
    void putReplacesRangesAndSlot() throws Exception {
        Long storeId = priyaStore().getId();
        mockMvc.perform(put(path(storeId)).with(csrf()).cookie(login("priya"))
                        .contentType(MediaType.APPLICATION_JSON).content(MONDAY_BODY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.availability.maxBookingMinutes", is(90)))
                .andExpect(jsonPath("$.data.availability.slotMinutes", is(45)));
        mockMvc.perform(get(path(storeId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.ranges", hasSize(1)))
                .andExpect(jsonPath("$.data.ranges[0].day", is("MONDAY")))
                .andExpect(jsonPath("$.data.ranges[0].start", is("09:00:00")));
    }

    @Test
    @DisplayName("PUT by non-owner is forbidden")
    void putByNonOwnerForbidden() throws Exception {
        mockMvc.perform(put(path(priyaStore().getId())).with(csrf()).cookie(login("aman"))
                        .contentType(MediaType.APPLICATION_JSON).content(MONDAY_BODY))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code", is("FORBIDDEN")));
    }

    @Test
    @DisplayName("Overlapping ranges are rejected")
    void putInvalidOverlap400() throws Exception {
        String body = """
                {"slotMinutes":30,"maxBookingMinutes":60,"ranges":[
                 {"day":"MONDAY","start":"09:00","end":"13:00"},
                 {"day":"MONDAY","start":"12:00","end":"15:00"}]}""";
        mockMvc.perform(put(path(priyaStore().getId())).with(csrf()).cookie(login("priya"))
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("must not overlap")));
    }

    @Test
    @DisplayName("Invalid slot length is rejected; max above 720 is clamped")
    void slotValidationAndMaxClamp() throws Exception {
        Long storeId = priyaStore().getId();
        mockMvc.perform(put(path(storeId)).with(csrf()).cookie(login("priya"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"slotMinutes\":20,\"maxBookingMinutes\":60,\"ranges\":[]}"))
                .andExpect(status().isBadRequest());
        mockMvc.perform(put(path(storeId)).with(csrf()).cookie(login("priya"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"slotMinutes\":90,\"maxBookingMinutes\":5000,\"ranges\":[]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.availability.maxBookingMinutes", is(720)));
    }

    @Test
    @DisplayName("PUT warns about confirmed bookings now outside availability but keeps them")
    void putReturnsConfirmedOutsideCount() throws Exception {
        Store store = priyaStore();
        LocalDate monday = nextMonday();
        Booking booking = bookingRepository.save(Booking.builder()
                .store(store)
                .user(userRepository.findByUsername("rohan").orElseThrow())
                .startAt(LocalDateTime.of(monday, LocalTime.of(10, 0)))
                .endAt(LocalDateTime.of(monday, LocalTime.of(11, 0)))
                .durationMinutes(60)
                .status(BookingStatus.CONFIRMED)
                .build());
        String body = """
                {"slotMinutes":30,"maxBookingMinutes":60,
                 "ranges":[{"day":"TUESDAY","start":"09:00","end":"13:00"}]}""";
        mockMvc.perform(put(path(store.getId())).with(csrf()).cookie(login("priya"))
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.confirmedOutsideCount", is(1)));
        assertEquals(BookingStatus.CONFIRMED, bookingRepository.findById(booking.getId()).orElseThrow().getStatus());
    }

    @Test
    @DisplayName("Exceptions can be added, listed and deleted by the owner only")
    void exceptionsCrud() throws Exception {
        Long storeId = priyaStore().getId();
        Cookie[] priya = login("priya");
        String body = "{\"date\":\"" + nextMonday() + "\",\"type\":\"BLOCKED\",\"reason\":\"Holiday\"}";
        MvcResult created = mockMvc.perform(post(path(storeId) + "/exceptions").with(csrf()).cookie(priya)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.type", is("BLOCKED")))
                .andExpect(jsonPath("$.data.confirmedOutsideCount", is(0)))
                .andReturn();
        Number excId = com.jayway.jsonpath.JsonPath.read(created.getResponse().getContentAsString(), "$.data.id");

        mockMvc.perform(get(path(storeId) + "/exceptions").cookie(priya))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].reason", is("Holiday")));
        mockMvc.perform(get(path(storeId) + "/exceptions").cookie(login("aman")))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete(path(storeId) + "/exceptions/" + excId).with(csrf()).cookie(login("aman")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code", is("FORBIDDEN")));
        mockMvc.perform(delete(path(storeId) + "/exceptions/" + excId).with(csrf()).cookie(priya))
                .andExpect(status().isOk());
        mockMvc.perform(get(path(storeId) + "/exceptions").cookie(priya))
                .andExpect(jsonPath("$.data", hasSize(0)));
    }

    @Test
    @DisplayName("Exception in the past is rejected")
    void exceptionInPastRejected() throws Exception {
        String body = "{\"date\":\"" + nextMonday().minusDays(60) + "\",\"type\":\"BLOCKED\"}";
        mockMvc.perform(post(path(priyaStore().getId()) + "/exceptions").with(csrf()).cookie(login("priya"))
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Date must be today or later")));
    }

    private static final String NEW_STORE = """
            {"storeName":"Aman Fix","category":"Tech","area":"Indiranagar","city":"Bengaluru"%s}""";

    @Test
    @DisplayName("Create store saves supplied availability")
    void createStoreWithAvailability() throws Exception {
        String body = NEW_STORE.formatted(",\"availability\":{\"slotMinutes\":60,\"maxBookingMinutes\":120,"
                + "\"ranges\":[{\"day\":\"FRIDAY\",\"start\":\"10:00\",\"end\":\"14:00\"}]}");
        MvcResult res = mockMvc.perform(post("/api/stores").with(csrf()).cookie(login("aman"))
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.bookingsOpen", is(true)))
                .andReturn();
        Number storeId = com.jayway.jsonpath.JsonPath.read(res.getResponse().getContentAsString(), "$.data.id");
        mockMvc.perform(get(path(storeId.longValue())))
                .andExpect(jsonPath("$.data.slotMinutes", is(60)))
                .andExpect(jsonPath("$.data.ranges", hasSize(1)))
                .andExpect(jsonPath("$.data.ranges[0].day", is("FRIDAY")));
    }

    @Test
    @DisplayName("Create store without availability has bookings closed")
    void createStoreWithoutAvailabilityHasNone() throws Exception {
        mockMvc.perform(post("/api/stores").with(csrf()).cookie(login("aman"))
                        .contentType(MediaType.APPLICATION_JSON).content(NEW_STORE.formatted("")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.bookingsOpen", is(false)));
    }

    @Test
    @DisplayName("Updating a store without the availability field leaves it unchanged")
    void updateStoreWithoutAvailabilityLeavesIt() throws Exception {
        Long storeId = priyaStore().getId();
        Cookie[] priya = login("priya");
        mockMvc.perform(put(path(storeId)).with(csrf()).cookie(priya)
                        .contentType(MediaType.APPLICATION_JSON).content(MONDAY_BODY))
                .andExpect(status().isOk());
        mockMvc.perform(put("/api/stores/" + storeId).with(csrf()).cookie(priya)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"tagline\":\"new tagline\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.bookingsOpen", is(true)));
        mockMvc.perform(get(path(storeId)))
                .andExpect(jsonPath("$.data.ranges", hasSize(1)));
    }

    @Test
    @DisplayName("Updating a store with availability replaces it")
    void updateStoreWithAvailabilityReplaces() throws Exception {
        Long storeId = priyaStore().getId();
        mockMvc.perform(put("/api/stores/" + storeId).with(csrf()).cookie(login("priya"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"availability\":{\"slotMinutes\":15,\"maxBookingMinutes\":30,"
                                + "\"ranges\":[{\"day\":\"SUNDAY\",\"start\":\"08:00\",\"end\":\"09:00\"}]}}"))
                .andExpect(status().isOk());
        mockMvc.perform(get(path(storeId)))
                .andExpect(jsonPath("$.data.slotMinutes", is(15)))
                .andExpect(jsonPath("$.data.ranges[0].day", is("SUNDAY")));
    }
}
