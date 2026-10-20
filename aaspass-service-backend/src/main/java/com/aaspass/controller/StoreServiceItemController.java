package com.aaspass.controller;

import com.aaspass.dto.request.ServiceItemRequest;
import com.aaspass.dto.response.ApiResponse;
import com.aaspass.dto.response.ServiceItemResponse;
import com.aaspass.service.StoreServiceItemService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller managing store service packages (e.g. "30-sec Instagram Reel", "Full YouTube Video Edit").
 */
@RestController
@RequestMapping("/api/stores/{storeId}/services")
@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200"})
public class StoreServiceItemController {

    private static final Logger log = LoggerFactory.getLogger(StoreServiceItemController.class);

    private final StoreServiceItemService serviceItemService;

    public StoreServiceItemController(StoreServiceItemService serviceItemService) {
        this.serviceItemService = serviceItemService;
    }

    /**
     * Get all service packages offered by a store.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ServiceItemResponse>>> getServices(@PathVariable("storeId") Long storeId) {
        log.info("[API-CALL] GET /api/stores/{}/services - Listing service packages", storeId);
        List<ServiceItemResponse> services = serviceItemService.getServicesByStoreId(storeId);
        return ResponseEntity.ok(ApiResponse.success(services, "Services retrieved successfully"));
    }

    /**
     * Add a new service package to a store.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ServiceItemResponse>> addService(
            @PathVariable("storeId") Long storeId,
            @Valid @RequestBody ServiceItemRequest request) {
        log.info("[API-CALL] POST /api/stores/{}/services - Adding service: '{}', price: {}",
                storeId, request.getName(), request.getPrice());
        ServiceItemResponse response = serviceItemService.addService(storeId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Service package added successfully"));
    }

    /**
     * Update an existing service package.
     */
    @PutMapping("/{serviceId}")
    public ResponseEntity<ApiResponse<ServiceItemResponse>> updateService(
            @PathVariable("storeId") Long storeId,
            @PathVariable("serviceId") Long serviceId,
            @Valid @RequestBody ServiceItemRequest request) {
        log.info("[API-CALL] PUT /api/stores/{}/services/{} - Updating service", storeId, serviceId);
        ServiceItemResponse response = serviceItemService.updateService(storeId, serviceId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Service package updated successfully"));
    }

    /**
     * Delete a service package.
     */
    @DeleteMapping("/{serviceId}")
    public ResponseEntity<ApiResponse<Void>> deleteService(
            @PathVariable("storeId") Long storeId,
            @PathVariable("serviceId") Long serviceId) {
        log.info("[API-CALL] DELETE /api/stores/{}/services/{} - Deleting service", storeId, serviceId);
        serviceItemService.deleteService(storeId, serviceId);
        return ResponseEntity.ok(ApiResponse.success(null, "Service package deleted successfully"));
    }
}
