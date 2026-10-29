package com.aaspass.admin.controller;

import com.aaspass.admin.dto.AdminUserDetail;
import com.aaspass.admin.dto.AdminUserSummary;
import com.aaspass.admin.dto.PageResponse;
import com.aaspass.admin.dto.SuspendUserRequest;
import com.aaspass.admin.dto.VerificationDecisionRequest;
import com.aaspass.admin.dto.VerificationItem;
import com.aaspass.admin.security.CurrentAdmin;
import com.aaspass.admin.service.AdminUserService;
import com.aaspass.dto.response.ApiResponse;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

/** Admin user search, KYC verification and suspension. Protected by the admin security chain. */
@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private static final Logger log = LoggerFactory.getLogger(AdminUserController.class);

    private final AdminUserService userService;
    private final CurrentAdmin currentAdmin;

    public AdminUserController(AdminUserService userService, CurrentAdmin currentAdmin) {
        this.userService = userService;
        this.currentAdmin = currentAdmin;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AdminUserSummary>>> search(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "all") String verification,
            @RequestParam(required = false) Boolean suspended,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("[API-CALL] GET /api/admin/users - verification={}", verification);
        return ResponseEntity.ok(ApiResponse.success(
                userService.search(q, verification, suspended, page, size), "Users retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminUserDetail>> get(@PathVariable Long id) {
        log.info("[API-CALL] GET /api/admin/users/{}", id);
        return ResponseEntity.ok(ApiResponse.success(
                userService.get(id, currentAdmin.requireAdminId()), "User retrieved successfully"));
    }

    @PostMapping("/{id}/suspension")
    public ResponseEntity<ApiResponse<AdminUserDetail>> suspend(@PathVariable Long id,
                                                                @Valid @RequestBody SuspendUserRequest request) {
        log.info("[API-CALL] POST /api/admin/users/{}/suspension", id);
        return ResponseEntity.ok(ApiResponse.success(
                userService.suspend(id, request, currentAdmin.requireAdminId()), "User suspended"));
    }

    @DeleteMapping("/{id}/suspension")
    public ResponseEntity<ApiResponse<AdminUserDetail>> liftSuspension(@PathVariable Long id) {
        log.info("[API-CALL] DELETE /api/admin/users/{}/suspension", id);
        return ResponseEntity.ok(ApiResponse.success(
                userService.liftSuspension(id, currentAdmin.requireAdminId()), "Suspension lifted"));
    }

    @PutMapping("/{id}/verification/{item}")
    public ResponseEntity<ApiResponse<AdminUserDetail>> decide(@PathVariable Long id, @PathVariable String item,
                                                               @Valid @RequestBody VerificationDecisionRequest request) {
        log.info("[API-CALL] PUT /api/admin/users/{}/verification/{}", id, item);
        VerificationItem parsed = VerificationItem.fromPath(item);
        return ResponseEntity.ok(ApiResponse.success(
                userService.decide(id, parsed, request, currentAdmin.requireAdminId()), "Verification updated"));
    }
}
