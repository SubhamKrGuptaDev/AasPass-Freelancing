package com.aaspass.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Response DTO representing verified client ratings and reviews.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreReviewResponse {

    private Long id;
    private Long storeId;
    private String userName;
    private String userAvatar;
    private Double rating;
    private String message;
    private String reviewDate;
    private LocalDateTime creationDateTime;
}
