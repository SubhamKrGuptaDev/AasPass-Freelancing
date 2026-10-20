package com.aaspass.dto.response;

import com.aaspass.dto.common.SocialMediaLinkDto;
import com.aaspass.entity.StoreEngagementStats;
import com.aaspass.entity.StoreSocialMediaLinks;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Response DTO representing full store details.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreResponse {

    private Long id;
    private Long userId;
    private String storeName;
    private String ownerName;
    private String tagline;
    private String category;

    @Builder.Default
    private List<String> skills = new ArrayList<>();

    private Integer experienceYears;
    private BigDecimal hourlyRate;
    private BigDecimal startingPrice;
    private String area;
    private String city;
    private Integer serviceRadiusKm;
    private Double distanceKm;

    @Builder.Default
    private Double rating = 5.0;

    @Builder.Default
    private Integer reviewCount = 0;

    private String description;
    private String avatarUrl;

    @Builder.Default
    private String bannerGradient = "from-indigo-500 to-purple-600";

    @Builder.Default
    private Boolean isAvailable = true;

    private String memberSince;
    private StoreEngagementStats views;
    private StoreSocialMediaLinks storeSocialMediaLinks;

    @Builder.Default
    private List<SocialMediaLinkDto> socialMediaLinks = new ArrayList<>();

    @Builder.Default
    private List<ServiceItemResponse> services = new ArrayList<>();

    @Builder.Default
    private List<StoreReviewResponse> reviews = new ArrayList<>();

    private LocalDateTime creationDateTime;
    private LocalDateTime lastUpdateDateTime;
}
