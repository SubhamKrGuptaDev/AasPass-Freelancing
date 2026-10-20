package com.aaspass.controller;

import com.aaspass.dto.request.StoreReviewRequest;
import com.aaspass.dto.response.ApiResponse;
import com.aaspass.dto.response.StoreReviewResponse;
import com.aaspass.service.StoreReviewService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller managing customer reviews and ratings for stores.
 */
@RestController
@RequestMapping("/api/stores/{storeId}/reviews")
@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200"})
public class StoreReviewController {

    private static final Logger log = LoggerFactory.getLogger(StoreReviewController.class);

    private final StoreReviewService reviewService;

    public StoreReviewController(StoreReviewService reviewService) {
        this.reviewService = reviewService;
    }

    /**
     * Get all verified client reviews for a store.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<StoreReviewResponse>>> getReviews(@PathVariable("storeId") Long storeId) {
        log.info("[API-CALL] GET /api/stores/{}/reviews - Fetching reviews", storeId);
        List<StoreReviewResponse> reviews = reviewService.getReviewsByStoreId(storeId);
        return ResponseEntity.ok(ApiResponse.success(reviews, "Reviews retrieved successfully"));
    }

    /**
     * Submit a customer review and rating (1.0 to 5.0) for a store.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<StoreReviewResponse>> addReview(
            @PathVariable("storeId") Long storeId,
            @Valid @RequestBody StoreReviewRequest request) {
        log.info("[API-CALL] POST /api/stores/{}/reviews - User '{}' submitting rating: {}",
                storeId, request.getUserName(), request.getRating());

        StoreReviewResponse response = reviewService.addReview(storeId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Review submitted successfully"));
    }
}
