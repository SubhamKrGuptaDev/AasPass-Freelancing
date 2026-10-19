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
 * Embeddable representing digital store social media and portfolio channel links
 * (Instagram, LinkedIn, GitHub, Portfolio, Twitter/X, YouTube).
 * Captures the Store Social Media Links for neighborhood storefront credibility.
 */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreSocialMediaLinks implements Serializable {

    @Column(name = "store_social_instagram", length = 255)
    private String instagram;

    @Column(name = "store_social_linkedin", length = 255)
    private String linkedin;

    @Column(name = "store_social_github", length = 255)
    private String github;

    @Column(name = "store_social_portfolio", length = 255)
    private String portfolio;

    @Column(name = "store_social_twitter", length = 255)
    private String twitter;

    @Column(name = "store_social_youtube", length = 255)
    private String youtube;
}
