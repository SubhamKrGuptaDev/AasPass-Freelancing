package com.aaspass.util;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

/**
 * Builds the public URL of a user's uploaded profile picture.
 * The {@code v} query parameter changes on every upload so browsers never show a stale cached image.
 */
public final class ProfilePictureUrls {

    private ProfilePictureUrls() {
    }

    /** @return the picture URL, or null when the user has no uploaded picture */
    public static String of(Long userId, LocalDateTime updatedAt) {
        if (userId == null || updatedAt == null) {
            return null;
        }
        return "/api/users/" + userId + "/profile-picture?v=" + updatedAt.toInstant(ZoneOffset.UTC).toEpochMilli();
    }
}
