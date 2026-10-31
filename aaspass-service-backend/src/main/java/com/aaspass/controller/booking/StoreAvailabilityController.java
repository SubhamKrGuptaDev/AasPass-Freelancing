package com.aaspass.controller.booking;

import com.aaspass.config.security.CurrentUser;
import com.aaspass.dto.booking.AvailabilityExceptionRequest;
import com.aaspass.dto.booking.AvailabilityExceptionResponse;
import com.aaspass.dto.booking.AvailabilitySaveResult;
import com.aaspass.dto.booking.StoreAvailabilityDto;
import com.aaspass.dto.response.ApiResponse;
import com.aaspass.service.booking.StoreAvailabilityService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

/** Weekly availability (public read, owner write) and date exceptions (owner) of a store. */
@RestController
@RequestMapping("/api/stores/{storeId}/availability")
public class StoreAvailabilityController {

    private static final Logger log = LoggerFactory.getLogger(StoreAvailabilityController.class);

    private final StoreAvailabilityService availabilityService;
    private final CurrentUser currentUser;

    public StoreAvailabilityController(StoreAvailabilityService availabilityService, CurrentUser currentUser) {
        this.availabilityService = availabilityService;
        this.currentUser = currentUser;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<StoreAvailabilityDto>> get(@PathVariable("storeId") Long storeId) {
        log.info("[API-CALL] GET /api/stores/{}/availability", storeId);
        return ResponseEntity.ok(ApiResponse.success(availabilityService.get(storeId), "Availability retrieved successfully"));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<AvailabilitySaveResult>> replace(
            @PathVariable("storeId") Long storeId,
            @RequestBody StoreAvailabilityDto body) {
        log.info("[API-CALL] PUT /api/stores/{}/availability", storeId);
        AvailabilitySaveResult result = availabilityService.replace(storeId, currentUser.requireUserId(), body);
        return ResponseEntity.ok(ApiResponse.success(result, "Availability saved successfully"));
    }

    @GetMapping("/exceptions")
    public ResponseEntity<ApiResponse<List<AvailabilityExceptionResponse>>> listExceptions(
            @PathVariable("storeId") Long storeId,
            @RequestParam(value = "from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(value = "to", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        log.info("[API-CALL] GET /api/stores/{}/availability/exceptions from={} to={}", storeId, from, to);
        List<AvailabilityExceptionResponse> list =
                availabilityService.listExceptions(storeId, currentUser.requireUserId(), from, to);
        return ResponseEntity.ok(ApiResponse.success(list, "Exceptions retrieved successfully"));
    }

    @PostMapping("/exceptions")
    public ResponseEntity<ApiResponse<AvailabilityExceptionResponse>> addException(
            @PathVariable("storeId") Long storeId,
            @Valid @RequestBody AvailabilityExceptionRequest body) {
        log.info("[API-CALL] POST /api/stores/{}/availability/exceptions", storeId);
        AvailabilityExceptionResponse created =
                availabilityService.addException(storeId, currentUser.requireUserId(), body);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Exception added successfully"));
    }

    @DeleteMapping("/exceptions/{exceptionId}")
    public ResponseEntity<ApiResponse<Void>> deleteException(
            @PathVariable("storeId") Long storeId,
            @PathVariable("exceptionId") Long exceptionId) {
        log.info("[API-CALL] DELETE /api/stores/{}/availability/exceptions/{}", storeId, exceptionId);
        availabilityService.deleteException(storeId, exceptionId, currentUser.requireUserId());
        return ResponseEntity.ok(ApiResponse.success(null, "Exception deleted successfully"));
    }
}
