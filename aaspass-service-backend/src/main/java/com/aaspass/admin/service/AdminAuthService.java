package com.aaspass.admin.service;

import com.aaspass.admin.dto.AdminLoginRequest;
import com.aaspass.admin.dto.AdminProfile;
import com.aaspass.admin.entity.AdminAuditAction;
import com.aaspass.admin.entity.AdminUser;
import com.aaspass.admin.entity.AuditTargetType;
import com.aaspass.admin.repository.AdminUserRepository;
import com.aaspass.admin.security.AdminIssuedSession;
import com.aaspass.admin.security.AdminSessionService;
import com.aaspass.exception.ErrorCode;
import com.aaspass.exception.UnauthorizedException;
import java.time.Clock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Administrator authentication. Unknown email, wrong password and inactive account all fail with the
 * same generic {@code 401 INVALID_CREDENTIALS}; an unknown email still runs a BCrypt compare so the
 * response time does not reveal whether the account exists. Emails and passwords are never logged.
 */
@Service
public class AdminAuthService {

    private static final Logger log = LoggerFactory.getLogger(AdminAuthService.class);
    private static final String INVALID_CREDENTIALS_MESSAGE = "Invalid email or password";

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminSessionService sessionService;
    private final AdminAuditService auditService;
    private final Clock clock;

    /** Valid BCrypt hash compared against for unknown emails so timing does not reveal existence. */
    private final String dummyHash;

    public AdminAuthService(AdminUserRepository adminUserRepository, PasswordEncoder passwordEncoder,
                            AdminSessionService sessionService, AdminAuditService auditService, Clock clock) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.sessionService = sessionService;
        this.auditService = auditService;
        this.clock = clock;
        this.dummyHash = passwordEncoder.encode("aaspass-admin-timing-equaliser");
    }

    /** Result of a successful admin login: the profile and the freshly opened session. */
    public record AdminAuthResult(AdminProfile profile, AdminIssuedSession session) {
    }

    /**
     * Authenticates an administrator, opens a new admin session, stamps {@code lastLoginAt} and
     * records a {@code LOGIN} audit entry.
     */
    @Transactional
    public AdminAuthResult login(AdminLoginRequest request, String userAgent, String ip) {
        log.info("[ADMIN LOGIN ATTEMPT] Admin login attempt received");
        String email = request != null && request.email() != null ? request.email().trim() : "";
        String rawPassword = request != null && request.password() != null ? request.password() : "";

        AdminUser admin = email.isEmpty() ? null : adminUserRepository.findByEmailIgnoreCase(email).orElse(null);
        if (admin == null) {
            passwordEncoder.matches(rawPassword, dummyHash);
            log.warn("[ADMIN LOGIN FAILED] Invalid credentials (unknown account)");
            throw invalidCredentials();
        }
        if (admin.getPassword() == null || !passwordEncoder.matches(rawPassword, admin.getPassword())) {
            log.warn("[ADMIN LOGIN FAILED] Invalid credentials for admin ID: {}", admin.getId());
            throw invalidCredentials();
        }
        if (!Boolean.TRUE.equals(admin.getActive())) {
            log.warn("[ADMIN LOGIN FAILED] Inactive admin ID: {}", admin.getId());
            throw invalidCredentials();
        }

        admin.setLastLoginAt(clock.instant());
        AdminUser saved = adminUserRepository.save(admin);
        AdminIssuedSession session = sessionService.open(saved, userAgent, ip);
        auditService.record(saved.getId(), AdminAuditAction.LOGIN, AuditTargetType.NONE, null, null);
        log.info("[ADMIN LOGIN SUCCESS] Admin authenticated: ID={}, session={}",
                saved.getId(), session.session().getSessionId());
        return new AdminAuthResult(AdminProfile.from(saved), session);
    }

    /** @return the profile of an active admin; {@code 401 UNAUTHENTICATED} when unknown or inactive. */
    @Transactional(readOnly = true)
    public AdminProfile getProfile(Long adminId) {
        if (adminId == null) {
            throw new UnauthorizedException("Authentication required", ErrorCode.UNAUTHENTICATED);
        }
        AdminUser admin = adminUserRepository.findById(adminId)
                .filter(a -> Boolean.TRUE.equals(a.getActive()))
                .orElseThrow(() -> new UnauthorizedException("Authentication required", ErrorCode.UNAUTHENTICATED));
        return AdminProfile.from(admin);
    }

    private static UnauthorizedException invalidCredentials() {
        return new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE, ErrorCode.INVALID_CREDENTIALS);
    }
}
