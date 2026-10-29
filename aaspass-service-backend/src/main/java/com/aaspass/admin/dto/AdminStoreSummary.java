package com.aaspass.admin.dto;

import java.time.LocalDateTime;

/** One row of the admin store list. */
public record AdminStoreSummary(Long id, String storeName, String category, Long ownerId, String ownerName,
                                String ownerUsername, String city, String country, String area,
                                boolean isActive, boolean adminBlocked, boolean reviewed,
                                LocalDateTime creationDateTime) {
}
