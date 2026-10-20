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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Authenticates a user by username or email and validates their password.
     *
     * @param request Login credentials (username/email and password)
     * @return AuthResponse with session token and authenticated user profile
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String identifier = request.getUsernameOrEmail() != null ? request.getUsernameOrEmail().trim() : "";
        log.info("[AUTH LOGIN ATTEMPT] Identifying user by: '{}'", identifier);

        User user = userRepository.findByUsernameOrEmail(identifier)
                .orElseThrow(() -> {
                    log.warn("[AUTH LOGIN FAILED] No user found matching identifier: '{}'", identifier);
                    return new UnauthorizedException("Invalid username or password");
                });

        // Basic password check
        if (!user.getPassword().equals(request.getPassword())) {
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
                request.getUsername(), request.getEmail());

        if (userRepository.existsByUsername(request.getUsername())) {
            log.warn("[AUTH REGISTER FAILED] Username '{}' is already taken", request.getUsername());
            throw new DuplicateResourceException("Username '" + request.getUsername() + "' is already in use");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("[AUTH REGISTER FAILED] Email '{}' is already registered", request.getEmail());
            throw new DuplicateResourceException("Email '" + request.getEmail() + "' is already registered");
        }

        String memberSince = LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMMM yyyy"));

        User newUser = User.builder()
                .name(request.getName().trim())
                .username(request.getUsername().trim().toLowerCase())
                .email(request.getEmail().trim().toLowerCase())
                .password(request.getPassword()) // Store credentials for user
                .phone(request.getPhone())
                .city(request.getCity() != null ? request.getCity() : "Bengaluru")
                .area(request.getArea() != null ? request.getArea() : "Indiranagar")
                .bio(request.getBio())
                .avatarUrl("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80")
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
