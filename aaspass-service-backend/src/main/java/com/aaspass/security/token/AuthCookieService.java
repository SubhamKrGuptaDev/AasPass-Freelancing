package com.aaspass.security.token;

import com.aaspass.config.security.SecurityProperties;
import com.aaspass.security.session.IssuedSession;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.regex.Pattern;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

/**
 * Single place that builds the auth cookies ({@code _sid} access JWT, {@code _rid} refresh token)
 * and their clearing variants. {@code Secure}/{@code Domain} are decided by the request host:
 * local hosts get neither; other hosts are always Secure and use the configured cookie domain if set.
 */
@Component
public class AuthCookieService {

    public static final String ACCESS_COOKIE = "_sid";
    public static final String REFRESH_COOKIE = "_rid";
    private static final String ACCESS_PATH = "/api";
    private static final String REFRESH_PATH = "/api/auth";

    private static final Pattern IPV4 = Pattern.compile("[0-9]{1,3}([.][0-9]{1,3}){3}");

    private final SecurityProperties properties;
    private final Clock clock;

    public AuthCookieService(SecurityProperties properties, Clock clock) {
        this.properties = properties;
        this.clock = clock;
    }

    public ResponseCookie accessCookie(HttpServletRequest req, String jwt) {
        return base(ACCESS_COOKIE, jwt, "Lax", ACCESS_PATH, properties.accessTokenTtl(), req).build();
    }

    public ResponseCookie refreshCookie(HttpServletRequest req, String token, Instant sessionExpiresAt) {
        Duration remaining = Duration.between(clock.instant(), sessionExpiresAt);
        if (remaining.isNegative()) {
            remaining = Duration.ZERO;
        }
        return base(REFRESH_COOKIE, token, "Strict", REFRESH_PATH, remaining, req).build();
    }

    public ResponseCookie clearAccessCookie(HttpServletRequest req) {
        return base(ACCESS_COOKIE, "", "Lax", ACCESS_PATH, Duration.ZERO, req).build();
    }

    public ResponseCookie clearRefreshCookie(HttpServletRequest req) {
        return base(REFRESH_COOKIE, "", "Strict", REFRESH_PATH, Duration.ZERO, req).build();
    }

    /** @return true for {@code localhost}, {@code 127.0.0.1}, {@code ::1} and {@code [::1]} (case-insensitive). */
    public static boolean isLocalHost(String serverName) {
        if (serverName == null) {
            return false;
        }
        String host = serverName.trim().toLowerCase(Locale.ROOT);
        return "localhost".equals(host) || "127.0.0.1".equals(host)
                || "::1".equals(host) || "[::1]".equals(host);
    }

    /** @return true for IPv4 or IPv6 literals (IPv6 with or without brackets); browsers reject Domain on these. */
    static boolean isIpLiteral(String serverName) {
        if (serverName == null) {
            return false;
        }
        String host = serverName.trim();
        return host.contains(":") || IPV4.matcher(host).matches();
    }

    /** Applies the host-dependent {@code Secure} and {@code Domain} attributes. */
    public void applyHostRules(ResponseCookie.ResponseCookieBuilder builder, HttpServletRequest req) {
        boolean local = isLocalHost(req.getServerName());
        builder.secure(!local);
        String domain = properties.cookieDomain();
        if (!local && !isIpLiteral(req.getServerName()) && domain != null && !domain.isBlank()) {
            builder.domain(domain.trim());
        }
    }

    public void writeSession(HttpServletRequest req, HttpServletResponse res, IssuedSession issued) {
        res.addHeader(HttpHeaders.SET_COOKIE, accessCookie(req, issued.accessToken()).toString());
        res.addHeader(HttpHeaders.SET_COOKIE,
                refreshCookie(req, issued.refreshToken(), issued.session().getExpiresAt()).toString());
    }

    public void clearSession(HttpServletRequest req, HttpServletResponse res) {
        res.addHeader(HttpHeaders.SET_COOKIE, clearAccessCookie(req).toString());
        res.addHeader(HttpHeaders.SET_COOKIE, clearRefreshCookie(req).toString());
    }

    private ResponseCookie.ResponseCookieBuilder base(String name, String value, String sameSite,
                                                      String path, Duration maxAge, HttpServletRequest req) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(name, value)
                .httpOnly(true)
                .sameSite(sameSite)
                .path(path)
                .maxAge(maxAge);
        applyHostRules(builder, req);
        return builder;
    }
}
