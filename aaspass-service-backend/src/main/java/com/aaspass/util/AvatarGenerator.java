package com.aaspass.util;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

/**
 * Utility for generating avatar URLs with random fallbacks when a user does not provide an image.
 */
public final class AvatarGenerator {

    private static final String DICEBEAR_BASE = "https://api.dicebear.com/7.x/avataaars/svg?seed=";

    private AvatarGenerator() {
    }

    /**
     * Returns the given avatarUrl if non-blank; otherwise generates a deterministic or random
     * SVG avatar using Dicebear Avataaars with the user's identifier or a random seed.
     *
     * @param avatarUrl existing avatar URL (may be null/empty)
     * @param seed optional seed string (username, name, or null for random)
     * @return a valid non-empty avatar URL
     */
    public static String getOrDefault(String avatarUrl, String seed) {
        if (avatarUrl != null && !avatarUrl.trim().isEmpty()) {
            return avatarUrl.trim();
        }
        return generateRandomAvatar(seed);
    }

    /**
     * Generates a random avatar URL using a seed or a unique random UUID.
     *
     * @param seed optional identifier seed
     * @return a valid avatar URL
     */
    public static String generateRandomAvatar(String seed) {
        String safeSeed;
        if (seed != null && !seed.trim().isEmpty()) {
            safeSeed = seed.trim().toLowerCase().replaceAll("[^a-zA-Z0-9_-]", "");
            if (safeSeed.isEmpty()) {
                safeSeed = "user-" + UUID.randomUUID().toString().substring(0, 8);
            }
        } else {
            safeSeed = "user-" + UUID.randomUUID().toString().substring(0, 8);
        }
        return DICEBEAR_BASE + URLEncoder.encode(safeSeed, StandardCharsets.UTF_8);
    }
}
