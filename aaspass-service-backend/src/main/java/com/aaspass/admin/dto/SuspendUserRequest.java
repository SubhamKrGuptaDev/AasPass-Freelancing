package com.aaspass.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public record SuspendUserRequest(@NotNull Instant until, @NotBlank @Size(max = 500) String reason) {
}
