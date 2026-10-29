package com.aaspass.admin.entity;

import com.aaspass.entity.base.BaseAuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Append-only record of an administrator action. Details never hold raw phone/PAN/Aadhaar values. */
@Entity
@Table(name = "admin_audit_log", indexes = {
        @Index(name = "idx_admin_audit_target", columnList = "target_type, target_id")
})
@Getter
@Setter
@NoArgsConstructor
public class AdminAuditEntry extends BaseAuditEntity {

    @Column(name = "admin_id", nullable = false)
    private Long adminId;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false, length = 32)
    private AdminAuditAction action;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false, length = 16)
    private AuditTargetType targetType;

    @Column(name = "target_id")
    private Long targetId;

    @Column(name = "details", length = 500)
    private String details;
}
