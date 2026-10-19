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

import java.math.BigDecimal;

/**
 * Entity representing an individual service package offered by a Store
 * (e.g., "30-sec Instagram Reel / Short", price 450, duration "24 hrs").
 */
@Entity
@Table(name = "store_services")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreServiceItem extends BaseAuditEntity {

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "duration", length = 100)
    private String duration;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}
