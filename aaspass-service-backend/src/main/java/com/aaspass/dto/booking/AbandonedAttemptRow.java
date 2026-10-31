package com.aaspass.dto.booking;

import com.aaspass.entity.booking.FunnelStep;

import java.time.LocalDateTime;

public record AbandonedAttemptRow(Long userId, String userName, String avatarUrl, String serviceName,
                                  FunnelStep lastStep, LocalDateTime clickedAt) {
}
