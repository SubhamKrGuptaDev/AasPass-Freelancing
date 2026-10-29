package com.aaspass.admin;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.aaspass.entity.Store;
import com.aaspass.entity.User;
import com.aaspass.entity.VerificationStatus;
import com.aaspass.repository.StoreRepository;
import com.aaspass.repository.UserRepository;
import com.aaspass.support.AdminTestSupport;
import jakarta.persistence.EntityManager;
import jakarta.servlet.http.Cookie;
import java.time.Instant;
import java.time.LocalDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/** Admin Charts endpoint through the real admin security chain. */
@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
class AdminChartControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired StoreRepository storeRepository;
    @Autowired UserRepository userRepository;
    @Autowired EntityManager entityManager;

    private Cookie[] admin;

    @BeforeEach
    void setUp() throws Exception {
        admin = AdminTestSupport.login(mockMvc);
        for (Store s : storeRepository.findAll()) {
            s.setAdminReviewedAt(null);
            storeRepository.saveAndFlush(s);
        }
    }

    @Test
    void dailyChartsBucketTodaysActivity() throws Exception {
        User aman = userRepository.findByEmail("aman.sharma@example.com").orElseThrow();
        aman.getPhoneVerification().decide(VerificationStatus.VERIFIED, null, 1L, Instant.now());
        aman.getPanVerification().decide(VerificationStatus.REJECTED, "Blurry", 1L, Instant.now());
        userRepository.saveAndFlush(aman);
        Store reviewed = storeRepository.findAll().get(0);
        reviewed.setAdminReviewedAt(Instant.now());
        storeRepository.saveAndFlush(reviewed);

        mockMvc.perform(get("/api/admin/charts").cookie(admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.period", is("DAILY")))
                .andExpect(jsonPath("$.data.buckets", hasSize(30)))
                .andExpect(jsonPath("$.data.newUsers", hasSize(30)))
                .andExpect(jsonPath("$.data.newUsers[29]", is(3)))
                .andExpect(jsonPath("$.data.newStores[29]", is(2)))
                .andExpect(jsonPath("$.data.userItemsVerified[29]", is(1)))
                .andExpect(jsonPath("$.data.userItemsRejected[29]", is(1)))
                .andExpect(jsonPath("$.data.storesReviewed[29]", is(1)))
                .andExpect(jsonPath("$.data.topUserCities[0].city", is("Bengaluru")))
                .andExpect(jsonPath("$.data.topUserCities[0].count", is(3)))
                .andExpect(jsonPath("$.data.topStoreCities[0].count", is(2)));
    }

    @Test
    void weeklyAndMonthlyUseTwelveBucketsAndReachFurtherBack() throws Exception {
        Store old = storeRepository.findAll().stream()
                .filter(s -> "CodeSpark Lab".equals(s.getStoreName())).findFirst().orElseThrow();
        backdateStore(old.getId(), 40);

        mockMvc.perform(get("/api/admin/charts").cookie(admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.newStores[29]", is(1)))
                .andExpect(jsonPath("$.data.topStoreCities[0].count", is(1)));

        mockMvc.perform(get("/api/admin/charts").param("period", "weekly").cookie(admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.period", is("WEEKLY")))
                .andExpect(jsonPath("$.data.buckets", hasSize(12)))
                .andExpect(jsonPath("$.data.topStoreCities[0].count", is(2)));

        mockMvc.perform(get("/api/admin/charts").param("period", "monthly").cookie(admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.period", is("MONTHLY")))
                .andExpect(jsonPath("$.data.buckets", hasSize(12)))
                .andExpect(jsonPath("$.data.topStoreCities[0].count", is(2)));
    }

    @Test
    void locationFilterNarrowsEveryChart() throws Exception {
        User rohan = userRepository.findByEmail("rohan.gupta@example.com").orElseThrow();
        rohan.setCity("Pune");
        userRepository.saveAndFlush(rohan);

        mockMvc.perform(get("/api/admin/charts").param("country", "india").param("city", "PUNE").cookie(admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.newUsers[29]", is(1)))
                .andExpect(jsonPath("$.data.newStores[29]", is(0)))
                .andExpect(jsonPath("$.data.topUserCities", hasSize(1)))
                .andExpect(jsonPath("$.data.topUserCities[0].city", is("Pune")))
                .andExpect(jsonPath("$.data.topStoreCities", hasSize(0)));
    }

    @Test
    void chartsRejectUnknownPeriod() throws Exception {
        mockMvc.perform(get("/api/admin/charts").param("period", "yearly").cookie(admin))
                .andExpect(status().isBadRequest());
    }

    @Test
    void chartsRequireAdmin() throws Exception {
        mockMvc.perform(get("/api/admin/charts"))
                .andExpect(status().isUnauthorized());
    }

    /** creation_date_time is not updatable through JPA, so move it back with SQL. */
    private void backdateStore(Long id, int days) {
        entityManager.flush();
        entityManager.createNativeQuery("UPDATE stores SET creation_date_time = ? WHERE id = ?")
                .setParameter(1, LocalDateTime.now().minusDays(days))
                .setParameter(2, id)
                .executeUpdate();
        entityManager.clear();
    }
}
