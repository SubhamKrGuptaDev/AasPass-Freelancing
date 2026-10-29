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

    private StoreCreateRequest.StoreCreateRequestBuilder countryStoreBuilder(String name) {
        return StoreCreateRequest.builder()
                .storeName(name)
                .category("Tech Support, PC Builds & Hardware Setup")
                .area("Downtown")
                .city("Austin");
    }

    private tools.jackson.databind.JsonNode createStore(StoreCreateRequest request) throws Exception {
        String body = mockMvc.perform(post("/api/stores").with(csrf()).cookie(loginAman())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(body);
    }

    @Test
    @DisplayName("POST /api/stores - Country defaults to India when omitted")
    public void testCreateStoreDefaultsCountryToIndia() throws Exception {
        mockMvc.perform(post("/api/stores").with(csrf()).cookie(loginAman())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(countryStoreBuilder("Default Country Store").build())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.country", is("India")));
    }

    @Test
    @DisplayName("POST /api/stores - City longer than 60 characters is rejected with 400")
    public void testCreateStoreRejectsOverlongCity() throws Exception {
        mockMvc.perform(post("/api/stores").with(csrf()).cookie(loginAman())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                countryStoreBuilder("Long City Store").city("x".repeat(61)).build())))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/stores - Country is stored when provided")
    public void testCreateStoreWithCountry() throws Exception {
        mockMvc.perform(post("/api/stores").with(csrf()).cookie(loginAman())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                countryStoreBuilder("US Store").country("United States").build())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.country", is("United States")));
    }

    @Test
    @DisplayName("GET /api/stores?country= - Filters by country case-insensitively")
    public void testGetStoresFilterByCountry() throws Exception {
        long usId = createStore(countryStoreBuilder("US Filter Store").country("United States").build())
                .path("data").path("id").asLong();
        mockMvc.perform(patch("/api/stores/" + usId + "/activate").with(csrf()).cookie(loginAman()))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/stores").param("country", "india"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data[*].country", everyItem(is("India"))));

        mockMvc.perform(get("/api/stores").param("country", "United States"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].country", is("United States")));
    }

    @Test
    @DisplayName("PUT /api/stores/{id} - Update without country keeps existing country")
    public void testUpdateStoreWithoutCountryKeepsCountry() throws Exception {
        long id = createStore(countryStoreBuilder("US Update Store").country("United States").build())
                .path("data").path("id").asLong();

        mockMvc.perform(put("/api/stores/" + id).with(csrf()).cookie(loginAman())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"tagline\":\"Updated tagline\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.tagline", is("Updated tagline")))
                .andExpect(jsonPath("$.data.country", is("United States")));
    }

    @Test
    @DisplayName("POST /api/stores - Google Maps link is optional, trimmed and stored")
    public void testCreateStoreWithGoogleMapLink() throws Exception {
        tools.jackson.databind.JsonNode withoutLink = createStore(countryStoreBuilder("No Map Store").build());
        tools.jackson.databind.JsonNode noLink = withoutLink.path("data").path("googleMapLink");
        org.junit.jupiter.api.Assertions.assertTrue(noLink.isNull() || noLink.isMissingNode(), "link should be empty");

        mockMvc.perform(post("/api/stores").with(csrf()).cookie(loginAman())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(countryStoreBuilder("Map Store")
                                .googleMapLink("  https://maps.app.goo.gl/AbCdEf123  ").build())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.googleMapLink", is("https://maps.app.goo.gl/AbCdEf123")));
    }

    @Test
    @DisplayName("POST /api/stores - Non-Google-Maps or overlong links are rejected with 400")
    public void testCreateStoreRejectsInvalidGoogleMapLink() throws Exception {
        String overlong = "https://maps.app.goo.gl/" + "a".repeat(StoreCreateRequest.GOOGLE_MAP_LINK_MAX_LENGTH);
        for (String link : new String[]{"https://example.com/maps", "https://maps.google.com.evil.io/x", "javascript:alert(1)", overlong}) {
            mockMvc.perform(post("/api/stores").with(csrf()).cookie(loginAman())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(
                                    countryStoreBuilder("Bad Map Store").googleMapLink(link).build())))
                    .andExpect(status().isBadRequest());
        }
    }

    @Test
    @DisplayName("PUT /api/stores/{id} - Google Maps link can be set, kept, rejected and cleared")
    public void testUpdateStoreGoogleMapLink() throws Exception {
        long id = createStore(countryStoreBuilder("Map Update Store").build()).path("data").path("id").asLong();
        String longPlaceLink = "https://www.google.co.in/maps/place/" + "%E0%A4%87".repeat(100) + "/@12.97,77.64,17z";

        mockMvc.perform(put("/api/stores/" + id).with(csrf()).cookie(loginAman())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"googleMapLink\":\"" + longPlaceLink + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.googleMapLink", is(longPlaceLink)));

        // Omitting the field keeps the saved link
        mockMvc.perform(put("/api/stores/" + id).with(csrf()).cookie(loginAman())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"tagline\":\"Still mapped\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.googleMapLink", is(longPlaceLink)));

        mockMvc.perform(put("/api/stores/" + id).with(csrf()).cookie(loginAman())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"googleMapLink\":\"https://example.com/x\"}"))
                .andExpect(status().isBadRequest());

        // A blank link clears it
        String cleared = mockMvc.perform(put("/api/stores/" + id).with(csrf()).cookie(loginAman())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"googleMapLink\":\"\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        tools.jackson.databind.JsonNode link = objectMapper.readTree(cleared).path("data").path("googleMapLink");
        org.junit.jupiter.api.Assertions.assertTrue(link.isNull() || link.isMissingNode(), "link should be cleared");
    }

    @Test
    @DisplayName("POST /api/stores - New store starts inactive and is hidden from search")
    public void testNewStoreIsInactiveAndHiddenFromSearch() throws Exception {
        long id = createStore(countryStoreBuilder("Hidden Store").country("Canada").build())
                .path("data").path("id").asLong();

        mockMvc.perform(get("/api/stores/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isActive", is(false)));

        mockMvc.perform(get("/api/stores").param("country", "Canada"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(0)));
    }

    @Test
    @DisplayName("PATCH /api/stores/{id}/activate and /deactivate - Toggle search visibility")
    public void testActivateAndDeactivateStore() throws Exception {
        long id = createStore(countryStoreBuilder("Toggle Store").country("Canada").build())
                .path("data").path("id").asLong();

        mockMvc.perform(patch("/api/stores/" + id + "/activate").with(csrf()).cookie(loginAman()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isActive", is(true)));
        mockMvc.perform(get("/api/stores").param("country", "Canada"))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id", is((int) id)));

        mockMvc.perform(patch("/api/stores/" + id + "/deactivate").with(csrf()).cookie(loginAman()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isActive", is(false)));
        mockMvc.perform(get("/api/stores").param("country", "Canada"))
                .andExpect(jsonPath("$.data", hasSize(0)));
    }

    @Test
    @DisplayName("PATCH /api/stores/{id}/activate - Requires sign-in and ownership")
    public void testActivateStoreRequiresOwner() throws Exception {
        long id = createStore(countryStoreBuilder("Owned Store").build())
                .path("data").path("id").asLong();

        mockMvc.perform(patch("/api/stores/" + id + "/activate").with(csrf()))
                .andExpect(status().isUnauthorized());

        Cookie[] priya = AuthTestSupport.login(mockMvc, "priya", "password123");
        mockMvc.perform(patch("/api/stores/" + id + "/activate").with(csrf()).cookie(priya))
                .andExpect(status().isForbidden());
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
    @DisplayName("PUT /api/users/{id} - Should update profile and keep KYC masked")
    public void testUpdateUserProfile() throws Exception {
        UserUpdateRequest request = UserUpdateRequest.builder()
                .bio("Updated bio for freelance gigs around Bengaluru cafes")
                .phone("+91 91234 56789")
                .country("India")
                .build();

        mockMvc.perform(put("/api/users/1").with(csrf()).cookie(loginAman())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.bio", containsString("Updated bio")))
                .andExpect(jsonPath("$.data.country", is("India")))
                .andExpect(jsonPath("$.data.panNumber", is("XXXXXX234F")));
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
                .rating(4.5)
                .message("Great work! Delivered our cafe video edit in under 20 hours.")
                .build();

        mockMvc.perform(post("/api/stores/1/reviews").with(csrf()).cookie(loginAman())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reviewRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.rating", is(4.5)))
                .andExpect(jsonPath("$.data.userName", is("Aman Sharma")));

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

        mockMvc.perform(post("/api/stores/1/services").with(csrf()).cookie(AuthTestSupport.login(mockMvc, "priya", "password123"))
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
        mockMvc.perform(post("/api/stores/1/views").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.views.lifetime", greaterThan(0)));
    }
}
