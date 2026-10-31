package com.aaspass.repository.booking;

import com.aaspass.entity.booking.StoreAvailabilityException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface StoreAvailabilityExceptionRepository extends JpaRepository<StoreAvailabilityException, Long> {

    List<StoreAvailabilityException> findByStoreIdAndDateGreaterThanEqualOrderByDateAsc(Long storeId, LocalDate from);

    List<StoreAvailabilityException> findByStoreIdAndDate(Long storeId, LocalDate date);
}
