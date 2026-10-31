package com.aaspass.repository.booking;

import com.aaspass.entity.booking.Booking;
import com.aaspass.entity.booking.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    /** Bookings of a store in the given statuses whose [startAt, endAt) intersects [start, end). */
    @Query("select b from Booking b where b.store.id = :storeId and b.status in :statuses "
            + "and b.startAt < :end and b.endAt > :start")
    List<Booking> findOverlapping(@Param("storeId") Long storeId,
                                  @Param("statuses") Collection<BookingStatus> statuses,
                                  @Param("start") LocalDateTime start,
                                  @Param("end") LocalDateTime end);

    Page<Booking> findByUserId(Long userId, Pageable pageable);

    Page<Booking> findByUserIdAndStatus(Long userId, BookingStatus status, Pageable pageable);
}
