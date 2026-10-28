package com.aaspass.config.security;

import java.time.Clock;
import java.time.Instant;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;

/**
 * Timestamp validation for access JWTs (zero clock skew, shared {@link Clock}). An {@code exp}
 * that has passed fails with the distinct error code {@value #TOKEN_EXPIRED}, so the API can answer
 * {@code TOKEN_EXPIRED} and the client knows to refresh. A missing {@code exp} or an {@code nbf}
 * in the future fails as a generic invalid token ({@code UNAUTHENTICATED}).
 */
public class ExpiryValidator implements OAuth2TokenValidator<Jwt> {

    public static final String TOKEN_EXPIRED = "token_expired";

    private final Clock clock;

    public ExpiryValidator(Clock clock) {
        this.clock = clock;
    }

    @Override
    public OAuth2TokenValidatorResult validate(Jwt token) {
        Instant expiresAt = token.getExpiresAt();
        if (expiresAt == null) {
            return OAuth2TokenValidatorResult.failure(
                    new OAuth2Error("invalid_token", "Access token has no expiry", null));
        }
        Instant now = clock.instant();
        if (!now.isBefore(expiresAt)) {
            return OAuth2TokenValidatorResult.failure(
                    new OAuth2Error(TOKEN_EXPIRED, "Access token expired", null));
        }
        Instant notBefore = token.getNotBefore();
        if (notBefore != null && now.isBefore(notBefore)) {
            // Not yet valid: a generic invalid token (UNAUTHENTICATED), never TOKEN_EXPIRED.
            return OAuth2TokenValidatorResult.failure(
                    new OAuth2Error("invalid_token", "Access token not yet valid", null));
        }
        return OAuth2TokenValidatorResult.success();
    }
}
