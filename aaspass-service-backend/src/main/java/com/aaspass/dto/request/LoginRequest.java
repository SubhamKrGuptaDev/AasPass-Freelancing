package com.aaspass.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

/**
 * Request payload for user login authentication.
 */
@Builder
public record LoginRequest(
    @NotBlank(message = "Username or email is required")
    String usernameOrEmail,

    @NotBlank(message = "Password is required")
    String password,

    Boolean rememberMe
) {}
