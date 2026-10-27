package com.aaspass.service;

import com.aaspass.dto.request.LoginRequest;
import com.aaspass.dto.request.RegisterRequest;
import com.aaspass.dto.response.AuthResponse;
import com.aaspass.dto.response.UserResponse;
import com.aaspass.entity.User;
import com.aaspass.exception.DuplicateResourceException;
import com.aaspass.exception.ResourceNotFoundException;
import com.aaspass.exception.UnauthorizedException;
import com.aaspass.repository.UserRepository;
import com.aaspass.service.mapper.DtoMapper;
import com.aaspass.util.AvatarGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * Service managing user authentication, login validation, session tokens, and account registration.
 */
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    /** Valid BCrypt hash compared against for unknown users so response time does not reveal existence. */
    private final String dummyHash;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.dummyHash = passwordEncoder.encode("aaspass-timing-equaliser");
    }

    /**
     * Authenticates a user by username or email and validates their password.
     *
     * @param request Login credentials (username/email and password)
     * @return AuthResponse with session token and authenticated user profile
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String identifier = request.usernameOrEmail() != null ? request.usernameOrEmail().trim() : "";
        log.info("[AUTH LOGIN ATTEMPT] Identifying user by: '{}'", identifier);

        User user = userRepository.findByUsernameOrEmail(identifier).orElse(null);
        String rawPassword = request.password() != null ? request.password() : "";

        if (user == null) {
            // Dummy compare keeps timing similar to the wrong-password path.
            passwordEncoder.matches(rawPassword, dummyHash);
            log.warn("[AUTH LOGIN FAILED] No user found matching identifier: '{}'", identifier);
            throw new UnauthorizedException("Invalid username or password");
        }

        if (user.getPassword() == null || !passwordEncoder.matches(rawPassword, user.getPassword())) {
            log.warn("[AUTH LOGIN FAILED] Password mismatch for user ID: {} (username: '{}')", user.getId(), user.getUsername());
            throw new UnauthorizedException("Invalid username or password");
        }

        // Generate a session authentication token
        String token = "aaspass-token-" + UUID.randomUUID().toString();
        log.info("[AUTH LOGIN SUCCESS] User authenticated successfully: ID={}, username='{}', name='{}'",
                user.getId(), user.getUsername(), user.getName());

        UserResponse userResponse = DtoMapper.toUserResponse(user, true, true);

        return AuthResponse.builder()
                .success(true)
                .message("Login successful")
                .token(token)
                .tokenType("Bearer")
                .user(userResponse)
                .build();
    }

    /**
     * Registers a new user account.
     *
     * @param request Registration details
     * @return AuthResponse with session token and newly created user profile
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
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

        String token = "aaspass-token-" + UUID.randomUUID().toString();
        UserResponse userResponse = DtoMapper.toUserResponse(savedUser, true, true);

        return AuthResponse.builder()
                .success(true)
                .message("Registration successful")
                .token(token)
                .tokenType("Bearer")
                .user(userResponse)
                .build();
    }

    /**
     * Retrieves the current user profile by user ID or username.
     */
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(Long userId) {
        log.info("[AUTH GET CURRENT USER] Fetching user profile for ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return DtoMapper.toUserResponse(user, true, true);
    }
}
