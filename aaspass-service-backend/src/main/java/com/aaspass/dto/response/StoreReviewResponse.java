package com.aaspass.dto.response;

import lombok.Builder;

import java.time.LocalDateTime;

/**
 * Response DTO representing verified client ratings and reviews.
 */
@Builder
public record StoreReviewResponse(
    Long id,
    Long storeId,
    String userName,
    String userAvatar,
    Double rating,
    String message,
    String reviewDate,
    LocalDateTime creationDateTime
) {}
