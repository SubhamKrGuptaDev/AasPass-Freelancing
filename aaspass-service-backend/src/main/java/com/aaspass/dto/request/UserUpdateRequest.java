package com.aaspass.dto.request;

import com.aaspass.dto.common.SocialMediaLinkDto;
import com.aaspass.entity.UserSocialMediaLinks;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Builder;

import java.util.List;

/**
 * Request payload for updating a user's profile details.
 */
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public record UserUpdateRequest(
    String name,
    String phone,
    String avatarUrl,
    String city,
    String area,
    String country,
    String bio,
    UserSocialMediaLinks userSocialMediaLinks,
    List<SocialMediaLinkDto> socialMediaLinks
) {}
