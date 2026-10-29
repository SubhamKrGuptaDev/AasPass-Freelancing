package com.aaspass.admin.security;

import com.aaspass.exception.ErrorCode;
import com.aaspass.exception.UnauthorizedException;
import java.util.Optional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

/**
 * Exposes the authenticated administrator (from the validated admin access JWT) to admin controllers
 * and services. Only tokens issued by {@link AdminJwtTokenService#ISSUER} with {@code typ=admin} count,
 * so a user JWT can never be read as an admin identity.
 */
@Component
public class CurrentAdmin {

    /** @return the caller's admin id; throws {@code 401 UNAUTHENTICATED} when no admin is authenticated. */
    public Long requireAdminId() {
        return optionalAdminId().orElseThrow(
                () -> new UnauthorizedException("Authentication required", ErrorCode.UNAUTHENTICATED));
    }

    /** @return the caller's admin id, or empty when the request carries no admin token. */
    public Optional<Long> optionalAdminId() {
        return currentAdminJwt().map(Jwt::getSubject).flatMap(CurrentAdmin::parseId);
    }

    private static Optional<Jwt> currentAdminJwt() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof JwtAuthenticationToken jwtAuth && jwtAuth.isAuthenticated()) {
            Jwt jwt = jwtAuth.getToken();
            if (jwt != null
                    && AdminJwtTokenService.ADMIN_TYPE.equals(jwt.getClaimAsString(AdminJwtTokenService.TYPE_CLAIM))
                    && AdminJwtTokenService.ISSUER.equals(jwt.getClaimAsString("iss"))) {
                return Optional.of(jwt);
            }
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
