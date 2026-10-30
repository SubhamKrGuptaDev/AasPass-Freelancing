package com.aaspass.admin.dto;

import com.aaspass.entity.ContactRequestStatus;
import com.aaspass.entity.ContactRequestType;
import java.time.LocalDateTime;

/** Full contact request including the admin note and the linked user, if any. */
public record AdminContactRequestDetail(
        Long id,
        ContactRequestType type,
        ContactRequestStatus status,
        String name,
        String email,
        String phone,
        String subject,
        String message,
        String adminNote,
        Long userId,
        String username,
        Long handledByAdminId,
        LocalDateTime resolvedAt,
        LocalDateTime creationDateTime,
        LocalDateTime lastUpdatedDateTime) {
}
