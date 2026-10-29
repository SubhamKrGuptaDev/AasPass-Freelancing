package com.aaspass.admin.service;

import com.aaspass.admin.entity.AdminAuditAction;
import com.aaspass.admin.entity.AdminAuditEntry;
import com.aaspass.admin.entity.AuditTargetType;
import com.aaspass.admin.repository.AdminAuditRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Appends entries to the admin audit log. Joins the caller's transaction, so an audited action and
 * its entry commit or roll back together. Callers must never pass raw phone/PAN/Aadhaar values.
 */
@Service
public class AdminAuditService {

    private static final Logger log = LoggerFactory.getLogger(AdminAuditService.class);
    static final int MAX_DETAILS = 500;

    private final AdminAuditRepository repository;

    public AdminAuditService(AdminAuditRepository repository) {
        this.repository = repository;
    }

    /**
     * Records one admin action.
     *
     * @param adminId  acting admin (required)
     * @param action   what was done (required)
     * @param type     kind of target; {@code null} is stored as {@link AuditTargetType#NONE}
     * @param targetId target record id, or {@code null}
     * @param details  free text, truncated to {@value #MAX_DETAILS} chars; may be {@code null}
     */
    @Transactional
    public AdminAuditEntry record(Long adminId, AdminAuditAction action, AuditTargetType type,
                                  Long targetId, String details) {
        if (adminId == null || action == null) {
            throw new IllegalArgumentException("adminId and action are required");
        }
        AdminAuditEntry entry = new AdminAuditEntry();
        entry.setAdminId(adminId);
        entry.setAction(action);
        entry.setTargetType(type == null ? AuditTargetType.NONE : type);
        entry.setTargetId(targetId);
        entry.setDetails(truncate(details));
        AdminAuditEntry saved = repository.save(entry);
        log.info("[ADMIN AUDIT] admin={} action={} target={}:{}", adminId, action, entry.getTargetType(), targetId);
        return saved;
    }

    private static String truncate(String value) {
        if (value == null) {
            return null;
        }
        return value.length() <= MAX_DETAILS ? value : value.substring(0, MAX_DETAILS);
    }
}
