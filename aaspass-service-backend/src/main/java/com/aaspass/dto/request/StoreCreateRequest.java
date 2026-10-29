package com.aaspass.dto.request;

import com.aaspass.dto.common.SocialMediaLinkDto;
import com.aaspass.entity.StoreSocialMediaLinks;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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
    @Size(max = 60, message = "City must be at most 60 characters")
    String city,

    @Size(max = 60, message = "Country must be at most 60 characters")
    String country,

    @Size(max = GOOGLE_MAP_LINK_MAX_LENGTH, message = "Google Maps link must be at most 2048 characters")
    @Pattern(regexp = GOOGLE_MAP_LINK_REGEX, flags = Pattern.Flag.CASE_INSENSITIVE, message = GOOGLE_MAP_LINK_MESSAGE)
    String googleMapLink,

    Integer serviceRadiusKm,
    String description,
    String avatarUrl,
    String bannerGradient,
    StoreSocialMediaLinks storeSocialMediaLinks,
    List<SocialMediaLinkDto> socialMediaLinks,
    List<ServiceItemRequest> services
) {
    /** Long localized place names and directions links run well past 500 characters. */
    public static final int GOOGLE_MAP_LINK_MAX_LENGTH = 2048;

    /**
     * Blank (the field is optional), or a Google Maps link: maps.app.goo.gl/..., goo.gl/maps/...,
     * [www.|maps.]google.TLD/maps..., or maps.google.TLD[/?#]... where TLD is com, a 2-letter
     * country code, co.XX or com.XX. Anchoring the TLD stops look-alike hosts such as maps.google.com.evil.io.
     * Surrounding whitespace is allowed because the service trims the value. Keep in sync with
     * {@code GOOGLE_MAP_LINK_PATTERN} in the client's forms/validators.ts.
     */
    public static final String GOOGLE_MAP_LINK_REGEX =
        "^\\s*(?:https?://(?:"
            + "maps\\.app\\.goo\\.gl/\\S+"
            + "|goo\\.gl/maps/\\S+"
            + "|(?:www\\.|maps\\.)?google\\.(?:com|[a-z]{2}|co\\.[a-z]{2}|com\\.[a-z]{2})/maps(?:[/?#]\\S*)?"
            + "|maps\\.google\\.(?:com|[a-z]{2}|co\\.[a-z]{2}|com\\.[a-z]{2})(?:[/?#]\\S*)?"
            + "))?\\s*$";

    public static final String GOOGLE_MAP_LINK_MESSAGE =
        "Google Maps link must be a valid Google Maps URL (e.g. https://maps.app.goo.gl/...)";

    public StoreCreateRequest {
        skills = (skills != null) ? skills : List.of();
        experienceYears = (experienceYears != null) ? experienceYears : 0;
        serviceRadiusKm = (serviceRadiusKm != null) ? serviceRadiusKm : 10;
        bannerGradient = (bannerGradient != null && !bannerGradient.isBlank()) ? bannerGradient : "from-indigo-500 to-purple-600";
        socialMediaLinks = (socialMediaLinks != null) ? socialMediaLinks : List.of();
        services = (services != null) ? services : List.of();
    }
}
