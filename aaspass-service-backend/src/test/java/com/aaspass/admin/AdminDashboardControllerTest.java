package com.aaspass.admin;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.aaspass.entity.ContactRequest;
import com.aaspass.entity.ContactRequestType;
import com.aaspass.entity.Store;
import com.aaspass.entity.User;
import com.aaspass.repository.ContactRequestRepository;
import com.aaspass.repository.StoreRepository;
import com.aaspass.repository.UserRepository;
import com.aaspass.support.AdminTestSupport;
import jakarta.persistence.EntityManager;
import jakarta.servlet.http.Cookie;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/** Admin dashboard summary endpoint through the real admin security chain. */
@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
class AdminDashboardControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired StoreRepository storeRepository;
    @Autowired UserRepository userRepository;
    @Autowired ContactRequestRepository contactRequestRepository;
    @Autowired EntityManager entityManager;

    private Cookie[] admin;

    @BeforeEach
    void setUp() throws Exception {
        admin = AdminTestSupport.login(mockMvc);
        for (Store s : storeRepository.findAll()) {
            s.setIsActive(true);
            s.setAdminBlocked(false);
            s.setAdminReviewedAt(null);
            storeRepository.saveAndFlush(s);
        }
    }

    @Test
    void dashboardCountsReflectModeration() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard").cookie(admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalUsers", is(3)))
                .andExpect(jsonPath("$.data.totalStores", is(2)))
                .andExpect(jsonPath("$.data.pendingUsers", is(3)))
                .andExpect(jsonPath("$.data.unreviewedStores", is(2)))
                .andExpect(jsonPath("$.data.blockedStores", is(0)))
                .andExpect(jsonPath("$.data.suspendedUsers", is(0)))
                .andExpect(jsonPath("$.data.newContactRequests", is(0)));

        Store reviewed = storeRepository.findAll().stream()
                .filter(s -> "PixelCraft Studios".equals(s.getStoreName())).findFirst().orElseThrow();
        Store blocked = storeRepository.findAll().stream()
                .filter(s -> "CodeSpark Lab".equals(s.getStoreName())).findFirst().orElseThrow();
        reviewed.setAdminReviewedAt(Instant.now());
        storeRepository.saveAndFlush(reviewed);
        blocked.setAdminBlocked(true);
        storeRepository.saveAndFlush(blocked);
        User rohan = userRepository.findByEmail("rohan.gupta@example.com").orElseThrow();
        rohan.setSuspendedUntil(Instant.now().plus(5, ChronoUnit.DAYS));
        userRepository.saveAndFlush(rohan);
        ContactRequest inbound = new ContactRequest();
        inbound.setType(ContactRequestType.QUERY);
        inbound.setName("Ravi");
        inbound.setEmail("ravi@example.com");
        inbound.setSubject("Hello");
        inbound.setMessage("Hi there");
        contactRequestRepository.saveAndFlush(inbound);

        mockMvc.perform(get("/api/admin/dashboard").cookie(admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.unreviewedStores", is(1)))
                .andExpect(jsonPath("$.data.blockedStores", is(1)))
                .andExpect(jsonPath("$.data.suspendedUsers", is(1)))
                .andExpect(jsonPath("$.data.newContactRequests", is(1)))
                .andExpect(jsonPath("$.data.activeStores", is(1)))
                .andExpect(jsonPath("$.data.recentUnreviewedStores", hasSize(1)));
    }

    @Test
    void newActivityDefaultsToDailyAndWidensWithPeriod() throws Exception {
        backdate("users", userRepository.findByEmail("rohan.gupta@example.com").orElseThrow().getId(), 3);
        Store old = storeRepository.findAll().stream()
                .filter(s -> "CodeSpark Lab".equals(s.getStoreName())).findFirst().orElseThrow();
        backdate("stores", old.getId(), 20);

        mockMvc.perform(get("/api/admin/dashboard/new-activity").cookie(admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.period", is("DAILY")))
                .andExpect(jsonPath("$.data.newUsers", is(2)))
                .andExpect(jsonPath("$.data.newStores", is(1)))
                .andExpect(jsonPath("$.data.recentUsers", hasSize(2)))
                .andExpect(jsonPath("$.data.recentStores", hasSize(1)));

        mockMvc.perform(get("/api/admin/dashboard/new-activity").param("period", "weekly").cookie(admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.period", is("WEEKLY")))
                .andExpect(jsonPath("$.data.newUsers", is(3)))
                .andExpect(jsonPath("$.data.newStores", is(1)));

        mockMvc.perform(get("/api/admin/dashboard/new-activity").param("period", "MONTHLY").cookie(admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.period", is("MONTHLY")))
                .andExpect(jsonPath("$.data.newUsers", is(3)))
                .andExpect(jsonPath("$.data.newStores", is(2)))
                .andExpect(jsonPath("$.data.recentStores", hasSize(2)));
    }

    @Test
    void newActivityRejectsUnknownPeriod() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard/new-activity").param("period", "yearly").cookie(admin))
                .andExpect(status().isBadRequest());
    }

    @Test
    void newActivityRequiresAdmin() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard/new-activity"))
                .andExpect(status().isUnauthorized());
    }

    /** creation_date_time is not updatable through JPA, so move it back with SQL. */
    private void backdate(String table, Long id, int days) {
        entityManager.flush();
        entityManager.createNativeQuery("UPDATE " + table + " SET creation_date_time = ? WHERE id = ?")
                .setParameter(1, LocalDateTime.now().minusDays(days))
                .setParameter(2, id)
                .executeUpdate();
        entityManager.clear();
    }

    @Test
    void dashboardRequiresAdmin() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard"))
                .andExpect(status().isUnauthorized());
    }
}
