package com.aaspass.config.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Materialises the deferred CSRF token on every request so the {@code XSRF-TOKEN} cookie is
 * issued on the first response (Angular reads it and echoes it in {@code X-XSRF-TOKEN}).
 */
public class CsrfCookieFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        Object attribute = request.getAttribute(CsrfToken.class.getName());
        if (attribute instanceof CsrfToken csrfToken) {
            // Reading the value forces the repository to load or generate (and save) the token.
            csrfToken.getToken();
        }
        filterChain.doFilter(request, response);
    }
}
