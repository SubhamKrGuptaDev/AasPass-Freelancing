package com.aaspass.dto.request;

import com.aaspass.dto.common.SocialMediaLinkDto;
import com.aaspass.entity.StoreSocialMediaLinks;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;

/**
 * Request payload for creating and publishing a new store storefront.
 */
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public record StoreCreateRequest(
    String ownerName,

    @NotBlank(message = "Store name is required")
    String storeName,

    String tagline,

    @NotBlank(message = "Category is required")
    String category,

    List<String> skills,
    Integer experienceYears,
    BigDecimal hourlyRate,
    BigDecimal startingPrice,

    @NotBlank(message = "Neighborhood area is required")
    String area,

    @NotBlank(message = "City is required")
    String city,

    @Size(max = 60, message = "Country must be at most 60 characters")
    String country,

    Integer serviceRadiusKm,
    String description,
    String avatarUrl,
    String bannerGradient,
    StoreSocialMediaLinks storeSocialMediaLinks,
    List<SocialMediaLinkDto> socialMediaLinks,
    List<ServiceItemRequest> services
) {
    public StoreCreateRequest {
        skills = (skills != null) ? skills : List.of();
        experienceYears = (experienceYears != null) ? experienceYears : 0;
        serviceRadiusKm = (serviceRadiusKm != null) ? serviceRadiusKm : 10;
        bannerGradient = (bannerGradient != null && !bannerGradient.isBlank()) ? bannerGradient : "from-indigo-500 to-purple-600";
        socialMediaLinks = (socialMediaLinks != null) ? socialMediaLinks : List.of();
        services = (services != null) ? services : List.of();
    }
}
