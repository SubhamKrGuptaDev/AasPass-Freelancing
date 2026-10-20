package com.aaspass.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Response DTO representing an individual store service item / gig package.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceItemResponse {

    private Long id;
    private Long storeId;
    private String name;
    private BigDecimal price;
    private String duration;
    private String description;
    private LocalDateTime creationDateTime;
}
