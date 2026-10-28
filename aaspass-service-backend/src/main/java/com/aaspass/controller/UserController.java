package com.aaspass.controller;

import com.aaspass.config.security.CurrentUser;
import com.aaspass.dto.request.AddressRequest;
import com.aaspass.dto.request.KycUpdateRequest;
import com.aaspass.dto.request.UserUpdateRequest;
import com.aaspass.dto.response.AddressResponse;
import com.aaspass.dto.response.ApiResponse;
import com.aaspass.dto.response.UserResponse;
import com.aaspass.exception.ForbiddenException;
import com.aaspass.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller managing User accounts, profiles, KYC details, and multi-address management.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    private final UserService userService;
    private final CurrentUser currentUser;

    public UserController(UserService userService, CurrentUser currentUser) {
        this.userService = userService;
        this.currentUser = currentUser;
    }

    /** Rejects the request unless the path user id is the authenticated caller. */
    private void assertSelf(Long pathUserId) {
        Long callerId = currentUser.requireUserId();
        if (!callerId.equals(pathUserId)) {
            log.warn("[API-CALL] User {} attempted to access account {}", callerId, pathUserId);
            throw new ForbiddenException("You can only modify your own account");
        }
    }

    /**
     * Get user profile by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable("id") Long id) {
        log.info("[API-CALL] GET /api/users/{} - Fetching user profile", id);
        boolean isSelf = id != null && id.equals(currentUser.optionalUserId().orElse(null));
        UserResponse response = userService.getUserById(id, isSelf);
        return ResponseEntity.ok(ApiResponse.success(response, "User profile retrieved successfully"));
    }

    /**
     * Update the caller's KYC identifiers (Aadhaar / PAN); responses are always masked.
     */
    @PutMapping("/me/kyc")
    public ResponseEntity<ApiResponse<UserResponse>> updateKyc(@Valid @RequestBody KycUpdateRequest request) {
        Long callerId = currentUser.requireUserId();
        log.info("[API-CALL] PUT /api/users/me/kyc - Updating KYC for user {}", callerId);
        UserResponse response = userService.updateKyc(callerId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "KYC details updated successfully"));
    }

    /**
     * Update user profile details.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable("id") Long id,
            @RequestBody UserUpdateRequest request) {
        assertSelf(id);
        log.info("[API-CALL] PUT /api/users/{} - Updating user profile", id);
        UserResponse response = userService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "User profile updated successfully"));
    }

    /**
     * Get all addresses saved by a user.
     */
    @GetMapping("/{userId}/addresses")
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getUserAddresses(@PathVariable("userId") Long userId) {
        assertSelf(userId);
        log.info("[API-CALL] GET /api/users/{}/addresses - Listing user addresses", userId);
        List<AddressResponse> addresses = userService.getUserAddresses(userId);
        return ResponseEntity.ok(ApiResponse.success(addresses, "User addresses retrieved successfully"));
    }

    /**
     * Add a new address for a user.
     */
    @PostMapping("/{userId}/addresses")
    public ResponseEntity<ApiResponse<AddressResponse>> addAddress(
            @PathVariable("userId") Long userId,
            @Valid @RequestBody AddressRequest request) {
        assertSelf(userId);
        log.info("[API-CALL] POST /api/users/{}/addresses - Adding new address in area: '{}'", userId, request.area());
        AddressResponse response = userService.addAddress(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Address added successfully"));
    }

    /**
     * Update an existing address.
     */
    @PutMapping("/{userId}/addresses/{addressId}")
    public ResponseEntity<ApiResponse<AddressResponse>> updateAddress(
            @PathVariable("userId") Long userId,
            @PathVariable("addressId") Long addressId,
            @Valid @RequestBody AddressRequest request) {
        assertSelf(userId);
        log.info("[API-CALL] PUT /api/users/{}/addresses/{} - Updating address", userId, addressId);
        AddressResponse response = userService.updateAddress(userId, addressId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Address updated successfully"));
    }

    /**
     * Delete an address.
     */
    @DeleteMapping("/{userId}/addresses/{addressId}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @PathVariable("userId") Long userId,
            @PathVariable("addressId") Long addressId) {
        assertSelf(userId);
        log.info("[API-CALL] DELETE /api/users/{}/addresses/{} - Deleting address", userId, addressId);
        userService.deleteAddress(userId, addressId);
        return ResponseEntity.ok(ApiResponse.success(null, "Address deleted successfully"));
    }

    /**
     * Set an address as the user's primary/default address.
     */
    @PatchMapping("/{userId}/addresses/{addressId}/default")
    public ResponseEntity<ApiResponse<AddressResponse>> setDefaultAddress(
            @PathVariable("userId") Long userId,
            @PathVariable("addressId") Long addressId) {
        assertSelf(userId);
        log.info("[API-CALL] PATCH /api/users/{}/addresses/{}/default - Setting default address", userId, addressId);
        AddressResponse response = userService.setDefaultAddress(userId, addressId);
        return ResponseEntity.ok(ApiResponse.success(response, "Default address set successfully"));
    }
}
