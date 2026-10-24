package com.aaspass.service.mapper;

import com.aaspass.dto.common.SocialMediaLinkDto;
import com.aaspass.dto.response.AddressResponse;
import com.aaspass.dto.response.ServiceItemResponse;
import com.aaspass.dto.response.StoreResponse;
import com.aaspass.dto.response.StoreReviewResponse;
import com.aaspass.dto.response.UserResponse;
import com.aaspass.entity.Address;
import com.aaspass.entity.SocialMediaLink;
import com.aaspass.entity.Store;
import com.aaspass.entity.StoreReview;
import com.aaspass.entity.StoreServiceItem;
import com.aaspass.entity.User;
import com.aaspass.util.AvatarGenerator;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Utility mapping class converting JPA Entities to Response DTOs.
 */
public final class DtoMapper {

    private DtoMapper() {
    }

    public static UserResponse toUserResponse(User user, boolean includeStores, boolean includeAddresses) {
        if (user == null) return null;

        List<StoreResponse> storeResponses = Collections.emptyList();
        if (includeStores && user.getStores() != null) {
            storeResponses = user.getStores().stream()
                    .map(store -> toStoreResponse(store, false))
                    .collect(Collectors.toList());
        }

        List<AddressResponse> addressResponses = Collections.emptyList();
        if (includeAddresses && user.getAddresses() != null) {
            addressResponses = user.getAddresses().stream()
                    .map(DtoMapper::toAddressResponse)
                    .collect(Collectors.toList());
        }

        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .aadharNumber(user.getAadharNumber())
                .panNumber(user.getPanNumber())
                .avatarUrl(AvatarGenerator.getOrDefault(user.getAvatarUrl(), user.getUsername()))
                .city(user.getCity())
                .area(user.getArea())
                .country(user.getCountry() != null && !user.getCountry().isBlank() ? user.getCountry() : "India")
                .bio(user.getBio())
                .memberSince(user.getMemberSince())
                .hasStore(user.getHasStore())
                .userSocialMediaLinks(user.getUserSocialMediaLinks())
                .stores(storeResponses)
                .addresses(addressResponses)
                .creationDateTime(user.getCreationDateTime())
                .lastUpdateDateTime(user.getLastUpdateDateTime())
                .build();
    }

    public static StoreResponse toStoreResponse(Store store, boolean includeNested) {
        if (store == null) return null;

        List<SocialMediaLinkDto> socialMediaLinkDtos = Collections.emptyList();
        if (store.getSocialMediaLinks() != null) {
            socialMediaLinkDtos = store.getSocialMediaLinks().stream()
                    .map(DtoMapper::toSocialMediaLinkDto)
                    .collect(Collectors.toList());
        }

        List<ServiceItemResponse> serviceResponses = Collections.emptyList();
        List<StoreReviewResponse> reviewResponses = Collections.emptyList();
        double computedRating = 5.0;
        int reviewCount = 0;

        if (store.getReviews() != null && !store.getReviews().isEmpty()) {
            reviewCount = store.getReviews().size();
            double sum = store.getReviews().stream().mapToDouble(StoreReview::getRating).sum();
            computedRating = Math.round((sum / reviewCount) * 10.0) / 10.0;
        }

        if (includeNested) {
            if (store.getServices() != null) {
                serviceResponses = store.getServices().stream()
                        .map(DtoMapper::toServiceItemResponse)
                        .collect(Collectors.toList());
            }
            if (store.getReviews() != null) {
                reviewResponses = store.getReviews().stream()
                        .map(DtoMapper::toStoreReviewResponse)
                        .collect(Collectors.toList());
            }
        }

        return StoreResponse.builder()
                .id(store.getId())
                .userId(store.getUser() != null ? store.getUser().getId() : null)
                .storeName(store.getStoreName())
                .ownerName(store.getOwnerName())
                .tagline(store.getTagline())
                .category(store.getCategory())
                .skills(store.getSkills() != null ? store.getSkills() : Collections.emptyList())
                .experienceYears(store.getExperienceYears())
                .hourlyRate(store.getHourlyRate())
                .startingPrice(store.getStartingPrice())
                .area(store.getArea())
                .city(store.getCity())
                .serviceRadiusKm(store.getServiceRadiusKm())
                .distanceKm(0.8) // Default base neighborhood proximity
                .rating(computedRating)
                .reviewCount(reviewCount)
                .description(store.getDescription())
                .avatarUrl(store.getAvatarUrl())
                .bannerGradient(store.getBannerGradient())
                .isAvailable(store.getIsAvailable())
                .memberSince(store.getMemberSince())
                .views(store.getViews())
                .storeSocialMediaLinks(store.getStoreSocialMediaLinks())
                .socialMediaLinks(socialMediaLinkDtos)
                .services(serviceResponses)
                .reviews(reviewResponses)
                .creationDateTime(store.getCreationDateTime())
                .lastUpdateDateTime(store.getLastUpdateDateTime())
                .build();
    }

    public static AddressResponse toAddressResponse(Address address) {
        if (address == null) return null;
        return AddressResponse.builder()
                .id(address.getId())
                .userId(address.getUser() != null ? address.getUser().getId() : null)
                .addressType(address.getAddressType())
                .addressLine(address.getAddressLine())
                .area(address.getArea())
                .city(address.getCity())
                .state(address.getState())
                .pincode(address.getPincode())
                .landmark(address.getLandmark())
                .latitude(address.getLatitude())
                .longitude(address.getLongitude())
                .isDefault(address.getIsDefault())
                .creationDateTime(address.getCreationDateTime())
                .lastUpdateDateTime(address.getLastUpdateDateTime())
                .build();
    }

    public static ServiceItemResponse toServiceItemResponse(StoreServiceItem item) {
        if (item == null) return null;
        return ServiceItemResponse.builder()
                .id(item.getId())
                .storeId(item.getStore() != null ? item.getStore().getId() : null)
                .name(item.getName())
                .price(item.getPrice())
                .duration(item.getDuration())
                .description(item.getDescription())
                .creationDateTime(item.getCreationDateTime())
                .build();
    }

    public static StoreReviewResponse toStoreReviewResponse(StoreReview review) {
        if (review == null) return null;
        return StoreReviewResponse.builder()
                .id(review.getId())
                .storeId(review.getStore() != null ? review.getStore().getId() : null)
                .userName(review.getUserName())
                .userAvatar(review.getUserAvatar())
                .rating(review.getRating())
                .message(review.getMessage())
                .reviewDate(review.getReviewDate())
                .creationDateTime(review.getCreationDateTime())
                .build();
    }

    public static SocialMediaLinkDto toSocialMediaLinkDto(SocialMediaLink link) {
        if (link == null) return null;
        return SocialMediaLinkDto.builder()
                .id(link.getId())
                .name(link.getName())
                .url(link.getUrl())
                .build();
    }
}
