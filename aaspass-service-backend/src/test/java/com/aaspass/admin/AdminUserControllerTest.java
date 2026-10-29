package com.aaspass.admin;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.aaspass.admin.entity.AdminAuditAction;
import com.aaspass.admin.entity.AuditTargetType;
import com.aaspass.admin.repository.AdminAuditRepository;
import com.aaspass.entity.User;
import com.aaspass.entity.VerificationStatus;
import com.aaspass.repository.UserRepository;
import com.aaspass.support.AdminTestSupport;
import com.aaspass.support.AuthTestSupport;
import jakarta.persistence.EntityManager;
import jakarta.servlet.http.Cookie;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
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

/** Admin user search, KYC verification and suspension endpoints through the real admin security chain. */
@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
class AdminUserControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired UserRepository userRepository;
    @Autowired AdminAuditRepository adminAuditRepository;
    @Autowired EntityManager entityManager;

    private Cookie[] admin;
    private Long amanId;

    @BeforeEach
    void setUp() throws Exception {
        admin = AdminTestSupport.login(mockMvc);
        amanId = userRepository.findByEmail("aman.sharma@example.com").orElseThrow().getId();
    }

    private ResultActions decide(String item, String body) throws Exception {
        return mockMvc.perform(put("/api/admin/users/" + amanId + "/verification/" + item)
                .cookie(admin).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body));
    }

    private ResultActions suspend(String body) throws Exception {
        return mockMvc.perform(post("/api/admin/users/" + amanId + "/suspension")
                .cookie(admin).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body));
    }

    private String suspendBody(Instant until, String reason) {
        return "{\"until\":\"" + until + "\",\"reason\":\"" + reason + "\"}";
    }

    @Test
    void searchByEmailFragment() throws Exception {
        mockMvc.perform(get("/api/admin/users").cookie(admin).param("q", "priya.nair"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements", is(1)))
                .andExpect(jsonPath("$.data.content[0].email", is("priya.nair@example.com")));
    }

    @Test
    void pendingFilterListsUsersWithUnverifiedValues() throws Exception {
        mockMvc.perform(get("/api/admin/users").cookie(admin).param("verification", "pending"))
                .andExpect(jsonPath("$.data.totalElements", is(3)));
    }

    @Test
    void detailShowsUnmaskedKycAndAudits() throws Exception {
        mockMvc.perform(get("/api/admin/users/" + amanId).cookie(admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.panNumber", is("ABCDE1234F")))
                .andExpect(jsonPath("$.data.aadharNumber", is("999988887777")));
        var entries = adminAuditRepository.findByTargetTypeAndTargetIdOrderByIdDesc(AuditTargetType.USER, amanId);
        assertEquals(AdminAuditAction.VIEW_USER_KYC, entries.get(0).getAction());
        String details = entries.get(0).getDetails();
        assertTrue(details == null || !details.contains("ABCDE1234F"));
    }

    @Test
    void verifyAllThreeMakesUserVerifiedPublicly() throws Exception {
        for (String item : new String[] {"phone", "pan", "aadhar"}) {
            decide(item, "{\"decision\":\"VERIFIED\"}").andExpect(status().isOk());
        }
        mockMvc.perform(get("/api/users/" + amanId))
                .andExpect(jsonPath("$.data.verified", is(true)));
        mockMvc.perform(get("/api/admin/users").cookie(admin).param("verification", "verified"))
                .andExpect(jsonPath("$.data.content[*].id", hasItem(amanId.intValue())));
        var entries = adminAuditRepository.findByTargetTypeAndTargetIdOrderByIdDesc(AuditTargetType.USER, amanId);
        assertEquals(AdminAuditAction.VERIFY_ITEM, entries.get(0).getAction());
        assertEquals("item=AADHAR", entries.get(0).getDetails());
    }

    @Test
    void rejectNeedsReason() throws Exception {
        decide("pan", "{\"decision\":\"REJECTED\"}").andExpect(status().isBadRequest());
        decide("pan", "{\"decision\":\"REJECTED\",\"reason\":\"Blurry\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.verification.pan.status", is("REJECTED")));
    }

    @Test
    void cannotVerifyMissingValue() throws Exception {
        User aman = userRepository.findById(amanId).orElseThrow();
        aman.setPhone(null);
        userRepository.saveAndFlush(aman);
        decide("phone", "{\"decision\":\"VERIFIED\"}").andExpect(status().isBadRequest());
        entityManager.flush();
        entityManager.clear();
        assertEquals(VerificationStatus.UNVERIFIED,
                userRepository.findById(amanId).orElseThrow().getPhoneVerification().getStatus());
    }

    @Test
    void unverifiedDecisionIs400() throws Exception {
        decide("pan", "{\"decision\":\"UNVERIFIED\"}").andExpect(status().isBadRequest());
    }

    @Test
    void unknownItemIs400() throws Exception {
        decide("passport", "{\"decision\":\"VERIFIED\"}").andExpect(status().isBadRequest());
    }

    @Test
    void suspendRevokesSessionsAndBlocksLogin() throws Exception {
        Cookie[] user = AuthTestSupport.login(mockMvc, "aman.sharma@example.com", "password123");
        mockMvc.perform(get("/api/auth/me").cookie(user)).andExpect(status().isOk());
        suspend(suspendBody(Instant.now().plus(7, ChronoUnit.DAYS), "Spam")).andExpect(status().isOk());
        mockMvc.perform(get("/api/auth/me").cookie(user)).andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"usernameOrEmail\":\"aman.sharma@example.com\",\"password\":\"password123\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code", is("ACCOUNT_SUSPENDED")));
        var entries = adminAuditRepository.findByTargetTypeAndTargetIdOrderByIdDesc(AuditTargetType.USER, amanId);
        assertEquals(AdminAuditAction.SUSPEND_USER, entries.get(0).getAction());
    }

    @Test
    void suspendValidatesUntil() throws Exception {
        suspend(suspendBody(Instant.now().minus(1, ChronoUnit.DAYS), "Spam")).andExpect(status().isBadRequest());
        suspend(suspendBody(Instant.now().plus(400, ChronoUnit.DAYS), "Spam")).andExpect(status().isBadRequest());
        suspend(suspendBody(Instant.now().plus(2, ChronoUnit.DAYS), " ")).andExpect(status().isBadRequest());
    }

    @Test
    void liftSuspensionAllowsLogin() throws Exception {
        suspend(suspendBody(Instant.now().plus(7, ChronoUnit.DAYS), "Spam")).andExpect(status().isOk());
        mockMvc.perform(delete("/api/admin/users/" + amanId + "/suspension").cookie(admin).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.summary.suspendedUntil").doesNotExist());
        AuthTestSupport.login(mockMvc, "aman.sharma@example.com", "password123");
        var entries = adminAuditRepository.findByTargetTypeAndTargetIdOrderByIdDesc(AuditTargetType.USER, amanId);
        assertEquals(AdminAuditAction.LIFT_SUSPENSION, entries.get(0).getAction());
        assertFalse(userRepository.findById(amanId).orElseThrow().isSuspended(Instant.now()));
    }

    @Test
    void suspendedFilter() throws Exception {
        suspend(suspendBody(Instant.now().plus(7, ChronoUnit.DAYS), "Spam")).andExpect(status().isOk());
        mockMvc.perform(get("/api/admin/users").cookie(admin).param("suspended", "true"))
                .andExpect(jsonPath("$.data.totalElements", is(1)))
                .andExpect(jsonPath("$.data.content[0].id", is(amanId.intValue())));
        mockMvc.perform(get("/api/admin/users").cookie(admin).param("suspended", "false"))
                .andExpect(jsonPath("$.data.content[*].id", not(hasItem(amanId.intValue()))));
    }
}
