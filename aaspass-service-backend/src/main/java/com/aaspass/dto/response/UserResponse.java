package com.aaspass.dto.response;

import com.aaspass.dto.common.SocialMediaLinkDto;
import com.aaspass.entity.UserSocialMediaLinks;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO representing full user account details.
 */
@Builder
public record UserResponse(
    Long id,
    String name,
    String username,
    String email,
    String phone,
    String aadharNumber,
    String panNumber,
    String avatarUrl,
    String city,
    String area,
    String country,
    String bio,
    String memberSince,
    Boolean hasStore,
    UserSocialMediaLinks userSocialMediaLinks,
    List<SocialMediaLinkDto> socialMediaLinks,
    List<StoreResponse> stores,
    List<AddressResponse> addresses,
    LocalDateTime creationDateTime,
    LocalDateTime lastUpdateDateTime
) {
    public UserResponse {
        socialMediaLinks = (socialMediaLinks != null) ? socialMediaLinks : List.of();
        stores = (stores != null) ? stores : List.of();
        addresses = (addresses != null) ? addresses : List.of();
    }
}
