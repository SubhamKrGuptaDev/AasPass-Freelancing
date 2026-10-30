package com.aaspass.admin.dto;

import com.aaspass.entity.ContactRequestStatus;
import jakarta.validation.constraints.Size;

/** Partial update of a contact request; at least one field must be present. A blank note clears it. */
public record ContactRequestUpdate(ContactRequestStatus status, @Size(max = 2000) String adminNote) {
}
