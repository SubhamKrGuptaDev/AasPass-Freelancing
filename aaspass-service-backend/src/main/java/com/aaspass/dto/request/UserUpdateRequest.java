package com.aaspass.dto.request;

import com.aaspass.dto.common.SocialMediaLinkDto;
import com.aaspass.entity.UserSocialMediaLinks;
import lombok.Builder;

import java.util.List;

/**
 * Request payload for updating a user's profile details.
 */
@Builder
public record UserUpdateRequest(
    String name,
    String phone,
    String aadharNumber,
    String panNumber,
    String avatarUrl,
    String city,
    String area,
    String bio,
    UserSocialMediaLinks userSocialMediaLinks,
    List<SocialMediaLinkDto> socialMediaLinks
) {}
