package com.aaspass.admin.service;

import com.aaspass.admin.dto.DashboardResponse;
import com.aaspass.entity.Store;
import com.aaspass.entity.User;
import com.aaspass.repository.StoreRepository;
import com.aaspass.repository.UserRepository;
import java.time.Clock;
import java.time.Instant;
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
    private final AdminMapper mapper;
    private final Clock clock;

    public AdminDashboardService(StoreRepository storeRepository, UserRepository userRepository,
                                 AdminMapper mapper, Clock clock) {
        this.storeRepository = storeRepository;
        this.userRepository = userRepository;
        this.mapper = mapper;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public DashboardResponse summary() {
        Instant now = clock.instant();
        PageRequest recent = PageRequest.of(0, RECENT_SIZE,
                Sort.by(Sort.Direction.DESC, "creationDateTime").and(Sort.by(Sort.Direction.DESC, "id")));

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
                userRepository.findAll(pending, recent).map(mapper::toUserSummary).getContent(),
                storeRepository.findAll(unreviewed, recent).map(mapper::toStoreSummary).getContent());
    }
}
