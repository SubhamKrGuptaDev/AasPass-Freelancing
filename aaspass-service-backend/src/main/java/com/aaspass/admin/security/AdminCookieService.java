package com.aaspass.admin.security;

import com.aaspass.admin.config.AdminProperties;
import com.aaspass.security.token.AuthCookieService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

/**
 * Builds the admin auth cookies ({@code _asid} access JWT on {@code /api/admin}, SameSite Lax;
 * {@code _arid} refresh token on {@code /api/admin/auth}, SameSite Strict) and their clearing
 * variants. Cookie attributes and host rules come from {@link AuthCookieService#buildCookie}, so
 * admin and user cookies follow one policy while never sharing a name.
 */
@Component
public class AdminCookieService {

    public static final String ACCESS_COOKIE = "_asid";
    public static final String REFRESH_COOKIE = "_arid";
    private static final String ACCESS_PATH = "/api/admin";
    private static final String REFRESH_PATH = "/api/admin/auth";

    private final AuthCookieService authCookieService;
    private final AdminProperties properties;
    private final Clock clock;

    public AdminCookieService(AuthCookieService authCookieService, AdminProperties properties, Clock clock) {
        this.authCookieService = authCookieService;
        this.properties = properties;
        this.clock = clock;
    }

    public void writeSession(HttpServletRequest req, HttpServletResponse res, AdminIssuedSession issued) {
        res.addHeader(HttpHeaders.SET_COOKIE, accessCookie(req, issued.accessToken()).toString());
        res.addHeader(HttpHeaders.SET_COOKIE,
                refreshCookie(req, issued.refreshToken(), issued.session().getExpiresAt()).toString());
    }

    public void clearSession(HttpServletRequest req, HttpServletResponse res) {
        res.addHeader(HttpHeaders.SET_COOKIE,
                authCookieService.buildCookie(ACCESS_COOKIE, "", "Lax", ACCESS_PATH, Duration.ZERO, req).toString());
        res.addHeader(HttpHeaders.SET_COOKIE,
                authCookieService.buildCookie(REFRESH_COOKIE, "", "Strict", REFRESH_PATH, Duration.ZERO, req).toString());
    }

    private ResponseCookie accessCookie(HttpServletRequest req, String jwt) {
        return authCookieService.buildCookie(ACCESS_COOKIE, jwt, "Lax", ACCESS_PATH, properties.accessTokenTtl(), req);
    }

    private ResponseCookie refreshCookie(HttpServletRequest req, String token, Instant sessionExpiresAt) {
        Duration remaining = sessionExpiresAt == null ? Duration.ZERO : Duration.between(clock.instant(), sessionExpiresAt);
        if (remaining.isNegative()) {
            remaining = Duration.ZERO;
        }
        return authCookieService.buildCookie(REFRESH_COOKIE, token, "Strict", REFRESH_PATH, remaining, req);
    }
}
