package com.aaspass.dto.response;

import lombok.Builder;

/**
 * Response DTO returned upon successful login / registration.
 * The access and refresh tokens travel only in HttpOnly cookies, never in this body.
 */
@Builder
public record AuthResponse(
    boolean success,
    String message,
    UserResponse user
) {
}
