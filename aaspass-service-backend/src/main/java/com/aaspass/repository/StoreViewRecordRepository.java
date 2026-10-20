package com.aaspass.repository;

import com.aaspass.entity.StoreViewRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StoreViewRecordRepository extends JpaRepository<StoreViewRecord, Long> {

    List<StoreViewRecord> findByStoreId(Long storeId);
}
