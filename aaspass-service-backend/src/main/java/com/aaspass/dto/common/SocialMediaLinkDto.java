package com.aaspass.dto.common;

import lombok.Builder;

/**
 * DTO representing dynamic verified social media and external portfolio channels.
 */
@Builder
public record SocialMediaLinkDto(
    Long id,
    String name,
    String url
) {}
