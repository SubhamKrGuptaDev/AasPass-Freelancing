package com.aaspass.dto.request;

import com.aaspass.dto.common.SocialMediaLinkDto;
import com.aaspass.entity.StoreSocialMediaLinks;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

/**
 * Request payload for updating an existing store storefront.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreUpdateRequest {

    private String storeName;
    private String ownerName;
    private String tagline;
    private String category;
    private List<String> skills;
    private Integer experienceYears;
    private BigDecimal hourlyRate;
    private BigDecimal startingPrice;
    private String area;
    private String city;
    private Integer serviceRadiusKm;
    private String description;
    private String avatarUrl;
    private String bannerGradient;
    private Boolean isAvailable;
    private StoreSocialMediaLinks storeSocialMediaLinks;
    private List<SocialMediaLinkDto> socialMediaLinks;
}
