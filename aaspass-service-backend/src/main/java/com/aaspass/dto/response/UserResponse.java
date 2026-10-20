package com.aaspass.dto.response;

import com.aaspass.dto.common.SocialMediaLinkDto;
import com.aaspass.entity.UserSocialMediaLinks;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Response DTO representing full user account details.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long id;
    private String name;
    private String username;
    private String email;
    private String phone;
    private String aadharNumber;
    private String panNumber;
    private String avatarUrl;
    private String city;
    private String area;
    private String bio;
    private String memberSince;
    private Boolean hasStore;

    private UserSocialMediaLinks userSocialMediaLinks;

    @Builder.Default
    private List<SocialMediaLinkDto> socialMediaLinks = new ArrayList<>();

    @Builder.Default
    private List<StoreResponse> stores = new ArrayList<>();

    @Builder.Default
    private List<AddressResponse> addresses = new ArrayList<>();

    private LocalDateTime creationDateTime;
    private LocalDateTime lastUpdateDateTime;
}
