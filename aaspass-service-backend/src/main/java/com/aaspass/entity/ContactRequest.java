package com.aaspass.entity;

import com.aaspass.entity.base.BaseAuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * A query, feedback or complaint submitted through the public contact form. The submitting user
 * is linked when the request was made while logged in; admin-only fields are never exposed publicly.
 */
@Entity
@Table(name = "contact_requests", indexes = {
        @Index(name = "idx_contact_status_created", columnList = "status, creation_date_time"),
        @Index(name = "idx_contact_email_created", columnList = "email, creation_date_time"),
        @Index(name = "idx_contact_ip_created", columnList = "submitter_ip, creation_date_time")
})
@Getter
@Setter
public class ContactRequest extends BaseAuditEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20, columnDefinition = "VARCHAR(20) NOT NULL")
    private ContactRequestType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20, columnDefinition = "VARCHAR(20) NOT NULL")
    private ContactRequestStatus status = ContactRequestStatus.NEW;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "email", nullable = false, length = 100)
    private String email;

    @Column(name = "phone", length = 25)
    private String phone;

    @Column(name = "subject", nullable = false, length = 150)
    private String subject;

    @Column(name = "message", nullable = false, length = 2000)
    private String message;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "submitter_ip", length = 64)
    private String submitterIp;

    @Column(name = "admin_note", length = 2000)
    private String adminNote;

    @Column(name = "handled_by_admin_id")
    private Long handledByAdminId;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
}
