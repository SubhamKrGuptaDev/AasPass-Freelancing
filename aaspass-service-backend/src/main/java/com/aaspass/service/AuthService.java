package com.aaspass.service;

import com.aaspass.dto.request.LoginRequest;
import com.aaspass.dto.request.RegisterRequest;
import com.aaspass.dto.response.UserResponse;
import com.aaspass.entity.User;
import com.aaspass.exception.DuplicateResourceException;
import com.aaspass.exception.ErrorCode;
import com.aaspass.exception.ResourceNotFoundException;
import com.aaspass.exception.UnauthorizedException;
import com.aaspass.repository.UserRepository;
import com.aaspass.security.session.IssuedSession;
import com.aaspass.security.session.SessionService;
import com.aaspass.service.mapper.DtoMapper;
import com.aaspass.util.AvatarGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Service managing user authentication, login validation, login sessions, and account registration.
 * Login and registration open a new {@link SessionService} session; the caller turns the returned
 * {@link IssuedSession} into auth cookies.
 */
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final SessionService sessionService;

    /** Valid BCrypt hash compared against for unknown users so response time does not reveal existence. */
    private final String dummyHash;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       SessionService sessionService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.sessionService = sessionService;
        this.dummyHash = passwordEncoder.encode("aaspass-timing-equaliser");
    }

    /** Result of a successful login/registration: the user profile and the freshly opened session. */
    public record AuthResult(UserResponse user, IssuedSession session) {
    }

    /**
     * Authenticates a user by username or email, validates their password and opens a new session.
     *
     * @param request   Login credentials (username/email and password)
     * @param userAgent client User-Agent recorded on the session (may be null)
     * @param ip        client IP recorded on the session (may be null)
     * @return the authenticated user profile and the issued session
     */
    @Transactional
    public AuthResult login(LoginRequest request, String userAgent, String ip) {
        String identifier = request.usernameOrEmail() != null ? request.usernameOrEmail().trim() : "";
        log.info("[AUTH LOGIN ATTEMPT] Identifying user by: '{}'", identifier);

        User user = userRepository.findByUsernameOrEmail(identifier).orElse(null);
        String rawPassword = request.password() != null ? request.password() : "";

        if (user == null) {
            // Dummy compare keeps timing similar to the wrong-password path.
            passwordEncoder.matches(rawPassword, dummyHash);
            log.warn("[AUTH LOGIN FAILED] No user found matching identifier: '{}'", identifier);
            throw new UnauthorizedException("Invalid username or password", ErrorCode.INVALID_CREDENTIALS);
        }

        if (user.getPassword() == null || !passwordEncoder.matches(rawPassword, user.getPassword())) {
            log.warn("[AUTH LOGIN FAILED] Password mismatch for user ID: {} (username: '{}')", user.getId(), user.getUsername());
            throw new UnauthorizedException("Invalid username or password", ErrorCode.INVALID_CREDENTIALS);
        }

        IssuedSession session = sessionService.open(user, userAgent, ip);
        log.info("[AUTH LOGIN SUCCESS] User authenticated successfully: ID={}, session={}",
                user.getId(), session.session().getSessionId());

        return new AuthResult(DtoMapper.toUserResponse(user, true, true, true), session);
    }

    /**
     * Registers a new user account and logs it in (opens a new session).
     *
     * @param request   Registration details
     * @param userAgent client User-Agent recorded on the session (may be null)
     * @param ip        client IP recorded on the session (may be null)
     * @return the newly created user profile and the issued session
     */
    @Transactional
    public AuthResult register(RegisterRequest request, String userAgent, String ip) {
        log.info("[AUTH REGISTER ATTEMPT] Registering username='{}', email='{}'",
                request.username(), request.email());

        if (userRepository.existsByUsername(request.username())) {
            log.warn("[AUTH REGISTER FAILED] Username '{}' is already taken", request.username());
            throw new DuplicateResourceException("Username '" + request.username() + "' is already in use");
        }

        if (userRepository.existsByEmail(request.email())) {
            log.warn("[AUTH REGISTER FAILED] Email '{}' is already registered", request.email());
            throw new DuplicateResourceException("Email '" + request.email() + "' is already registered");
        }

        String memberSince = LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMMM yyyy"));
        String avatarUrl = AvatarGenerator.getOrDefault(request.avatarUrl(), request.username());

        User newUser = User.builder()
                .name(request.name().trim())
                .username(request.username().trim().toLowerCase())
                .email(request.email().trim().toLowerCase())
                .password(passwordEncoder.encode(request.password()))
                .phone(request.phone())
                .city(request.city() != null ? request.city() : "Bengaluru")
                .area(request.area() != null ? request.area() : "Indiranagar")
                .country(request.country() != null && !request.country().isBlank() ? request.country().trim() : "India")
                .bio(request.bio())
                .avatarUrl(avatarUrl)
                .memberSince(memberSince)
                .hasStore(false)
                .build();

        User savedUser = userRepository.save(newUser);
        log.info("[AUTH REGISTER SUCCESS] Created new user: ID={}, username='{}'", savedUser.getId(), savedUser.getUsername());

        IssuedSession session = sessionService.open(savedUser, userAgent, ip);
        return new AuthResult(DtoMapper.toUserResponse(savedUser, true, true, true), session);
    }

    /**
     * Retrieves a user's own profile (KYC masked) by id, e.g. for {@code GET /api/auth/me}.
     */
    @Transactional(readOnly = true)
    public UserResponse getUser(Long userId) {
        if (userId == null) {
            throw new UnauthorizedException("Authentication required", ErrorCode.UNAUTHENTICATED);
        }
        log.info("[AUTH GET CURRENT USER] Fetching user profile for ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return DtoMapper.toUserResponse(user, true, true, true);
    }
}
