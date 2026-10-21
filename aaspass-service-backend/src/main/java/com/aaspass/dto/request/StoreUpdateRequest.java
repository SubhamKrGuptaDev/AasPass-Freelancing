package com.aaspass.dto.request;

import com.aaspass.dto.common.SocialMediaLinkDto;
import com.aaspass.entity.StoreSocialMediaLinks;
import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;

/**
 * Request payload for updating an existing store storefront.
 */
@Builder
public record StoreUpdateRequest(
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
    Integer serviceRadiusKm,
    String description,
    String avatarUrl,
    String bannerGradient,
    Boolean isAvailable,
    StoreSocialMediaLinks storeSocialMediaLinks,
    List<SocialMediaLinkDto> socialMediaLinks
) {}
