package com.aaspass.service;

import com.aaspass.dto.request.AddressRequest;
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
import java.util.stream.Collectors;

/**
 * Service managing user profile updates and multi-address management.
 */
@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;

    public UserService(UserRepository userRepository, AddressRepository addressRepository) {
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        log.info("[USER SERVICE] Fetching user by ID: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("[USER SERVICE] User not found with ID: {}", id);
                    return new ResourceNotFoundException("User", "id", id);
                });
        return DtoMapper.toUserResponse(user, true, true);
    }

    @Transactional
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        log.info("[USER SERVICE] Updating user profile for ID: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("[USER SERVICE] User not found for update with ID: {}", id);
                    return new ResourceNotFoundException("User", "id", id);
                });

        if (request.getName() != null) user.setName(request.getName().trim());
        if (request.getPhone() != null) user.setPhone(request.getPhone().trim());
        if (request.getAadharNumber() != null) user.setAadharNumber(request.getAadharNumber().trim());
        if (request.getPanNumber() != null) user.setPanNumber(request.getPanNumber().trim());
        if (request.getAvatarUrl() != null) {
            String trimmedAvatar = request.getAvatarUrl().trim();
            user.setAvatarUrl(trimmedAvatar.isEmpty() ? AvatarGenerator.generateRandomAvatar(user.getUsername()) : trimmedAvatar);
        } else if (user.getAvatarUrl() == null || user.getAvatarUrl().trim().isEmpty()) {
            user.setAvatarUrl(AvatarGenerator.generateRandomAvatar(user.getUsername()));
        }
        if (request.getCity() != null) user.setCity(request.getCity().trim());
        if (request.getArea() != null) user.setArea(request.getArea().trim());
        if (request.getBio() != null) user.setBio(request.getBio().trim());
        if (request.getUserSocialMediaLinks() != null) {
            user.setUserSocialMediaLinks(request.getUserSocialMediaLinks());
        }

        User updatedUser = userRepository.save(user);
        log.info("[USER SERVICE] Successfully updated user profile for ID: {}", id);
        return DtoMapper.toUserResponse(updatedUser, true, true);
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
        log.info("[USER SERVICE] Adding address for user ID: {}, area: '{}'", userId, request.getArea());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // If this address is set as default, unset existing default
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            addressRepository.findByUserIdAndIsDefaultTrue(userId)
                    .ifPresent(existingDefault -> {
                        existingDefault.setIsDefault(false);
                        addressRepository.save(existingDefault);
                    });
        }

        Address address = Address.builder()
                .user(user)
                .addressType(request.getAddressType() != null ? request.getAddressType() : "HOME")
                .addressLine(request.getAddressLine())
                .area(request.getArea())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .landmark(request.getLandmark())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .isDefault(Boolean.TRUE.equals(request.getIsDefault()))
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

        if (Boolean.TRUE.equals(request.getIsDefault()) && !Boolean.TRUE.equals(address.getIsDefault())) {
            addressRepository.findByUserIdAndIsDefaultTrue(userId)
                    .ifPresent(existingDefault -> {
                        existingDefault.setIsDefault(false);
                        addressRepository.save(existingDefault);
                    });
            address.setIsDefault(true);
        } else if (request.getIsDefault() != null) {
            address.setIsDefault(request.getIsDefault());
        }

        if (request.getAddressType() != null) address.setAddressType(request.getAddressType());
        if (request.getAddressLine() != null) address.setAddressLine(request.getAddressLine());
        if (request.getArea() != null) address.setArea(request.getArea());
        if (request.getCity() != null) address.setCity(request.getCity());
        if (request.getState() != null) address.setState(request.getState());
        if (request.getPincode() != null) address.setPincode(request.getPincode());
        if (request.getLandmark() != null) address.setLandmark(request.getLandmark());
        if (request.getLatitude() != null) address.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) address.setLongitude(request.getLongitude());

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
