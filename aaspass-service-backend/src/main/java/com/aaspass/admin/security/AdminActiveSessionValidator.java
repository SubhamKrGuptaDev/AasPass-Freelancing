package com.aaspass.admin.security;

import com.aaspass.config.security.ActiveSessionValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;

/**
 * Rejects admin access JWTs that are not of type {@code admin} or whose {@code sid} admin session is
 * unknown, revoked, expired or belongs to a deactivated admin, so logout takes effect immediately.
 * A dead session fails with {@link ActiveSessionValidator#SESSION_REVOKED} so the shared error
 * handler answers {@code SESSION_REVOKED}.
 */
public class AdminActiveSessionValidator implements OAuth2TokenValidator<Jwt> {

    private final AdminSessionService sessionService;

    public AdminActiveSessionValidator(AdminSessionService sessionService) {
        this.sessionService = sessionService;
    }

    @Override
    public OAuth2TokenValidatorResult validate(Jwt token) {
        if (!AdminJwtTokenService.ADMIN_TYPE.equals(token.getClaimAsString(AdminJwtTokenService.TYPE_CLAIM))) {
            return OAuth2TokenValidatorResult.failure(
                    new OAuth2Error("invalid_token", "Not an admin access token", null));
        }
        String sessionId = token.getClaimAsString("sid");
        if (sessionId == null || !sessionService.isActive(sessionId)) {
            return OAuth2TokenValidatorResult.failure(
                    new OAuth2Error(ActiveSessionValidator.SESSION_REVOKED, "Session revoked or expired", null));
        }
        return OAuth2TokenValidatorResult.success();
    }
}
