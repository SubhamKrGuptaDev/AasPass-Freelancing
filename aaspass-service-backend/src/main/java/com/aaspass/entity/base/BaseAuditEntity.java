package com.aaspass.entity.base;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Base mapped superclass providing auditing timestamps.
 * Extends {@link BaseIdEntity} so inheriting entities automatically receive:
 * 1. Read-only ID (via getId() without any setter).
 * 2. creationDateTime (set automatically on initial persist, immutable afterwards).
 * 3. lastUpdatedDateTime (set on persist and automatically refreshed on every update).
 */
@MappedSuperclass
@Getter
@Setter
public abstract class BaseAuditEntity extends BaseIdEntity {

    @Column(name = "creation_date_time", nullable = false, updatable = false)
    private LocalDateTime creationDateTime;

    @Column(name = "last_updated_date_time", nullable = false)
    private LocalDateTime lastUpdatedDateTime;

    @PrePersist
    public void onPrePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (this.creationDateTime == null) {
            this.creationDateTime = now;
        }
        if (this.lastUpdatedDateTime == null) {
            this.lastUpdatedDateTime = now;
        }
    }

    @PreUpdate
    public void onPreUpdate() {
        this.lastUpdatedDateTime = LocalDateTime.now();
    }

    // Convenience alias matching the client model's lastUpdateDateTime property name
    public LocalDateTime getLastUpdateDateTime() {
        return this.lastUpdatedDateTime;
    }

    public void setLastUpdateDateTime(LocalDateTime lastUpdateDateTime) {
        this.lastUpdatedDateTime = lastUpdateDateTime;
    }
}
