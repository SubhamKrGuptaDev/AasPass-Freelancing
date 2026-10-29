package com.aaspass.dto.response;

import com.aaspass.dto.common.SocialMediaLinkDto;
import com.aaspass.entity.StoreEngagementStats;
import com.aaspass.entity.StoreSocialMediaLinks;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO representing full store details.
 */
@Builder
public record StoreResponse(
    Long id,
    Long userId,
    String storeName,
    String ownerName,
    String tagline,
    String category,
    List<String> skills,
    Integer experienceYears,
    BigDecimal hourlyRate,
    BigDecimal startingPrice,
    String area,
    String city,
    String country,
    Integer serviceRadiusKm,
    Double rating,
    Integer reviewCount,
    String description,
    String avatarUrl,
    String bannerGradient,
    Boolean isAvailable,
    Boolean isActive,
    String memberSince,
    StoreEngagementStats views,
    StoreSocialMediaLinks storeSocialMediaLinks,
    List<SocialMediaLinkDto> socialMediaLinks,
    List<ServiceItemResponse> services,
    List<StoreReviewResponse> reviews,
    LocalDateTime creationDateTime,
    LocalDateTime lastUpdateDateTime
) {
    public StoreResponse {
        skills = (skills != null) ? skills : List.of();
        rating = (rating != null) ? rating : 5.0;
        reviewCount = (reviewCount != null) ? reviewCount : 0;
        bannerGradient = (bannerGradient != null && !bannerGradient.isBlank()) ? bannerGradient : "from-indigo-500 to-purple-600";
        isAvailable = (isAvailable != null) ? isAvailable : true;
        isActive = Boolean.TRUE.equals(isActive);
        socialMediaLinks = (socialMediaLinks != null) ? socialMediaLinks : List.of();
        services = (services != null) ? services : List.of();
        reviews = (reviews != null) ? reviews : List.of();
    }
}
