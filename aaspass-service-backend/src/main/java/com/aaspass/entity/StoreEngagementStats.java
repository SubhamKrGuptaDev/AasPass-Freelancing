package com.aaspass.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

/**
 * Embeddable representing aggregate view engagement statistics for a store
 * across daily, weekly, monthly, and lifetime timeframes.
 */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreEngagementStats implements Serializable {

    @Builder.Default
    @Column(name = "views_daily")
    private Integer daily = 0;

    @Builder.Default
    @Column(name = "views_weekly")
    private Integer weekly = 0;

    @Builder.Default
    @Column(name = "views_monthly")
    private Integer monthly = 0;

    @Builder.Default
    @Column(name = "views_lifetime")
    private Integer lifetime = 0;
}
