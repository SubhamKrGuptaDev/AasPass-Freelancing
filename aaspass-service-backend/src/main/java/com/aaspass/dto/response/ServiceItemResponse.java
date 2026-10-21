package com.aaspass.dto.response;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Response DTO representing an individual store service item / gig package.
 */
@Builder
public record ServiceItemResponse(
    Long id,
    Long storeId,
    String name,
    BigDecimal price,
    String duration,
    String description,
    LocalDateTime creationDateTime
) {}
