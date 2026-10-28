package com.aaspass.controller;

import com.aaspass.config.security.CurrentUser;
import com.aaspass.dto.request.LoginRequest;
import com.aaspass.dto.request.RegisterRequest;
import com.aaspass.dto.response.ApiResponse;
import com.aaspass.dto.response.AuthResponse;
import com.aaspass.dto.response.AvailabilityResponse;
import com.aaspass.dto.response.UserResponse;
import com.aaspass.exception.UnauthorizedException;
import com.aaspass.security.session.IssuedSession;
import com.aaspass.security.session.SessionRevokeReason;
import com.aaspass.security.session.SessionService;
import com.aaspass.security.token.AuthCookieService;
import com.aaspass.service.AuthService;
import com.aaspass.service.AuthService.AuthResult;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller handling login, registration, token refresh, logout and the current-user lookup.
 * Tokens travel only as HttpOnly cookies ({@code _sid} access JWT, {@code _rid} refresh token),
 * written and cleared exclusively through {@link AuthCookieService}. Tokens are never logged.
 * <p>
 * Refresh and logout are deliberately not transactional, so a reuse-detected revocation inside
 * {@link SessionService#rotate(String)} commits even though it ends in an exception.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;
    private final SessionService sessionService;
    private final AuthCookieService authCookieService;
    private final CurrentUser currentUser;

    public AuthController(AuthService authService, SessionService sessionService,
                          AuthCookieService authCookieService, CurrentUser currentUser) {
        this.authService = authService;
        this.sessionService = sessionService;
        this.authCookieService = authCookieService;
        this.currentUser = currentUser;
    }

    /**
     * Login API endpoint. Authenticates by username or email and password, opens a new session
     * and sets the {@code _sid}/{@code _rid} cookies.
     *
     * @param request Login credentials (username/email and password)
     * @return Standardized ApiResponse wrapping AuthResponse (no tokens in the body)
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request,
                                                           HttpServletRequest httpRequest,
                                                           HttpServletResponse httpResponse) {
        log.info("[API-CALL] POST /api/auth/login - Received login request");

        AuthResult result = authService.login(request, userAgent(httpRequest), httpRequest.getRemoteAddr());
        authCookieService.writeSession(httpRequest, httpResponse, result.session());

        log.info("[API-CALL] POST /api/auth/login - Completed successfully for user ID: {}",
                result.user() != null ? result.user().id() : null);

        return ResponseEntity.ok(ApiResponse.success(toAuthResponse(result, "Login successful"), "Login successful"));
    }

    /**
     * Account Registration API endpoint. Registers a new user account and logs it in.
     *
     * @param request Registration details
     * @return Standardized ApiResponse wrapping AuthResponse with 201 Created
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request,
                                                              HttpServletRequest httpRequest,
                                                              HttpServletResponse httpResponse) {
        log.info("[API-CALL] POST /api/auth/register - Received registration request");

        AuthResult result = authService.register(request, userAgent(httpRequest), httpRequest.getRemoteAddr());
        authCookieService.writeSession(httpRequest, httpResponse, result.session());

        log.info("[API-CALL] POST /api/auth/register - User registered successfully with ID: {}",
                result.user() != null ? result.user().id() : null);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(toAuthResponse(result, "Registration successful"),
                        "Account registered successfully"));
    }

    /**
     * Username availability API endpoint used by the signup form before submitting.
     *
     * @param username candidate username
     * @return Standardized ApiResponse wrapping AvailabilityResponse; 400 when the username is blank
     */
    @GetMapping("/check-username")
    public ResponseEntity<ApiResponse<AvailabilityResponse>> checkUsername(
            @RequestParam(name = "username", required = false) String username) {
        log.info("[API-CALL] GET /api/auth/check-username - Received availability check");
        boolean available = authService.isUsernameAvailable(username);
        return ResponseEntity.ok(ApiResponse.success(new AvailabilityResponse(available),
                available ? "Username is available" : "Username is already in use"));
    }

    /**
     * Email availability API endpoint used by the signup form before submitting.
     *
     * @param email candidate email
     * @return Standardized ApiResponse wrapping AvailabilityResponse; 400 when the email is blank
     */
    @GetMapping("/check-email")
    public ResponseEntity<ApiResponse<AvailabilityResponse>> checkEmail(
            @RequestParam(name = "email", required = false) String email) {
        log.info("[API-CALL] GET /api/auth/check-email - Received availability check");
        boolean available = authService.isEmailAvailable(email);
        return ResponseEntity.ok(ApiResponse.success(new AvailabilityResponse(available),
                available ? "Email is available" : "Email is already registered"));
    }

    /**
     * Refresh API endpoint. Rotates the refresh token from the {@code _rid} cookie and issues new
     * {@code _sid}/{@code _rid} cookies. On any failure both cookies are cleared before the 401.
     *
     * @param refreshToken value of the {@code _rid} cookie, if sent
     * @return the session's user profile
     */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<UserResponse>> refresh(
            @CookieValue(name = AuthCookieService.REFRESH_COOKIE, required = false) String refreshToken,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        IssuedSession issued;
        Long userId;
        UserResponse user;
        try {
            issued = sessionService.rotate(refreshToken);
            userId = issued.session().getUser() != null ? issued.session().getUser().getId() : null;
            user = authService.getUser(userId);
        } catch (RuntimeException e) {
            // Any failure after reading _rid (rotation or user lookup) leaves the client's cookies
            // unusable, so clear both rather than let it replay a now-previous refresh token.
            if (e instanceof UnauthorizedException unauthorized) {
                log.info("[API-CALL] POST /api/auth/refresh - Refresh rejected ({}); clearing auth cookies",
                        unauthorized.code());
            } else {
                log.warn("[API-CALL] POST /api/auth/refresh - Refresh failed ({}); clearing auth cookies",
                        e.getClass().getSimpleName());
            }
            authCookieService.clearSession(httpRequest, httpResponse);
            throw e;
        }

        // Only write new cookies once everything succeeded.
        authCookieService.writeSession(httpRequest, httpResponse, issued);

        log.info("[API-CALL] POST /api/auth/refresh - Rotated session {} for user ID: {}",
                issued.session().getSessionId(), userId);
        return ResponseEntity.ok(ApiResponse.success(user, "Session refreshed"));
    }

    /**
     * Logout API endpoint. Revokes the session identified by the {@code _rid} cookie (the access
     * cookie is deliberately not read) and always clears both auth cookies.
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @CookieValue(name = AuthCookieService.REFRESH_COOKIE, required = false) String refreshToken,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        try {
            if (refreshToken != null && !refreshToken.isBlank()) {
                sessionService.revokeByRefreshToken(refreshToken, SessionRevokeReason.LOGOUT);
            }
        } finally {
            authCookieService.clearSession(httpRequest, httpResponse);
        }
        log.info("[API-CALL] POST /api/auth/logout - User logged out");
        return ResponseEntity.ok(ApiResponse.success(null, "Logged out successfully"));
    }

    /**
     * Get Current Authenticated User API endpoint.
     *
     * @return the profile of the user identified by the access token
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {
        Long userId = currentUser.requireUserId();
        log.info("[API-CALL] GET /api/auth/me - Fetching profile for user ID: {}", userId);
        UserResponse userResponse = authService.getUser(userId);
        return ResponseEntity.ok(ApiResponse.success(userResponse, "Current user retrieved successfully"));
    }

    private static AuthResponse toAuthResponse(AuthResult result, String message) {
        return AuthResponse.builder()
                .success(true)
                .message(message)
                .user(result.user())
                .build();
    }

    private static String userAgent(HttpServletRequest request) {
        return request.getHeader(HttpHeaders.USER_AGENT);
    }
}
