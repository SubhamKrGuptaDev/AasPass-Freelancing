package com.aaspass.controller.booking;

import com.aaspass.config.security.CurrentUser;
import com.aaspass.dto.booking.FunnelEventRequest;
import com.aaspass.service.booking.FunnelService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/** Anonymous-friendly booking funnel tracking. */
@RestController
public class FunnelController {

    private static final Logger log = LoggerFactory.getLogger(FunnelController.class);

    private final FunnelService funnelService;
    private final CurrentUser currentUser;

    public FunnelController(FunnelService funnelService, CurrentUser currentUser) {
        this.funnelService = funnelService;
        this.currentUser = currentUser;
    }

    @PostMapping("/api/stores/{storeId}/funnel-events")
    public ResponseEntity<Void> record(@PathVariable Long storeId, @Valid @RequestBody FunnelEventRequest body,
                                       HttpServletRequest request) {
        log.info("[API-CALL] POST /api/stores/{}/funnel-events step={}", storeId, body.step());
        funnelService.record(storeId, body, currentUser.optionalUserId(), request.getRemoteAddr());
        return ResponseEntity.noContent().build();
    }
}
