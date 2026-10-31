package com.aaspass.controller.booking;

import com.aaspass.admin.dto.PageResponse;
import com.aaspass.booking.AnalyticsPeriod;
import com.aaspass.config.security.CurrentUser;
import com.aaspass.dto.booking.AbandonedAttemptRow;
import com.aaspass.dto.booking.BookingAnalyticsResponse;
import com.aaspass.dto.response.ApiResponse;
import com.aaspass.service.booking.BookingAnalyticsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Owner booking funnel analytics and abandoned-attempt list. */
@RestController
public class BookingAnalyticsController {

    private static final Logger log = LoggerFactory.getLogger(BookingAnalyticsController.class);

    private final BookingAnalyticsService analyticsService;
    private final CurrentUser currentUser;

    public BookingAnalyticsController(BookingAnalyticsService analyticsService, CurrentUser currentUser) {
        this.analyticsService = analyticsService;
        this.currentUser = currentUser;
    }

    @GetMapping("/api/stores/{id}/booking-analytics")
    public ResponseEntity<ApiResponse<BookingAnalyticsResponse>> analytics(
            @PathVariable("id") Long id,
            @RequestParam(value = "period", defaultValue = "7D") String period) {
        Long callerId = currentUser.requireUserId();
        log.info("[API-CALL] GET /api/stores/{}/booking-analytics user={} period={}", id, callerId, period);
        return ResponseEntity.ok(ApiResponse.success(
                analyticsService.analytics(id, callerId, AnalyticsPeriod.fromParam(period)),
                "Booking analytics retrieved successfully"));
    }

    @GetMapping("/api/stores/{id}/booking-analytics/abandoned")
    public ResponseEntity<ApiResponse<PageResponse<AbandonedAttemptRow>>> abandoned(
            @PathVariable("id") Long id,
            @RequestParam(value = "period", defaultValue = "7D") String period,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        Long callerId = currentUser.requireUserId();
        log.info("[API-CALL] GET /api/stores/{}/booking-analytics/abandoned user={} period={}", id, callerId, period);
        PageRequest pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100));
        return ResponseEntity.ok(ApiResponse.success(
                PageResponse.of(analyticsService.abandoned(id, callerId, AnalyticsPeriod.fromParam(period), pageable)),
                "Abandoned attempts retrieved successfully"));
    }
}
