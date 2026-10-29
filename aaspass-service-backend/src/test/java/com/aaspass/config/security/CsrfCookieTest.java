package com.aaspass.config.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.is;

import com.aaspass.support.AuthTestSupport;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

/**
 * Exercises the real {@code XSRF-TOKEN} cookie round trip. Runs in a fresh context because
 * spring-security-test's {@code csrf()} post-processor (used by other test classes) permanently
 * wraps the shared CsrfFilter's repository, after which the real cookie is no longer written.
 * Therefore this class must never use {@code csrf()} itself.
 */
@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_CLASS)
class CsrfCookieTest {

    private static final String XSRF = "XSRF-TOKEN";

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("XSRF-TOKEN is issued readable by JS, SameSite=Strict, Path=/, host-only and not Secure on localhost")
    void csrfCookieIssuedOnLocalhost() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/stores"))
                .andExpect(status().isOk())
                .andReturn();

        Cookie xsrf = AuthTestSupport.cookie(result, XSRF);
        assertFalse(xsrf.getValue().isEmpty());
        assertFalse(xsrf.isHttpOnly());
        // SameSite travels as a Servlet cookie attribute, rendered by the container.
        assertEquals("Strict", xsrf.getAttribute("SameSite"));
        assertEquals("/", xsrf.getPath());
        assertFalse(xsrf.getSecure());
        assertNull(xsrf.getDomain());
    }

    @Test
    @DisplayName("XSRF-TOKEN is Secure on a non-local host")
    void csrfCookieSecureOnRealHost() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/stores").with(request -> {
                    request.setServerName("api.aaspass.in");
                    return request;
                }))
                .andExpect(status().isOk())
                .andReturn();

        Cookie xsrf = AuthTestSupport.cookie(result, XSRF);
        assertTrue(xsrf.getSecure());
        assertEquals("Strict", xsrf.getAttribute("SameSite"));
    }

    @Test
    @DisplayName("A write succeeds with the XSRF cookie echoed in X-XSRF-TOKEN and fails without it")
    void csrfTokenRoundTrip() throws Exception {
        MvcResult first = mockMvc.perform(get("/api/stores")).andExpect(status().isOk()).andReturn();
        String token = AuthTestSupport.cookie(first, XSRF).getValue();
        Cookie[] auth = AuthTestSupport.login(mockMvc, "aman", "password123");

        mockMvc.perform(post("/api/auth/logout")
                        .cookie(auth[0], auth[1], new Cookie(XSRF, token))
                        .header("X-XSRF-TOKEN", "wrong-" + token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code", is("CSRF_INVALID")));

        mockMvc.perform(post("/api/auth/logout")
                        .cookie(auth[0], auth[1], new Cookie(XSRF, token))
                        .header("X-XSRF-TOKEN", token))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Authenticated requests keep the XSRF cookie, so consecutive writes from one page succeed")
    void csrfCookieSurvivesAuthenticatedRequests() throws Exception {
        MvcResult first = mockMvc.perform(get("/api/stores")).andExpect(status().isOk()).andReturn();
        String token = AuthTestSupport.cookie(first, XSRF).getValue();
        // Seeded store 1 belongs to priya
        Cookie[] auth = AuthTestSupport.login(mockMvc, "priya", "password123");

        for (String action : new String[] {"deactivate", "activate", "deactivate"}) {
            MvcResult result = mockMvc.perform(patch("/api/stores/1/" + action)
                            .cookie(auth[0], auth[1], new Cookie(XSRF, token))
                            .header("X-XSRF-TOKEN", token))
                    .andExpect(status().isOk())
                    .andReturn();
            // A browser would drop the cookie on an empty/expired Set-Cookie, breaking the next write.
            Cookie reissued = result.getResponse().getCookie(XSRF);
            assertTrue(reissued == null || !reissued.getValue().isEmpty(),
                    action + " must not clear the XSRF-TOKEN cookie");
        }
    }

    @Test
    @DisplayName("Login issues a fresh XSRF-TOKEN instead of keeping the pre-login one")
    void loginRotatesCsrfToken() throws Exception {
        MvcResult first = mockMvc.perform(get("/api/stores")).andExpect(status().isOk()).andReturn();
        String guestToken = AuthTestSupport.cookie(first, XSRF).getValue();

        MvcResult login = mockMvc.perform(post("/api/auth/login")
                        .cookie(new Cookie(XSRF, guestToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"usernameOrEmail\":\"aman\",\"password\":\"password123\"}"))
                .andExpect(status().isOk())
                .andReturn();

        Cookie issued = AuthTestSupport.cookie(login, XSRF);
        assertFalse(issued.getValue().isEmpty());
        assertNotEquals(guestToken, issued.getValue());
        assertFalse(issued.isHttpOnly());
        assertEquals("Strict", issued.getAttribute("SameSite"));
        assertEquals("/", issued.getPath());
    }

    @Test
    @DisplayName("Logout expires the XSRF-TOKEN cookie together with the auth cookies")
    void logoutExpiresCsrfToken() throws Exception {
        MvcResult first = mockMvc.perform(get("/api/stores")).andExpect(status().isOk()).andReturn();
        String token = AuthTestSupport.cookie(first, XSRF).getValue();
        Cookie[] auth = AuthTestSupport.login(mockMvc, "aman", "password123");

        MvcResult logout = mockMvc.perform(post("/api/auth/logout")
                        .cookie(auth[0], auth[1], new Cookie(XSRF, token))
                        .header("X-XSRF-TOKEN", token))
                .andExpect(status().isOk())
                .andReturn();

        Cookie expired = AuthTestSupport.cookie(logout, XSRF);
        assertEquals(0, expired.getMaxAge());
        assertEquals("/", expired.getPath());
        assertEquals(0, AuthTestSupport.cookie(logout, "_sid").getMaxAge());
        assertEquals(0, AuthTestSupport.cookie(logout, "_rid").getMaxAge());
    }
}
