package com.aaspass.admin.controller;

import com.aaspass.admin.dto.AdminContactRequestDetail;
import com.aaspass.admin.dto.AdminContactRequestSummary;
import com.aaspass.admin.dto.ContactRequestUpdate;
import com.aaspass.admin.dto.PageResponse;
import com.aaspass.admin.security.CurrentAdmin;
import com.aaspass.admin.service.AdminContactRequestService;
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

/** Admin inbox for contact requests. Protected by the admin security chain. */
@RestController
@RequestMapping("/api/admin/contact-requests")
public class AdminContactRequestController {

    private static final Logger log = LoggerFactory.getLogger(AdminContactRequestController.class);

    private final AdminContactRequestService service;
    private final CurrentAdmin currentAdmin;

    public AdminContactRequestController(AdminContactRequestService service, CurrentAdmin currentAdmin) {
        this.service = service;
        this.currentAdmin = currentAdmin;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AdminContactRequestSummary>>> search(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "all") String status,
            @RequestParam(defaultValue = "all") String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("[API-CALL] GET /api/admin/contact-requests - status={} type={}", status, type);
        return ResponseEntity.ok(ApiResponse.success(
                service.search(q, status, type, page, size), "Contact requests retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminContactRequestDetail>> get(@PathVariable Long id) {
        log.info("[API-CALL] GET /api/admin/contact-requests/{}", id);
        return ResponseEntity.ok(ApiResponse.success(service.get(id), "Contact request retrieved successfully"));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminContactRequestDetail>> update(
            @PathVariable Long id, @Valid @RequestBody ContactRequestUpdate request) {
        log.info("[API-CALL] PATCH /api/admin/contact-requests/{}", id);
        return ResponseEntity.ok(ApiResponse.success(
                service.update(id, request, currentAdmin.requireAdminId()), "Contact request updated"));
    }
}
