package com.aaspass.dto.booking;

import com.aaspass.entity.booking.BookingStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BookingResponse(Long id, Long storeId, String storeName, Long serviceId, String serviceName,
                              Long userId, String userName, String userAvatarUrl,
                              LocalDateTime startAt, LocalDateTime endAt, int durationMinutes,
                              BookingStatus status, String note, String ownerNote, BigDecimal price,
                              LocalDateTime decidedAt, boolean autoRejected, LocalDateTime creationDateTime) {
}
