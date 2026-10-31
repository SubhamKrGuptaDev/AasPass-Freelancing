package com.aaspass.service.booking;

import com.aaspass.booking.StoreTime;
import com.aaspass.dto.booking.FunnelEventRequest;
import com.aaspass.entity.Store;
import com.aaspass.entity.booking.BookingFunnelEvent;
import com.aaspass.entity.booking.FunnelStep;
import com.aaspass.exception.BadRequestException;
import com.aaspass.exception.RateLimitedException;
import com.aaspass.exception.ResourceNotFoundException;
import com.aaspass.repository.StoreRepository;
import com.aaspass.repository.booking.BookingFunnelEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.Optional;

/** Records client-reported booking funnel steps, silently skipping owners and duplicates. */
@Service
public class FunnelService {

    private static final Logger log = LoggerFactory.getLogger(FunnelService.class);

    static final int DEDUPE_MINUTES = 30;
    static final int THROTTLE_LIMIT = 120;
    static final int THROTTLE_WINDOW_HOURS = 1;

    private final StoreRepository storeRepository;
    private final BookingFunnelEventRepository eventRepository;
    private final Clock clock;

    public FunnelService(StoreRepository storeRepository, BookingFunnelEventRepository eventRepository, Clock clock) {
        this.storeRepository = storeRepository;
        this.eventRepository = eventRepository;
        this.clock = clock;
    }

    @Transactional
    public void record(Long storeId, FunnelEventRequest req, Optional<Long> callerId, String ip) {
        if (req.step() == FunnelStep.BOOKED) {
            throw new BadRequestException("BOOKED is recorded by the server");
        }
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store", "id", storeId));
        if (store.isAdminHidden(clock.instant())) {
            throw new ResourceNotFoundException("Store", "id", storeId);
        }
        Long ownerId = store.getUser() != null ? store.getUser().getId() : null;
        if (ownerId != null && callerId.isPresent() && ownerId.equals(callerId.get())) {
            log.debug("[FUNNEL] owner event skipped store={}", storeId);
            return;
        }

        LocalDateTime now = StoreTime.now(clock);
        if (ip != null && eventRepository.countBySubmitterIpAndOccurredAtAfter(
                ip, now.minusHours(THROTTLE_WINDOW_HOURS)) >= THROTTLE_LIMIT) {
            log.warn("[FUNNEL] throttled ip={}", ip);
            throw new RateLimitedException("Too many requests, please try again later.");
        }

        LocalDateTime since = now.minusMinutes(DEDUPE_MINUTES);
        boolean duplicate = req.serviceId() == null
                ? eventRepository.existsByStoreIdAndVisitorIdAndStepAndServiceIdIsNullAndOccurredAtAfter(
                        storeId, req.visitorId(), req.step(), since)
                : eventRepository.existsByStoreIdAndVisitorIdAndStepAndServiceIdAndOccurredAtAfter(
                        storeId, req.visitorId(), req.step(), req.serviceId(), since);
        if (duplicate) {
            return;
        }

        eventRepository.save(BookingFunnelEvent.builder()
                .store(store).serviceId(req.serviceId()).step(req.step())
                .visitorId(req.visitorId()).userId(callerId.orElse(null))
                .occurredAt(now).submitterIp(ip).build());
    }
}
