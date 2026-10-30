package com.aaspass.controller;

import com.aaspass.entity.ContactRequest;
import com.aaspass.entity.ContactRequestStatus;
import com.aaspass.repository.ContactRequestRepository;
import com.aaspass.support.AuthTestSupport;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
public class ContactControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ContactRequestRepository repository;

    private static String body(String name, String email, String subject, String message, String type, String website) {
        StringBuilder sb = new StringBuilder("{");
        if (type != null) {
            sb.append("\"type\":\"").append(type).append("\",");
        }
        sb.append("\"name\":\"").append(name).append("\",")
                .append("\"email\":\"").append(email).append("\",")
                .append("\"subject\":\"").append(subject).append("\",")
                .append("\"message\":\"").append(message).append("\"");
        if (website != null) {
            sb.append(",\"website\":\"").append(website).append("\"");
        }
        return sb.append("}").toString();
    }

    private static String validBody(String email) {
        return body("  Asha  ", email, "Hello", "Need help", "QUERY", null);
    }

    private static RequestPostProcessor fromIp(String ip) {
        return r -> {
            r.setRemoteAddr(ip);
            return r;
        };
    }

    private ResultActions submit(String json, RequestPostProcessor ip, Cookie... cookies) throws Exception {
        MockHttpServletRequestBuilder builder = post("/api/contact")
                .with(csrf())
                .with(ip)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json);
        if (cookies.length > 0) {
            builder = builder.cookie(cookies);
        }
        return mockMvc.perform(builder);
    }

    @Test
    @DisplayName("Guest submit is saved as NEW with normalized fields")
    public void guestSubmitIsSavedAsNew() throws Exception {
        String res = submit(validBody("Asha@Example.com"), fromIp("127.0.0.1"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status", is("NEW")))
                .andExpect(jsonPath("$.data.id", notNullValue()))
                .andReturn().getResponse().getContentAsString();
        assertNotNull(res);

        ContactRequest saved = repository.findAll().get(0);
        assertEquals("Asha", saved.getName());
        assertEquals("asha@example.com", saved.getEmail());
        assertEquals(ContactRequestStatus.NEW, saved.getStatus());
        assertNull(saved.getUser());
        assertEquals("127.0.0.1", saved.getSubmitterIp());
    }

    @Test
    @DisplayName("Logged-in submit is linked to the user")
    public void loggedInSubmitIsLinkedToUser() throws Exception {
        Cookie[] cookies = AuthTestSupport.login(mockMvc, "aman", "password123");
        submit(validBody("Asha@Example.com"), fromIp("127.0.0.1"), cookies)
                .andExpect(status().isCreated());

        ContactRequest saved = repository.findAll().get(0);
        assertNotNull(saved.getUser());
        assertEquals("aman", saved.getUser().getUsername());
    }

    @Test
    @DisplayName("Response hides admin-only fields")
    public void responseHidesAdminFields() throws Exception {
        submit(validBody("asha@example.com"), fromIp("127.0.0.1"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.adminNote").doesNotExist())
                .andExpect(jsonPath("$.data.submitterIp").doesNotExist())
                .andExpect(jsonPath("$.data.handledByAdminId").doesNotExist())
                .andExpect(jsonPath("$.data.user").doesNotExist());
    }

    @Test
    @DisplayName("Honeypot hit returns success without saving")
    public void honeypotIsDroppedSilently() throws Exception {
        long before = repository.count();
        submit(body("Bot", "bot@example.com", "Hi", "Spam", "QUERY", "http://spam"), fromIp("127.0.0.1"))
                .andExpect(status().isCreated());
        assertEquals(before, repository.count());
    }

    @Test
    @DisplayName("Invalid body is rejected with 400")
    public void invalidBodyIs400() throws Exception {
        submit(body("Asha", "asha@example.com", " ", "Msg", "QUERY", null), fromIp("127.0.0.1"))
                .andExpect(status().isBadRequest());
        submit(body("Asha", "asha@example.com", "Hi", "x".repeat(2001), "QUERY", null), fromIp("127.0.0.1"))
                .andExpect(status().isBadRequest());
        submit(body("Asha", "asha@example.com", "Hi", "Msg", null, null), fromIp("127.0.0.1"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Throttles by IP after 5 requests in an hour")
    public void throttlesByIp() throws Exception {
        for (int i = 0; i < 5; i++) {
            submit(validBody("user" + i + "@example.com"), fromIp("10.0.0.9"))
                    .andExpect(status().isCreated());
        }
        submit(validBody("user99@example.com"), fromIp("10.0.0.9"))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code", is("CONTACT_RATE_LIMITED")));
    }

    @Test
    @DisplayName("Throttles by email case-insensitively")
    public void throttlesByEmailCaseInsensitively() throws Exception {
        for (int i = 0; i < 5; i++) {
            submit(validBody("a@x.com"), fromIp("10.0.1." + i))
                    .andExpect(status().isCreated());
        }
        submit(validBody("A@X.com "), fromIp("10.0.1.200"))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code", is("CONTACT_RATE_LIMITED")));
    }
}
