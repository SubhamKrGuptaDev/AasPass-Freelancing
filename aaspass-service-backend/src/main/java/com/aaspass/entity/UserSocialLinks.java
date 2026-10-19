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
 * Embeddable representing user / store owner social media and portfolio channel links
 * (Instagram, LinkedIn, GitHub, Portfolio, Twitter/X, YouTube).
 * Captures the Store Owner User Details when setting up or managing their digital presence.
 */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSocialLinks implements Serializable {

    @Column(name = "social_instagram", length = 255)
    private String instagram;

    @Column(name = "social_linkedin", length = 255)
    private String linkedin;

    @Column(name = "social_github", length = 255)
    private String github;

    @Column(name = "social_portfolio", length = 255)
    private String portfolio;

    @Column(name = "social_twitter", length = 255)
    private String twitter;

    @Column(name = "social_youtube", length = 255)
    private String youtube;
}
