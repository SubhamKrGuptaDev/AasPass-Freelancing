package com.aaspass.controller;

import com.aaspass.dto.request.AddressRequest;
import com.aaspass.dto.request.ServiceItemRequest;
import com.aaspass.dto.request.StoreCreateRequest;
import com.aaspass.dto.request.StoreReviewRequest;
import com.aaspass.dto.request.UserUpdateRequest;
import com.aaspass.support.AuthTestSupport;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
public class StoreAndUserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private Cookie[] loginAman() throws Exception {
        return AuthTestSupport.login(mockMvc, "aman", "password123");
    }

    @Test
    @DisplayName("GET /api/stores - Should return seeded storefronts")
    public void testGetStores() throws Exception {
        mockMvc.perform(get("/api/stores"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("GET /api/stores with filters - Should filter by city and category")
    public void testGetStoresWithFilter() throws Exception {
        mockMvc.perform(get("/api/stores")
                        .param("city", "Bengaluru")
                        .param("category", "Video & Editing"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("POST /api/stores - Should create new store for a user")
    public void testCreateStore() throws Exception {
        StoreCreateRequest request = StoreCreateRequest.builder()
                .userId(1L)
                .storeName("Aman's Tech Workshop")
                .tagline("PC Assembly, Upgrades & Hardware Diagnostics")
                .category("Tech Support, PC Builds & Hardware Setup")
                .skills(List.of("Custom PC Build", "GPU Testing", "Thermal Paste Repaste", "Windows Optimization"))
                .experienceYears(2)
                .hourlyRate(BigDecimal.valueOf(400))
                .startingPrice(BigDecimal.valueOf(300))
                .area("Indiranagar")
                .city("Bengaluru")
                .serviceRadiusKm(5)
                .description("Neighborhood PC enthusiast offering same-day PC assembly and cleaning at your place or mine.")
                .build();

        mockMvc.perform(post("/api/stores").with(csrf()).cookie(loginAman())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.storeName", is("Aman's Tech Workshop")))
                .andExpect(jsonPath("$.data.userId", is(1)));
    }

    @Test
    @DisplayName("GET /api/users/{id} - Should fetch user profile")
    public void testGetUserProfile() throws Exception {
        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.username", is("aman")));
    }

    @Test
    @DisplayName("PUT /api/users/{id} - Should update user profile KYC details")
    public void testUpdateUserProfile() throws Exception {
        UserUpdateRequest request = UserUpdateRequest.builder()
                .bio("Updated bio for freelance gigs around Bengaluru cafes")
                .phone("+91 91234 56789")
                .aadharNumber("XXXX-XXXX-9999")
                .panNumber("NEWPN1234M")
                .country("India")
                .build();

        mockMvc.perform(put("/api/users/1").with(csrf()).cookie(loginAman())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.bio", containsString("Updated bio")))
                .andExpect(jsonPath("$.data.country", is("India")))
                .andExpect(jsonPath("$.data.panNumber", is("XXXXXX234M")));
    }

    @Test
    @DisplayName("PUT /api/users/{id} - Blank avatar should assign random avatar")
    public void testUpdateUserAvatarFallback() throws Exception {
        UserUpdateRequest request = UserUpdateRequest.builder()
                .avatarUrl("") // empty string should trigger random avatar generation
                .build();

        mockMvc.perform(put("/api/users/1").with(csrf()).cookie(loginAman())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.avatarUrl", containsString("dicebear.com")));
    }

    @Test
    @DisplayName("POST & GET /api/users/{userId}/addresses - Address lifecycle")
    public void testAddressLifecycle() throws Exception {
        AddressRequest addressRequest = AddressRequest.builder()
                .addressType("OTHER")
                .addressLine("Third Wave Coffee, 100 Feet Rd")
                .area("Indiranagar")
                .city("Bengaluru")
                .state("Karnataka")
                .pincode("560038")
                .isDefault(false)
                .build();

        mockMvc.perform(post("/api/users/1/addresses").with(csrf()).cookie(loginAman())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(addressRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.area", is("Indiranagar")));

        mockMvc.perform(get("/api/users/1/addresses").cookie(loginAman()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("POST & GET /api/stores/{storeId}/reviews - Review submission with rating bounds [1.0 - 5.0]")
    public void testStoreReviewLifecycle() throws Exception {
        StoreReviewRequest reviewRequest = StoreReviewRequest.builder()
                .userName("Karan Patel")
                .rating(4.5)
                .message("Great work! Delivered our cafe video edit in under 20 hours.")
                .build();

        mockMvc.perform(post("/api/stores/1/reviews").with(csrf()).cookie(loginAman())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reviewRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.rating", is(4.5)))
                .andExpect(jsonPath("$.data.userName", is("Karan Patel")));

        mockMvc.perform(get("/api/stores/1/reviews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("POST & GET /api/stores/{storeId}/services - Gig service packages")
    public void testStoreServicePackages() throws Exception {
        ServiceItemRequest itemRequest = ServiceItemRequest.builder()
                .name("Speed Color Grade Pack")
                .price(BigDecimal.valueOf(600))
                .duration("12 hrs")
                .description("Cinematic LUTs and exposure balancing.")
                .build();

        mockMvc.perform(post("/api/stores/1/services").with(csrf()).cookie(loginAman())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(itemRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.name", is("Speed Color Grade Pack")));

        mockMvc.perform(get("/api/stores/1/services"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("POST /api/stores/{id}/views - Track store view analytics")
    public void testTrackStoreViews() throws Exception {
        mockMvc.perform(post("/api/stores/1/views").with(csrf())
                        .param("viewerId", "neighbor-client-44"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.views.lifetime", greaterThan(0)));
    }
}
