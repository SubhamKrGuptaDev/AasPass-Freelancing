package com.aaspass.admin.service;

import com.aaspass.admin.dto.AdminStoreDetail;
import com.aaspass.admin.dto.AdminStoreSummary;
import com.aaspass.admin.dto.PageResponse;
import com.aaspass.admin.entity.AdminAuditAction;
import com.aaspass.admin.entity.AuditTargetType;
import com.aaspass.entity.Store;
import com.aaspass.exception.ResourceNotFoundException;
import com.aaspass.repository.StoreRepository;
import java.time.Clock;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Admin store search and moderation (block, unblock, review). Every mutation is audited. */
@Service
public class AdminStoreService {

    static final int MAX_PAGE_SIZE = 100;

    private final StoreRepository storeRepository;
    private final AdminMapper mapper;
    private final AdminAuditService auditService;
    private final Clock clock;

    public AdminStoreService(StoreRepository storeRepository, AdminMapper mapper,
                             AdminAuditService auditService, Clock clock) {
        this.storeRepository = storeRepository;
        this.mapper = mapper;
        this.auditService = auditService;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminStoreSummary> search(String country, String city, String name, String status,
                                                  int page, int size) {
        PageRequest pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), MAX_PAGE_SIZE),
                Sort.by(Sort.Direction.DESC, "creationDateTime").and(Sort.by(Sort.Direction.DESC, "id")));
        return PageResponse.of(storeRepository.findAll(AdminStoreSpecs.filter(country, city, name, status), pageable)
                .map(mapper::toStoreSummary));
    }

    @Transactional(readOnly = true)
    public AdminStoreDetail get(Long id) {
        return toDetail(load(id));
    }

    @Transactional
    public AdminStoreDetail block(Long id, String reason, Long adminId) {
        Store store = load(id);
        store.setAdminBlocked(true);
        store.setAdminBlockReason(reason);
        store.setAdminBlockedAt(clock.instant());
        storeRepository.saveAndFlush(store);
        auditService.record(adminId, AdminAuditAction.BLOCK_STORE, AuditTargetType.STORE, id, reason);
        return toDetail(store);
    }

    @Transactional
    public AdminStoreDetail unblock(Long id, Long adminId) {
        Store store = load(id);
        store.setAdminBlocked(false);
        store.setAdminBlockReason(null);
        store.setAdminBlockedAt(null);
        storeRepository.saveAndFlush(store);
        auditService.record(adminId, AdminAuditAction.UNBLOCK_STORE, AuditTargetType.STORE, id, null);
        return toDetail(store);
    }

    @Transactional
    public AdminStoreDetail review(Long id, Long adminId) {
        Store store = load(id);
        store.setAdminReviewedAt(clock.instant());
        store.setReviewedByAdminId(adminId);
        storeRepository.saveAndFlush(store);
        auditService.record(adminId, AdminAuditAction.REVIEW_STORE, AuditTargetType.STORE, id, null);
        return toDetail(store);
    }

    private Store load(Long id) {
        if (id == null) {
            throw new ResourceNotFoundException("Store", "id", null);
        }
        return storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store", "id", id));
    }

    private AdminStoreDetail toDetail(Store store) {
        return new AdminStoreDetail(mapper.toStoreSummary(store), store.getTagline(), store.getDescription(),
                store.getGoogleMapLink(), store.getAdminBlockReason(), store.getAdminBlockedAt(),
                store.getAdminReviewedAt(), mapper.toOwnerSummary(store.getUser()));
    }
}
