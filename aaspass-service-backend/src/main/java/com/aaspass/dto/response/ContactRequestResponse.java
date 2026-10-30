package com.aaspass.dto.response;

import com.aaspass.entity.ContactRequestStatus;
import com.aaspass.entity.ContactRequestType;

import java.time.LocalDateTime;

/** Public acknowledgement of a contact submission; deliberately omits all admin-only fields. */
public record ContactRequestResponse(
        Long id,
        ContactRequestType type,
        ContactRequestStatus status,
        LocalDateTime creationDateTime
) {
}
