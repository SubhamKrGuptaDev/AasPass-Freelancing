package com.aaspass.config.security;

import java.time.Clock;
import java.time.Instant;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;

/**
 * Rejects access JWTs whose {@code exp} has passed (zero clock skew, shared {@link Clock}) with
 * the distinct error code {@value #TOKEN_EXPIRED}, so the API can answer {@code TOKEN_EXPIRED}
 * and the client knows to refresh. A token without {@code exp} is rejected as invalid.
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
        if (!clock.instant().isBefore(expiresAt)) {
            return OAuth2TokenValidatorResult.failure(
                    new OAuth2Error(TOKEN_EXPIRED, "Access token expired", null));
        }
        return OAuth2TokenValidatorResult.success();
    }
}
