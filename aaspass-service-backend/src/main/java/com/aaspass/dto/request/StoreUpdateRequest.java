package com.aaspass.dto.request;

import com.aaspass.dto.booking.StoreAvailabilityDto;
import com.aaspass.dto.common.SocialMediaLinkDto;
import com.aaspass.entity.StoreSocialMediaLinks;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Pattern;
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
    @Size(max = 60, message = "City must be at most 60 characters")
    String city,
    @Size(max = 60, message = "Country must be at most 60 characters")
    String country,
    @Size(max = StoreCreateRequest.GOOGLE_MAP_LINK_MAX_LENGTH, message = "Google Maps link must be at most 2048 characters")
    @Pattern(regexp = StoreCreateRequest.GOOGLE_MAP_LINK_REGEX, flags = Pattern.Flag.CASE_INSENSITIVE,
        message = StoreCreateRequest.GOOGLE_MAP_LINK_MESSAGE)
    String googleMapLink,
    Integer serviceRadiusKm,
    String description,
    String avatarUrl,
    String bannerGradient,
    Boolean isAvailable,
    StoreSocialMediaLinks storeSocialMediaLinks,
    List<SocialMediaLinkDto> socialMediaLinks,
    StoreAvailabilityDto availability
) {}
