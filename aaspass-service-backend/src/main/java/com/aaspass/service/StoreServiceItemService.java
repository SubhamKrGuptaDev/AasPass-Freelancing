package com.aaspass.service;

import com.aaspass.dto.request.ServiceItemRequest;
import com.aaspass.dto.response.ServiceItemResponse;
import com.aaspass.entity.Store;
import com.aaspass.entity.StoreServiceItem;
import com.aaspass.exception.BadRequestException;
import com.aaspass.exception.ResourceNotFoundException;
import com.aaspass.repository.StoreRepository;
import com.aaspass.repository.StoreServiceItemRepository;
import com.aaspass.service.mapper.DtoMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service managing individual store service packages and gig offerings.
 */
@Service
public class StoreServiceItemService {

    private static final Logger log = LoggerFactory.getLogger(StoreServiceItemService.class);

    private final StoreServiceItemRepository serviceItemRepository;
    private final StoreRepository storeRepository;

    public StoreServiceItemService(StoreServiceItemRepository serviceItemRepository, StoreRepository storeRepository) {
        this.serviceItemRepository = serviceItemRepository;
        this.storeRepository = storeRepository;
    }

    @Transactional(readOnly = true)
    public List<ServiceItemResponse> getServicesByStoreId(Long storeId) {
        log.info("[SERVICE ITEM] Fetching service items for store ID: {}", storeId);
        if (!storeRepository.existsById(storeId)) {
            throw new ResourceNotFoundException("Store", "id", storeId);
        }
        return serviceItemRepository.findByStoreId(storeId).stream()
                .map(DtoMapper::toServiceItemResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ServiceItemResponse addService(Long storeId, ServiceItemRequest request) {
        log.info("[SERVICE ITEM] Adding service item '{}' (price: {}) to store ID: {}",
                request.name(), request.price(), storeId);

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store", "id", storeId));

        StoreServiceItem serviceItem = StoreServiceItem.builder()
                .store(store)
                .name(request.name().trim())
                .price(request.price())
                .duration(request.duration())
                .description(request.description())
                .build();

        store.addService(serviceItem);
        StoreServiceItem saved = serviceItemRepository.save(serviceItem);
        log.info("[SERVICE ITEM] Service item saved with ID: {} for store ID: {}", saved.getId(), storeId);
        return DtoMapper.toServiceItemResponse(saved);
    }

    @Transactional
    public ServiceItemResponse updateService(Long storeId, Long serviceId, ServiceItemRequest request) {
        log.info("[SERVICE ITEM] Updating service item ID: {} for store ID: {}", serviceId, storeId);

        StoreServiceItem serviceItem = serviceItemRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service item", "id", serviceId));

        if (!serviceItem.getStore().getId().equals(storeId)) {
            throw new BadRequestException("Service item does not belong to specified store");
        }

        if (request.name() != null) serviceItem.setName(request.name().trim());
        if (request.price() != null) serviceItem.setPrice(request.price());
        if (request.duration() != null) serviceItem.setDuration(request.duration());
        if (request.description() != null) serviceItem.setDescription(request.description());

        StoreServiceItem updated = serviceItemRepository.save(serviceItem);
        log.info("[SERVICE ITEM] Successfully updated service item ID: {}", serviceId);
        return DtoMapper.toServiceItemResponse(updated);
    }

    @Transactional
    public void deleteService(Long storeId, Long serviceId) {
        log.info("[SERVICE ITEM] Deleting service item ID: {} from store ID: {}", serviceId, storeId);

        StoreServiceItem serviceItem = serviceItemRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service item", "id", serviceId));

        if (!serviceItem.getStore().getId().equals(storeId)) {
            throw new BadRequestException("Service item does not belong to specified store");
        }

        serviceItem.getStore().removeService(serviceItem);
        serviceItemRepository.delete(serviceItem);
        log.info("[SERVICE ITEM] Successfully deleted service item ID: {}", serviceId);
    }
}
