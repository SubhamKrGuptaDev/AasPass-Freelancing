package com.aaspass.admin.service;

import com.aaspass.admin.dto.AdminStoreSummary;
import com.aaspass.admin.dto.AdminUserDetail;
import com.aaspass.admin.dto.AdminUserSummary;
import com.aaspass.admin.dto.PageResponse;
import com.aaspass.admin.dto.SuspendUserRequest;
import com.aaspass.admin.dto.VerificationDecisionRequest;
import com.aaspass.admin.dto.VerificationItem;
import com.aaspass.admin.entity.AdminAuditAction;
import com.aaspass.admin.entity.AuditTargetType;
import com.aaspass.dto.response.VerificationView;
import com.aaspass.entity.User;
import com.aaspass.entity.VerificationCheck;
import com.aaspass.entity.VerificationStatus;
import com.aaspass.exception.BadRequestException;
import com.aaspass.exception.ResourceNotFoundException;
import com.aaspass.repository.UserRepository;
import com.aaspass.security.session.SessionRevokeReason;
import com.aaspass.security.session.SessionService;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Admin user search, KYC verification and suspension. Every mutation (and every view of unmasked KYC
 * data) is audited; audit details never contain the raw phone, PAN or Aadhaar value.
 */
@Service
public class AdminUserService {

    static final int MAX_PAGE_SIZE = 100;
    static final int MAX_SUSPENSION_DAYS = 365;

    private final UserRepository userRepository;
    private final AdminMapper mapper;
    private final AdminAuditService auditService;
    private final SessionService sessionService;
    private final Clock clock;

    public AdminUserService(UserRepository userRepository, AdminMapper mapper, AdminAuditService auditService,
                            SessionService sessionService, Clock clock) {
        this.userRepository = userRepository;
        this.mapper = mapper;
        this.auditService = auditService;
        this.sessionService = sessionService;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminUserSummary> search(String q, String verification, Boolean suspended,
                                                 int page, int size) {
        PageRequest pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), MAX_PAGE_SIZE),
                Sort.by(Sort.Direction.DESC, "creationDateTime").and(Sort.by(Sort.Direction.DESC, "id")));
        return PageResponse.of(userRepository
                .findAll(AdminUserSpecs.filter(q, verification, suspended, clock.instant()), pageable)
                .map(mapper::toUserSummary));
    }

    /** Returns the unmasked detail and records {@link AdminAuditAction#VIEW_USER_KYC}. */
    @Transactional
    public AdminUserDetail get(Long id, Long adminId) {
        User user = load(id);
        auditService.record(adminId, AdminAuditAction.VIEW_USER_KYC, AuditTargetType.USER, id, null);
        return toDetail(user);
    }

    @Transactional
    public AdminUserDetail suspend(Long id, SuspendUserRequest request, Long adminId) {
        if (request == null || request.until() == null) {
            throw new BadRequestException("Suspension end is required");
        }
        Instant now = clock.instant();
        if (!request.until().isAfter(now)) {
            throw new BadRequestException("Suspension end must be in the future");
        }
        if (request.until().isAfter(now.plus(MAX_SUSPENSION_DAYS, ChronoUnit.DAYS))) {
            throw new BadRequestException("Suspensions are limited to one year");
        }
        String reason = request.reason() == null ? "" : request.reason().trim();
        if (reason.isEmpty()) {
            throw new BadRequestException("A reason is required to suspend");
        }
        User user = load(id);
        user.setSuspendedUntil(request.until());
        user.setSuspensionReason(reason);
        userRepository.saveAndFlush(user);
        sessionService.revokeAllForUser(user.getId(), SessionRevokeReason.SUSPENDED);
        auditService.record(adminId, AdminAuditAction.SUSPEND_USER, AuditTargetType.USER, id,
                "until=" + request.until() + " reason=" + reason);
        return toDetail(user);
    }

    @Transactional
    public AdminUserDetail liftSuspension(Long id, Long adminId) {
        User user = load(id);
        user.setSuspendedUntil(null);
        user.setSuspensionReason(null);
        userRepository.saveAndFlush(user);
        auditService.record(adminId, AdminAuditAction.LIFT_SUSPENSION, AuditTargetType.USER, id, null);
        return toDetail(user);
    }

    @Transactional
    public AdminUserDetail decide(Long id, VerificationItem item, VerificationDecisionRequest request, Long adminId) {
        if (item == null || request == null || request.decision() == null) {
            throw new BadRequestException("A verification decision is required");
        }
        VerificationStatus decision = request.decision();
        if (decision == VerificationStatus.UNVERIFIED) {
            throw new BadRequestException("Decision must be VERIFIED or REJECTED");
        }
        String reason = request.reason() == null || request.reason().isBlank() ? null : request.reason().trim();
        if (decision == VerificationStatus.REJECTED && reason == null) {
            throw new BadRequestException("A reason is required to reject");
        }
        User user = load(id);
        if (isBlank(valueOf(user, item))) {
            throw new BadRequestException(item.label() + " has not been provided by the user");
        }
        VerificationCheck check = checkOf(user, item);
        check.decide(decision, decision == VerificationStatus.REJECTED ? reason : null, adminId, clock.instant());
        userRepository.saveAndFlush(user);
        boolean rejected = decision == VerificationStatus.REJECTED;
        auditService.record(adminId, rejected ? AdminAuditAction.REJECT_ITEM : AdminAuditAction.VERIFY_ITEM,
                AuditTargetType.USER, id, "item=" + item.name() + (rejected ? " reason=" + reason : ""));
        return toDetail(user);
    }

    private User load(Long id) {
        if (id == null) {
            throw new ResourceNotFoundException("User", "id", null);
        }
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    private static String valueOf(User user, VerificationItem item) {
        return switch (item) {
            case PHONE -> user.getPhone();
            case PAN -> user.getPanNumber();
            case AADHAR -> user.getAadharNumber();
        };
    }

    private static VerificationCheck checkOf(User user, VerificationItem item) {
        return switch (item) {
            case PHONE -> user.getPhoneVerification();
            case PAN -> user.getPanVerification();
            case AADHAR -> user.getAadharVerification();
        };
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private AdminUserDetail toDetail(User user) {
        List<AdminStoreSummary> stores = user.getStores() == null ? List.of()
                : user.getStores().stream().map(mapper::toStoreSummary).toList();
        return new AdminUserDetail(mapper.toUserSummary(user), user.getPhone(), user.getAadharNumber(),
                user.getPanNumber(), VerificationView.of(user), user.getSuspensionReason(), user.getBio(),
                user.getArea(), stores);
    }
}
