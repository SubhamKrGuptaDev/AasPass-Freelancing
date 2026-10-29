package com.aaspass.controller;

import com.aaspass.entity.User;
import com.aaspass.entity.VerificationStatus;
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
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;
import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Owner-only writes, caller-derived identities and the dedicated KYC endpoint.
 */
@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
class OwnershipAndKycTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private StoreRepository storeRepository;
    @Autowired
    private JdbcTemplate jdbcTemplate;

    private Cookie[] login(String username) throws Exception {
        return AuthTestSupport.login(mockMvc, username, "password123");
    }

    private Long id(String username) {
        return userRepository.findByUsername(username).orElseThrow().getId();
    }

    private Long priyaStoreId() {
        return storeRepository.findByUserId(id("priya")).get(0).getId();
    }

    private static final String STORE_BODY = """
            {"storeName":"Aman Fix","category":"Tech","area":"Indiranagar","city":"Bengaluru",
             "userId":%d}""";

    @Test
    @DisplayName("Cannot update another user")
    void cannotUpdateAnotherUser() throws Exception {
        mockMvc.perform(put("/api/users/" + id("priya")).with(csrf()).cookie(login("aman"))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"bio\":\"hacked\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code", is("FORBIDDEN")));
    }

    @Test
    @DisplayName("Cannot touch another user's addresses")
    void cannotTouchAnotherUsersAddresses() throws Exception {
        mockMvc.perform(get("/api/users/" + id("priya") + "/addresses").cookie(login("aman")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code", is("FORBIDDEN")));
    }

    @Test
    @DisplayName("Cannot modify another user's store")
    void cannotUpdateAnotherUsersStore() throws Exception {
        Cookie[] aman = login("aman");
        Long storeId = priyaStoreId();
        mockMvc.perform(put("/api/stores/" + storeId).with(csrf()).cookie(aman)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"tagline\":\"x\"}"))
                .andExpect(status().isForbidden());
        mockMvc.perform(patch("/api/stores/" + storeId + "/toggle-status").with(csrf()).cookie(aman))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/api/stores/" + storeId + "/services").with(csrf()).cookie(aman)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Evil\",\"price\":1}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Store owner is the caller, not the body userId")
    void createStoreUsesCaller() throws Exception {
        Long amanId = id("aman");
        mockMvc.perform(post("/api/stores").with(csrf()).cookie(login("aman"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(STORE_BODY.formatted(id("priya"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.userId", is(amanId.intValue())));
    }

    @Test
    @DisplayName("Reviewer is the caller regardless of body")
    void reviewerIsCaller() throws Exception {
        mockMvc.perform(post("/api/stores/" + priyaStoreId() + "/reviews").with(csrf()).cookie(login("aman"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"userName\":\"Someone Else\",\"rating\":4.0,\"message\":\"ok\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.userName", is("Aman Sharma")));
    }

    @Test
    @DisplayName("Owner viewing their own store does not count as a view")
    void ownerViewIsNotCounted() throws Exception {
        Long storeId = priyaStoreId();
        var views = storeRepository.findById(storeId).orElseThrow().getViews();
        int expected = (views != null && views.getLifetime() != null) ? views.getLifetime() : 0;

        mockMvc.perform(post("/api/stores/" + storeId + "/views").with(csrf()).cookie(login("priya")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.views.lifetime", is(expected)));

        mockMvc.perform(post("/api/stores/" + storeId + "/views").with(csrf()).cookie(login("aman")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.views.lifetime", is(expected + 1)));
    }

    @Test
    @DisplayName("Write without CSRF token is rejected")
    void writeWithoutCsrfIsRejected() throws Exception {
        mockMvc.perform(put("/api/users/" + id("aman")).cookie(login("aman"))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"bio\":\"x\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code", is("CSRF_INVALID")));
    }

    @Test
    @DisplayName("KYC update encrypts at rest and masks in response")
    void kycUpdateEncryptsAndMasks() throws Exception {
        Long amanId = id("aman");
        mockMvc.perform(put("/api/users/me/kyc").with(csrf()).cookie(login("aman"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"aadharNumber\":\"123412341234\",\"panNumber\":\"PQRST6789Z\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.aadharNumber", is("XXXXXXXX1234")))
                .andExpect(jsonPath("$.data.panNumber", is("XXXXXX789Z")));

        userRepository.flush();
        String raw = jdbcTemplate.queryForObject(
                "SELECT aadhar_number FROM users WHERE id = ?", String.class, amanId);
        assertTrue(raw != null && raw.startsWith("enc:v1:"), "raw column should be encrypted");
    }

    @Test
    @DisplayName("KYC update normalises input")
    void kycUpdateNormalisesInput() throws Exception {
        mockMvc.perform(put("/api/users/me/kyc").with(csrf()).cookie(login("aman"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"aadharNumber\":\"9999 8888-7777\",\"panNumber\":\"abcde1234f\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.aadharNumber", is("XXXXXXXX7777")))
                .andExpect(jsonPath("$.data.panNumber", is("XXXXXX234F")));
    }

    @Test
    @DisplayName("KYC update rejects bad formats")
    void kycUpdateRejectsBadFormat() throws Exception {
        Cookie[] aman = login("aman");
        mockMvc.perform(put("/api/users/me/kyc").with(csrf()).cookie(aman)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"aadharNumber\":\"12345\"}"))
                .andExpect(status().isBadRequest());
        mockMvc.perform(put("/api/users/me/kyc").with(csrf()).cookie(aman)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"panNumber\":\"ABC123\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Verified Aadhaar is locked; unverified PAN stays editable; same value is a no-op")
    void verifiedKycCannotBeChanged() throws Exception {
        Cookie[] aman = login("aman");
        mockMvc.perform(put("/api/users/me/kyc").with(csrf()).cookie(aman)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"aadharNumber\":\"123412341234\",\"panNumber\":\"PQRST6789Z\"}"))
                .andExpect(status().isOk());
        markAadhaar(VerificationStatus.VERIFIED);

        // Changing the verified Aadhaar is refused, and the PAN in the same request is not applied either.
        mockMvc.perform(put("/api/users/me/kyc").with(csrf()).cookie(aman)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"aadharNumber\":\"999988887777\",\"panNumber\":\"ABCDE1234F\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("Aadhaar is verified and can no longer be changed")));
        User afterRefusal = userRepository.findById(id("aman")).orElseThrow();
        assertEquals("123412341234", afterRefusal.getAadharNumber());
        assertEquals("PQRST6789Z", afterRefusal.getPanNumber());

        // Re-sending the same Aadhaar keeps it verified; the unverified PAN can still change.
        mockMvc.perform(put("/api/users/me/kyc").with(csrf()).cookie(aman)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"aadharNumber\":\"1234 1234 1234\",\"panNumber\":\"ABCDE1234F\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.panNumber", is("XXXXXX234F")));
        User afterUpdate = userRepository.findById(id("aman")).orElseThrow();
        assertEquals(VerificationStatus.VERIFIED, afterUpdate.getAadharVerification().getStatus());
    }

    @Test
    @DisplayName("Rejected Aadhaar can be replaced and goes back to unverified")
    void rejectedKycCanBeReplaced() throws Exception {
        Cookie[] aman = login("aman");
        mockMvc.perform(put("/api/users/me/kyc").with(csrf()).cookie(aman)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"aadharNumber\":\"123412341234\"}"))
                .andExpect(status().isOk());
        markAadhaar(VerificationStatus.REJECTED);

        mockMvc.perform(put("/api/users/me/kyc").with(csrf()).cookie(aman)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"aadharNumber\":\"999988887777\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.aadharNumber", is("XXXXXXXX7777")));
        User after = userRepository.findById(id("aman")).orElseThrow();
        assertEquals(VerificationStatus.UNVERIFIED, after.getAadharVerification().getStatus());
    }

    private void markAadhaar(VerificationStatus status) {
        User user = userRepository.findById(id("aman")).orElseThrow();
        user.getAadharVerification().decide(status, null, 1L, Instant.now());
        userRepository.saveAndFlush(user);
    }

    @Test
    @DisplayName("Profile update ignores KYC fields")
    void updateUserIgnoresKycFields() throws Exception {
        Long amanId = id("aman");
        mockMvc.perform(put("/api/users/" + amanId).with(csrf()).cookie(login("aman"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"bio\":\"new\",\"aadharNumber\":\"XXXXXXXX0000\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.aadharNumber", is("XXXXXXXX7777")));
        assertTrue(userRepository.findById(amanId).orElseThrow().getAadharNumber().endsWith("7777"));
    }

    @Test
    @DisplayName("Public profile hides KYC; own profile masks it")
    void publicProfileHidesKyc() throws Exception {
        Long amanId = id("aman");
        mockMvc.perform(get("/api/users/" + amanId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.aadharNumber", nullValue()))
                .andExpect(jsonPath("$.data.panNumber", nullValue()));
        mockMvc.perform(get("/api/users/" + amanId).cookie(login("aman")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.aadharNumber", is("XXXXXXXX7777")));
    }

    @Test
    @DisplayName("Public profile hides addresses; own profile shows them")
    void publicProfileHidesAddresses() throws Exception {
        Long amanId = id("aman");
        mockMvc.perform(get("/api/users/" + amanId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.addresses", org.hamcrest.Matchers.empty()));
        mockMvc.perform(get("/api/users/" + amanId).cookie(login("aman")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.addresses", org.hamcrest.Matchers.not(org.hamcrest.Matchers.empty())));
    }

    @Test
    @DisplayName("Public profile hides email and phone; own profile shows them")
    void publicProfileHidesContactDetails() throws Exception {
        Long amanId = id("aman");
        mockMvc.perform(get("/api/users/" + amanId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.username", is("aman")))
                .andExpect(jsonPath("$.data.email", nullValue()))
                .andExpect(jsonPath("$.data.phone", nullValue()));
        mockMvc.perform(get("/api/users/" + amanId).cookie(login("priya")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email", nullValue()))
                .andExpect(jsonPath("$.data.phone", nullValue()));
        mockMvc.perform(get("/api/users/" + amanId).cookie(login("aman")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email", org.hamcrest.Matchers.notNullValue()))
                .andExpect(jsonPath("$.data.phone", org.hamcrest.Matchers.notNullValue()));
    }

    @Test
    @DisplayName("Updating a rejected PAN resets only the PAN verification")
    void kycUpdateResetsPanCheck() throws Exception {
        User aman = userRepository.findByUsername("aman").orElseThrow();
        aman.getPanVerification().decide(VerificationStatus.REJECTED, "Blurry", 1L, Instant.now());
        aman.getAadharVerification().decide(VerificationStatus.VERIFIED, null, 1L, Instant.now());
        userRepository.saveAndFlush(aman);
        mockMvc.perform(put("/api/users/me/kyc").with(csrf()).cookie(login("aman"))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"panNumber\":\"ZZZZZ9999Z\"}"))
                .andExpect(status().isOk());
        User after = userRepository.findByUsername("aman").orElseThrow();
        assertEquals(VerificationStatus.UNVERIFIED, after.getPanVerification().getStatus());
        assertEquals(VerificationStatus.VERIFIED, after.getAadharVerification().getStatus());
    }
}
