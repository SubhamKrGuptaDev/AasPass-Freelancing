package com.aaspass.controller.booking;

import com.aaspass.config.security.CurrentUser;
import com.aaspass.dto.booking.BookingCreateRequest;
import com.aaspass.dto.booking.BookingResponse;
import com.aaspass.dto.booking.DaySlotsResponse;
import com.aaspass.entity.booking.BookingStatus;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import com.aaspass.admin.dto.PageResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.aaspass.dto.response.ApiResponse;
import com.aaspass.service.booking.BookingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

/** User-facing booking endpoints. */
@RestController
public class BookingController {

    private static final Logger log = LoggerFactory.getLogger(BookingController.class);

    private final BookingService bookingService;
    private final CurrentUser currentUser;

    public BookingController(BookingService bookingService, CurrentUser currentUser) {
        this.bookingService = bookingService;
        this.currentUser = currentUser;
    }

    @PostMapping("/api/bookings")
    public ResponseEntity<ApiResponse<BookingResponse>> create(@Valid @RequestBody BookingCreateRequest body,
                                                               HttpServletRequest request) {
        Long callerId = currentUser.requireUserId();
        log.info("[API-CALL] POST /api/bookings store={} user={}", body.storeId(), callerId);
        return ResponseEntity.ok(ApiResponse.success(
                bookingService.create(callerId, body, request.getRemoteAddr()), "Booking requested"));
    }

    @GetMapping("/api/bookings/mine")
    public ResponseEntity<ApiResponse<PageResponse<BookingResponse>>> mine(
            @RequestParam(value = "status", required = false) BookingStatus status,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        Long callerId = currentUser.requireUserId();
        log.info("[API-CALL] GET /api/bookings/mine user={} status={}", callerId, status);
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(bookingService.mine(callerId, status, pageable)),
                "Bookings retrieved successfully"));
    }

    @PatchMapping("/api/bookings/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponse>> cancel(@PathVariable("id") Long id) {
        Long callerId = currentUser.requireUserId();
        log.info("[API-CALL] PATCH /api/bookings/{}/cancel user={}", id, callerId);
        return ResponseEntity.ok(ApiResponse.success(bookingService.cancel(id, callerId), "Booking cancelled"));
    }

    @GetMapping("/api/stores/{id}/slots")
    public ResponseEntity<ApiResponse<DaySlotsResponse>> slots(
            @PathVariable("id") Long id,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(value = "duration", required = false) Integer duration) {
        log.info("[API-CALL] GET /api/stores/{}/slots date={} duration={}", id, date, duration);
        return ResponseEntity.ok(ApiResponse.success(bookingService.slots(id, date, duration), "Slots retrieved successfully"));
    }
}
