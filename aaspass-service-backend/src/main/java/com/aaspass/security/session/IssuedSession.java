package com.aaspass.security.session;

/** A session together with the freshly issued plaintext refresh token and access JWT. */
public record IssuedSession(UserSession session, String refreshToken, String accessToken) {
}
