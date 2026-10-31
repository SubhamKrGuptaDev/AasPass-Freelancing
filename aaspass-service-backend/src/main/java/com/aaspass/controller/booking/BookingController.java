package com.aaspass.controller.booking;

import com.aaspass.dto.booking.DaySlotsResponse;
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

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
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
