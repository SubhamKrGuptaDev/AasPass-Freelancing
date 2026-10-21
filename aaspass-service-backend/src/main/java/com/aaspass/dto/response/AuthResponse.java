package com.aaspass.dto.response;

import lombok.Builder;

/**
 * Response DTO returned upon successful login / registration.
 */
@Builder
public record AuthResponse(
    boolean success,
    String message,
    String token,
    String tokenType,
    UserResponse user
) {
    public AuthResponse {
        if (tokenType == null || tokenType.isBlank()) {
            tokenType = "Bearer";
        }
    }
}
