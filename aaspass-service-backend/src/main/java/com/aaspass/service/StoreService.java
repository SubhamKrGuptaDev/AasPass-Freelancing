package com.aaspass.service;

import com.aaspass.dto.common.SocialMediaLinkDto;
import com.aaspass.dto.request.ServiceItemRequest;
import com.aaspass.dto.request.StoreCreateRequest;
import com.aaspass.dto.request.StoreUpdateRequest;
import com.aaspass.dto.response.StoreResponse;
import com.aaspass.entity.SocialMediaLink;
import com.aaspass.entity.Store;
import com.aaspass.entity.StoreEngagementStats;
import com.aaspass.entity.StoreServiceItem;
import com.aaspass.entity.StoreViewRecord;
import com.aaspass.entity.User;
import com.aaspass.exception.ForbiddenException;
import com.aaspass.exception.ResourceNotFoundException;
import com.aaspass.repository.StoreRepository;
import com.aaspass.repository.UserRepository;
import com.aaspass.service.mapper.DtoMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service managing neighborhood storefronts, gig listings, live previews, and analytics.
 */
@Service
public class StoreService {

    private static final Logger log = LoggerFactory.getLogger(StoreService.class);

    private final StoreRepository storeRepository;
    private final UserRepository userRepository;

    public StoreService(StoreRepository storeRepository, UserRepository userRepository) {
        this.storeRepository = storeRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<StoreResponse> getStores(String city, String category, String query, Boolean availableOnly) {
        log.info("[STORE SERVICE] Querying stores: city='{}', category='{}', query='{}', availableOnly={}",
                city, category, query, availableOnly);

        List<Store> stores = storeRepository.searchStores(
                (city != null && !city.isBlank()) ? city.trim() : null,
                (category != null && !category.isBlank()) ? category.trim() : null,
                (query != null && !query.isBlank()) ? query.trim() : null,
                availableOnly
        );

        log.info("[STORE SERVICE] Query returned {} stores", stores.size());
        return stores.stream()
                .map(store -> DtoMapper.toStoreResponse(store, true))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StoreResponse getStoreById(Long id) {
        log.info("[STORE SERVICE] Fetching store details for ID: {}", id);
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("[STORE SERVICE] Store not found with ID: {}", id);
                    return new ResourceNotFoundException("Store", "id", id);
                });
        return DtoMapper.toStoreResponse(store, true);
    }

    @Transactional(readOnly = true)
    public List<StoreResponse> getStoresByUserId(Long userId) {
        log.info("[STORE SERVICE] Fetching all stores for owner user ID: {}", userId);
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }
        return storeRepository.findByUserId(userId).stream()
                .map(store -> DtoMapper.toStoreResponse(store, true))
                .collect(Collectors.toList());
    }

    /**
     * Verifies that the given user owns the store.
     *
     * @throws ResourceNotFoundException if the store does not exist
     * @throws ForbiddenException        if the store belongs to someone else
     */
    @Transactional(readOnly = true)
    public void assertStoreOwner(Long storeId, Long userId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store", "id", storeId));
        Long ownerId = store.getUser() != null ? store.getUser().getId() : null;
        if (ownerId == null || !ownerId.equals(userId)) {
            log.warn("[STORE SERVICE] User {} attempted to modify store {} owned by {}", userId, storeId, ownerId);
            throw new ForbiddenException("You don't own this store");
        }
    }

    @Transactional
    public StoreResponse createStore(Long ownerId, StoreCreateRequest request) {
        log.info("[STORE SERVICE] Creating store '{}' for user ID: {}", request.storeName(), ownerId);
        User user = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", ownerId));

        String memberSince = LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMMM yyyy"));
        String ownerName = (request.ownerName() != null && !request.ownerName().isBlank())
                ? request.ownerName().trim()
                : user.getName();

        Store store = Store.builder()
                .user(user)
                .ownerName(ownerName)
                .storeName(request.storeName().trim())
                .tagline(request.tagline())
                .category(request.category().trim())
                .skills(request.skills() != null ? new ArrayList<>(request.skills()) : new ArrayList<>())
                .experienceYears(request.experienceYears() != null ? request.experienceYears() : 0)
                .hourlyRate(request.hourlyRate())
                .startingPrice(request.startingPrice())
                .area(request.area().trim())
                .city(request.city().trim())
                .serviceRadiusKm(request.serviceRadiusKm() != null ? request.serviceRadiusKm() : 10)
                .description(request.description())
                .avatarUrl(request.avatarUrl() != null ? request.avatarUrl() : user.getAvatarUrl())
                .bannerGradient(request.bannerGradient() != null ? request.bannerGradient() : "from-indigo-500 to-purple-600")
                .isAvailable(true)
                .memberSince(memberSince)
                .views(StoreEngagementStats.builder().daily(0).weekly(0).monthly(0).lifetime(0).build())
                .storeSocialMediaLinks(request.storeSocialMediaLinks())
                .build();

        // Attach initial services if provided
        if (request.services() != null) {
            for (ServiceItemRequest sReq : request.services()) {
                if (sReq != null && sReq.name() != null && !sReq.name().isBlank()) {
                    StoreServiceItem item = StoreServiceItem.builder()
                            .name(sReq.name().trim())
                            .price(sReq.price() != null ? sReq.price() : BigDecimal.ZERO)
                            .duration(sReq.duration())
                            .description(sReq.description())
                            .build();
                    store.addService(item);
                }
            }
        }

        // Attach dynamic social links if provided
        if (request.socialMediaLinks() != null) {
            for (SocialMediaLinkDto linkDto : request.socialMediaLinks()) {
                if (linkDto != null && linkDto.name() != null && !linkDto.name().isBlank() && linkDto.url() != null && !linkDto.url().isBlank()) {
                    SocialMediaLink link = SocialMediaLink.builder()
                            .name(linkDto.name().trim())
                            .url(linkDto.url().trim())
                            .build();
                    store.addSocialMediaLink(link);
                }
            }
        }

        user.addStore(store);
        Store savedStore = storeRepository.save(store);
        userRepository.save(user);

        log.info("[STORE SERVICE] Store created successfully with ID: {} for user ID: {}", savedStore.getId(), user.getId());
        return DtoMapper.toStoreResponse(savedStore, true);
    }

    @Transactional
    public StoreResponse updateStore(Long id, Long callerId, StoreUpdateRequest request) {
        assertStoreOwner(id, callerId);
        log.info("[STORE SERVICE] Updating store ID: {}", id);
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store", "id", id));

        if (request.storeName() != null) store.setStoreName(request.storeName().trim());
        if (request.ownerName() != null) store.setOwnerName(request.ownerName().trim());
        if (request.tagline() != null) store.setTagline(request.tagline());
        if (request.category() != null) store.setCategory(request.category().trim());
        if (request.skills() != null) store.setSkills(new ArrayList<>(request.skills()));
        if (request.experienceYears() != null) store.setExperienceYears(request.experienceYears());
        if (request.hourlyRate() != null) store.setHourlyRate(request.hourlyRate());
        if (request.startingPrice() != null) store.setStartingPrice(request.startingPrice());
        if (request.area() != null) store.setArea(request.area().trim());
        if (request.city() != null) store.setCity(request.city().trim());
        if (request.serviceRadiusKm() != null) store.setServiceRadiusKm(request.serviceRadiusKm());
        if (request.description() != null) store.setDescription(request.description());
        if (request.avatarUrl() != null) store.setAvatarUrl(request.avatarUrl());
        if (request.bannerGradient() != null) store.setBannerGradient(request.bannerGradient());
        if (request.isAvailable() != null) store.setIsAvailable(request.isAvailable());
        if (request.storeSocialMediaLinks() != null) {
            store.setStoreSocialMediaLinks(request.storeSocialMediaLinks());
        }

        if (request.socialMediaLinks() != null) {
            if (store.getSocialMediaLinks() != null) {
                store.getSocialMediaLinks().clear();
            }
            for (SocialMediaLinkDto linkDto : request.socialMediaLinks()) {
                if (linkDto != null && linkDto.name() != null && !linkDto.name().isBlank() && linkDto.url() != null && !linkDto.url().isBlank()) {
                    SocialMediaLink link = SocialMediaLink.builder()
                            .name(linkDto.name().trim())
                            .url(linkDto.url().trim())
                            .build();
                    store.addSocialMediaLink(link);
                }
            }
        }

        Store updated = storeRepository.save(store);
        log.info("[STORE SERVICE] Store ID: {} updated successfully", id);
        return DtoMapper.toStoreResponse(updated, true);
    }

    @Transactional
    public void deleteStore(Long id, Long callerId) {
        assertStoreOwner(id, callerId);
        log.info("[STORE SERVICE] Deleting store ID: {}", id);
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store", "id", id));

        User user = store.getUser();
        if (user != null) {
            user.removeStore(store);
            userRepository.save(user);
        }

        storeRepository.delete(store);
        log.info("[STORE SERVICE] Store ID: {} deleted successfully", id);
    }

    @Transactional
    public StoreResponse toggleStoreAvailability(Long id, Long callerId) {
        assertStoreOwner(id, callerId);
        log.info("[STORE SERVICE] Toggling availability for store ID: {}", id);
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store", "id", id));

        boolean newStatus = !Boolean.TRUE.equals(store.getIsAvailable());
        store.setIsAvailable(newStatus);
        Store saved = storeRepository.save(store);

        log.info("[STORE SERVICE] Store ID: {} availability set to: {}", id, newStatus);
        return DtoMapper.toStoreResponse(saved, true);
    }

    @Transactional
    public StoreResponse recordStoreView(Long id, Optional<Long> viewerId) {
        log.info("[STORE SERVICE] Recording view for store ID: {}, viewer: '{}'", id, viewerId.orElse(null));
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store", "id", id));

        StoreEngagementStats stats = store.getViews();
        if (stats == null) {
            stats = new StoreEngagementStats();
            store.setViews(stats);
        }
        stats.setDaily((stats.getDaily() != null ? stats.getDaily() : 0) + 1);
        stats.setWeekly((stats.getWeekly() != null ? stats.getWeekly() : 0) + 1);
        stats.setMonthly((stats.getMonthly() != null ? stats.getMonthly() : 0) + 1);
        stats.setLifetime((stats.getLifetime() != null ? stats.getLifetime() : 0) + 1);

        StoreViewRecord viewRecord = StoreViewRecord.builder()
                .viewTimestamp(LocalDateTime.now())
                .viewerId(viewerId.map(String::valueOf).orElse("anonymous"))
                .build();
        store.addViewRecord(viewRecord);

        Store saved = storeRepository.save(store);
        log.info("[STORE SERVICE] Store ID: {} new view total: {}", id, stats.getLifetime());
        return DtoMapper.toStoreResponse(saved, true);
    }
}
