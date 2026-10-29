package com.aaspass.service;

import com.aaspass.dto.request.AddressRequest;
import com.aaspass.dto.request.KycUpdateRequest;
import com.aaspass.dto.request.UserUpdateRequest;
import com.aaspass.dto.response.AddressResponse;
import com.aaspass.dto.response.UserResponse;
import com.aaspass.entity.Address;
import com.aaspass.entity.User;
import com.aaspass.entity.VerificationCheck;
import com.aaspass.exception.BadRequestException;
import com.aaspass.exception.ResourceNotFoundException;
import com.aaspass.repository.AddressRepository;
import com.aaspass.repository.UserRepository;
import com.aaspass.security.crypto.KycFormat;
import com.aaspass.service.mapper.DtoMapper;
import com.aaspass.util.AvatarGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Service managing user profile updates and multi-address management.
 */
@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;

    private final Clock clock;

    public UserService(UserRepository userRepository, AddressRepository addressRepository, Clock clock) {
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id, boolean isSelf) {
        log.info("[USER SERVICE] Fetching user by ID: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("[USER SERVICE] User not found with ID: {}", id);
                    return new ResourceNotFoundException("User", "id", id);
                });
        return DtoMapper.toUserResponse(user, true, isSelf, isSelf, clock.instant());
    }

    @Transactional
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        log.info("[USER SERVICE] Updating user profile for ID: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("[USER SERVICE] User not found for update with ID: {}", id);
                    return new ResourceNotFoundException("User", "id", id);
                });

        if (request.name() != null) user.setName(request.name().trim());
        if (request.phone() != null) user.updatePhone(request.phone().trim());
        if (request.avatarUrl() != null) {
            String trimmedAvatar = request.avatarUrl().trim();
            user.setAvatarUrl(trimmedAvatar.isEmpty() ? AvatarGenerator.generateRandomAvatar(user.getUsername()) : trimmedAvatar);
        } else if (user.getAvatarUrl() == null || user.getAvatarUrl().trim().isEmpty()) {
            user.setAvatarUrl(AvatarGenerator.generateRandomAvatar(user.getUsername()));
        }
        if (request.city() != null) user.setCity(request.city().trim());
        if (request.area() != null) user.setArea(request.area().trim());
        if (request.country() != null && !request.country().isBlank()) user.setCountry(request.country().trim());
        if (request.bio() != null) user.setBio(request.bio().trim());
        if (request.userSocialMediaLinks() != null) {
            user.setUserSocialMediaLinks(request.userSocialMediaLinks());
        }

        User updatedUser = userRepository.save(user);
        log.info("[USER SERVICE] Successfully updated user profile for ID: {}", id);
        return DtoMapper.toUserResponse(updatedUser, true, true, true);
    }

    /**
     * Updates the caller's KYC identifiers after normalising and validating them. A {@code null}
     * field is left unchanged. Values are encrypted at rest by the entity converter.
     */
    @Transactional
    public UserResponse updateKyc(Long userId, KycUpdateRequest request) {
        log.info("[USER SERVICE] Updating KYC for user ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Validate every field before applying any, so a rejected request changes nothing.
        String aadhaar = null;
        String pan = null;
        if (request != null && request.aadharNumber() != null) {
            aadhaar = KycFormat.normaliseAadhaar(request.aadharNumber());
            if (!KycFormat.isValidAadhaar(aadhaar)) {
                throw new BadRequestException("Aadhaar must be 12 digits");
            }
            assertChangeable(user.getAadharVerification(), user.getAadharNumber(), aadhaar, "Aadhaar");
        }
        if (request != null && request.panNumber() != null) {
            pan = KycFormat.normalisePan(request.panNumber());
            if (!KycFormat.isValidPan(pan)) {
                throw new BadRequestException("PAN must look like ABCDE1234F");
            }
            assertChangeable(user.getPanVerification(), user.getPanNumber(), pan, "PAN");
        }
        if (aadhaar != null) {
            user.updateAadharNumber(aadhaar);
        }
        if (pan != null) {
            user.updatePanNumber(pan);
        }

        User saved = userRepository.save(user);
        log.info("[USER SERVICE] KYC updated for user ID: {}", userId);
        return DtoMapper.toUserResponse(saved, true, true, true);
    }

    /**
     * A verified KYC identifier is locked: replacing it would silently discard the admin's
     * verification. Re-sending the same value is a harmless no-op. An admin rejection unlocks it.
     */
    private static void assertChangeable(VerificationCheck check, String current, String next, String label) {
        if (check != null && check.isVerified() && !Objects.equals(current, next)) {
            throw new BadRequestException(label + " is verified and can no longer be changed");
        }
    }

    @Transactional(readOnly = true)
    public List<AddressResponse> getUserAddresses(Long userId) {
        log.info("[USER SERVICE] Fetching addresses for user ID: {}", userId);
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }
        return addressRepository.findByUserId(userId).stream()
                .map(DtoMapper::toAddressResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AddressResponse addAddress(Long userId, AddressRequest request) {
        log.info("[USER SERVICE] Adding address for user ID: {}, area: '{}'", userId, request.area());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // If this address is set as default, unset existing default
        if (Boolean.TRUE.equals(request.isDefault())) {
            addressRepository.findByUserIdAndIsDefaultTrue(userId)
                    .ifPresent(existingDefault -> {
                        existingDefault.setIsDefault(false);
                        addressRepository.save(existingDefault);
                    });
        }

        Address address = Address.builder()
                .user(user)
                .addressType(request.addressType() != null ? request.addressType() : "HOME")
                .addressLine(request.addressLine())
                .area(request.area())
                .city(request.city())
                .state(request.state())
                .pincode(request.pincode())
                .landmark(request.landmark())
                .latitude(request.latitude())
                .longitude(request.longitude())
                .isDefault(Boolean.TRUE.equals(request.isDefault()))
                .build();

        user.addAddress(address);
        Address savedAddress = addressRepository.save(address);
        log.info("[USER SERVICE] Address saved with ID: {} for user ID: {}", savedAddress.getId(), userId);
        return DtoMapper.toAddressResponse(savedAddress);
    }

    @Transactional
    public AddressResponse updateAddress(Long userId, Long addressId, AddressRequest request) {
        log.info("[USER SERVICE] Updating address ID: {} for user ID: {}", addressId, userId);
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));

        if (!address.getUser().getId().equals(userId)) {
            throw new BadRequestException("Address does not belong to specified user");
        }

        if (Boolean.TRUE.equals(request.isDefault()) && !Boolean.TRUE.equals(address.getIsDefault())) {
            addressRepository.findByUserIdAndIsDefaultTrue(userId)
                    .ifPresent(existingDefault -> {
                        existingDefault.setIsDefault(false);
                        addressRepository.save(existingDefault);
                    });
            address.setIsDefault(true);
        } else if (request.isDefault() != null) {
            address.setIsDefault(request.isDefault());
        }

        if (request.addressType() != null) address.setAddressType(request.addressType());
        if (request.addressLine() != null) address.setAddressLine(request.addressLine());
        if (request.area() != null) address.setArea(request.area());
        if (request.city() != null) address.setCity(request.city());
        if (request.state() != null) address.setState(request.state());
        if (request.pincode() != null) address.setPincode(request.pincode());
        if (request.landmark() != null) address.setLandmark(request.landmark());
        if (request.latitude() != null) address.setLatitude(request.latitude());
        if (request.longitude() != null) address.setLongitude(request.longitude());

        Address updated = addressRepository.save(address);
        log.info("[USER SERVICE] Successfully updated address ID: {}", addressId);
        return DtoMapper.toAddressResponse(updated);
    }

    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        log.info("[USER SERVICE] Deleting address ID: {} for user ID: {}", addressId, userId);
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));

        if (!address.getUser().getId().equals(userId)) {
            throw new BadRequestException("Address does not belong to specified user");
        }

        address.getUser().removeAddress(address);
        addressRepository.delete(address);
        log.info("[USER SERVICE] Successfully deleted address ID: {}", addressId);
    }

    @Transactional
    public AddressResponse setDefaultAddress(Long userId, Long addressId) {
        log.info("[USER SERVICE] Setting address ID: {} as default for user ID: {}", addressId, userId);
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));

        if (!address.getUser().getId().equals(userId)) {
            throw new BadRequestException("Address does not belong to specified user");
        }

        addressRepository.findByUserIdAndIsDefaultTrue(userId)
                .ifPresent(existingDefault -> {
                    existingDefault.setIsDefault(false);
                    addressRepository.save(existingDefault);
                });

        address.setIsDefault(true);
        Address updated = addressRepository.save(address);
        return DtoMapper.toAddressResponse(updated);
    }
}
