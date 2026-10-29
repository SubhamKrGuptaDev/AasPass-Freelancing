package com.aaspass.controller;

import com.aaspass.config.security.CurrentUser;
import com.aaspass.dto.response.ApiResponse;
import com.aaspass.dto.response.ProfilePictureResponse;
import com.aaspass.service.ProfilePictureService;
import com.aaspass.service.ProfilePictureService.PictureContent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.time.ZoneOffset;
import java.util.concurrent.TimeUnit;

/**
 * Upload, view and remove a user's profile picture. Separate from the profile update API so the
 * image travels as multipart bytes instead of inside the JSON profile body.
 */
@RestController
@RequestMapping("/api/users")
public class ProfilePictureController {

    private static final Logger log = LoggerFactory.getLogger(ProfilePictureController.class);

    private final ProfilePictureService profilePictureService;
    private final CurrentUser currentUser;

    public ProfilePictureController(ProfilePictureService profilePictureService, CurrentUser currentUser) {
        this.profilePictureService = profilePictureService;
        this.currentUser = currentUser;
    }

    /**
     * Upload or replace the caller's profile picture (multipart field {@code file}).
     */
    @PostMapping(value = "/me/profile-picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProfilePictureResponse>> upload(@RequestPart("file") MultipartFile file) {
        Long callerId = currentUser.requireUserId();
        log.info("[API-CALL] POST /api/users/me/profile-picture - Uploading picture for user {}", callerId);
        ProfilePictureResponse response = profilePictureService.upload(callerId, file);
        return ResponseEntity.ok(ApiResponse.success(response, "Profile picture updated successfully"));
    }

    /**
     * Public: serves the raw image so it can be used directly in {@code <img src>}.
     * Versioned URLs ({@code ?v=}) change on every upload, so they are cached for a long time.
     */
    @GetMapping("/{id}/profile-picture")
    public ResponseEntity<byte[]> get(@PathVariable("id") Long id,
                                      @RequestParam(value = "v", required = false) String version) {
        PictureContent picture = profilePictureService.get(id);
        CacheControl cacheControl = (version != null && !version.isBlank())
                ? CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic().immutable()
                : CacheControl.noCache();

        ResponseEntity.BodyBuilder builder = ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(picture.contentType()))
                .cacheControl(cacheControl);
        if (picture.lastUpdated() != null) {
            builder.lastModified(picture.lastUpdated().toInstant(ZoneOffset.UTC));
        }
        return builder.body(picture.data());
    }

    /**
     * Remove the caller's profile picture; the generated avatar is shown again everywhere.
     */
    @DeleteMapping("/me/profile-picture")
    public ResponseEntity<ApiResponse<ProfilePictureResponse>> delete() {
        Long callerId = currentUser.requireUserId();
        log.info("[API-CALL] DELETE /api/users/me/profile-picture - Removing picture for user {}", callerId);
        ProfilePictureResponse response = profilePictureService.delete(callerId);
        return ResponseEntity.ok(ApiResponse.success(response, "Profile picture removed successfully"));
    }
}
