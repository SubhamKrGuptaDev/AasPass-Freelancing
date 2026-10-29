package com.aaspass.entity;

import com.aaspass.entity.base.BaseAuditEntity;
import com.aaspass.security.crypto.KycEncryptedConverter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.AttributeOverrides;
import jakarta.persistence.Convert;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Formula;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Entity representing an application user account and profile.
 * Implements Option A (Unified Account Model) where any user can hire local talent
 * and can also open/manage one or more neighborhood skill storefronts.
 * A single user can also have multiple saved addresses (Home, Work, Alternate).
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User extends BaseAuditEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "phone", length = 25)
    private String phone;

    @Convert(converter = KycEncryptedConverter.class)
    @Column(name = "aadhar_number", length = 255)
    private String aadharNumber;

    @Convert(converter = KycEncryptedConverter.class)
    @Column(name = "pan_number", length = 255)
    private String panNumber;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    /**
     * Last update time of the uploaded profile picture, or null when none is uploaded.
     * Read-only subquery so the image bytes in {@code user_profile_pictures} are never loaded with the user.
     */
    @Setter(AccessLevel.NONE)
    @Formula("(SELECT p.last_updated_date_time FROM user_profile_pictures p WHERE p.user_id = id)")
    private LocalDateTime profilePictureUpdatedAt;

    @Column(name = "city", length = 60)
    private String city;

    @Column(name = "area", length = 100)
    private String area;

    @Builder.Default
    @Column(name = "country", length = 60)
    private String country = "India";

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "member_since", length = 50)
    private String memberSince;

    @Builder.Default
    @Column(name = "has_store", nullable = false)
    private Boolean hasStore = false;

    /** Account is suspended while this instant is in the future; null when not suspended. */
    @Column(name = "suspended_until")
    private Instant suspendedUntil;

    @Column(name = "suspension_reason", length = 500)
    private String suspensionReason;

    @Builder.Default
    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "status", column = @Column(name = "phone_verification_status", nullable = false,
                    columnDefinition = "VARCHAR(16) NOT NULL DEFAULT 'UNVERIFIED'")),
            @AttributeOverride(name = "reason", column = @Column(name = "phone_verification_reason", length = 500)),
            @AttributeOverride(name = "decidedAt", column = @Column(name = "phone_verified_at")),
            @AttributeOverride(name = "decidedByAdminId", column = @Column(name = "phone_verified_by_admin_id"))
    })
    private VerificationCheck phoneVerification = new VerificationCheck();

    @Builder.Default
    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "status", column = @Column(name = "pan_verification_status", nullable = false,
                    columnDefinition = "VARCHAR(16) NOT NULL DEFAULT 'UNVERIFIED'")),
            @AttributeOverride(name = "reason", column = @Column(name = "pan_verification_reason", length = 500)),
            @AttributeOverride(name = "decidedAt", column = @Column(name = "pan_verified_at")),
            @AttributeOverride(name = "decidedByAdminId", column = @Column(name = "pan_verified_by_admin_id"))
    })
    private VerificationCheck panVerification = new VerificationCheck();

    @Builder.Default
    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "status", column = @Column(name = "aadhar_verification_status", nullable = false,
                    columnDefinition = "VARCHAR(16) NOT NULL DEFAULT 'UNVERIFIED'")),
            @AttributeOverride(name = "reason", column = @Column(name = "aadhar_verification_reason", length = 500)),
            @AttributeOverride(name = "decidedAt", column = @Column(name = "aadhar_verified_at")),
            @AttributeOverride(name = "decidedByAdminId", column = @Column(name = "aadhar_verified_by_admin_id"))
    })
    private VerificationCheck aadharVerification = new VerificationCheck();

    @Embedded
    private UserSocialMediaLinks userSocialMediaLinks;

    @JsonIgnore
    @Builder.Default
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Store> stores = new ArrayList<>();

    @JsonIgnore
    @Builder.Default
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Address> addresses = new ArrayList<>();

    public boolean isSuspended(Instant now) {
        return suspendedUntil != null && now != null && now.isBefore(suspendedUntil);
    }

    public boolean isFullyVerified() {
        return getPhoneVerification().isVerified()
                && getPanVerification().isVerified()
                && getAadharVerification().isVerified();
    }

    /** Never returns null: a missing embedded check is lazily replaced with an unverified one. */
    public VerificationCheck getPhoneVerification() {
        if (phoneVerification == null) phoneVerification = new VerificationCheck();
        return phoneVerification;
    }

    public VerificationCheck getPanVerification() {
        if (panVerification == null) panVerification = new VerificationCheck();
        return panVerification;
    }

    public VerificationCheck getAadharVerification() {
        if (aadharVerification == null) aadharVerification = new VerificationCheck();
        return aadharVerification;
    }

    /** Sets the phone and resets its verification when the value actually changes. */
    public void updatePhone(String newPhone) {
        if (!Objects.equals(this.phone, newPhone)) getPhoneVerification().reset();
        this.phone = newPhone;
    }

    public void updateAadharNumber(String newAadhar) {
        if (!Objects.equals(this.aadharNumber, newAadhar)) getAadharVerification().reset();
        this.aadharNumber = newAadhar;
    }

    public void updatePanNumber(String newPan) {
        if (!Objects.equals(this.panNumber, newPan)) getPanVerification().reset();
        this.panNumber = newPan;
    }

    // Backward-compatible alias accessors
    public UserSocialMediaLinks getUserSocialLinks() {
        return this.userSocialMediaLinks;
    }

    public void setUserSocialLinks(UserSocialMediaLinks links) {
        this.userSocialMediaLinks = links;
    }

    public void addAddress(Address address) {
        if (address != null) {
            if (this.addresses == null) {
                this.addresses = new ArrayList<>();
            }
            addresses.add(address);
            address.setUser(this);
        }
    }

    public void removeAddress(Address address) {
        if (address != null && addresses != null) {
            addresses.remove(address);
            address.setUser(null);
        }
    }

    public void addStore(Store store) {
        if (store != null) {
            if (this.stores == null) {
                this.stores = new ArrayList<>();
            }
            stores.add(store);
            store.setUser(this);
            this.hasStore = true;
        }
    }

    public void removeStore(Store store) {
        if (store != null && stores != null) {
            stores.remove(store);
            store.setUser(null);
            if (stores.isEmpty()) {
                this.hasStore = false;
            }
        }
    }
}
