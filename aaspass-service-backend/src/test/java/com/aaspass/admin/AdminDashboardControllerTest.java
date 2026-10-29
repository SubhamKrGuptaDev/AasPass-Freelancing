package com.aaspass.admin;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.aaspass.entity.Store;
import com.aaspass.entity.User;
import com.aaspass.repository.StoreRepository;
import com.aaspass.repository.UserRepository;
import com.aaspass.support.AdminTestSupport;
import jakarta.servlet.http.Cookie;
import java.time.Instant;
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
                .andExpect(jsonPath("$.data.suspendedUsers", is(0)));

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

        mockMvc.perform(get("/api/admin/dashboard").cookie(admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.unreviewedStores", is(1)))
                .andExpect(jsonPath("$.data.blockedStores", is(1)))
                .andExpect(jsonPath("$.data.suspendedUsers", is(1)))
                .andExpect(jsonPath("$.data.activeStores", is(1)))
                .andExpect(jsonPath("$.data.recentUnreviewedStores", hasSize(1)));
    }

    @Test
    void dashboardRequiresAdmin() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard"))
                .andExpect(status().isUnauthorized());
    }
}
