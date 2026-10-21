package com.aaspass.controller;

import com.aaspass.dto.request.LoginRequest;
import com.aaspass.dto.request.RegisterRequest;
import com.aaspass.dto.response.ApiResponse;
import com.aaspass.dto.response.AuthResponse;
import com.aaspass.dto.response.UserResponse;
import com.aaspass.service.AuthService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller handling user authentication, login validation, session validation, and registration.
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200"})
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Basic Login API endpoint.
     * Authenticates a user using username or email and password.
     *
     * @param request Login credentials (username/email and password)
     * @return Standardized ApiResponse wrapping AuthResponse
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        log.info("[API-CALL] POST /api/auth/login - Received login request for identifier: '{}'",
                request.usernameOrEmail());

        AuthResponse authResponse = authService.login(request);

        log.info("[API-CALL] POST /api/auth/login - Completed successfully for user ID: {}",
                authResponse.user() != null ? authResponse.user().id() : null);

        return ResponseEntity.ok(ApiResponse.success(authResponse, "Login successful"));
    }

    /**
     * Account Registration API endpoint.
     * Registers a new user account.
     *
     * @param request Registration details
     * @return Standardized ApiResponse wrapping AuthResponse with 201 Created
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        log.info("[API-CALL] POST /api/auth/register - Received registration request for username: '{}', email: '{}'",
                request.username(), request.email());

        AuthResponse authResponse = authService.register(request);

        log.info("[API-CALL] POST /api/auth/register - User registered successfully with ID: {}",
                authResponse.user() != null ? authResponse.user().id() : null);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(authResponse, "Account registered successfully"));
    }

    /**
     * Get Current Authenticated User API endpoint.
     *
     * @param userId User ID parameter or token context
     * @return Current User profile
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(@RequestParam("userId") Long userId) {
        log.info("[API-CALL] GET /api/auth/me - Fetching profile for user ID: {}", userId);
        UserResponse userResponse = authService.getCurrentUser(userId);
        return ResponseEntity.ok(ApiResponse.success(userResponse, "Current user retrieved successfully"));
    }

    /**
     * Logout API endpoint.
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        log.info("[API-CALL] POST /api/auth/logout - User logged out");
        return ResponseEntity.ok(ApiResponse.success(null, "Logged out successfully"));
    }
}
