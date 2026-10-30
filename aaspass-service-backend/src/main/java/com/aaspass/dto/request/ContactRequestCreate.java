package com.aaspass.dto.request;

import com.aaspass.entity.ContactRequestType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Public contact/feedback submission. {@code website} is a honeypot: real users never fill it.
 * The email is trimmed on construction so stray whitespace does not fail {@code @Email}.
 */
public record ContactRequestCreate(
        @NotNull ContactRequestType type,
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Email @Size(max = 100) String email,
        @Size(max = 25) String phone,
        @NotBlank @Size(max = 150) String subject,
        @NotBlank @Size(max = 2000) String message,
        String website
) {

    public ContactRequestCreate {
        email = email == null ? null : email.trim();
    }
}
