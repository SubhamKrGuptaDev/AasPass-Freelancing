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

/**
 * Entity representing a user's address.
 * A single user can have multiple addresses (e.g. Home, Work, Alternate locations).
 */
@Entity
@Table(name = "addresses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address extends BaseAuditEntity {

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "address_type", length = 30)
    private String addressType; // e.g., "HOME", "WORK", "OTHER"

    @Column(name = "address_line", length = 255)
    private String addressLine; // House/Flat No, Building, Street

    @Column(name = "area", nullable = false, length = 100)
    private String area; // Neighborhood (e.g. Indiranagar, HSR Layout)

    @Column(name = "city", nullable = false, length = 60)
    private String city; // City (e.g. Bengaluru, Delhi NCR)

    @Column(name = "state", length = 60)
    private String state; // State (e.g. Karnataka, Maharashtra)

    @Column(name = "pincode", length = 10)
    private String pincode; // 6-digit postal code

    @Column(name = "landmark", length = 150)
    private String landmark;

    @Column(name = "latitude")
    private Double latitude; // Coordinate for hyperlocal distance calculations

    @Column(name = "longitude")
    private Double longitude;

    @Builder.Default
    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;
}
