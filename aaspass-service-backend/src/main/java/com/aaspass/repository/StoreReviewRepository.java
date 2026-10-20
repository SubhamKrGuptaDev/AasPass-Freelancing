package com.aaspass.repository;

import com.aaspass.entity.StoreReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StoreReviewRepository extends JpaRepository<StoreReview, Long> {

    List<StoreReview> findByStoreIdOrderByCreationDateTimeDesc(Long storeId);
}
