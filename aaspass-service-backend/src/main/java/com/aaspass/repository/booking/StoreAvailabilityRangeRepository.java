package com.aaspass.repository.booking;

import com.aaspass.entity.booking.StoreAvailabilityRange;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StoreAvailabilityRangeRepository extends JpaRepository<StoreAvailabilityRange, Long> {

    List<StoreAvailabilityRange> findByStoreId(Long storeId);
}
