package com.aaspass.entity;

import com.aaspass.entity.base.BaseAuditEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity representing a neighborhood digital skill storefront.
 * Supports multi-store ownership under a unified User account.
 */
@Entity
@Table(name = "stores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Store extends BaseAuditEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "owner_name", length = 100)
    private String ownerName;

    @Column(name = "store_name", nullable = false, length = 150)
    private String storeName;

    @Column(name = "tagline", length = 255)
    private String tagline;

    @Column(name = "category", nullable = false, length = 100)
    private String category;

    @Builder.Default
    @ElementCollection
    @CollectionTable(name = "store_skills", joinColumns = @JoinColumn(name = "store_id"))
    @Column(name = "skill", length = 100)
    private List<String> skills = new ArrayList<>();

    @Builder.Default
    @Column(name = "experience_years")
    private Integer experienceYears = 0;

    @Column(name = "hourly_rate", precision = 10, scale = 2)
    private BigDecimal hourlyRate;

    @Column(name = "starting_price", precision = 10, scale = 2)
    private BigDecimal startingPrice;

    @Column(name = "area", nullable = false, length = 100)
    private String area;

    @Column(name = "city", nullable = false, length = 60)
    private String city;

    @Builder.Default
    @Column(name = "country", nullable = false, columnDefinition = "VARCHAR(60) NOT NULL DEFAULT 'India'")
    private String country = "India";

//    @Builder.Default
//    @Column(name = "distance_km")
//    private Double distanceKm = 0.0;

    @Builder.Default
    @Column(name = "service_radius_km")
    private Integer serviceRadiusKm = 10;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

//    @Builder.Default
//    @Column(name = "rating")
//    private Double rating = 5.0;

//    @Builder.Default
//    @Column(name = "review_count")
//    private Integer reviewCount = 0;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Builder.Default
    @Column(name = "banner_gradient", length = 100)
    private String bannerGradient = "from-indigo-500 to-purple-600";

    @Builder.Default
    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable = true;

    /**
     * Whether the store is published and discoverable in search. New stores start inactive until the
     * owner activates them. The column's DB default is TRUE only so that {@code ddl-auto=update} backfills
     * pre-existing stores as active when it adds the column; Hibernate always writes this field on insert.
     */
    @Builder.Default
    @Column(name = "is_active", nullable = false, columnDefinition = "BOOLEAN NOT NULL DEFAULT TRUE")
    private Boolean isActive = false;

    @Column(name = "member_since", length = 50)
    private String memberSince;

    @Embedded
    @Builder.Default
    private StoreEngagementStats views = new StoreEngagementStats();

    @Embedded
    private StoreSocialMediaLinks storeSocialMediaLinks;

    @Builder.Default
    @OneToMany(mappedBy = "store", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StoreServiceItem> services = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "store", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SocialMediaLink> socialMediaLinks = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "store", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StoreReview> reviews = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "store", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StoreViewRecord> viewHistory = new ArrayList<>();

    public void addService(StoreServiceItem serviceItem) {
        if (serviceItem != null) {
            if (this.services == null) {
                this.services = new ArrayList<>();
            }
            services.add(serviceItem);
            serviceItem.setStore(this);
        }
    }

    public void removeService(StoreServiceItem serviceItem) {
        if (serviceItem != null && services != null) {
            services.remove(serviceItem);
            serviceItem.setStore(null);
        }
    }

    public void addSocialMediaLink(SocialMediaLink link) {
        if (link != null) {
            if (this.socialMediaLinks == null) {
                this.socialMediaLinks = new ArrayList<>();
            }
            socialMediaLinks.add(link);
            link.setStore(this);
        }
    }

    public void addReview(StoreReview review) {
        if (review != null) {
            if (this.reviews == null) {
                this.reviews = new ArrayList<>();
            }
            reviews.add(review);
            review.setStore(this);
        }
    }

    public void addViewRecord(StoreViewRecord record) {
        if (record != null) {
            if (this.viewHistory == null) {
                this.viewHistory = new ArrayList<>();
            }
            viewHistory.add(record);
            record.setStore(this);
        }
    }
}
