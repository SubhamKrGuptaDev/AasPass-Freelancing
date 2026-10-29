package com.aaspass.admin.security;

import com.aaspass.config.security.CookieBearerTokenResolver;
import java.util.Set;

/**
 * Resolves the admin access JWT from the HttpOnly {@code _asid} cookie only (never {@code _sid} or the
 * {@code Authorization} header). Returns {@code null} for the admin login/refresh/logout endpoints so a
 * stale or garbage access cookie can never break them ({@code /me} needs the token, so it is not skipped).
 */
public class AdminCookieBearerTokenResolver extends CookieBearerTokenResolver {

    private static final Set<String> SKIPPED_PATHS = Set.of(
            "/api/admin/auth/login", "/api/admin/auth/refresh", "/api/admin/auth/logout");

    public AdminCookieBearerTokenResolver() {
        super(AdminCookieService.ACCESS_COOKIE, SKIPPED_PATHS);
    }
}
