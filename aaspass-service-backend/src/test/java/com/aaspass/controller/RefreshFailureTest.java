package com.aaspass.controller;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.aaspass.exception.ResourceNotFoundException;
import com.aaspass.security.token.AuthCookieService;
import com.aaspass.service.AuthService;
import com.aaspass.support.AuthTestSupport;
import jakarta.servlet.http.Cookie;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

/**
 * Refresh must clear both auth cookies when anything after reading {@code _rid} fails, including
 * the user lookup that follows a committed rotation, and must never write new cookies then.
 */
@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class RefreshFailureTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoSpyBean
    private AuthService authService;

    @Test
    @DisplayName("POST /api/auth/refresh - user lookup failure after rotation clears both cookies")
    void userLookupFailureClearsCookies() throws Exception {
        Cookie[] cookies = AuthTestSupport.login(mockMvc, "aman", "password123");
        doThrow(new ResourceNotFoundException("User", "id", 1L)).when(authService).getUser(any());

        MvcResult result = mockMvc.perform(post("/api/auth/refresh").cookie(cookies[1]))
                .andExpect(status().isNotFound())
                .andReturn();

        List<String> setCookies = result.getResponse().getHeaders(HttpHeaders.SET_COOKIE);
        for (String name : List.of(AuthCookieService.ACCESS_COOKIE, AuthCookieService.REFRESH_COOKIE)) {
            List<String> forName = setCookies.stream().filter(h -> h.startsWith(name + "=")).toList();
            assertTrue(!forName.isEmpty(), name + " must be cleared");
            assertTrue(forName.stream().allMatch(h -> h.startsWith(name + "=;") && h.contains("Max-Age=0")),
                    name + " must only be cleared, never re-issued");
        }
    }
}
