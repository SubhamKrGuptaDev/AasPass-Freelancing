package com.aaspass.admin;

import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.aaspass.admin.entity.AdminAuditAction;
import com.aaspass.admin.entity.AdminAuditEntry;
import com.aaspass.admin.entity.AdminUser;
import com.aaspass.admin.repository.AdminAuditRepository;
import com.aaspass.admin.repository.AdminUserRepository;
import com.aaspass.admin.security.AdminCookieService;
import com.aaspass.security.token.AuthCookieService;
import com.aaspass.support.AdminTestSupport;
import com.aaspass.support.AuthTestSupport;
import jakarta.servlet.http.Cookie;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

/**
 * End-to-end tests of admin authentication through the real admin security chain, including the
 * isolation of admin and user identities. Not {@code @Transactional}: revocations must commit.
 */
@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class AdminAuthTest {

    private static final String ASID = AdminCookieService.ACCESS_COOKIE;
    private static final String ARID = AdminCookieService.REFRESH_COOKIE;

    @Autowired MockMvc mockMvc;
    @Autowired AdminUserRepository adminUserRepository;
    @Autowired AdminAuditRepository adminAuditRepository;

    private static String loginBody(String email, String password) {
        return "{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}";
    }

    @Test
    void adminLoginSetsAdminCookies() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody(AdminTestSupport.ADMIN_EMAIL, AdminTestSupport.ADMIN_PASSWORD)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email", is("admin@test.local")))
                .andReturn();

        Cookie access = AuthTestSupport.cookie(result, ASID);
        Cookie refresh = AuthTestSupport.cookie(result, ARID);
        assertEquals("/api/admin", access.getPath());
        assertEquals("/api/admin/auth", refresh.getPath());
        assertEquals("Lax", access.getAttribute("SameSite"));
        assertEquals("Strict", refresh.getAttribute("SameSite"));
    }

    @Test
    void wrongPasswordIsGeneric401() throws Exception {
        mockMvc.perform(post("/api/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody(AdminTestSupport.ADMIN_EMAIL, "wrong-password")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code", is("INVALID_CREDENTIALS")));

        mockMvc.perform(post("/api/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody("nobody@test.local", AdminTestSupport.ADMIN_PASSWORD)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code", is("INVALID_CREDENTIALS")));
    }

    @Test
    void inactiveAdminCannotLogIn() throws Exception {
        AdminUser admin = adminUserRepository.findByEmailIgnoreCase(AdminTestSupport.ADMIN_EMAIL).orElseThrow();
        admin.setActive(false);
        adminUserRepository.saveAndFlush(admin);
        try {
            mockMvc.perform(post("/api/admin/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(loginBody(AdminTestSupport.ADMIN_EMAIL, AdminTestSupport.ADMIN_PASSWORD)))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.code", is("INVALID_CREDENTIALS")));
        } finally {
            AdminUser restored = adminUserRepository.findByEmailIgnoreCase(AdminTestSupport.ADMIN_EMAIL).orElseThrow();
            restored.setActive(true);
            adminUserRepository.saveAndFlush(restored);
        }
    }

    @Test
    void meReturnsAdminProfile() throws Exception {
        Cookie[] cookies = AdminTestSupport.login(mockMvc);
        mockMvc.perform(get("/api/admin/auth/me").cookie(cookies))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email", is("admin@test.local")))
                .andExpect(jsonPath("$.data.name", is("AasPass Admin")));
    }

    @Test
    void userTokenRejectedOnAdminApi() throws Exception {
        Cookie[] user = AuthTestSupport.login(mockMvc, "aman", "password123");
        mockMvc.perform(get("/api/admin/auth/me").cookie(new Cookie(ASID, user[0].getValue())))
                .andExpect(status().isUnauthorized());
        // The user's own _sid cookie (path /api) also reaches /api/admin but is never read there.
        mockMvc.perform(get("/api/admin/auth/me").cookie(user[0]))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code", is("UNAUTHENTICATED")));
    }

    @Test
    void adminTokenRejectedOnUserApi() throws Exception {
        Cookie[] admin = AdminTestSupport.login(mockMvc);
        mockMvc.perform(get("/api/auth/me").cookie(new Cookie(AuthCookieService.ACCESS_COOKIE, admin[0].getValue())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void anonymousAdminApiIs401() throws Exception {
        mockMvc.perform(get("/api/admin/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code", is("UNAUTHENTICATED")));
    }

    @Test
    void refreshRotatesAdminSession() throws Exception {
        Cookie[] cookies = AdminTestSupport.login(mockMvc);
        MvcResult result = mockMvc.perform(post("/api/admin/auth/refresh").cookie(cookies[1]))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email", is("admin@test.local")))
                .andReturn();
        Cookie rotated = AuthTestSupport.cookie(result, ARID);
        assertNotEquals(cookies[1].getValue(), rotated.getValue());
        assertNotNull(AuthTestSupport.cookie(result, ASID).getValue());
    }

    @Test
    void refreshWithUnknownTokenClearsCookies() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/admin/auth/refresh").cookie(new Cookie(ARID, "garbage")))
                .andExpect(status().isUnauthorized())
                .andReturn();
        assertEquals(0, AuthTestSupport.cookie(result, ASID).getMaxAge());
        assertEquals(0, AuthTestSupport.cookie(result, ARID).getMaxAge());
    }

    @Test
    void logoutRevokesAdminSession() throws Exception {
        Cookie[] cookies = AdminTestSupport.login(mockMvc);
        mockMvc.perform(post("/api/admin/auth/logout").with(csrf()).cookie(cookies))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/admin/auth/me").cookie(cookies[0]))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code", is("SESSION_REVOKED")));
    }

    @Test
    void adminWriteWithoutCsrfIs403() throws Exception {
        Cookie[] cookies = AdminTestSupport.login(mockMvc);
        mockMvc.perform(post("/api/admin/auth/logout").cookie(cookies))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code", is("CSRF_INVALID")));
    }

    @Test
    void loginWritesAuditEntry() throws Exception {
        AdminUser admin = adminUserRepository.findByEmailIgnoreCase(AdminTestSupport.ADMIN_EMAIL).orElseThrow();
        Instant before = Instant.now().minusSeconds(1);
        long loginsBefore = countLogins(admin.getId());

        AdminTestSupport.login(mockMvc);

        assertEquals(loginsBefore + 1, countLogins(admin.getId()));
        AdminUser reloaded = adminUserRepository.findById(admin.getId()).orElseThrow();
        assertNotNull(reloaded.getLastLoginAt());
        assertEquals(true, reloaded.getLastLoginAt().isAfter(before));
    }

    @Test
    void userLoginStillWorks() throws Exception {
        Cookie[] cookies = AuthTestSupport.login(mockMvc, "aman", "password123");
        mockMvc.perform(get("/api/auth/me").cookie(cookies))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.username", is("aman")));
    }

    private long countLogins(Long adminId) {
        return adminAuditRepository.findAll().stream()
                .filter(e -> adminId.equals(e.getAdminId()) && e.getAction() == AdminAuditAction.LOGIN)
                .map(AdminAuditEntry::getId)
                .count();
    }
}
