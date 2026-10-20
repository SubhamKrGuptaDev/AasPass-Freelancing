package com.aaspass.repository;

import com.aaspass.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StoreRepository extends JpaRepository<Store, Long> {

    List<Store> findByUserId(Long userId);

    List<Store> findByCityIgnoreCase(String city);

    List<Store> findByCategoryIgnoreCase(String category);

    boolean existsByStoreName(String storeName);

    boolean existsByUserIdAndStoreName(Long userId, String storeName);

    @Query("SELECT DISTINCT s FROM Store s " +
            "LEFT JOIN s.skills sk " +
            "WHERE (:city IS NULL OR :city = '' OR LOWER(s.city) = LOWER(:city)) " +
            "AND (:category IS NULL OR :category = '' OR LOWER(s.category) = LOWER(:category)) " +
            "AND (:availableOnly IS NULL OR :availableOnly = false OR s.isAvailable = true) " +
            "AND (:query IS NULL OR :query = '' OR " +
            "     LOWER(s.storeName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "     LOWER(s.ownerName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "     LOWER(s.tagline) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "     LOWER(s.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "     LOWER(s.area) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "     LOWER(sk) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Store> searchStores(
            @Param("city") String city,
            @Param("category") String category,
            @Param("query") String query,
            @Param("availableOnly") Boolean availableOnly
    );
}
