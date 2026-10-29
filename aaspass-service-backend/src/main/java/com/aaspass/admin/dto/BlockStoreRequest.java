package com.aaspass.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BlockStoreRequest(@NotBlank @Size(max = 500) String reason) {
}
