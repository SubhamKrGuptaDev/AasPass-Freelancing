package com.aaspass.admin.controller;

import com.aaspass.admin.dto.ActivityPeriod;
import com.aaspass.admin.dto.AdminChartsResponse;
import com.aaspass.admin.service.AdminChartService;
import com.aaspass.dto.response.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Time-bucketed statistics for the admin Charts screen. Protected by the admin security chain. */
@RestController
@RequestMapping("/api/admin/charts")
public class AdminChartController {

    private static final Logger log = LoggerFactory.getLogger(AdminChartController.class);

    private final AdminChartService chartService;

    public AdminChartController(AdminChartService chartService) {
        this.chartService = chartService;
    }

    /** {@code period} = daily (default, last 30 days), weekly (last 12 weeks) or monthly (last 12 months). */
    @GetMapping
    public ResponseEntity<ApiResponse<AdminChartsResponse>> get(
            @RequestParam(required = false) String period,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String city) {
        log.info("[API-CALL] GET /api/admin/charts period={} country={} city={}", period, country, city);
        return ResponseEntity.ok(ApiResponse.success(
                chartService.charts(ActivityPeriod.fromParam(period), country, city), "Charts retrieved successfully"));
    }
}
