package com.aaspass.repository.booking;

import com.aaspass.entity.booking.BookingFunnelEvent;
import com.aaspass.entity.booking.FunnelStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface BookingFunnelEventRepository extends JpaRepository<BookingFunnelEvent, Long> {

    boolean existsByStoreIdAndVisitorIdAndStepAndServiceIdAndOccurredAtAfter(
            Long storeId, String visitorId, FunnelStep step, Long serviceId, LocalDateTime after);

    boolean existsByStoreIdAndVisitorIdAndStepAndServiceIdIsNullAndOccurredAtAfter(
            Long storeId, String visitorId, FunnelStep step, LocalDateTime after);

    long countBySubmitterIpAndOccurredAtAfter(String submitterIp, LocalDateTime after);
}
