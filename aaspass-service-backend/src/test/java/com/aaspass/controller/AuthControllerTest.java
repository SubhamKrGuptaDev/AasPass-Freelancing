package com.aaspass.controller;

import com.aaspass.config.security.SecurityProperties;
import com.aaspass.dto.request.LoginRequest;
import com.aaspass.dto.request.RegisterRequest;
import com.aaspass.entity.User;
import com.aaspass.repository.UserRepository;
import com.aaspass.security.token.AuthCookieService;
import com.aaspass.security.token.JwtTokenService;
import com.aaspass.support.AuthTestSupport;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import com.nimbusds.jwt.SignedJWT;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import tools.jackson.databind.ObjectMapper;

import javax.crypto.spec.SecretKeySpec;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * End-to-end tests of the cookie-based auth endpoints through the real security chain.
 * Deliberately not {@code @Transactional}: session revocation (including reuse detection, which
 * throws) must really commit, exactly as it does in production.
 */
@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
public class AuthControllerTest {

    private static final String SID = AuthCookieService.ACCESS_COOKIE;
    private static final String RID = AuthCookieService.REFRESH_COOKIE;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenService jwtTokenService;

    @Autowired
    private SecurityProperties securityProperties;

    // ---------------------------------------------------------------- helpers

    private MvcResult loginAman() throws Exception {
        return mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"usernameOrEmail\":\"aman\",\"password\":\"password123\"}"))
                .andExpect(status().isOk())
                .andReturn();
    }

    private static String setCookieHeader(MvcResult result, String name) {
        List<String> headers = result.getResponse().getHeaders(HttpHeaders.SET_COOKIE);
        String found = null;
        for (String h : headers) {
            if (h.startsWith(name + "=")) {
                found = h;
            }
        }
        if (found == null) {
            throw new AssertionError("No Set-Cookie for " + name + " in " + headers.size() + " header(s)");
        }
        return found;
    }

    private static String sidClaim(String accessToken) throws Exception {
        return SignedJWT.parse(accessToken).getJWTClaimsSet().getStringClaim("sid");
    }

    private static void assertClearsBothCookies(MvcResult result) {
        assertTrue(setCookieHeader(result, SID).contains("Max-Age=0"), "access cookie must be cleared");
        assertTrue(setCookieHeader(result, RID).contains("Max-Age=0"), "refresh cookie must be cleared");
    }

    // ---------------------------------------------------------------- login

    @Test
    @DisplayName("Seeded passwords are stored as BCrypt hashes")
    public void seededPasswordIsHashed() {
        String stored = userRepository.findByUsername("aman").orElseThrow().getPassword();
        assertTrue(stored.startsWith("$2"));
    }

    @Test
    @DisplayName("POST /api/auth/login - KYC fields are masked in the response")
    public void loginResponseMasksKyc() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .usernameOrEmail("aman")
                .password("password123")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.user.aadharNumber", is("XXXXXXXX7777")))
                .andExpect(jsonPath("$.data.user.panNumber", is("XXXXXX234F")));
    }

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
    @DisplayName("POST /api/auth/login - sets HttpOnly auth cookies and never returns the token in the body")
    public void loginSetsHttpOnlyCookiesAndNoTokenInBody() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"usernameOrEmail\":\"aman\",\"password\":\"password123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.token").doesNotExist())
                .andExpect(jsonPath("$.data.tokenType").doesNotExist())
                .andReturn();

        String sid = setCookieHeader(result, SID);
        assertTrue(sid.contains("HttpOnly"), sid);
        assertTrue(sid.contains("SameSite=Lax"), sid);
        assertTrue(sid.contains("Path=/api;") || sid.endsWith("Path=/api"), sid);
        assertTrue(sid.contains("Max-Age=900"), sid);
        assertFalse(sid.contains("Secure"), sid);
        assertFalse(sid.contains("Domain"), sid);

        String rid = setCookieHeader(result, RID);
        assertTrue(rid.contains("HttpOnly"), rid);
        assertTrue(rid.contains("SameSite=Strict"), rid);
        assertTrue(rid.contains("Path=/api/auth"), rid);
        assertFalse(rid.contains("Secure"), rid);
        assertFalse(rid.contains("Domain"), rid);
    }

    @Test
    @DisplayName("POST /api/auth/login - wrong password and unknown user both return INVALID_CREDENTIALS")
    public void invalidCredentialsReturnCode() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"usernameOrEmail\":\"aman\",\"password\":\"nope\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code", is("INVALID_CREDENTIALS")))
                .andExpect(jsonPath("$.message", is("Invalid username or password")));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"usernameOrEmail\":\"ghost_user_404\",\"password\":\"nope\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code", is("INVALID_CREDENTIALS")))
                .andExpect(jsonPath("$.message", is("Invalid username or password")));
    }

    @Test
    @DisplayName("POST /api/auth/login - a garbage access cookie never breaks login")
    public void loginSucceedsWithGarbageAccessCookie() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .cookie(new Cookie(SID, "garbage"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"usernameOrEmail\":\"aman\",\"password\":\"password123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }

    // ---------------------------------------------------------------- me / token validation

    @Test
    @DisplayName("GET /api/auth/me - without cookie is UNAUTHENTICATED")
    public void meWithoutCookieIsUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.code", is("UNAUTHENTICATED")));
    }

    @Test
    @DisplayName("GET /api/auth/me - with access cookie returns the token's user")
    public void meWithCookieReturnsUser() throws Exception {
        Cookie[] cookies = AuthTestSupport.login(mockMvc, "aman", "password123");

        mockMvc.perform(get("/api/auth/me").cookie(cookies))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.username", is("aman")));
    }

    @Test
    @DisplayName("GET /api/auth/me - expired access token returns TOKEN_EXPIRED")
    public void expiredAccessTokenReturnsTokenExpired() throws Exception {
        Cookie[] cookies = AuthTestSupport.login(mockMvc, "aman", "password123");
        String sid = sidClaim(cookies[0].getValue());
        User aman = userRepository.findByUsername("aman").orElseThrow();
        String expired = jwtTokenService.issueAccessToken(
                aman.getId(), "aman", sid, Instant.now().minus(16, ChronoUnit.MINUTES));

        mockMvc.perform(get("/api/auth/me").cookie(new Cookie(SID, expired)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code", is("TOKEN_EXPIRED")));
    }

    @Test
    @DisplayName("GET /api/stores - public endpoint with expired cookie returns TOKEN_EXPIRED, without cookie 200")
    public void publicEndpointWithExpiredCookieReturnsTokenExpired() throws Exception {
        Cookie[] cookies = AuthTestSupport.login(mockMvc, "aman", "password123");
        String sid = sidClaim(cookies[0].getValue());
        User aman = userRepository.findByUsername("aman").orElseThrow();
        String expired = jwtTokenService.issueAccessToken(
                aman.getId(), "aman", sid, Instant.now().minus(16, ChronoUnit.MINUTES));

        mockMvc.perform(get("/api/stores").cookie(new Cookie(SID, expired)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code", is("TOKEN_EXPIRED")));

        mockMvc.perform(get("/api/stores"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/auth/me - token with nbf in the future is UNAUTHENTICATED")
    public void notYetValidTokenIsUnauthenticated() throws Exception {
        Cookie[] cookies = AuthTestSupport.login(mockMvc, "aman", "password123");
        String sid = sidClaim(cookies[0].getValue());
        User aman = userRepository.findByUsername("aman").orElseThrow();
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(JwtTokenService.ISSUER)
                .subject(String.valueOf(aman.getId()))
                .issuedAt(now)
                .notBefore(now.plus(5, ChronoUnit.MINUTES))
                .expiresAt(now.plus(15, ChronoUnit.MINUTES))
                .claim("sid", sid)
                .claim("username", "aman")
                .build();
        JwtEncoder encoder = new NimbusJwtEncoder(new ImmutableSecret<>(
                new SecretKeySpec(securityProperties.jwtSecretBytes(), "HmacSHA256")));
        String notYetValid = encoder.encode(JwtEncoderParameters.from(
                JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();

        mockMvc.perform(get("/api/auth/me").cookie(new Cookie(SID, notYetValid)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code", is("UNAUTHENTICATED")));
    }

    // ---------------------------------------------------------------- refresh

    @Test
    @DisplayName("POST /api/auth/refresh - rotates both cookies and returns the user")
    public void refreshRotatesBothCookies() throws Exception {
        Cookie[] cookies = AuthTestSupport.login(mockMvc, "aman", "password123");

        MvcResult result = mockMvc.perform(post("/api/auth/refresh").cookie(cookies[1]))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.username", is("aman")))
                .andReturn();

        Cookie newRid = AuthTestSupport.cookie(result, RID);
        Cookie newSid = AuthTestSupport.cookie(result, SID);
        assertNotEquals(cookies[1].getValue(), newRid.getValue());
        assertFalse(newRid.getValue().isEmpty());
        assertFalse(newSid.getValue().isEmpty());
        assertEquals(sidClaim(cookies[0].getValue()), sidClaim(newSid.getValue()), "same session after rotation");
    }

    @Test
    @DisplayName("POST /api/auth/refresh - missing refresh cookie is UNAUTHENTICATED")
    public void refreshWithoutCookieIsUnauthenticated() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/refresh"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code", is("UNAUTHENTICATED")))
                .andReturn();
        assertClearsBothCookies(result);
    }

    @Test
    @DisplayName("POST /api/auth/refresh - replaying a rotated refresh token revokes the session")
    public void refreshReuseRevokesSession() throws Exception {
        Cookie[] cookies = AuthTestSupport.login(mockMvc, "aman", "password123");

        MvcResult first = mockMvc.perform(post("/api/auth/refresh").cookie(cookies[1]))
                .andExpect(status().isOk())
                .andReturn();
        Cookie rotatedRid = AuthTestSupport.cookie(first, RID);

        MvcResult replay = mockMvc.perform(post("/api/auth/refresh").cookie(cookies[1]))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code", is("SESSION_REVOKED")))
                .andReturn();
        assertClearsBothCookies(replay);

        // The revocation committed: even the legitimately rotated token is now dead.
        mockMvc.perform(post("/api/auth/refresh").cookie(rotatedRid))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code", is("SESSION_REVOKED")));
    }

    // ---------------------------------------------------------------- logout

    @Test
    @DisplayName("POST /api/auth/logout - revokes the session and clears both cookies")
    public void logoutRevokesAndClears() throws Exception {
        Cookie[] cookies = AuthTestSupport.login(mockMvc, "aman", "password123");

        MvcResult result = mockMvc.perform(post("/api/auth/logout").with(csrf()).cookie(cookies))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andReturn();
        assertClearsBothCookies(result);

        mockMvc.perform(get("/api/auth/me").cookie(cookies[0]))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code", is("SESSION_REVOKED")));
    }

    @Test
    @DisplayName("POST /api/auth/logout - without CSRF token is rejected with CSRF_INVALID")
    public void logoutWithoutCsrfIsForbidden() throws Exception {
        Cookie[] cookies = AuthTestSupport.login(mockMvc, "aman", "password123");

        mockMvc.perform(post("/api/auth/logout").cookie(cookies))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.code", is("CSRF_INVALID")));

        // Session untouched.
        mockMvc.perform(get("/api/auth/me").cookie(cookies[0]))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Cookie-authenticated writes still require the CSRF token")
    public void cookieAuthenticatedWriteWithoutCsrfIsForbidden() throws Exception {
        Cookie[] cookies = AuthTestSupport.login(mockMvc, "aman", "password123");

        mockMvc.perform(post("/api/users/1/addresses").cookie(cookies)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code", is("CSRF_INVALID")));
    }

    @Test
    @DisplayName("A logged-out session can never be rejoined with copied cookies")
    public void noRejoinAfterLogout() throws Exception {
        Cookie[] cookies = AuthTestSupport.login(mockMvc, "aman", "password123");

        mockMvc.perform(post("/api/auth/logout").with(csrf()).cookie(cookies))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/auth/me").cookie(cookies[0]))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code", is("SESSION_REVOKED")));

        MvcResult refresh = mockMvc.perform(post("/api/auth/refresh").cookie(cookies))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code", is("SESSION_REVOKED")))
                .andReturn();
        assertClearsBothCookies(refresh);
        for (Cookie c : refresh.getResponse().getCookies()) {
            if (SID.equals(c.getName())) {
                assertTrue(c.getValue() == null || c.getValue().isEmpty(), "no new access cookie may be issued");
            }
        }
    }

    @Test
    @DisplayName("Re-login after logout gets a brand-new session id")
    public void reLoginGetsNewSessionId() throws Exception {
        Cookie[] before = AuthTestSupport.login(mockMvc, "aman", "password123");
        String oldSid = sidClaim(before[0].getValue());

        mockMvc.perform(post("/api/auth/logout").with(csrf()).cookie(before))
                .andExpect(status().isOk());

        Cookie[] after = AuthTestSupport.login(mockMvc, "aman", "password123");
        assertNotEquals(oldSid, sidClaim(after[0].getValue()));
    }

    @Test
    @DisplayName("POST /api/auth/logout - an expired access cookie never breaks logout")
    public void logoutSucceedsWithExpiredAccessCookie() throws Exception {
        Cookie[] cookies = AuthTestSupport.login(mockMvc, "aman", "password123");
        String sid = sidClaim(cookies[0].getValue());
        User aman = userRepository.findByUsername("aman").orElseThrow();
        String expired = jwtTokenService.issueAccessToken(
                aman.getId(), "aman", sid, Instant.now().minus(16, ChronoUnit.MINUTES));

        MvcResult result = mockMvc.perform(post("/api/auth/logout").with(csrf())
                        .cookie(new Cookie(SID, expired), cookies[1]))
                .andExpect(status().isOk())
                .andReturn();
        assertClearsBothCookies(result);
    }

    // ---------------------------------------------------------------- register

    @Test
    @DisplayName("POST /api/auth/register - hashes the password and sets auth cookies")
    public void registerHashesPasswordAndSetsCookies() throws Exception {
        String uniqueUser = "hashuser_" + System.currentTimeMillis();
        RegisterRequest request = RegisterRequest.builder()
                .name("Hash User")
                .username(uniqueUser)
                .email(uniqueUser + "@example.com")
                .password("securePassword123")
                .phone("+91 99999 66666")
                .build();

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.token").doesNotExist())
                .andExpect(jsonPath("$.data.user.username", is(uniqueUser)))
                .andReturn();

        String stored = userRepository.findByUsername(uniqueUser).orElseThrow().getPassword();
        assertTrue(stored.startsWith("$2"));
        assertFalse(AuthTestSupport.cookie(result, SID).getValue().isEmpty());
        assertFalse(AuthTestSupport.cookie(result, RID).getValue().isEmpty());

        mockMvc.perform(get("/api/auth/me").cookie(AuthTestSupport.cookie(result, SID)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.username", is(uniqueUser)));
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
}
