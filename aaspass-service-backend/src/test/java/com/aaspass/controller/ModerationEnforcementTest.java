package com.aaspass.controller;

import com.aaspass.dto.response.UserResponse;
import com.aaspass.entity.Store;
import com.aaspass.entity.User;
import com.aaspass.entity.VerificationStatus;
import com.aaspass.repository.StoreRepository;
import com.aaspass.repository.UserRepository;
import com.aaspass.security.session.SessionRevokeReason;
import com.aaspass.security.session.SessionService;
import com.aaspass.service.mapper.DtoMapper;
import com.aaspass.support.AuthTestSupport;
import jakarta.persistence.EntityManager;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.nullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Suspension and admin-block enforcement in the user-facing API, plus verification exposure. */
@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
class ModerationEnforcementTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private StoreRepository storeRepository;
    @Autowired private SessionService sessionService;
    @Autowired private EntityManager entityManager;

    private User user(String username) {
        return userRepository.findByUsername(username).orElseThrow();
    }

    private Store priyaStore() {
        return storeRepository.findByUserId(user("priya").getId()).get(0);
    }

    private void suspend(String username, Instant until) {
        User u = user(username);
        u.setSuspendedUntil(until);
        u.setSuspensionReason("Spam");
        userRepository.saveAndFlush(u);
    }

    private void activatePriyaStore() {
        Store s = priyaStore();
        s.setIsActive(true);
        storeRepository.saveAndFlush(s);
    }

    private void blockPriyaStore() {
        Store s = priyaStore();
        s.setAdminBlocked(true);
        s.setAdminBlockReason("Fake listing");
        storeRepository.saveAndFlush(s);
    }

    private Cookie[] login(String username) throws Exception {
        return AuthTestSupport.login(mockMvc, username, "password123");
    }

    @Test
    void suspendedUserCannotLogIn() throws Exception {
        suspend("priya", Instant.now().plus(1, ChronoUnit.DAYS));
        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"usernameOrEmail\":\"priya\",\"password\":\"password123\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("ACCOUNT_SUSPENDED"))
                .andExpect(jsonPath("$.message", containsString("Spam")))
                .andExpect(jsonPath("$.message", containsString("UTC")));
    }

    @Test
    void expiredSuspensionAllowsLogin() throws Exception {
        suspend("priya", Instant.now().minus(1, ChronoUnit.MINUTES));
        login("priya");
    }

    @Test
    void suspensionRevokesSessions() throws Exception {
        Cookie[] cookies = login("priya");
        sessionService.revokeAllForUser(user("priya").getId(), SessionRevokeReason.SUSPENDED);
        entityManager.flush();
        entityManager.clear();
        mockMvc.perform(get("/api/auth/me").cookie(cookies))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("SESSION_REVOKED"));
    }

    @Test
    void blockedStoreHiddenFromSearch() throws Exception {
        activatePriyaStore();
        mockMvc.perform(get("/api/stores").param("city", "Bengaluru"))
                .andExpect(jsonPath("$.data[*].storeName", hasItem("PixelCraft Studios")));
        blockPriyaStore();
        mockMvc.perform(get("/api/stores").param("city", "Bengaluru"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[*].storeName", not(hasItem("PixelCraft Studios"))));
    }

    @Test
    void suspendedOwnersStoresHiddenFromSearch() throws Exception {
        activatePriyaStore();
        suspend("priya", Instant.now().plus(1, ChronoUnit.DAYS));
        mockMvc.perform(get("/api/stores").param("city", "Bengaluru"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[*].storeName", not(hasItem("PixelCraft Studios"))));
    }

    @Test
    void blockedStoreIs404ForOthersButVisibleToOwner() throws Exception {
        Long id = priyaStore().getId();
        blockPriyaStore();
        mockMvc.perform(get("/api/stores/" + id)).andExpect(status().isNotFound());
        mockMvc.perform(get("/api/stores/" + id).cookie(login("priya")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.adminBlocked").value(true))
                .andExpect(jsonPath("$.data.adminBlockReason").value("Fake listing"));
    }

    @Test
    void blockedStoreOmittedFromOwnerListForOthers() throws Exception {
        Long priyaId = user("priya").getId();
        blockPriyaStore();
        mockMvc.perform(get("/api/stores/user/" + priyaId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(0)));
        mockMvc.perform(get("/api/stores/user/" + priyaId).cookie(login("priya")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)));
    }

    @Test
    void ownerCannotActivateBlockedStore() throws Exception {
        Long id = priyaStore().getId();
        blockPriyaStore();
        Cookie[] cookies = login("priya");
        mockMvc.perform(patch("/api/stores/" + id + "/activate").with(csrf()).cookie(cookies))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("STORE_BLOCKED_BY_ADMIN"));
        mockMvc.perform(patch("/api/stores/" + id + "/deactivate").with(csrf()).cookie(cookies))
                .andExpect(status().isOk());
    }

    @Test
    void publicResponsesExposeOnlyVerifiedFlag() throws Exception {
        Long priyaId = user("priya").getId();
        Long storeId = priyaStore().getId();
        mockMvc.perform(get("/api/users/" + priyaId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.verified").value(false))
                .andExpect(jsonPath("$.data.verification").value(nullValue()));
        User p = user("priya");
        Instant now = Instant.now();
        p.getPhoneVerification().decide(VerificationStatus.VERIFIED, null, 1L, now);
        p.getPanVerification().decide(VerificationStatus.VERIFIED, null, 1L, now);
        p.getAadharVerification().decide(VerificationStatus.VERIFIED, null, 1L, now);
        userRepository.saveAndFlush(p);
        mockMvc.perform(get("/api/users/" + priyaId))
                .andExpect(jsonPath("$.data.verified").value(true))
                .andExpect(jsonPath("$.data.verification").value(nullValue()));
        mockMvc.perform(get("/api/stores/" + storeId))
                .andExpect(jsonPath("$.data.ownerVerified").value(true))
                .andExpect(jsonPath("$.data.adminBlocked").value(false));
    }

    @Test
    void meExposesPerItemVerification() throws Exception {
        User aman = user("aman");
        aman.getPanVerification().decide(VerificationStatus.REJECTED, "Blurry", 1L, Instant.now());
        userRepository.saveAndFlush(aman);
        mockMvc.perform(get("/api/auth/me").cookie(login("aman")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.verification.pan.status").value("REJECTED"))
                .andExpect(jsonPath("$.data.verification.pan.reason").value("Blurry"));
    }

    @Test
    void blockedStoreOmittedFromPublicProfileButShownToOwner() throws Exception {
        Long priyaId = user("priya").getId();
        blockPriyaStore();
        mockMvc.perform(get("/api/users/" + priyaId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.stores", hasSize(0)));
        mockMvc.perform(get("/api/auth/me").cookie(login("priya")))
                .andExpect(jsonPath("$.data.stores", hasSize(1)))
                .andExpect(jsonPath("$.data.stores[0].adminBlocked").value(true));
    }

    @Test
    void suspendedOwnerStoresOmittedFromPublicProfile() throws Exception {
        suspend("priya", Instant.now().plus(1, ChronoUnit.DAYS));
        mockMvc.perform(get("/api/users/" + user("priya").getId()))
                .andExpect(jsonPath("$.data.stores", hasSize(0)));
    }

    @Test
    void viewsOnBlockedStoreIs404ForAnonymousAnd200ForOwner() throws Exception {
        Long id = priyaStore().getId();
        blockPriyaStore();
        mockMvc.perform(post("/api/stores/" + id + "/views").with(csrf()))
                .andExpect(status().isNotFound());
        mockMvc.perform(post("/api/stores/" + id + "/views").with(csrf()).cookie(login("priya")))
                .andExpect(status().isOk());
    }

    @Test
    void ownerSuspensionAloneHidesStoreFromOthers() throws Exception {
        Long id = priyaStore().getId();
        Long priyaId = user("priya").getId();
        suspend("priya", Instant.now().plus(1, ChronoUnit.DAYS));
        mockMvc.perform(get("/api/stores/" + id)).andExpect(status().isNotFound());
        mockMvc.perform(get("/api/stores/user/" + priyaId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(0)));
    }

    @Test
    void userWithNullEmbeddedChecksMapsSafely() {
        User u = new User();
        u.setPhoneVerification(null);
        u.setPanVerification(null);
        u.setAadharVerification(null);
        UserResponse r = DtoMapper.toUserResponse(u, false, false, true);
        assertFalse(r.verified());
        assertEquals(VerificationStatus.UNVERIFIED, r.verification().phone().status());
    }
}
