package com.aaspass.dto.common;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Builder;

/**
 * DTO representing dynamic verified social media and external portfolio channels.
 * Uses Object id to safely accept both numeric DB IDs and temporary client IDs.
 */
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public record SocialMediaLinkDto(
    Object id,
    String name,
    String url
) {}
