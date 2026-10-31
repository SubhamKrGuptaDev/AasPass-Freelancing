package com.aaspass.controller.booking;

import com.aaspass.admin.dto.PageResponse;
import com.aaspass.config.security.CurrentUser;
import com.aaspass.dto.booking.BookingDecisionRequest;
import com.aaspass.dto.booking.BookingDecisionResult;
import com.aaspass.dto.booking.BookingResponse;
import com.aaspass.dto.booking.ConfirmPreview;
import com.aaspass.dto.booking.OwnerBookingRow;
import com.aaspass.dto.booking.ScheduleResponse;
import com.aaspass.dto.response.ApiResponse;
import com.aaspass.entity.booking.BookingStatus;
import com.aaspass.service.booking.OwnerBookingService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

/** Owner inbox, overlap view and booking decisions. */
@RestController
public class OwnerBookingController {

    private static final Logger log = LoggerFactory.getLogger(OwnerBookingController.class);

    private final OwnerBookingService ownerBookingService;
    private final CurrentUser currentUser;

    public OwnerBookingController(OwnerBookingService ownerBookingService, CurrentUser currentUser) {
        this.ownerBookingService = ownerBookingService;
        this.currentUser = currentUser;
    }

    @GetMapping("/api/stores/{id}/bookings")
    public ResponseEntity<ApiResponse<PageResponse<OwnerBookingRow>>> list(
            @PathVariable("id") Long id,
            @RequestParam(value = "status", required = false) BookingStatus status,
            @RequestParam(value = "from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(value = "to", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        Long callerId = currentUser.requireUserId();
        log.info("[API-CALL] GET /api/stores/{}/bookings user={} status={}", id, callerId, status);
        PageRequest pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100));
        return ResponseEntity.ok(ApiResponse.success(
                PageResponse.of(ownerBookingService.list(id, callerId, status, from, to, pageable)),
                "Bookings retrieved successfully"));
    }

    @GetMapping("/api/stores/{id}/bookings/{bookingId}/overlaps")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> overlaps(@PathVariable("id") Long id,
                                                                       @PathVariable("bookingId") Long bookingId) {
        Long callerId = currentUser.requireUserId();
        log.info("[API-CALL] GET /api/stores/{}/bookings/{}/overlaps user={}", id, bookingId, callerId);
        return ResponseEntity.ok(ApiResponse.success(ownerBookingService.overlaps(id, bookingId, callerId),
                "Overlaps retrieved successfully"));
    }

    @GetMapping("/api/stores/{id}/bookings/{bookingId}/confirm-preview")
    public ResponseEntity<ApiResponse<ConfirmPreview>> preview(@PathVariable("id") Long id,
                                                               @PathVariable("bookingId") Long bookingId) {
        Long callerId = currentUser.requireUserId();
        log.info("[API-CALL] GET /api/stores/{}/bookings/{}/confirm-preview user={}", id, bookingId, callerId);
        return ResponseEntity.ok(ApiResponse.success(ownerBookingService.preview(id, bookingId, callerId),
                "Preview retrieved successfully"));
    }

    @GetMapping("/api/stores/{id}/schedule")
    public ResponseEntity<ApiResponse<ScheduleResponse>> schedule(
            @PathVariable("id") Long id,
            @RequestParam("from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam("to") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        Long callerId = currentUser.requireUserId();
        log.info("[API-CALL] GET /api/stores/{}/schedule user={} from={} to={}", id, callerId, from, to);
        return ResponseEntity.ok(ApiResponse.success(ownerBookingService.schedule(id, callerId, from, to),
                "Schedule retrieved successfully"));
    }

    @PatchMapping("/api/bookings/{id}")
    public ResponseEntity<ApiResponse<BookingDecisionResult>> decide(@PathVariable("id") Long id,
                                                                     @Valid @RequestBody BookingDecisionRequest body) {
        Long callerId = currentUser.requireUserId();
        log.info("[API-CALL] PATCH /api/bookings/{} action={} user={}", id, body.action(), callerId);
        return ResponseEntity.ok(ApiResponse.success(ownerBookingService.decide(id, callerId, body),
                "Booking updated"));
    }
}
