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
import com.aaspass.exception.ResourceNotFoundException;
import com.aaspass.repository.StoreRepository;
import com.aaspass.repository.UserRepository;
import com.aaspass.service.mapper.DtoMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
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

    @Transactional
    public StoreResponse createStore(StoreCreateRequest request) {
        log.info("[STORE SERVICE] Creating store '{}' for user ID: {}", request.getStoreName(), request.getUserId());
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUserId()));

        String memberSince = LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMMM yyyy"));
        String ownerName = (request.getOwnerName() != null && !request.getOwnerName().isBlank())
                ? request.getOwnerName().trim()
                : user.getName();

        Store store = Store.builder()
                .user(user)
                .ownerName(ownerName)
                .storeName(request.getStoreName().trim())
                .tagline(request.getTagline())
                .category(request.getCategory().trim())
                .skills(request.getSkills() != null ? new ArrayList<>(request.getSkills()) : new ArrayList<>())
                .experienceYears(request.getExperienceYears() != null ? request.getExperienceYears() : 0)
                .hourlyRate(request.getHourlyRate())
                .startingPrice(request.getStartingPrice())
                .area(request.getArea().trim())
                .city(request.getCity().trim())
                .serviceRadiusKm(request.getServiceRadiusKm() != null ? request.getServiceRadiusKm() : 10)
                .description(request.getDescription())
                .avatarUrl(request.getAvatarUrl() != null ? request.getAvatarUrl() : user.getAvatarUrl())
                .bannerGradient(request.getBannerGradient() != null ? request.getBannerGradient() : "from-indigo-500 to-purple-600")
                .isAvailable(true)
                .memberSince(memberSince)
                .views(StoreEngagementStats.builder().daily(0).weekly(0).monthly(0).lifetime(0).build())
                .storeSocialMediaLinks(request.getStoreSocialMediaLinks())
                .build();

        // Attach initial services if provided
        if (request.getServices() != null) {
            for (ServiceItemRequest sReq : request.getServices()) {
                StoreServiceItem item = StoreServiceItem.builder()
                        .name(sReq.getName())
                        .price(sReq.getPrice())
                        .duration(sReq.getDuration())
                        .description(sReq.getDescription())
                        .build();
                store.addService(item);
            }
        }

        // Attach dynamic social links if provided
        if (request.getSocialMediaLinks() != null) {
            for (SocialMediaLinkDto linkDto : request.getSocialMediaLinks()) {
                SocialMediaLink link = SocialMediaLink.builder()
                        .name(linkDto.getName())
                        .url(linkDto.getUrl())
                        .build();
                store.addSocialMediaLink(link);
            }
        }

        user.addStore(store);
        Store savedStore = storeRepository.save(store);
        userRepository.save(user);

        log.info("[STORE SERVICE] Store created successfully with ID: {} for user ID: {}", savedStore.getId(), user.getId());
        return DtoMapper.toStoreResponse(savedStore, true);
    }

    @Transactional
    public StoreResponse updateStore(Long id, StoreUpdateRequest request) {
        log.info("[STORE SERVICE] Updating store ID: {}", id);
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store", "id", id));

        if (request.getStoreName() != null) store.setStoreName(request.getStoreName().trim());
        if (request.getOwnerName() != null) store.setOwnerName(request.getOwnerName().trim());
        if (request.getTagline() != null) store.setTagline(request.getTagline());
        if (request.getCategory() != null) store.setCategory(request.getCategory().trim());
        if (request.getSkills() != null) store.setSkills(new ArrayList<>(request.getSkills()));
        if (request.getExperienceYears() != null) store.setExperienceYears(request.getExperienceYears());
        if (request.getHourlyRate() != null) store.setHourlyRate(request.getHourlyRate());
        if (request.getStartingPrice() != null) store.setStartingPrice(request.getStartingPrice());
        if (request.getArea() != null) store.setArea(request.getArea().trim());
        if (request.getCity() != null) store.setCity(request.getCity().trim());
        if (request.getServiceRadiusKm() != null) store.setServiceRadiusKm(request.getServiceRadiusKm());
        if (request.getDescription() != null) store.setDescription(request.getDescription());
        if (request.getAvatarUrl() != null) store.setAvatarUrl(request.getAvatarUrl());
        if (request.getBannerGradient() != null) store.setBannerGradient(request.getBannerGradient());
        if (request.getIsAvailable() != null) store.setIsAvailable(request.getIsAvailable());
        if (request.getStoreSocialMediaLinks() != null) {
            store.setStoreSocialMediaLinks(request.getStoreSocialMediaLinks());
        }

        if (request.getSocialMediaLinks() != null) {
            if (store.getSocialMediaLinks() != null) {
                store.getSocialMediaLinks().clear();
            }
            for (SocialMediaLinkDto linkDto : request.getSocialMediaLinks()) {
                if (linkDto != null) {
                    SocialMediaLink link = SocialMediaLink.builder()
                            .name(linkDto.getName())
                            .url(linkDto.getUrl())
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
    public void deleteStore(Long id) {
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
    public StoreResponse toggleStoreAvailability(Long id) {
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
    public StoreResponse recordStoreView(Long id, String viewerId) {
        log.info("[STORE SERVICE] Recording view for store ID: {}, viewer: '{}'", id, viewerId);
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
                .viewerId(viewerId != null ? viewerId : "anonymous")
                .build();
        store.addViewRecord(viewRecord);

        Store saved = storeRepository.save(store);
        log.info("[STORE SERVICE] Store ID: {} new view total: {}", id, stats.getLifetime());
        return DtoMapper.toStoreResponse(saved, true);
    }
}
