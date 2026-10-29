package com.aaspass.support;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.aaspass.admin.security.AdminCookieService;
import jakarta.servlet.http.Cookie;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

/**
 * Test helpers for the admin cookie auth flow: logs the test-profile bootstrap admin in through the
 * real endpoint and extracts the {@code _asid}/{@code _arid} cookies from the response.
 */
public final class AdminTestSupport {

    public static final String ADMIN_EMAIL = "admin@test.local";
    public static final String ADMIN_PASSWORD = "admin12345";

    private AdminTestSupport() {
    }

    /** Logs in via {@code POST /api/admin/auth/login} and returns the admin access and refresh cookies. */
    public static Cookie[] login(MockMvc mockMvc) throws Exception {
        String body = "{\"email\":\"" + ADMIN_EMAIL + "\",\"password\":\"" + ADMIN_PASSWORD + "\"}";
        MvcResult result = mockMvc.perform(post("/api/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn();
        return new Cookie[] {
                AuthTestSupport.cookie(result, AdminCookieService.ACCESS_COOKIE),
                AuthTestSupport.cookie(result, AdminCookieService.REFRESH_COOKIE)
        };
    }
}
