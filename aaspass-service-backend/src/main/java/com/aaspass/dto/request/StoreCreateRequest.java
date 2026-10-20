package com.aaspass.dto.request;

import com.aaspass.dto.common.SocialMediaLinkDto;
import com.aaspass.entity.StoreSocialMediaLinks;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Request payload for creating and publishing a new store storefront.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreCreateRequest {

    @NotNull(message = "User ID is required to associate store with owner")
    private Long userId;

    private String ownerName;

    @NotBlank(message = "Store name is required")
    private String storeName;

    private String tagline;

    @NotBlank(message = "Category is required")
    private String category;

    @Builder.Default
    private List<String> skills = new ArrayList<>();

    @Builder.Default
    private Integer experienceYears = 0;

    private BigDecimal hourlyRate;
    private BigDecimal startingPrice;

    @NotBlank(message = "Neighborhood area is required")
    private String area;

    @NotBlank(message = "City is required")
    private String city;

    @Builder.Default
    private Integer serviceRadiusKm = 10;

    private String description;
    private String avatarUrl;

    @Builder.Default
    private String bannerGradient = "from-indigo-500 to-purple-600";

    private StoreSocialMediaLinks storeSocialMediaLinks;

    @Builder.Default
    private List<SocialMediaLinkDto> socialMediaLinks = new ArrayList<>();

    @Builder.Default
    private List<ServiceItemRequest> services = new ArrayList<>();
}
