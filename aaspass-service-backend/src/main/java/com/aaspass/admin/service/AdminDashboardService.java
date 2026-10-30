package com.aaspass.admin.service;

import com.aaspass.admin.dto.ActivityPeriod;
import com.aaspass.admin.dto.DashboardResponse;
import com.aaspass.admin.dto.NewActivityResponse;
import com.aaspass.entity.Store;
import com.aaspass.entity.User;
import com.aaspass.entity.ContactRequestStatus;
import com.aaspass.repository.ContactRequestRepository;
import com.aaspass.repository.StoreRepository;
import com.aaspass.repository.UserRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Builds the admin dashboard summary from the same specs the search endpoints use. */
@Service
public class AdminDashboardService {

    static final int RECENT_SIZE = 10;

    private final StoreRepository storeRepository;
    private final UserRepository userRepository;
    private final ContactRequestRepository contactRequestRepository;
    private final AdminMapper mapper;
    private final Clock clock;

    public AdminDashboardService(StoreRepository storeRepository, UserRepository userRepository,
                                 ContactRequestRepository contactRequestRepository, AdminMapper mapper,
                                 Clock clock) {
        this.storeRepository = storeRepository;
        this.userRepository = userRepository;
        this.contactRequestRepository = contactRequestRepository;
        this.mapper = mapper;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public DashboardResponse summary() {
        Instant now = clock.instant();
        PageRequest recent = newestFirst();

        Specification<Store> unreviewed = AdminStoreSpecs.filter(null, null, null, "unreviewed");
        Specification<User> pending = AdminUserSpecs.filter(null, "pending", null, now);

        return new DashboardResponse(
                userRepository.count(),
                storeRepository.count(),
                storeRepository.count(AdminStoreSpecs.filter(null, null, null, "active")),
                userRepository.count(pending),
                storeRepository.count(unreviewed),
                storeRepository.count(AdminStoreSpecs.filter(null, null, null, "blocked")),
                userRepository.count(AdminUserSpecs.filter(null, "all", true, now)),
                contactRequestRepository.countByStatus(ContactRequestStatus.NEW),
                userRepository.findAll(pending, recent).map(mapper::toUserSummary).getContent(),
                storeRepository.findAll(unreviewed, recent).map(mapper::toStoreSummary).getContent());
    }

    /**
     * Users and stores created within the rolling {@code period} window ending now.
     * Creation timestamps are stored as server-local {@link LocalDateTime} (see BaseAuditEntity),
     * so the cutoff is computed in the same zone.
     */
    @Transactional(readOnly = true)
    public NewActivityResponse newActivity(ActivityPeriod period) {
        ActivityPeriod resolved = period == null ? ActivityPeriod.DAILY : period;
        LocalDateTime since = LocalDateTime.ofInstant(clock.instant(), ZoneId.systemDefault())
                .minusDays(resolved.days());
        Specification<User> newUsers = createdSince(since);
        Specification<Store> newStores = createdSince(since);
        PageRequest recent = newestFirst();

        return new NewActivityResponse(
                resolved,
                userRepository.count(newUsers),
                storeRepository.count(newStores),
                userRepository.findAll(newUsers, recent).map(mapper::toUserSummary).getContent(),
                storeRepository.findAll(newStores, recent).map(mapper::toStoreSummary).getContent());
    }

    private static PageRequest newestFirst() {
        return PageRequest.of(0, RECENT_SIZE,
                Sort.by(Sort.Direction.DESC, "creationDateTime").and(Sort.by(Sort.Direction.DESC, "id")));
    }

    private static <T> Specification<T> createdSince(LocalDateTime since) {
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.<LocalDateTime>get("creationDateTime"), since);
    }
}
