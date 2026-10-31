package com.aaspass.repository.booking;

import com.aaspass.entity.booking.BookingFunnelEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingFunnelEventRepository extends JpaRepository<BookingFunnelEvent, Long> {
}
