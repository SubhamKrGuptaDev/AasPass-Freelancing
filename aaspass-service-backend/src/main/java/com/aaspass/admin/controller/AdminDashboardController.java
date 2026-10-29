package com.aaspass.admin.controller;

import com.aaspass.admin.dto.ActivityPeriod;
import com.aaspass.admin.dto.DashboardResponse;
import com.aaspass.admin.dto.NewActivityResponse;
import com.aaspass.admin.service.AdminDashboardService;
import com.aaspass.dto.response.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Admin dashboard summary. Protected by the admin security chain. */
@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    private static final Logger log = LoggerFactory.getLogger(AdminDashboardController.class);

    private final AdminDashboardService dashboardService;

    public AdminDashboardController(AdminDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardResponse>> get() {
        log.info("[API-CALL] GET /api/admin/dashboard");
        return ResponseEntity.ok(ApiResponse.success(dashboardService.summary(), "Dashboard retrieved successfully"));
    }

    /** New users and stores for {@code period} = daily (default), weekly or monthly. */
    @GetMapping("/new-activity")
    public ResponseEntity<ApiResponse<NewActivityResponse>> newActivity(
            @RequestParam(required = false) String period) {
        log.info("[API-CALL] GET /api/admin/dashboard/new-activity period={}", period);
        return ResponseEntity.ok(ApiResponse.success(
                dashboardService.newActivity(ActivityPeriod.fromParam(period)), "New activity retrieved successfully"));
    }
}
