package com.aaspass.admin;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.aaspass.admin.entity.AdminAuditAction;
import com.aaspass.admin.entity.AuditTargetType;
import com.aaspass.admin.repository.AdminAuditRepository;
import com.aaspass.entity.Store;
import com.aaspass.repository.StoreRepository;
import com.aaspass.support.AdminTestSupport;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/** Admin store search and moderation endpoints through the real admin security chain. */
@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
class AdminStoreControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired StoreRepository storeRepository;
    @Autowired AdminAuditRepository adminAuditRepository;

    private Cookie[] admin;
    private Long pixelId;

    @BeforeEach
    void setUp() throws Exception {
        admin = AdminTestSupport.login(mockMvc);
        for (Store s : storeRepository.findAll()) {
            s.setIsActive(true);
            s.setAdminBlocked(false);
            s.setAdminReviewedAt(null);
            storeRepository.saveAndFlush(s);
        }
        pixelId = storeRepository.findAll().stream()
                .filter(s -> "PixelCraft Studios".equals(s.getStoreName()))
                .findFirst().orElseThrow().getId();
    }

    private org.springframework.test.web.servlet.ResultActions patchStore(Long id, String action, String body)
            throws Exception {
        return mockMvc.perform(patch("/api/admin/stores/" + id + "/" + action)
                .cookie(admin).with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(body == null ? "" : body));
    }

    @Test
    void searchByCityAndNameIsCaseInsensitive() throws Exception {
        mockMvc.perform(get("/api/admin/stores").cookie(admin).param("city", "bengaluru").param("name", "pixel"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements", is(1)))
                .andExpect(jsonPath("$.data.content[0].storeName", is("PixelCraft Studios")));
    }

    @Test
    void searchByCountryWithoutMatch() throws Exception {
        mockMvc.perform(get("/api/admin/stores").cookie(admin).param("country", "Nepal"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements", is(0)));
    }

    @Test
    void statusUnreviewedThenReviewed() throws Exception {
        mockMvc.perform(get("/api/admin/stores").cookie(admin).param("status", "unreviewed"))
                .andExpect(jsonPath("$.data.totalElements", is(2)));
        patchStore(pixelId, "review", null).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.summary.reviewed", is(true)));
        mockMvc.perform(get("/api/admin/stores").cookie(admin).param("status", "unreviewed"))
                .andExpect(jsonPath("$.data.totalElements", is(1)));
    }

    @Test
    void blockRequiresReason() throws Exception {
        patchStore(pixelId, "block", "{\"reason\":\"\"}").andExpect(status().isBadRequest());
    }

    @Test
    void blockHidesFromPublicAndShowsInBlockedFilter() throws Exception {
        mockMvc.perform(get("/api/stores").param("city", "Bengaluru"))
                .andExpect(jsonPath("$.data[*].storeName", hasItem("PixelCraft Studios")));
        patchStore(pixelId, "block", "{\"reason\":\"Fake listing\"}").andExpect(status().isOk());
        mockMvc.perform(get("/api/stores").param("city", "Bengaluru"))
                .andExpect(jsonPath("$.data[*].storeName", not(hasItem("PixelCraft Studios"))));
        mockMvc.perform(get("/api/admin/stores").cookie(admin).param("status", "blocked"))
                .andExpect(jsonPath("$.data.totalElements", is(1)))
                .andExpect(jsonPath("$.data.content[0].adminBlocked", is(true)));
    }

    @Test
    void unblockKeepsOwnersActiveFlag() throws Exception {
        patchStore(pixelId, "block", "{\"reason\":\"Fake listing\"}").andExpect(status().isOk());
        patchStore(pixelId, "unblock", null).andExpect(status().isOk());
        mockMvc.perform(get("/api/admin/stores/" + pixelId).cookie(admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.summary.isActive", is(true)))
                .andExpect(jsonPath("$.data.summary.adminBlocked", is(false)));
    }

    @Test
    void sizeIsClampedTo100() throws Exception {
        mockMvc.perform(get("/api/admin/stores").cookie(admin).param("size", "1000"))
                .andExpect(jsonPath("$.data.size", is(100)));
    }

    @Test
    void unknownStatusIs400() throws Exception {
        mockMvc.perform(get("/api/admin/stores").cookie(admin).param("status", "bogus"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void unknownStoreIs404() throws Exception {
        mockMvc.perform(get("/api/admin/stores/999999").cookie(admin)).andExpect(status().isNotFound());
    }

    @Test
    void mutationsWriteAuditEntries() throws Exception {
        patchStore(pixelId, "block", "{\"reason\":\"Fake listing\"}").andExpect(status().isOk());
        var entries = adminAuditRepository.findByTargetTypeAndTargetIdOrderByIdDesc(AuditTargetType.STORE, pixelId);
        assertEquals(AdminAuditAction.BLOCK_STORE, entries.get(0).getAction());
        assertEquals("Fake listing", entries.get(0).getDetails());
    }
}
