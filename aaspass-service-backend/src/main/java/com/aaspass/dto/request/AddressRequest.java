package com.aaspass.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

/**
 * Request payload for creating or updating a user address.
 */
@Builder
public record AddressRequest(
    String addressType,
    String addressLine,

    @NotBlank(message = "Area / neighborhood is required")
    String area,

    @NotBlank(message = "City is required")
    String city,

    String state,
    String pincode,
    String landmark,
    Double latitude,
    Double longitude,
    Boolean isDefault
) {}
