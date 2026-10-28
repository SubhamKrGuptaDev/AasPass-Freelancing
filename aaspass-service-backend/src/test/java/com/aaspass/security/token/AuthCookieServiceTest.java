package com.aaspass.security.token;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.aaspass.config.security.SecurityProperties;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Base64;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseCookie;
import org.springframework.mock.web.MockHttpServletRequest;

class AuthCookieServiceTest {

    private static final String KEY = Base64.getEncoder().encodeToString(new byte[32]);
    private static final Instant NOW = Instant.parse("2026-01-01T00:00:00Z");
    private static final Clock CLOCK = Clock.fixed(NOW, ZoneOffset.UTC);

    private static AuthCookieService service(String domain) {
        return new AuthCookieService(
                new SecurityProperties(KEY, KEY, domain, Duration.ofMinutes(15), Duration.ofDays(30)), CLOCK);
    }

    private static MockHttpServletRequest request(String host) {
        MockHttpServletRequest req = new MockHttpServletRequest();
        req.setServerName(host);
        return req;
    }

    @Test
    void accessCookieAttributes() {
        ResponseCookie c = service("").accessCookie(request("app.aaspass.in"), "jwt");
        assertEquals("_sid", c.getName());
        assertEquals("jwt", c.getValue());
        assertTrue(c.isHttpOnly());
        assertEquals("Lax", c.getSameSite());
        assertEquals("/api", c.getPath());
        assertEquals(Duration.ofSeconds(900), c.getMaxAge());
    }

    @Test
    void refreshCookieAttributes() {
        ResponseCookie c = service("").refreshCookie(request("app.aaspass.in"), "rt", NOW.plusSeconds(1000));
        assertEquals("_rid", c.getName());
        assertTrue(c.isHttpOnly());
        assertEquals("Strict", c.getSameSite());
        assertEquals("/api/auth", c.getPath());
        assertEquals(Duration.ofSeconds(1000), c.getMaxAge());
    }

    @Test
    void localhostHasNoSecureNoDomain() {
        for (String host : new String[] {"localhost", "127.0.0.1", "::1", "[::1]", "LOCALHOST"}) {
            ResponseCookie c = service("aaspass.in").accessCookie(request(host), "jwt");
            assertFalse(c.isSecure(), host);
            assertNull(c.getDomain(), host);
        }
    }

    @Test
    void realHostIsSecure() {
        ResponseCookie c = service("").accessCookie(request("app.aaspass.in"), "jwt");
        assertTrue(c.isSecure());
        assertNull(c.getDomain());
    }

    @Test
    void ipHostIsSecureWithoutDomain() {
        for (String host : new String[] {"192.168.1.5", "2001:db8::1", "[2001:db8::1]"}) {
            ResponseCookie c = service("aaspass.in").accessCookie(request(host), "jwt");
            assertTrue(c.isSecure(), host);
            assertNull(c.getDomain(), host);
        }
    }

    @Test
    void realHostUsesConfiguredDomain() {
        assertEquals("aaspass.in", service("aaspass.in").accessCookie(request("app.aaspass.in"), "jwt").getDomain());
    }

    @Test
    void clearCookiesHaveZeroMaxAgeAndSamePathDomain() {
        AuthCookieService svc = service("aaspass.in");
        MockHttpServletRequest req = request("app.aaspass.in");
        ResponseCookie access = svc.clearAccessCookie(req);
        ResponseCookie refresh = svc.clearRefreshCookie(req);
        assertEquals(Duration.ZERO, access.getMaxAge());
        assertEquals(Duration.ZERO, refresh.getMaxAge());
        assertEquals("", access.getValue());
        assertEquals("", refresh.getValue());
        assertEquals("/api", access.getPath());
        assertEquals("/api/auth", refresh.getPath());
        assertEquals("aaspass.in", access.getDomain());
        assertEquals("aaspass.in", refresh.getDomain());
        assertTrue(access.isSecure());
        assertTrue(refresh.isSecure());
    }
}
