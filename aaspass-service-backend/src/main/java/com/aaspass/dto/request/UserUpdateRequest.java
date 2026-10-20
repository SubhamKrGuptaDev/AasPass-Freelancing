package com.aaspass.dto.request;

import com.aaspass.dto.common.SocialMediaLinkDto;
import com.aaspass.entity.UserSocialMediaLinks;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * Request payload for updating a user's profile details.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserUpdateRequest {

    private String name;
    private String phone;
    private String aadharNumber;
    private String panNumber;
    private String avatarUrl;
    private String city;
    private String area;
    private String bio;
    private UserSocialMediaLinks userSocialMediaLinks;
    private List<SocialMediaLinkDto> socialMediaLinks;
}
