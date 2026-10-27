package com.aaspass.config.security;

import com.aaspass.exception.ErrorCode;
import com.aaspass.exception.UnauthorizedException;
import java.util.Optional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

/**
 * Exposes the authenticated caller (from the validated access JWT in the security context) to
 * controllers and services: user id from {@code sub}, session id from {@code sid}.
 */
@Component
public class CurrentUser {

    /** @return the caller's user id; throws {@code 401 UNAUTHENTICATED} when not authenticated. */
    public Long requireUserId() {
        return optionalUserId().orElseThrow(
                () -> new UnauthorizedException("Authentication required", ErrorCode.UNAUTHENTICATED));
    }

    /** @return the caller's user id, or empty for anonymous requests. */
    public Optional<Long> optionalUserId() {
        return currentJwt().map(Jwt::getSubject).flatMap(CurrentUser::parseId);
    }

    /** @return the caller's session id ({@code sid} claim), or empty for anonymous requests. */
    public Optional<String> sessionId() {
        return currentJwt().map(jwt -> jwt.getClaimAsString("sid"));
    }

    private static Optional<Jwt> currentJwt() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof JwtAuthenticationToken jwtAuth && jwtAuth.isAuthenticated()) {
            return Optional.ofNullable(jwtAuth.getToken());
        }
        return Optional.empty();
    }

    private static Optional<Long> parseId(String subject) {
        if (subject == null || subject.isBlank()) {
            return Optional.empty();
        }
        try {
            return Optional.of(Long.valueOf(subject));
        } catch (NumberFormatException e) {
            return Optional.empty();
        }
    }
}
