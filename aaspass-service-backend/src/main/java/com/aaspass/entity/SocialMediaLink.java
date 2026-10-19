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
 * Entity representing dynamic verified social media and external portfolio channels
 * linked to a store (e.g. Instagram, LinkedIn, GitHub, YouTube, Behance, Custom Portfolio).
 */
@Entity
@Table(name = "store_social_links")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SocialMediaLink extends BaseAuditEntity {

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(name = "name", nullable = false, length = 60)
    private String name;

    @Column(name = "url", nullable = false, length = 500)
    private String url;
}
