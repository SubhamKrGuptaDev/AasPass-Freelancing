package com.aaspass.admin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** Admin login credentials. */
public record AdminLoginRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        String email,

        @NotBlank(message = "Password is required")
        String password) {

    /** Redacts the password so it never reaches logs. */
    @Override
    public String toString() {
        return "AdminLoginRequest[email=" + email + ", password=***]";
    }
}
