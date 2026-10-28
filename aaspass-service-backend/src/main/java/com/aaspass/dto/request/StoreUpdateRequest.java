package com.aaspass.dto.request;

import com.aaspass.dto.common.SocialMediaLinkDto;
import com.aaspass.entity.StoreSocialMediaLinks;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Size;
import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;

/**
 * Request payload for updating an existing store storefront.
 */
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
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
    @Size(max = 60, message = "Country must be at most 60 characters")
    String country,
    Integer serviceRadiusKm,
    String description,
    String avatarUrl,
    String bannerGradient,
    Boolean isAvailable,
    StoreSocialMediaLinks storeSocialMediaLinks,
    List<SocialMediaLinkDto> socialMediaLinks
) {}
