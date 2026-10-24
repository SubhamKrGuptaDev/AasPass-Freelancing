package com.aaspass.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.math.BigDecimal;

/**
 * Request payload for creating or modifying a store gig/service package.
 */
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public record ServiceItemRequest(
    Object id,

    @NotBlank(message = "Service item name is required")
    String name,

    @NotNull(message = "Service package price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Price cannot be negative")
    BigDecimal price,

    String duration,
    String description
) {}
