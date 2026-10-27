package com.aaspass.config.security;

import com.aaspass.security.session.SessionService;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;

/**
 * Rejects access JWTs whose {@code sid} session is unknown, revoked or expired, so logout and
 * reuse-revocation take effect immediately even while the JWT's own {@code exp} is in the future.
 */
public class ActiveSessionValidator implements OAuth2TokenValidator<Jwt> {

    public static final String SESSION_REVOKED = "session_revoked";

    private final SessionService sessionService;

    public ActiveSessionValidator(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @Override
    public OAuth2TokenValidatorResult validate(Jwt token) {
        String sessionId = token.getClaimAsString("sid");
        if (sessionId == null || !sessionService.isActive(sessionId)) {
            return OAuth2TokenValidatorResult.failure(
                    new OAuth2Error(SESSION_REVOKED, "Session revoked or expired", null));
        }
        return OAuth2TokenValidatorResult.success();
    }
}
