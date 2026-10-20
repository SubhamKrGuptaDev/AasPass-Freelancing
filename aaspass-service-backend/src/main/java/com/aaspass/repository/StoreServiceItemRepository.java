package com.aaspass.repository;

import com.aaspass.entity.StoreServiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StoreServiceItemRepository extends JpaRepository<StoreServiceItem, Long> {

    List<StoreServiceItem> findByStoreId(Long storeId);
}
