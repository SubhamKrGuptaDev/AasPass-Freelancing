package com.aaspass.controller;

import com.aaspass.dto.request.ContactRequestCreate;
import com.aaspass.dto.response.ApiResponse;
import com.aaspass.dto.response.ContactRequestResponse;
import com.aaspass.service.ContactRequestService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Public endpoint for contact, feedback and complaint submissions. */
@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private static final Logger log = LoggerFactory.getLogger(ContactController.class);

    private final ContactRequestService service;

    public ContactController(ContactRequestService service) {
        this.service = service;
    }

    /** Submit a query, feedback or complaint (anonymous or logged in). */
    @PostMapping
    public ResponseEntity<ApiResponse<ContactRequestResponse>> submit(
            @Valid @RequestBody ContactRequestCreate request, HttpServletRequest httpRequest) {
        log.info("[API-CALL] POST /api/contact - type={}", request.type());
        ContactRequestResponse response = service.create(request, httpRequest.getRemoteAddr());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Request submitted"));
    }
}
