package com.aaspass.entity.base;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;

import java.io.Serializable;
import java.util.Objects;

/**
 * Base mapped superclass providing a database-generated primary key (ID).
 * <p>
 * Specifications:
 * - Only the getId() method is available.
 * - No setter is exposed for the ID, ensuring immutable identity from application code.
 * - Hibernate/JPA populates this field via direct reflection/field access.
 */
@MappedSuperclass
@Getter
public abstract class BaseIdEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    // Explicitly NO setId() method is defined or generated.

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        BaseIdEntity that = (BaseIdEntity) o;
        return id != null && Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
