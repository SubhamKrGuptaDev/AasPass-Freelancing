package com.aaspass.service;

import com.aaspass.dto.request.AddressRequest;
import com.aaspass.dto.request.KycUpdateRequest;
import com.aaspass.dto.request.UserUpdateRequest;
import com.aaspass.dto.response.AddressResponse;
import com.aaspass.dto.response.UserResponse;
import com.aaspass.entity.Address;
import com.aaspass.entity.User;
import com.aaspass.exception.BadRequestException;
import com.aaspass.exception.ResourceNotFoundException;
import com.aaspass.repository.AddressRepository;
import com.aaspass.repository.UserRepository;
import com.aaspass.service.mapper.DtoMapper;
import com.aaspass.util.AvatarGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Service managing user profile updates and multi-address management.
 */
@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private static final Pattern AADHAAR_PATTERN = Pattern.compile("^\\d{12}$");
    private static final Pattern PAN_PATTERN = Pattern.compile("^[A-Z]{5}[0-9]{4}[A-Z]$");

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;

    public UserService(UserRepository userRepository, AddressRepository addressRepository) {
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id, boolean isSelf) {
        log.info("[USER SERVICE] Fetching user by ID: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("[USER SERVICE] User not found with ID: {}", id);
                    return new ResourceNotFoundException("User", "id", id);
                });
        return DtoMapper.toUserResponse(user, true, isSelf, isSelf);
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
        if (request.phone() != null) user.setPhone(request.phone().trim());
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

        if (request != null && request.aadharNumber() != null) {
            String aadhaar = request.aadharNumber().replaceAll("[\\s-]", "");
            if (!AADHAAR_PATTERN.matcher(aadhaar).matches()) {
                throw new BadRequestException("Aadhaar must be 12 digits");
            }
            user.setAadharNumber(aadhaar);
        }
        if (request != null && request.panNumber() != null) {
            String pan = request.panNumber().trim().toUpperCase(Locale.ROOT);
            if (!PAN_PATTERN.matcher(pan).matches()) {
                throw new BadRequestException("PAN must look like ABCDE1234F");
            }
            user.setPanNumber(pan);
        }

        User saved = userRepository.save(user);
        log.info("[USER SERVICE] KYC updated for user ID: {}", userId);
        return DtoMapper.toUserResponse(saved, true, true, true);
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
