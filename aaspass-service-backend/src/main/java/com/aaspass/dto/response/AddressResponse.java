package com.aaspass.dto.response;

import lombok.Builder;

import java.time.LocalDateTime;

/**
 * Response DTO representing an Address entity.
 */
@Builder
public record AddressResponse(
    Long id,
    Long userId,
    String addressType,
    String addressLine,
    String area,
    String city,
    String state,
    String pincode,
    String landmark,
    Double latitude,
    Double longitude,
    Boolean isDefault,
    LocalDateTime creationDateTime,
    LocalDateTime lastUpdateDateTime
) {}
