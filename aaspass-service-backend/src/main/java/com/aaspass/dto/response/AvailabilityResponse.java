package com.aaspass.dto.response;

/**
 * Response DTO for the signup username / email availability checks.
 *
 * @param available {@code true} when no existing account uses the value
 */
public record AvailabilityResponse(
    boolean available
) {
}
