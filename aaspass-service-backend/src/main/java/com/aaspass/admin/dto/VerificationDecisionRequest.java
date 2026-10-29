package com.aaspass.admin.dto;

import com.aaspass.entity.VerificationStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record VerificationDecisionRequest(@NotNull VerificationStatus decision, @Size(max = 500) String reason) {
}
