package com.aaspass.service;

import com.aaspass.dto.response.ProfilePictureResponse;
import com.aaspass.entity.User;
import com.aaspass.entity.UserProfilePicture;
import com.aaspass.exception.BadRequestException;
import com.aaspass.exception.ResourceNotFoundException;
import com.aaspass.repository.UserProfilePictureRepository;
import com.aaspass.repository.UserRepository;
import com.aaspass.util.ProfilePictureUrls;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;

/**
 * Stores, serves and removes user profile pictures kept as bytes in the database.
 * The generated avatar ({@code User.avatarUrl}) is never touched; the picture is shown on top of it.
 */
@Service
public class ProfilePictureService {

    private static final Logger log = LoggerFactory.getLogger(ProfilePictureService.class);

    /** Hard cap on stored bytes; the client resizes to 512x512 JPEG first, which is far smaller. */
    public static final long MAX_BYTES = 1024 * 1024;

    private final UserProfilePictureRepository pictureRepository;
    private final UserRepository userRepository;

    public ProfilePictureService(UserProfilePictureRepository pictureRepository, UserRepository userRepository) {
        this.pictureRepository = pictureRepository;
        this.userRepository = userRepository;
    }

    /** Image bytes plus the metadata needed for HTTP caching headers. */
    public record PictureContent(byte[] data, String contentType, LocalDateTime lastUpdated) {
    }

    @Transactional
    public ProfilePictureResponse upload(Long userId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please choose an image to upload.");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new BadRequestException("Profile picture must be 1 MB or smaller.");
        }

        byte[] data;
        try {
            data = file.getBytes();
        } catch (IOException e) {
            log.warn("[PROFILE PICTURE] Could not read upload for user {}: {}", userId, e.getMessage());
            throw new BadRequestException("Could not read the uploaded image.");
        }

        // Trust the file's own bytes, never the client-supplied Content-Type or file name.
        String contentType = detectImageType(data);
        if (contentType == null) {
            throw new BadRequestException("Only JPEG, PNG or WebP images are allowed.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        UserProfilePicture picture = pictureRepository.findByUserId(userId)
                .orElseGet(() -> UserProfilePicture.builder().user(user).build());
        picture.setData(data);
        picture.setContentType(contentType);

        // Flush so the audit callbacks set lastUpdatedDateTime before it is read for the URL.
        UserProfilePicture saved = pictureRepository.saveAndFlush(picture);
        log.info("[PROFILE PICTURE] Saved {} ({} bytes) for user {}", contentType, data.length, userId);
        return new ProfilePictureResponse(ProfilePictureUrls.of(userId, saved.getLastUpdatedDateTime()));
    }

    @Transactional(readOnly = true)
    public PictureContent get(Long userId) {
        UserProfilePicture picture = pictureRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile picture", "userId", userId));
        return new PictureContent(picture.getData(), picture.getContentType(), picture.getLastUpdatedDateTime());
    }

    /** Idempotent: removing when no picture exists still succeeds. */
    @Transactional
    public ProfilePictureResponse delete(Long userId) {
        int removed = pictureRepository.deleteByUserId(userId);
        log.info("[PROFILE PICTURE] Removed {} picture(s) for user {}", removed, userId);
        return new ProfilePictureResponse(null);
    }

    /** @return the MIME type for JPEG, PNG or WebP magic bytes, or null for anything else */
    static String detectImageType(byte[] b) {
        if (b == null || b.length < 12) {
            return null;
        }
        if ((b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF) {
            return "image/jpeg";
        }
        if ((b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G'
                && b[4] == 0x0D && b[5] == 0x0A && b[6] == 0x1A && b[7] == 0x0A) {
            return "image/png";
        }
        if (b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
                && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P') {
            return "image/webp";
        }
        return null;
    }
}
