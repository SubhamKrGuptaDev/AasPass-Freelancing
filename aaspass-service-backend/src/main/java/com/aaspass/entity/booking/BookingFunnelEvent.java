package com.aaspass.entity.booking;

import com.aaspass.entity.Store;
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

import java.time.LocalDateTime;

/** One tracked step of a visitor booking funnel. */
@Entity
@Table(name = "booking_funnel_events", indexes = {
        @Index(name = "idx_funnel_store_step_time", columnList = "store_id, step, occurred_at"),
        @Index(name = "idx_funnel_store_visitor_time", columnList = "store_id, visitor_id, occurred_at"),
        @Index(name = "idx_funnel_ip_time", columnList = "submitter_ip, occurred_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingFunnelEvent extends BaseAuditEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    /** Plain column (no FK) so deleted services keep their history. */
    @Column(name = "service_id")
    private Long serviceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "step", nullable = false, length = 30)
    private FunnelStep step;

    @Column(name = "visitor_id", nullable = false, length = 64)
    private String visitorId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "occurred_at", nullable = false)
    private LocalDateTime occurredAt;

    @Column(name = "submitter_ip", length = 45)
    private String submitterIp;
}
