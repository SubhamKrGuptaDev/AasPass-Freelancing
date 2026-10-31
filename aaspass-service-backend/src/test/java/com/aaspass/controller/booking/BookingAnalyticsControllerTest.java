package com.aaspass.controller.booking;

import com.aaspass.booking.StoreTime;
import com.aaspass.entity.Store;
import com.aaspass.entity.StoreServiceItem;
import com.aaspass.entity.User;
import com.aaspass.entity.booking.Booking;
import com.aaspass.entity.booking.BookingFunnelEvent;
import com.aaspass.entity.booking.BookingStatus;
import com.aaspass.entity.booking.FunnelStep;
import com.aaspass.repository.StoreRepository;
import com.aaspass.repository.StoreServiceItemRepository;
import com.aaspass.repository.UserRepository;
import com.aaspass.repository.booking.BookingFunnelEventRepository;
import com.aaspass.repository.booking.BookingRepository;
import com.aaspass.support.AuthTestSupport;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.nullValue;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
class BookingAnalyticsControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private StoreRepository storeRepository;
    @Autowired
    private StoreServiceItemRepository serviceItemRepository;
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private BookingFunnelEventRepository eventRepository;
    @Autowired
    private Clock clock;

    private Store store;
    private StoreServiceItem service;
    private LocalDateTime now;

    @BeforeEach
    void setUp() {
        Long uid = userRepository.findByUsername("priya").orElseThrow().getId();
        store = storeRepository.findByUserId(uid).get(0);
        store.setIsActive(true);
        store.setAdminBlocked(false);
        store = storeRepository.saveAndFlush(store);
        service = serviceItemRepository.findByStoreId(store.getId()).get(0);
        now = StoreTime.now(clock);
    }

    private Cookie[] login(String username) throws Exception {
        return AuthTestSupport.login(mockMvc, username, "password123");
    }

    private void event(String visitor, FunnelStep step, LocalDateTime at, Long userId, Long serviceId) {
        eventRepository.saveAndFlush(BookingFunnelEvent.builder().store(store).visitorId(visitor).step(step)
                .occurredAt(at).userId(userId).serviceId(serviceId).build());
    }

    private String url(String suffix) {
        return "/api/stores/" + store.getId() + "/booking-analytics" + suffix;
    }

    @Test
    void funnelCountsDistinctVisitors() throws Exception {
        Long sid = service.getId();
        event("v1", FunnelStep.BOOK_CLICK, now.minusHours(5), null, sid);
        event("v1", FunnelStep.BOOK_CLICK, now.minusHours(4), null, sid);
        event("v2", FunnelStep.BOOK_CLICK, now.minusHours(3), null, sid);
        event("v1", FunnelStep.BOOKING_PAGE_VIEW, now.minusHours(4), null, sid);
        mockMvc.perform(get(url("?period=7D")).cookie(login("priya")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.funnel", hasSize(4)))
                .andExpect(jsonPath("$.data.funnel[0].step", is("BOOK_CLICK")))
                .andExpect(jsonPath("$.data.funnel[0].visitors", is(2)))
                .andExpect(jsonPath("$.data.funnel[0].conversionPercent", is(100.0)))
                .andExpect(jsonPath("$.data.funnel[1].visitors", is(1)))
                .andExpect(jsonPath("$.data.funnel[1].conversionPercent", is(50.0)))
                .andExpect(jsonPath("$.data.funnel[2].visitors", is(0)))
                .andExpect(jsonPath("$.data.funnel[2].conversionPercent", is(0.0)));
    }

    @Test
    void trendHas7BucketsFor7D() throws Exception {
        mockMvc.perform(get(url("?period=7D")).cookie(login("priya")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.buckets", hasSize(7)))
                .andExpect(jsonPath("$.data.clicks", hasSize(7)))
                .andExpect(jsonPath("$.data.bookings", hasSize(7)))
                .andExpect(jsonPath("$.data.abandoned", hasSize(7)));
        mockMvc.perform(get(url("?period=30D")).cookie(login("priya")))
                .andExpect(jsonPath("$.data.buckets", hasSize(30)));
        mockMvc.perform(get(url("?period=ALL")).cookie(login("priya")))
                .andExpect(jsonPath("$.data.buckets", hasSize(90)));
    }

    @Test
    void servicesBreakdown() throws Exception {
        Long sid = service.getId();
        event("v1", FunnelStep.BOOK_CLICK, now.minusHours(5), null, sid);
        event("v2", FunnelStep.BOOK_CLICK, now.minusHours(5), null, sid);
        event("v1", FunnelStep.BOOKED, now.minusHours(5).plusMinutes(10), 3L, sid);
        event("v3", FunnelStep.BOOK_CLICK, now.minusHours(5), null, 999999L);
        User aman = userRepository.findByUsername("aman").orElseThrow();
        LocalDateTime start = now.plusDays(2);
        bookingRepository.saveAndFlush(Booking.builder().store(store).service(service).user(aman)
                .startAt(start).endAt(start.plusMinutes(30)).durationMinutes(30)
                .status(BookingStatus.CONFIRMED).decidedAt(now.minusHours(1))
                .serviceNameAtBooking(service.getName()).build());
        bookingRepository.saveAndFlush(Booking.builder().store(store).service(service).user(aman)
                .startAt(start.plusHours(2)).endAt(start.plusHours(2).plusMinutes(30)).durationMinutes(30)
                .status(BookingStatus.PENDING).serviceNameAtBooking(service.getName()).build());
        mockMvc.perform(get(url("?period=7D")).cookie(login("priya")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.confirmed", is(1)))
                .andExpect(jsonPath("$.data.pendingCount", is(1)))
                .andExpect(jsonPath("$.data.services", hasSize(2)))
                .andExpect(jsonPath("$.data.services[0].serviceId", is(sid.intValue())))
                .andExpect(jsonPath("$.data.services[0].name", is(service.getName())))
                .andExpect(jsonPath("$.data.services[0].clicks", is(2)))
                .andExpect(jsonPath("$.data.services[0].bookings", is(1)))
                .andExpect(jsonPath("$.data.services[0].confirmed", is(1)))
                .andExpect(jsonPath("$.data.services[0].conversionPercent", is(50.0)))
                .andExpect(jsonPath("$.data.services[1].name", is("Deleted service")))
                .andExpect(jsonPath("$.data.services[1].conversionPercent", is(0.0)));
    }

    @Test
    void abandonedListOnlyLoggedIn() throws Exception {
        Long sid = service.getId();
        Long amanId = userRepository.findByUsername("aman").orElseThrow().getId();
        event("anon", FunnelStep.BOOK_CLICK, now.minusHours(6), null, sid);
        event("lin", FunnelStep.BOOK_CLICK, now.minusHours(5), null, sid);
        event("lin", FunnelStep.SLOT_SELECTED, now.minusHours(5).plusMinutes(5), amanId, sid);
        event("done", FunnelStep.BOOK_CLICK, now.minusHours(4), null, sid);
        event("done", FunnelStep.BOOKED, now.minusHours(4).plusMinutes(5), amanId, sid);
        event("fresh", FunnelStep.BOOK_CLICK, now.minusMinutes(10), amanId, sid);
        mockMvc.perform(get(url("/abandoned?period=7D&page=0&size=10")).cookie(login("priya")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements", is(1)))
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].userId", is(amanId.intValue())))
                .andExpect(jsonPath("$.data.content[0].lastStep", is("SLOT_SELECTED")))
                .andExpect(jsonPath("$.data.content[0].serviceName", is(service.getName())));
        mockMvc.perform(get(url("?period=7D")).cookie(login("priya")))
                .andExpect(jsonPath("$.data.abandonedCount", is(2)))
                .andExpect(jsonPath("$.data.abandonedPercent", is(66.7)));
    }

    @Test
    void nonOwnerForbidden() throws Exception {
        mockMvc.perform(get(url("?period=7D")).cookie(login("aman"))).andExpect(status().isForbidden());
        mockMvc.perform(get(url("/abandoned?period=7D")).cookie(login("aman"))).andExpect(status().isForbidden());
        mockMvc.perform(get(url("?period=7D"))).andExpect(status().isUnauthorized());
    }

    @Test
    void badPeriod400() throws Exception {
        mockMvc.perform(get(url("?period=1Y")).cookie(login("priya"))).andExpect(status().isBadRequest());
        mockMvc.perform(get(url("/abandoned?period=nope")).cookie(login("priya")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void detachedServiceBookingKeepsSnapshotName() throws Exception {
        User aman = userRepository.findByUsername("aman").orElseThrow();
        LocalDateTime start = now.plusDays(2);
        bookingRepository.saveAndFlush(Booking.builder().store(store).service(null).user(aman)
                .startAt(start).endAt(start.plusMinutes(30)).durationMinutes(30)
                .status(BookingStatus.CONFIRMED).decidedAt(now.minusHours(1))
                .serviceNameAtBooking("Old Reel").build());
        bookingRepository.saveAndFlush(Booking.builder().store(store).service(service).user(aman)
                .startAt(start.plusHours(3)).endAt(start.plusHours(3).plusMinutes(30)).durationMinutes(30)
                .status(BookingStatus.COMPLETED).decidedAt(now.minusHours(2))
                .serviceNameAtBooking(service.getName()).build());
        mockMvc.perform(get(url("?period=7D")).cookie(login("priya")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.confirmed", is(2)))
                .andExpect(jsonPath("$.data.services", hasSize(2)))
                .andExpect(jsonPath("$.data.services[?(@.name=='Old Reel')].confirmed", contains(1)))
                .andExpect(jsonPath("$.data.services[?(@.name=='Old Reel')].serviceId", contains(nullValue())))
                .andExpect(jsonPath("$.data.services[*].confirmed", containsInAnyOrder(1, 1)));
    }

    @Test
    void confirmedBeforePeriodNotCounted() throws Exception {
        User aman = userRepository.findByUsername("aman").orElseThrow();
        LocalDateTime start = now.plusDays(2);
        bookingRepository.saveAndFlush(Booking.builder().store(store).service(service).user(aman)
                .startAt(start).endAt(start.plusMinutes(30)).durationMinutes(30)
                .status(BookingStatus.CONFIRMED).decidedAt(now.minusDays(20))
                .serviceNameAtBooking(service.getName()).build());
        mockMvc.perform(get(url("?period=7D")).cookie(login("priya")))
                .andExpect(jsonPath("$.data.confirmed", is(0)));
        mockMvc.perform(get(url("?period=30D")).cookie(login("priya")))
                .andExpect(jsonPath("$.data.confirmed", is(1)));
    }
}
