package com.aaspass.admin;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.nullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.aaspass.admin.entity.AdminAuditAction;
import com.aaspass.admin.entity.AdminAuditEntry;
import com.aaspass.admin.entity.AuditTargetType;
import com.aaspass.admin.repository.AdminAuditRepository;
import com.aaspass.entity.ContactRequest;
import com.aaspass.entity.ContactRequestStatus;
import com.aaspass.entity.ContactRequestType;
import com.aaspass.repository.ContactRequestRepository;
import com.aaspass.repository.UserRepository;
import com.aaspass.support.AdminTestSupport;
import com.aaspass.support.AuthTestSupport;
import jakarta.persistence.EntityManager;
import jakarta.servlet.http.Cookie;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

/** Admin contact inbox endpoints through the real admin security chain. */
@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
class AdminContactRequestControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ContactRequestRepository repository;
    @Autowired UserRepository userRepository;
    @Autowired AdminAuditRepository adminAuditRepository;
    @Autowired EntityManager entityManager;

    private Cookie[] admin;
    private ContactRequest q1;
    private ContactRequest f1;
    private ContactRequest c1;

    @BeforeEach
    void setUp() throws Exception {
        admin = AdminTestSupport.login(mockMvc);
        q1 = seed(ContactRequestType.QUERY, ContactRequestStatus.NEW, "Ravi", "How do I list a store?");
        f1 = seed(ContactRequestType.FEEDBACK, ContactRequestStatus.NEW, "Meena", "Love the app");
        c1 = seed(ContactRequestType.COMPLAINT, ContactRequestStatus.RESOLVED, "Ravi", "Wrong listing");
        c1.setResolvedAt(LocalDateTime.now());
        repository.saveAndFlush(c1);
        // creation_date_time is not updatable through JPA, so order the rows with SQL
        backdate(q1, 3);
        backdate(f1, 2);
        backdate(c1, 1);
    }

    private ContactRequest seed(ContactRequestType type, ContactRequestStatus status, String name, String subject) {
        ContactRequest r = new ContactRequest();
        r.setType(type);
        r.setStatus(status);
        r.setName(name);
        r.setEmail(name.toLowerCase() + "@example.com");
        r.setSubject(subject);
        r.setMessage("Message body for " + subject);
        return repository.saveAndFlush(r);
    }

    private void backdate(ContactRequest r, int days) {
        entityManager.flush();
        entityManager.createNativeQuery("UPDATE contact_requests SET creation_date_time = ? WHERE id = ?")
                .setParameter(1, LocalDateTime.now().minusDays(days))
                .setParameter(2, r.getId())
                .executeUpdate();
        entityManager.clear();
    }

    private ResultActions patchRequest(Long id, String body) throws Exception {
        return mockMvc.perform(patch("/api/admin/contact-requests/" + id)
                .cookie(admin).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body));
    }

    @Test
    void listsNewestFirstWithFilters() throws Exception {
        mockMvc.perform(get("/api/admin/contact-requests").cookie(admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(3)))
                .andExpect(jsonPath("$.data.content[*].id", contains(
                        c1.getId().intValue(), f1.getId().intValue(), q1.getId().intValue())));

        mockMvc.perform(get("/api/admin/contact-requests").param("status", "NEW").cookie(admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(2)));
        mockMvc.perform(get("/api/admin/contact-requests").param("type", "COMPLAINT").cookie(admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(1)));
        mockMvc.perform(get("/api/admin/contact-requests").param("q", "ravi").cookie(admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(2)));
        mockMvc.perform(get("/api/admin/contact-requests").param("status", "bogus").cookie(admin))
                .andExpect(status().isBadRequest());
    }

    @Test
    void requiresAdmin() throws Exception {
        mockMvc.perform(get("/api/admin/contact-requests"))
                .andExpect(status().isUnauthorized());
        Cookie[] user = AuthTestSupport.login(mockMvc, "aman", "password123");
        mockMvc.perform(get("/api/admin/contact-requests").cookie(user))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void detailIncludesNoteAndUser() throws Exception {
        ContactRequest linked = repository.findById(q1.getId()).orElseThrow();
        linked.setUser(userRepository.findByEmail("aman.sharma@example.com").orElseThrow());
        linked.setAdminNote("Follow up");
        repository.saveAndFlush(linked);
        entityManager.clear();

        mockMvc.perform(get("/api/admin/contact-requests/" + q1.getId()).cookie(admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.username", is("aman")))
                .andExpect(jsonPath("$.data.adminNote", is("Follow up")))
                .andExpect(jsonPath("$.data.message", containsString("Message body")));
    }

    @Test
    void patchStatusSetsResolvedAtAndAudits() throws Exception {
        patchRequest(q1.getId(), "{\"status\":\"RESOLVED\",\"adminNote\":\"Called on phone\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("RESOLVED")))
                .andExpect(jsonPath("$.data.adminNote", is("Called on phone")))
                .andExpect(jsonPath("$.data.resolvedAt", notNullValue()))
                .andExpect(jsonPath("$.data.handledByAdminId", notNullValue()));

        List<AdminAuditEntry> entries = adminAuditRepository
                .findByTargetTypeAndTargetIdOrderByIdDesc(AuditTargetType.CONTACT_REQUEST, q1.getId());
        assertEquals(1, entries.size());
        assertEquals(AdminAuditAction.UPDATE_CONTACT_REQUEST, entries.get(0).getAction());
        assertEquals(true, entries.get(0).getDetails().contains("NEW -> RESOLVED"));
    }

    @Test
    void reopeningClearsResolvedAt() throws Exception {
        patchRequest(c1.getId(), "{\"status\":\"IN_PROGRESS\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("IN_PROGRESS")))
                .andExpect(jsonPath("$.data.resolvedAt", nullValue()));
    }

    @Test
    void blankNoteClearsNote() throws Exception {
        patchRequest(q1.getId(), "{\"adminNote\":\"temp\"}").andExpect(status().isOk());
        patchRequest(q1.getId(), "{\"adminNote\":\"  \"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.adminNote", nullValue()))
                .andExpect(jsonPath("$.data.status", is("NEW")));
    }

    @Test
    void emptyPatchIs400() throws Exception {
        patchRequest(q1.getId(), "{}").andExpect(status().isBadRequest());
    }

    @Test
    void unknownIdIs404() throws Exception {
        mockMvc.perform(get("/api/admin/contact-requests/999999").cookie(admin))
                .andExpect(status().isNotFound());
        patchRequest(999999L, "{\"status\":\"RESOLVED\"}").andExpect(status().isNotFound());
    }
}
