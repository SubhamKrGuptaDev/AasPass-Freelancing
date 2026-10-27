package com.aaspass.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

/**
 * Request payload for submitting a verified neighborhood client review and rating.
 */
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public record StoreReviewRequest(
    @NotNull(message = "Rating is required")
    @DecimalMin(value = "1.0", message = "Minimum rating is 1.0")
    @DecimalMax(value = "5.0", message = "Maximum rating is 5.0")
    Double rating,

    String message
) {}
