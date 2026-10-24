package com.aaspass.controller;

import com.aaspass.dto.request.LoginRequest;
import com.aaspass.dto.request.RegisterRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /api/auth/login - Should succeed with valid username credentials")
    public void testLoginSuccessWithUsername() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .usernameOrEmail("aman")
                .password("password123")
                .rememberMe(true)
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", containsString("Login successful")))
                .andExpect(jsonPath("$.data.token", notNullValue()))
                .andExpect(jsonPath("$.data.user.username", is("aman")))
                .andExpect(jsonPath("$.data.user.email", is("aman.sharma@example.com")));
    }

    @Test
    @DisplayName("POST /api/auth/login - Should succeed with valid email credentials")
    public void testLoginSuccessWithEmail() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .usernameOrEmail("aman.sharma@example.com")
                .password("password123")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.user.name", is("Aman Sharma")));
    }

    @Test
    @DisplayName("POST /api/auth/login - Should return 401 Unauthorized for incorrect password")
    public void testLoginFailureWrongPassword() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .usernameOrEmail("aman")
                .password("wrongpassword")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Invalid username or password")));
    }

    @Test
    @DisplayName("POST /api/auth/login - Should return 401 Unauthorized for unknown user")
    public void testLoginFailureNonExistentUser() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .usernameOrEmail("nonexistent_user_999")
                .password("password123")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    @DisplayName("POST /api/auth/register - Should successfully register a new user")
    public void testRegisterNewUser() throws Exception {
        String uniqueUser = "testuser_" + System.currentTimeMillis();
        RegisterRequest request = RegisterRequest.builder()
                .name("Test User")
                .username(uniqueUser)
                .email(uniqueUser + "@example.com")
                .password("securePassword123")
                .phone("+91 99999 88888")
                .city("Bengaluru")
                .area("Whitefield")
                .country("India")
                .bio("Software engineer testing the platform")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.token", notNullValue()))
                .andExpect(jsonPath("$.data.user.username", is(uniqueUser)))
                .andExpect(jsonPath("$.data.user.country", is("India")))
                .andExpect(jsonPath("$.data.user.avatarUrl", containsString("dicebear.com")));
    }

    @Test
    @DisplayName("POST /api/auth/register - Should retain custom avatar when user provides one")
    public void testRegisterNewUserWithExplicitAvatar() throws Exception {
        String uniqueUser = "custom_avatar_" + System.currentTimeMillis();
        String customAvatar = "https://custom-avatar.example.com/photo.png";
        RegisterRequest request = RegisterRequest.builder()
                .name("Avatar Test User")
                .username(uniqueUser)
                .email(uniqueUser + "@example.com")
                .password("securePassword123")
                .phone("+91 99999 77777")
                .city("Bengaluru")
                .area("Koramangala")
                .avatarUrl(customAvatar)
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.user.avatarUrl", is(customAvatar)));
    }

    @Test
    @DisplayName("GET /api/auth/me - Should fetch current user details")
    public void testGetCurrentUser() throws Exception {
        mockMvc.perform(get("/api/auth/me")
                        .param("userId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.id", is(1)));
    }
}
