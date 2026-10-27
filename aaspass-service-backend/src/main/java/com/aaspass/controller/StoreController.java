package com.aaspass.controller;

import com.aaspass.dto.request.StoreCreateRequest;
import com.aaspass.dto.request.StoreUpdateRequest;
import com.aaspass.dto.response.ApiResponse;
import com.aaspass.dto.response.StoreResponse;
import com.aaspass.service.StoreService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller handling neighborhood storefront discovery, gig search, creation, updates, and view analytics.
 */
@RestController
@RequestMapping("/api/stores")
public class StoreController {

    private static final Logger log = LoggerFactory.getLogger(StoreController.class);

    private final StoreService storeService;

    public StoreController(StoreService storeService) {
        this.storeService = storeService;
    }

    /**
     * Search and discover nearby stores with optional filters.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<StoreResponse>>> getStores(
            @RequestParam(value = "city", required = false) String city,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "query", required = false) String query,
            @RequestParam(value = "availableOnly", required = false, defaultValue = "false") Boolean availableOnly) {

        log.info("[API-CALL] GET /api/stores - city='{}', category='{}', query='{}', availableOnly={}",
                city, category, query, availableOnly);

        List<StoreResponse> stores = storeService.getStores(city, category, query, availableOnly);
        return ResponseEntity.ok(ApiResponse.success(stores, "Stores retrieved successfully"));
    }

    /**
     * Get single store storefront details by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StoreResponse>> getStoreById(@PathVariable("id") Long id) {
        log.info("[API-CALL] GET /api/stores/{} - Fetching store details", id);
        StoreResponse response = storeService.getStoreById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Store details retrieved successfully"));
    }

    /**
     * Get all stores owned by a specific user.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<StoreResponse>>> getStoresByUserId(@PathVariable("userId") Long userId) {
        log.info("[API-CALL] GET /api/stores/user/{} - Fetching owner stores", userId);
        List<StoreResponse> stores = storeService.getStoresByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(stores, "User stores retrieved successfully"));
    }

    /**
     * Create and publish a new digital skill storefront.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<StoreResponse>> createStore(@Valid @RequestBody StoreCreateRequest request) {
        log.info("[API-CALL] POST /api/stores - Creating store: '{}' for user: {}",
                request.storeName(), request.userId());

        StoreResponse response = storeService.createStore(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Store created successfully"));
    }

    /**
     * Update an existing store storefront.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StoreResponse>> updateStore(
            @PathVariable("id") Long id,
            @RequestBody StoreUpdateRequest request) {
        log.info("[API-CALL] PUT /api/stores/{} - Updating store", id);
        StoreResponse response = storeService.updateStore(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Store updated successfully"));
    }

    /**
     * Delete a store storefront.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteStore(@PathVariable("id") Long id) {
        log.info("[API-CALL] DELETE /api/stores/{} - Deleting store", id);
        storeService.deleteStore(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Store deleted successfully"));
    }

    /**
     * Toggle store availability between "Open for Gigs" and "Paused".
     */
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<StoreResponse>> toggleStoreAvailability(@PathVariable("id") Long id) {
        log.info("[API-CALL] PATCH /api/stores/{}/toggle-status - Toggling store availability", id);
        StoreResponse response = storeService.toggleStoreAvailability(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Store availability updated successfully"));
    }

    /**
     * Record a view event on a store storefront (increments daily, weekly, monthly, lifetime counters).
     */
    @PostMapping("/{id}/views")
    public ResponseEntity<ApiResponse<StoreResponse>> recordStoreView(
            @PathVariable("id") Long id,
            @RequestParam(value = "viewerId", required = false) String viewerId) {
        log.info("[API-CALL] POST /api/stores/{}/views - Recording view from viewer: '{}'", id, viewerId);
        StoreResponse response = storeService.recordStoreView(id, viewerId);
        return ResponseEntity.ok(ApiResponse.success(response, "Store view recorded successfully"));
    }
}
