package com.aaspass.admin.controller;

import com.aaspass.admin.dto.AdminLoginRequest;
import com.aaspass.admin.dto.AdminProfile;
import com.aaspass.admin.security.AdminCookieService;
import com.aaspass.admin.security.AdminIssuedSession;
import com.aaspass.admin.security.AdminSessionService;
import com.aaspass.admin.security.CurrentAdmin;
import com.aaspass.admin.service.AdminAuthService;
import com.aaspass.admin.service.AdminAuthService.AdminAuthResult;
import com.aaspass.dto.response.ApiResponse;
import com.aaspass.exception.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Admin login, token refresh, logout and current-admin lookup. Mirrors the user {@code AuthController}:
 * tokens travel only as HttpOnly cookies ({@code _asid}/{@code _arid}) written and cleared through
 * {@link AdminCookieService}; login rotates the {@code XSRF-TOKEN}, logout expires it; any refresh
 * failure clears both admin cookies. Tokens are never logged.
 * <p>
 * Refresh and logout are deliberately not transactional, so a reuse-detected revocation inside
 * {@link AdminSessionService#rotate(String)} commits even though it ends in an exception.
 */
@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    private static final Logger log = LoggerFactory.getLogger(AdminAuthController.class);

    private final AdminAuthService authService;
    private final AdminSessionService sessionService;
    private final AdminCookieService cookieService;
    private final CurrentAdmin currentAdmin;
    private final CsrfTokenRepository csrfTokenRepository;

    public AdminAuthController(AdminAuthService authService, AdminSessionService sessionService,
                               AdminCookieService cookieService, CurrentAdmin currentAdmin,
                               CsrfTokenRepository csrfTokenRepository) {
        this.authService = authService;
        this.sessionService = sessionService;
        this.cookieService = cookieService;
        this.currentAdmin = currentAdmin;
        this.csrfTokenRepository = csrfTokenRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AdminProfile>> login(@Valid @RequestBody AdminLoginRequest request,
                                                           HttpServletRequest httpRequest,
                                                           HttpServletResponse httpResponse) {
        log.info("[API-CALL] POST /api/admin/auth/login - Received admin login request");
        AdminAuthResult result = authService.login(request, userAgent(httpRequest), httpRequest.getRemoteAddr());
        cookieService.writeSession(httpRequest, httpResponse, result.session());
        rotateCsrfToken(httpRequest, httpResponse);
        log.info("[API-CALL] POST /api/admin/auth/login - Completed for admin ID: {}",
                result.profile() != null ? result.profile().id() : null);
        return ResponseEntity.ok(ApiResponse.success(result.profile(), "Login successful"));
    }

    /** Rotates the {@code _arid} refresh token; on any failure both admin cookies are cleared before the 401. */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AdminProfile>> refresh(
            @CookieValue(name = AdminCookieService.REFRESH_COOKIE, required = false) String refreshToken,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        AdminIssuedSession issued;
        AdminProfile profile;
        try {
            issued = sessionService.rotate(refreshToken);
            Long adminId = issued.session().getAdmin() != null ? issued.session().getAdmin().getId() : null;
            profile = authService.getProfile(adminId);
        } catch (RuntimeException e) {
            if (e instanceof UnauthorizedException unauthorized) {
                log.info("[API-CALL] POST /api/admin/auth/refresh - Refresh rejected ({}); clearing admin cookies",
                        unauthorized.code());
            } else {
                log.warn("[API-CALL] POST /api/admin/auth/refresh - Refresh failed ({}); clearing admin cookies",
                        e.getClass().getSimpleName());
            }
            cookieService.clearSession(httpRequest, httpResponse);
            throw e;
        }

        cookieService.writeSession(httpRequest, httpResponse, issued);
        log.info("[API-CALL] POST /api/admin/auth/refresh - Rotated admin session {} for admin ID: {}",
                issued.session().getSessionId(), profile.id());
        return ResponseEntity.ok(ApiResponse.success(profile, "Session refreshed"));
    }

    /** Revokes the session of the {@code _arid} cookie and always clears the admin cookies and the CSRF cookie. */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @CookieValue(name = AdminCookieService.REFRESH_COOKIE, required = false) String refreshToken,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        try {
            sessionService.revokeByRefreshToken(refreshToken);
        } finally {
            cookieService.clearSession(httpRequest, httpResponse);
            // A null token makes the repository write an expired XSRF-TOKEN; the next request issues a new one.
            csrfTokenRepository.saveToken(null, httpRequest, httpResponse);
        }
        log.info("[API-CALL] POST /api/admin/auth/logout - Admin logged out");
        return ResponseEntity.ok(ApiResponse.success(null, "Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AdminProfile>> me() {
        Long adminId = currentAdmin.requireAdminId();
        log.info("[API-CALL] GET /api/admin/auth/me - Fetching profile for admin ID: {}", adminId);
        return ResponseEntity.ok(ApiResponse.success(authService.getProfile(adminId), "Current admin retrieved"));
    }

    /** Replaces the pre-login CSRF token so a token seen before sign-in is not reused by the session. */
    private void rotateCsrfToken(HttpServletRequest request, HttpServletResponse response) {
        csrfTokenRepository.saveToken(csrfTokenRepository.generateToken(request), request, response);
    }

    private static String userAgent(HttpServletRequest request) {
        return request.getHeader(HttpHeaders.USER_AGENT);
    }
}
