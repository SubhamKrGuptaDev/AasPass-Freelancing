package com.aaspass.repository.booking;

import com.aaspass.entity.booking.Booking;
import com.aaspass.entity.booking.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    /** Bookings of a store in the given statuses whose [startAt, endAt) intersects [start, end). */
    @Query("select b from Booking b where b.store.id = :storeId and b.status in :statuses "
            + "and b.startAt < :end and b.endAt > :start")
    List<Booking> findOverlapping(@Param("storeId") Long storeId,
                                  @Param("statuses") Collection<BookingStatus> statuses,
                                  @Param("start") LocalDateTime start,
                                  @Param("end") LocalDateTime end);

    /** Owner inbox page: store bookings in the statuses whose start lies in [from, to). */
    @Query(value = "select b from Booking b where b.store.id = :storeId and b.status in :statuses "
            + "and b.startAt >= :from and b.startAt < :to",
            countQuery = "select count(b) from Booking b where b.store.id = :storeId and b.status in :statuses "
            + "and b.startAt >= :from and b.startAt < :to")
    Page<Booking> findInbox(@Param("storeId") Long storeId,
                            @Param("statuses") Collection<BookingStatus> statuses,
                            @Param("from") LocalDateTime from,
                            @Param("to") LocalDateTime to,
                            Pageable pageable);

    /** Detaches a service from its bookings (they keep their name/price snapshot). */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("update Booking b set b.service = null where b.service.id = :serviceId")
    int detachService(@Param("serviceId") Long serviceId);

    @Query("select b.store.id from Booking b where b.id = :id")
    Optional<Long> findStoreIdById(@Param("id") Long id);

    Page<Booking> findByUserId(Long userId, Pageable pageable);

    Page<Booking> findByUserIdAndStatus(Long userId, BookingStatus status, Pageable pageable);

    /** Bookings of a store in the statuses decided at or after {@code from}. */
    @Query("select b from Booking b where b.store.id = :storeId and b.status in :statuses and b.decidedAt >= :from")
    List<Booking> findDecidedSince(@Param("storeId") Long storeId,
                                   @Param("statuses") Collection<BookingStatus> statuses,
                                   @Param("from") LocalDateTime from);

    long countByStoreIdAndStatus(Long storeId, BookingStatus status);
}
