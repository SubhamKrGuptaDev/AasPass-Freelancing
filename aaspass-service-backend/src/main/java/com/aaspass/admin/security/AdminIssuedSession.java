package com.aaspass.admin.security;

import com.aaspass.admin.entity.AdminSession;

/** An admin session together with the freshly issued plaintext refresh token and access JWT. */
public record AdminIssuedSession(AdminSession session, String refreshToken, String accessToken) {
}
