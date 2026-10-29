package com.aaspass.config.security;

import com.aaspass.security.token.AuthCookieService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Set;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;

/**
 * Resolves the access JWT from the HttpOnly {@code _sid} cookie only; the {@code Authorization}
 * header is ignored. Returns {@code null} for the login/register/refresh/logout endpoints so a
 * stale or garbage access cookie can never break them.
 */
public class CookieBearerTokenResolver implements BearerTokenResolver {

    private static final Set<String> SKIPPED_PATHS = Set.of(
            "/api/auth/login", "/api/auth/register", "/api/auth/refresh", "/api/auth/logout");

    private final String cookieName;
    private final Set<String> skippedPaths;

    public CookieBearerTokenResolver() {
        this(AuthCookieService.ACCESS_COOKIE, SKIPPED_PATHS);
    }

    /** For other cookie-JWT chains (e.g. admin): reads only {@code cookieName}, skipping {@code skippedPaths}. */
    protected CookieBearerTokenResolver(String cookieName, Set<String> skippedPaths) {
        this.cookieName = cookieName;
        this.skippedPaths = Set.copyOf(skippedPaths);
    }

    @Override
    public String resolve(HttpServletRequest request) {
        if (skippedPaths.contains(pathWithinApplication(request))) {
            return null;
        }
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (cookieName.equals(cookie.getName())) {
                String value = cookie.getValue();
                return value == null || value.isBlank() ? null : value;
            }
        }
        return null;
    }

    private static String pathWithinApplication(HttpServletRequest request) {
        String uri = request.getRequestURI();
        if (uri == null) {
            return "";
        }
        String contextPath = request.getContextPath();
        if (contextPath != null && !contextPath.isEmpty() && uri.startsWith(contextPath)) {
            uri = uri.substring(contextPath.length());
        }
        // Tolerate a trailing slash so "/api/auth/login/" is treated like "/api/auth/login".
        return uri.length() > 1 && uri.endsWith("/") ? uri.substring(0, uri.length() - 1) : uri;
    }
}
