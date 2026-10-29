package com.aaspass.admin.controller;

import com.aaspass.admin.dto.AdminStoreDetail;
import com.aaspass.admin.dto.AdminStoreSummary;
import com.aaspass.admin.dto.BlockStoreRequest;
import com.aaspass.admin.dto.PageResponse;
import com.aaspass.admin.security.CurrentAdmin;
import com.aaspass.admin.service.AdminStoreService;
import com.aaspass.dto.response.ApiResponse;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Admin store search and moderation. Protected by the admin security chain. */
@RestController
@RequestMapping("/api/admin/stores")
public class AdminStoreController {

    private static final Logger log = LoggerFactory.getLogger(AdminStoreController.class);

    private final AdminStoreService storeService;
    private final CurrentAdmin currentAdmin;

    public AdminStoreController(AdminStoreService storeService, CurrentAdmin currentAdmin) {
        this.storeService = storeService;
        this.currentAdmin = currentAdmin;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AdminStoreSummary>>> search(
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String name,
            @RequestParam(defaultValue = "all") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("[API-CALL] GET /api/admin/stores - status={}", status);
        return ResponseEntity.ok(ApiResponse.success(
                storeService.search(country, city, name, status, page, size), "Stores retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminStoreDetail>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(storeService.get(id), "Store retrieved successfully"));
    }

    @PatchMapping("/{id}/block")
    public ResponseEntity<ApiResponse<AdminStoreDetail>> block(@PathVariable Long id,
                                                               @Valid @RequestBody BlockStoreRequest request) {
        log.info("[API-CALL] PATCH /api/admin/stores/{}/block", id);
        return ResponseEntity.ok(ApiResponse.success(
                storeService.block(id, request.reason(), currentAdmin.requireAdminId()), "Store blocked"));
    }

    @PatchMapping("/{id}/unblock")
    public ResponseEntity<ApiResponse<AdminStoreDetail>> unblock(@PathVariable Long id) {
        log.info("[API-CALL] PATCH /api/admin/stores/{}/unblock", id);
        return ResponseEntity.ok(ApiResponse.success(
                storeService.unblock(id, currentAdmin.requireAdminId()), "Store unblocked"));
    }

    @PatchMapping("/{id}/review")
    public ResponseEntity<ApiResponse<AdminStoreDetail>> review(@PathVariable Long id) {
        log.info("[API-CALL] PATCH /api/admin/stores/{}/review", id);
        return ResponseEntity.ok(ApiResponse.success(
                storeService.review(id, currentAdmin.requireAdminId()), "Store marked as reviewed"));
    }
}
