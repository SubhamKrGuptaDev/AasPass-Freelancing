package com.aaspass.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

/**
 * Embeddable representing personal user social media and portfolio channel links
 * (Instagram, LinkedIn, GitHub, Portfolio, Twitter/X, YouTube).
 * Captures personal User Social Media Links where customers and clients can connect
 * directly with the user / store owner.
 */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSocialMediaLinks implements Serializable {

    @Column(name = "user_social_instagram", length = 255)
    private String instagram;

    @Column(name = "user_social_linkedin", length = 255)
    private String linkedin;

    @Column(name = "user_social_github", length = 255)
    private String github;

    @Column(name = "user_social_portfolio", length = 255)
    private String portfolio;

    @Column(name = "user_social_twitter", length = 255)
    private String twitter;

    @Column(name = "user_social_youtube", length = 255)
    private String youtube;
}
