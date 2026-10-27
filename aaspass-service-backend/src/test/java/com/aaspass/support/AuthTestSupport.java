package com.aaspass.support;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.aaspass.security.token.AuthCookieService;
import jakarta.servlet.http.Cookie;
import java.util.Arrays;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

/**
 * Test helpers for the cookie-based auth flow: logs a user in through the real endpoint and
 * extracts the {@code _sid}/{@code _rid} cookies from the response.
 */
public final class AuthTestSupport {

    private AuthTestSupport() {
    }

    /** Logs in via {@code POST /api/auth/login} and returns the access and refresh cookies. */
    public static Cookie[] login(MockMvc mockMvc, String username, String password) throws Exception {
        String body = "{\"usernameOrEmail\":\"" + username + "\",\"password\":\"" + password + "\"}";
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn();
        return new Cookie[] {
                cookie(result, AuthCookieService.ACCESS_COOKIE),
                cookie(result, AuthCookieService.REFRESH_COOKIE)
        };
    }

    /** @return the last cookie named {@code name} set by the response; fails if absent. */
    public static Cookie cookie(MvcResult result, String name) {
        Cookie[] cookies = result.getResponse().getCookies();
        Cookie found = null;
        for (Cookie c : cookies) {
            if (name.equals(c.getName())) {
                found = c;
            }
        }
        if (found == null) {
            throw new AssertionError("No cookie '" + name + "' in response; got "
                    + Arrays.stream(cookies).map(Cookie::getName).toList());
        }
        return found;
    }
}
