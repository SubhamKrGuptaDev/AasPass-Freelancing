package com.aaspass.dto.response;

/**
 * Result of a profile picture upload or removal.
 *
 * @param profilePictureUrl versioned URL of the new picture, or null after removal
 */
public record ProfilePictureResponse(String profilePictureUrl) {
}
