package com.aaspass.admin.entity;

import com.aaspass.entity.base.BaseAuditEntity;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** An administrator account, kept entirely separate from end-user accounts. */
@Entity
@Table(name = "admin_users", uniqueConstraints = {
        @UniqueConstraint(name = "uk_admin_users_email", columnNames = "email")
})
@Getter
@Setter
@NoArgsConstructor
public class AdminUser extends BaseAuditEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "email", nullable = false, length = 255)
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;
}
