package com.aaspass.entity;

import com.aaspass.entity.base.BaseAuditEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Entity representing an individual store view event for tracking engagement history.
 */
@Entity
@Table(name = "store_view_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreViewRecord extends BaseAuditEntity {

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(name = "view_timestamp", nullable = false)
    private LocalDateTime viewTimestamp;

    @Column(name = "viewer_id", length = 50)
    private String viewerId;
}
