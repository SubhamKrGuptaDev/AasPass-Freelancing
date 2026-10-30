package com.aaspass.admin.dto;

import com.aaspass.entity.ContactRequestStatus;
import com.aaspass.entity.ContactRequestType;
import java.time.LocalDateTime;

/** One row of the admin contact inbox. */
public record AdminContactRequestSummary(
        Long id,
        ContactRequestType type,
        ContactRequestStatus status,
        String name,
        String email,
        String subject,
        LocalDateTime creationDateTime) {
}
