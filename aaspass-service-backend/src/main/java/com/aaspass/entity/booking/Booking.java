package com.aaspass.entity.booking;

import com.aaspass.entity.Store;
import com.aaspass.entity.StoreServiceItem;
import com.aaspass.entity.User;
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
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** A user booking request for a store service, confirmed by the owner. Times are store-local. */
@Entity
@Table(name = "bookings", indexes = {
        @Index(name = "idx_booking_store_status_start", columnList = "store_id, status, start_at"),
        @Index(name = "idx_booking_user_status", columnList = "user_id, status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking extends BaseAuditEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    /** Null once the service is deleted; the snapshot fields below keep the history readable. */
    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "service_id")
    private StoreServiceItem service;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "start_at", nullable = false)
    private LocalDateTime startAt;

    @Column(name = "end_at", nullable = false)
    private LocalDateTime endAt;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private BookingStatus status = BookingStatus.PENDING;

    @Column(name = "note", length = 500)
    private String note;

    @Column(name = "owner_note", length = 500)
    private String ownerNote;

    @Column(name = "price_at_booking", precision = 10, scale = 2)
    private BigDecimal priceAtBooking;

    @Column(name = "service_name_at_booking", length = 150)
    private String serviceNameAtBooking;

    @Column(name = "decided_at")
    private LocalDateTime decidedAt;

    @Builder.Default
    @Column(name = "auto_rejected", nullable = false, columnDefinition = "BOOLEAN NOT NULL DEFAULT FALSE")
    private Boolean autoRejected = false;
}
