package com.aaspass.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Response DTO returned upon successful login / registration.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private boolean success;
    private String message;
    private String token;
    @Builder.Default
    private String tokenType = "Bearer";
    private UserResponse user;
}
