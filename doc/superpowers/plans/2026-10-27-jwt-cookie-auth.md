# JWT Cookie Auth, Encrypted KYC, Ownership Lockdown & Toaster — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder login with Spring Security + 15-minute JWT access cookies and rotating 30-day refresh cookies, hash passwords with BCrypt, encrypt Aadhaar/PAN at rest with backend masking, lock every write endpoint to its owner, and give the Angular app one shared toaster that surfaces API errors.

**Architecture:** Spring Security OAuth2 Resource Server validates an HS256 JWT read from the `_sid` HttpOnly cookie; a `user_sessions` table backs refresh-token rotation, reuse detection and permanent revocation. KYC is encrypted by a JPA `AttributeConverter` (AES-256-GCM) and masked in `DtoMapper`. The Angular dev server proxies `/api` so browser and API are same-origin; interceptors handle silent refresh and error toasts.

**Tech Stack:** Spring Boot 4.0.8 / Java 17 / Spring Security 7 / Nimbus JOSE (via resource-server starter) / JPA / MySQL (H2 for tests) · Angular 22 / Signals / Tailwind v4 / Vitest.

**Spec:** `doc/superpowers/specs/2026-10-27-jwt-cookie-auth-design.md` — read it alongside this plan; section numbers (§) below refer to it.

## Global Constraints

- Access token TTL `PT15M`; refresh session absolute TTL `P30D` (not extended on refresh).
- Cookie names exactly: `_sid` (Path `/api`), `_rid` (Path `/api/auth`), `XSRF-TOKEN` (Path `/`, not HttpOnly); CSRF header `X-XSRF-TOKEN`.
- Auth cookies `HttpOnly`; `_sid` `SameSite=Lax`, `_rid` and `XSRF-TOKEN` `SameSite=Strict`.
- `Secure` is automatic: omitted when request host is `localhost`, `127.0.0.1`, `::1` or `[::1]`; present for every other host.
- `Domain` never set for localhost/IP hosts; otherwise `aaspass.security.cookie-domain` when non-blank, else host-only.
- JWT is delivered only via `Set-Cookie`; never in JSON bodies or `Authorization` headers.
- JWT: HS256, `iss=aaspass`, `sub=<userId>`, claims `sid`, `username`; no email/phone/KYC in the token.
- BCrypt cost 12. Refresh token = 32 random bytes base64url; stored only as hex SHA-256.
- KYC ciphertext format `enc:v1:` + base64(iv(12) ‖ ciphertext ‖ tag(128 bit)); key 32 bytes from `AASPASS_KYC_KEY`.
- Masking: Aadhaar → `XXXXXXXX` + last 4; PAN → `XXXXXX` + last 4; `< 4` chars → all `X`; null → null.
- Error `code` values exactly: `TOKEN_EXPIRED`, `UNAUTHENTICATED`, `SESSION_REVOKED`, `INVALID_CREDENTIALS`, `FORBIDDEN`, `CSRF_INVALID`.
- Never log tokens, passwords, plaintext or encrypted KYC. Log user id + session id only.
- Java null-safety rules from `AGENTS.md` §3 apply (no bare `Optional.get()`, `"LIT".equals(x)`, no unchecked unboxing, empty collections not null).
- Angular rules from `aaspass-client/CLAUDE.md`: no `any`, signals + `inject()`, native control flow, `host` object, no `standalone: true`, no `CommonModule`, AXE/WCAG AA.
- Each backend task ends green on `.\mvnw.cmd test` (run from `aaspass-service-backend`); each frontend task ends green on `npx ng test --watch=false` and `npm run build` (from `aaspass-client`).
- Add a `doc/AI-doc/CHANGELOG.md` entry in the final task, in the existing entry format.

## Review Focus

1. **Expired access cookie on a public page** (guest browsing `/api/stores` with a stale `_sid`) — Spring's bearer filter rejects an invalid token even on `permitAll` routes; a reasonable user expects the page to load. The frontend refresh interceptor must recover it, and a failed refresh must clear cookies so the next request is anonymous. Test in Task 5 (`publicEndpointWithExpiredCookieReturnsTokenExpired`) and Task 9 (`publicGetRecoversAfterRefresh`).
2. **Auth endpoints receiving a stale/garbage `_sid`** — login, register, refresh and logout must work even when the browser still sends a bad access cookie. The cookie resolver returns `null` for `/api/auth/login|register|refresh|logout`. Test in Task 5 (`loginSucceedsWithGarbageAccessCookie`, `logoutSucceedsWithExpiredAccessCookie`).
3. **Two refreshes with the same token** (two tabs, or a retried request) — the pessimistic lock serialises them; the second sees the token as *previous* and, per spec §3.4, revokes the session. Single-flight refresh in the frontend prevents this within one tab; the cross-tab case logging the user out is accepted behaviour per spec. Pinned by Task 4 (`rotateTwiceWithSameTokenRevokesSession`) and Task 9 (`refreshesOnceForConcurrent401s`).
4. **Profile save after masking** — saving the profile form must never send or persist the masked `XXXXXXXX8921`. Test in Task 6 (`updateUserIgnoresKycFields`) and Task 10 (`profileSaveSendsNoKyc`).
5. **Aadhaar typed with spaces/dashes** (`9999 8888 7777`, `9999-8888-7777`) and lowercase PAN (`abcde1234f`) — users expect these to be accepted and normalised. Test in Task 6 (`kycUpdateNormalisesInput`).

---

## File Structure

**Backend — create** (`aaspass-service-backend/src/main/java/com/aaspass/…`)
- `config/security/SecurityProperties.java` — `@ConfigurationProperties("aaspass.security")` record + startup validation.
- `config/security/SecurityConfig.java` — `SecurityFilterChain`, `JwtDecoder`, `JwtEncoder`, `PasswordEncoder`, CORS hookup.
- `config/security/CookieBearerTokenResolver.java` — reads `_sid`, skips auth endpoints.
- `config/security/ExpiryValidator.java`, `config/security/ActiveSessionValidator.java` — `OAuth2TokenValidator<Jwt>`s with codes `token_expired`, `session_revoked`.
- `config/security/ApiAuthErrorHandlers.java` — `AuthenticationEntryPoint` + `AccessDeniedHandler` writing `ApiResponse` JSON.
- `config/security/CsrfCookieFilter.java` — materialises the CSRF token each request.
- `config/security/CurrentUser.java` — `requireUserId()`, `optionalUserId()`, `requireSessionId()`.
- `security/crypto/KycCryptoService.java`, `security/crypto/KycEncryptedConverter.java`, `security/crypto/KycMasking.java`.
- `security/session/UserSession.java` (entity), `security/session/SessionRevokeReason.java`, `security/session/UserSessionRepository.java`, `security/session/SessionService.java`, `security/session/IssuedSession.java` (record).
- `security/token/JwtTokenService.java`, `security/token/AuthCookieService.java`, `security/token/TokenHashing.java`.
- `config/SecurityDataMigration.java` — legacy password/KYC migration runner.
- `dto/request/KycUpdateRequest.java`.
- `exception/ForbiddenException.java`, `exception/ErrorCode.java` (enum of the six codes).

**Backend — modify:** `pom.xml`, `application.properties`, new `application-dev.properties`, `entity/User.java`, `dto/response/ApiResponse.java`, `dto/response/AuthResponse.java`, `dto/request/UserUpdateRequest.java`, `dto/request/StoreCreateRequest.java`, `dto/request/StoreReviewRequest.java`, `service/AuthService.java`, `service/UserService.java`, `service/StoreService.java`, `service/StoreServiceItemService.java`, `service/StoreReviewService.java`, `service/mapper/DtoMapper.java`, `config/DataInitializer.java`, `config/WebMvcConfig.java`, `exception/GlobalExceptionHandler.java`, `exception/UnauthorizedException.java`, all five controllers.

**Backend — tests:** `src/test/resources/application-test.properties`; `src/test/java/com/aaspass/support/AuthTestSupport.java`; `security/crypto/KycCryptoServiceTest.java`, `KycMaskingTest.java`; `security/session/SessionServiceTest.java`; `config/SecurityDataMigrationTest.java`; `controller/AuthControllerTest.java` (rewrite), `controller/StoreAndUserControllerTest.java` (update), `controller/OwnershipAndKycTest.java`.

**Frontend — create** (`aaspass-client/…`)
- `proxy.conf.json`.
- `src/app/services/toast/toast.service.ts` (+ `.spec.ts`), `src/app/models/toast.model.ts`.
- `src/app/components/toaster/toaster.ts|html` (+ `.spec.ts`).
- `src/app/interceptors/error-toast.interceptor.ts` (+ spec), `src/app/interceptors/auth-refresh.interceptor.ts` (+ spec), `src/app/interceptors/http-context.ts` (`SKIP_ERROR_TOAST`, `SKIP_AUTH_REFRESH`).

**Frontend — modify:** `angular.json`, `src/app/config/api.config.ts`, `src/app/app.config.ts`, `src/app/app.ts|html`, `src/app/models/request.model.ts|response.model.ts|user.model.ts`, `src/app/services/auth/auth.service.ts|auth-http.service.ts` (+ specs), `src/app/guards/auth.guard.ts`, `src/app/services/store/store.service.ts|store-http.service.ts` (+ specs), `src/app/pages/auth/auth-page.ts|html`, `src/app/pages/profile/profile.ts|html`, `src/app/pages/create-store/create-store.ts|html`, `src/app/pages/store-detail/store-detail.ts|html`, `src/app/components/navbar/navbar.ts|html`.

---

## Backend

### Task 1: Test infrastructure, security properties, dev profile

**Files:**
- Modify: `aaspass-service-backend/pom.xml` — add `com.h2database:h2` (scope `test`) and `org.springframework.security:spring-security-crypto` (version from Boot BOM).
- Create: `src/main/resources/application-dev.properties`, `src/test/resources/application-test.properties`, `config/security/SecurityProperties.java`
- Modify: `src/main/resources/application.properties`, `AaspassServiceBackendApplication.java` (`@ConfigurationPropertiesScan`), both existing test classes + `AaspassServiceBackendApplicationTests` (`@ActiveProfiles("test")`).
- Test: `src/test/java/com/aaspass/config/security/SecurityPropertiesTest.java`

**Interfaces:**
- Produces: `record SecurityProperties(String jwtSecret, String kycKey, String cookieDomain, Duration accessTokenTtl, Duration refreshTokenTtl)` with `byte[] jwtSecretBytes()` and `byte[] kycKeyBytes()` (base64-decoded); compact constructor throws `IllegalStateException` when the jwt secret decodes to < 32 bytes or the KYC key is not exactly 32 bytes; defaults `cookieDomain=""` (null → empty), `PT15M`, `P30D`.

- [ ] **Step 1:** `application.properties`: add `spring.profiles.default=dev`, `aaspass.security.cookie-domain=${AASPASS_COOKIE_DOMAIN:}`, `aaspass.security.access-token-ttl=PT15M`, `aaspass.security.refresh-token-ttl=P30D`, `aaspass.security.jwt-secret=${AASPASS_JWT_SECRET:}`, `aaspass.security.kyc-key=${AASPASS_KYC_KEY:}`. `application-dev.properties`: fixed base64 dev values for both keys (generate once with `openssl rand -base64 32` / 48), commented `# DEV ONLY`. `application-test.properties`: H2 (`jdbc:h2:mem:aaspass;MODE=MySQL;DB_CLOSE_DELAY=-1`, `ddl-auto=create-drop`), separate fixed test keys, `spring.jpa.show-sql=false`.
- [ ] **Step 2: Write failing tests** `SecurityPropertiesTest`: `rejectsShortJwtSecret` (16-byte secret → `IllegalStateException`), `rejectsWrongLengthKycKey` (31 bytes → throws), `acceptsValidKeys` (`jwtSecretBytes().length >= 32`, `kycKeyBytes().length == 32`), `appliesDefaults` (null ttl → `Duration.ofMinutes(15)` / `Duration.ofDays(30)`).
- [ ] **Step 3:** Run `.\mvnw.cmd test -Dtest=SecurityPropertiesTest` → FAIL (class missing).
- [ ] **Step 4:** Implement `SecurityProperties`; add `@ConfigurationPropertiesScan`; annotate existing test classes with `@ActiveProfiles("test")`.
- [ ] **Step 5:** Run `.\mvnw.cmd test` → all PASS on H2 (existing 18 tests included).
- [ ] **Step 6: Commit** `feat(backend): security properties, dev profile and H2 test profile`.

### Task 2: KYC crypto and masking

**Files:**
- Create: `security/crypto/KycCryptoService.java`, `security/crypto/KycMasking.java`
- Test: `security/crypto/KycCryptoServiceTest.java`, `security/crypto/KycMaskingTest.java`

**Interfaces:**
- Consumes: `SecurityProperties.kycKeyBytes()`.
- Produces: `@Component KycCryptoService { String encrypt(String plain); String decrypt(String stored); static boolean isEncrypted(String stored); }` — `null`/blank in → `null` out; `decrypt` throws `IllegalStateException("KYC value could not be decrypted")` on tamper/wrong key (no value in message). `final class KycMasking { static String maskAadhaar(String plain); static String maskPan(String plain); }`.

- [ ] **Step 1: Write failing tests.** Crypto: `roundTrip` (`decrypt(encrypt("999988887777")) == "999988887777"`), `ciphertextHasPrefix` (`startsWith("enc:v1:")`), `sameInputDifferentCiphertext`, `tamperedCiphertextThrows` (flip one base64 char after prefix), `nullAndBlankReturnNull`, `isEncryptedDetectsPrefix`. Masking: `maskAadhaar("999988887777") == "XXXXXXXX7777"`, `maskPan("ABCDE1234F") == "XXXXXX234F"`, `maskAadhaar("12") == "XX"`, `maskPan(null) == null`.
- [ ] **Step 2:** Run `.\mvnw.cmd test -Dtest=Kyc*Test` → FAIL.
- [ ] **Step 3:** Implement with `Cipher.getInstance("AES/GCM/NoPadding")`, `GCMParameterSpec(128, iv)`, `SecureRandom` 12-byte IV, `Base64.getEncoder()`. Construct crypto in a plain unit test via `new KycCryptoService(testProperties)`.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5: Commit** `feat(backend): AES-256-GCM KYC crypto and masking`.

### Task 3: KYC at rest, BCrypt passwords, legacy migration, seeds

**Files:**
- Create: `security/crypto/KycEncryptedConverter.java`, `config/SecurityDataMigration.java`, `config/security/PasswordConfig.java` (temporary home for the `PasswordEncoder` bean; moved into `SecurityConfig` in Task 5)
- Modify: `entity/User.java` (`@Convert(converter = KycEncryptedConverter.class)` on `aadharNumber`/`panNumber`, `length = 255`), `service/mapper/DtoMapper.java` (lines ~52-53: masked values), `service/AuthService.java` (encode on register, `matches` on login + dummy compare for unknown user), `config/DataInitializer.java` (seed plain numbers `999988887777`/`ABCDE1234F`, `888877776666`/`PRYNR7890K`, `777766665555`/`ROHNG5678L`; passwords via `passwordEncoder.encode("password123")`)
- Test: `config/SecurityDataMigrationTest.java`, extend `AuthControllerTest`

**Interfaces:**
- Consumes: `KycCryptoService`, `KycMasking`.
- Produces: `PasswordEncoder` bean (`new BCryptPasswordEncoder(12)`); `KycEncryptedConverter implements AttributeConverter<String,String>` using a static holder `KycEncryptedConverter.init(KycCryptoService)` called from a `@PostConstruct` in `KycCryptoService`; `SecurityDataMigration implements ApplicationRunner` with `@Order(Ordered.HIGHEST_PRECEDENCE)` and `int migrate()` returning number of rows changed. `DtoMapper.toUserResponse(user, …)` now always emits masked KYC (the `includeKyc` decision lands in Task 7).

Note: because the converter decrypts transparently, `User.getAadharNumber()` returns plaintext inside the backend; the migration must read raw column values via `JdbcTemplate` (`SELECT id, password, aadhar_number, pan_number FROM users`) and write back via `JdbcTemplate` so it bypasses the converter.

- [ ] **Step 1: Write failing tests.** `SecurityDataMigrationTest` (`@SpringBootTest @ActiveProfiles("test")`): insert a row via `JdbcTemplate` with password `plain123`, aadhar `9999-1111-2222` (legacy plaintext) and pan `XXXX-XXXX-8921` (legacy pre-masked); `migrate()` → password starts with `$2`, `passwordEncoder.matches("plain123", stored)`, aadhar column starts with `enc:v1:`, legacy-masked value now `NULL`; second `migrate()` returns `0`. `AuthControllerTest`: `seededPasswordIsHashed` (`userRepository.findByUsername("aman")` password starts with `$2`), `loginResponseMasksKyc` (`$.data.user.aadharNumber == "XXXXXXXX7777"` for aman after login — keep existing login assertions except `$.data.token`, which stays until Task 5).
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement converter, migration (normalise aadhar: strip `[\s-]`; pan: trim + uppercase; any value containing `X` → `NULL`), `PasswordConfig`, AuthService/DataInitializer/DtoMapper changes.
- [ ] **Step 4:** `.\mvnw.cmd test` → all PASS.
- [ ] **Step 5: Commit** `feat(backend): BCrypt passwords, encrypted KYC columns and legacy migration`.

### Task 4: Sessions, token issuing, cookies

**Files:**
- Create: `security/session/UserSession.java`, `SessionRevokeReason.java`, `UserSessionRepository.java`, `SessionService.java`, `IssuedSession.java`; `security/token/TokenHashing.java`, `JwtTokenService.java`, `AuthCookieService.java`
- Modify: `pom.xml` — add only `org.springframework.security:spring-security-oauth2-jose` (gives `NimbusJwtEncoder`/`NimbusJwtDecoder` without security auto-configuration, so existing endpoints stay open until Task 5). The resource-server starter replaces it in Task 5.
- Test: `security/session/SessionServiceTest.java`, `security/token/AuthCookieServiceTest.java`

**Interfaces:**
- `enum SessionRevokeReason { LOGOUT, REUSE_DETECTED, PASSWORD_CHANGED }`
- `UserSession` (extends `BaseAuditEntity`) fields per §4.1 incl. `previousRefreshTokenHash`; `boolean isActive(Instant now)` = `revokedAt == null && expiresAt.isAfter(now)`.
- `UserSessionRepository`: `Optional<UserSession> findBySessionId(String)`, `@Lock(PESSIMISTIC_WRITE) @Query … Optional<UserSession> findForUpdateByRefreshTokenHash(String)`, `Optional<UserSession> findByPreviousRefreshTokenHash(String)`, `Optional<UserSession> findByRefreshTokenHash(String)`.
- `final class TokenHashing { static String sha256Hex(String); static String newRefreshToken(); }` (32 bytes `SecureRandom`, base64url no padding).
- `record IssuedSession(UserSession session, String refreshToken, String accessToken)`.
- `@Service SessionService`:
  - `IssuedSession open(User user, String userAgent, String ip)` — always a new UUID `sessionId`; `expiresAt = now + refreshTokenTtl`.
  - `IssuedSession rotate(String refreshToken)` — `@Transactional`; throws `SessionRevokedException` (new, extends `UnauthorizedException`, carries `ErrorCode.SESSION_REVOKED`) on reuse (revoke with `REUSE_DETECTED` first), revoked or expired; throws `UnauthorizedException` with `ErrorCode.UNAUTHENTICATED` when not found.
  - `void revokeByRefreshToken(String refreshToken, SessionRevokeReason reason)` — no-op when unknown; matches current or previous hash.
  - `boolean isActive(String sessionId)`.
- `@Service JwtTokenService`: `String issueAccessToken(Long userId, String username, String sessionId, Instant issuedAt)`; `String issueAccessToken(Long userId, String username, String sessionId)` (uses `Clock`). Uses `NimbusJwtEncoder` over `ImmutableSecret` HS256.
- `@Component AuthCookieService`: `ResponseCookie accessCookie(HttpServletRequest req, String jwt)`, `ResponseCookie refreshCookie(HttpServletRequest req, String token, Instant sessionExpiresAt)` (Max-Age = seconds until `expiresAt`), `ResponseCookie clearAccessCookie(HttpServletRequest req)`, `ResponseCookie clearRefreshCookie(HttpServletRequest req)`, `static boolean isLocalHost(String serverName)` (true for `localhost`, `127.0.0.1`, `::1`, `[::1]`, case-insensitive), `void applyHostRules(ResponseCookie.ResponseCookieBuilder b, HttpServletRequest req)` (sets `secure(!local)` and `domain(cookieDomain)` only when not local and non-blank; reused by the CSRF cookie customizer in Task 5), `void writeSession(HttpServletRequest, HttpServletResponse, IssuedSession)`, `void clearSession(HttpServletRequest, HttpServletResponse)`; constants `ACCESS_COOKIE = "_sid"`, `REFRESH_COOKIE = "_rid"`.
- `ErrorCode` enum (`exception/ErrorCode.java`) with the six codes; `UnauthorizedException` gains `ErrorCode code()` (default `UNAUTHENTICATED`) and a `(String message, ErrorCode code)` constructor.
- Add a `Clock` bean (`Clock.systemUTC()`) in `PasswordConfig` (renamed in Task 5).

- [ ] **Step 1: Write failing tests.** `SessionServiceTest` (`@SpringBootTest @ActiveProfiles("test") @Transactional`, user `aman`): `openCreatesNewSessionIdEachTime` (two opens → different `sessionId` and refresh token); `refreshTokenStoredOnlyAsHash` (entity hash == `sha256Hex(token)`, never equals token); `rotateIssuesNewTokenAndKeepsExpiry` (new token ≠ old, `expiresAt` unchanged, `previousRefreshTokenHash` == old hash); `rotateTwiceWithSameTokenRevokesSession` (second call throws `SessionRevokedException`, session `revokeReason == REUSE_DETECTED`, and the *new* token now also fails); `rotateAfterRevokeFails` (`revokeByRefreshToken(t, LOGOUT)` then `rotate(t)` → `SessionRevokedException`); `rotateAfterExpiryFails` (set `expiresAt` in past); `revokedSessionNeverReactivates` (after revoke, `open()` for same user returns a different `sessionId`, old `isActive` stays false). `AuthCookieServiceTest` (`MockHttpServletRequest` with `setServerName`): `accessCookieAttributes` (`isHttpOnly`, `getSameSite()=="Lax"`, name `_sid`, path `/api`, maxAge 900s); `refreshCookieAttributes` (name `_rid`, `getSameSite()=="Strict"`, path `/api/auth`); `localhostHasNoSecureNoDomain` (server names `localhost`, `127.0.0.1`, `::1`, `LOCALHOST` → `!isSecure()`, `getDomain()==null`, even with `cookieDomain="aaspass.in"`); `realHostIsSecure` (`app.aaspass.in`, empty domain → `isSecure()`, `getDomain()==null`); `realHostUsesConfiguredDomain` (`app.aaspass.in`, `cookieDomain="aaspass.in"` → `getDomain()=="aaspass.in"`); `clearCookiesHaveZeroMaxAgeAndSamePathDomain`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** `.\mvnw.cmd test` → PASS.
- [ ] **Step 5: Commit** `feat(backend): user sessions with rotating refresh tokens, JWT issuing and auth cookies`.

### Task 5: Spring Security chain and cookie auth endpoints

**Files:**
- Modify: `pom.xml` — replace `spring-security-oauth2-jose` with `spring-boot-starter-oauth2-resource-server`; add `spring-boot-starter-security-test` (or `org.springframework.security:spring-security-test`, test scope — use whichever resolves on Boot 4.0.8).
- Create: `config/security/SecurityConfig.java` (absorbs `PasswordConfig`, delete that file), `CookieBearerTokenResolver.java`, `ExpiryValidator.java`, `ActiveSessionValidator.java`, `ApiAuthErrorHandlers.java`, `CsrfCookieFilter.java`, `CurrentUser.java`; `src/test/java/com/aaspass/support/AuthTestSupport.java`
- Modify: `dto/response/ApiResponse.java` (add nullable `String code` component + `static <T> ApiResponse<T> error(String message, ErrorCode code)`; keep existing factories), `dto/response/AuthResponse.java` (remove `token`, `tokenType`), `service/AuthService.java` (login/register return `AuthResult(UserResponse user, IssuedSession session)` record; add `UserResponse getUser(Long id)`), `controller/AuthController.java`, `exception/GlobalExceptionHandler.java` (`UnauthorizedException` → body with `code`), `config/WebMvcConfig.java` (expose `CorsConfigurationSource` bean, add `PATCH`), remove `@CrossOrigin` from all 5 controllers.
- Test: rewrite `controller/AuthControllerTest.java`

**Interfaces:**
- Consumes: Task 4 services, `SecurityProperties`.
- Produces:
  - `CurrentUser`: `Long requireUserId()` (throws `UnauthorizedException`), `Optional<Long> optionalUserId()`, `Optional<String> sessionId()` — reads `JwtAuthenticationToken` from `SecurityContextHolder`.
  - Validator error codes: `ExpiryValidator` → `OAuth2Error("token_expired")` (clock skew 0, uses `Clock`); `ActiveSessionValidator` → `OAuth2Error("session_revoked")`. Decoder = `NimbusJwtDecoder.withSecretKey(...).macAlgorithm(HS256)` + `DelegatingOAuth2TokenValidator(new JwtIssuerValidator("aaspass"), expiryValidator, activeSessionValidator)`.
  - Entry point maps: walk exception cause chain for `JwtValidationException`; error code `token_expired` → `TOKEN_EXPIRED`, `session_revoked` → `SESSION_REVOKED`, else `UNAUTHENTICATED`. Access-denied handler: `CsrfException` → `403 CSRF_INVALID`, else `403 FORBIDDEN`. Both write `ApiResponse.error(message, code)` as JSON via the app's `ObjectMapper`.
  - `CookieBearerTokenResolver implements BearerTokenResolver` — returns `null` for `/api/auth/login`, `/register`, `/refresh`, `/logout`; otherwise `_sid` value or `null`.
  - Chain: `csrf` with `CookieCsrfTokenRepository.withHttpOnlyFalse()` (cookie path `/`, `SameSite=Strict`, `setCookieCustomizer(b -> authCookieService.applyHostRules(b, currentRequest))`), `CsrfTokenRequestAttributeHandler`, ignoring `POST /api/auth/login|register|refresh`; `CsrfCookieFilter` after `BasicAuthenticationFilter`; `sessionManagement STATELESS`; `cors(withDefaults())`; `oauth2ResourceServer(o -> o.bearerTokenResolver(resolver).jwt(withDefaults()).authenticationEntryPoint(entry))`; authorization rules per spec §5.1 (`/api/users/{id}` GET permitAll, `/api/stores/**` GET permitAll, `POST /api/stores/*/views` permitAll, the four auth endpoints permitAll, `anyRequest().authenticated()`); `httpBasic`/`formLogin` disabled.
  - `AuthController`: `POST /login`, `/register` → `authCookieService.writeSession(...)`, body `ApiResponse<AuthResponse>`; `POST /refresh` → reads `_rid` via `@CookieValue(required=false)`, on any `UnauthorizedException` clears cookies then rethrows; body `ApiResponse<UserResponse>`; `POST /logout` → `revokeByRefreshToken(rt, LOGOUT)` if present, always `clearSession` (the refresh cookie is always sent to `/api/auth/*`, so it alone identifies the session; the access cookie is deliberately not read here — a narrowing of spec §3.5 that removes the stale-access-cookie edge case); `GET /me` → `currentUser.requireUserId()`.
  - `AuthTestSupport`: `static Cookie[] login(MockMvc, String username, String password)` returning `_sid` + `_rid` cookies; `static Cookie cookie(MvcResult, String name)`.
  - Login with unknown user still runs `passwordEncoder.matches(raw, DUMMY_HASH)` (static BCrypt hash constant).

- [ ] **Step 1: Write failing tests** in `AuthControllerTest` (keep existing credential tests, drop `$.data.token` assertions):
  - `loginSetsHttpOnlyCookiesAndNoTokenInBody` — `Set-Cookie` for `_sid` contains `HttpOnly`, `SameSite=Lax`, `Path=/api`, `Max-Age=900` and (MockMvc host is `localhost`) no `Secure` and no `Domain`; `_rid` contains `HttpOnly`, `SameSite=Strict`, `Path=/api/auth`; `$.data.token` does not exist.
  - `invalidCredentialsReturnCode` — wrong password and unknown user both → 401, `$.code == "INVALID_CREDENTIALS"`, `$.message == "Invalid username or password"`.
  - `meWithoutCookieIsUnauthenticated` → 401 `UNAUTHENTICATED`.
  - `meWithCookieReturnsUser` → 200 `$.data.username == "aman"`.
  - `expiredAccessTokenReturnsTokenExpired` — cookie from `jwtTokenService.issueAccessToken(id, "aman", sid, now.minus(16, MINUTES))` → 401 `TOKEN_EXPIRED`.
  - `publicEndpointWithExpiredCookieReturnsTokenExpired` — `GET /api/stores` with expired cookie → 401 `TOKEN_EXPIRED`; without cookie → 200.
  - `refreshRotatesBothCookies` — new `_rid` value ≠ old, new `_sid` present, `$.data.username == "aman"`.
  - `refreshReuseRevokesSession` — refresh with old RT twice → second 401 `SESSION_REVOKED` and response clears both cookies (`Max-Age=0`).
  - `logoutRevokesAndClears` — logout (with `csrf()` + cookies) → 200, cookies cleared; old AT on `/me` → 401 `SESSION_REVOKED`.
  - `noRejoinAfterLogout` — capture AT+RT, logout, replay: `/me` → 401 `SESSION_REVOKED`; `/refresh` → 401 `SESSION_REVOKED` and no `Set-Cookie` with non-empty `_sid`.
  - `reLoginGetsNewSessionId` — decode `sid` from AT before logout and after re-login → different.
  - `loginSucceedsWithGarbageAccessCookie` — `_sid=garbage` + valid credentials → 200.
  - `logoutSucceedsWithExpiredAccessCookie` → 200.
  - `registerHashesPasswordAndSetsCookies` — new user; repository password starts `$2`; cookies set.
- [ ] **Step 2:** Run `.\mvnw.cmd test -Dtest=AuthControllerTest` → FAIL.
- [ ] **Step 3:** Implement. Update `StoreAndUserControllerTest` minimally so it compiles and passes: write calls use `AuthTestSupport.login(...)` cookies + `with(csrf())` (ownership assertions come in Task 6).
- [ ] **Step 4:** `.\mvnw.cmd test` → all PASS.
- [ ] **Step 5: Commit** `feat(backend): Spring Security JWT cookie auth with refresh rotation and CSRF`.

### Task 6: Ownership lockdown and KYC endpoint

**Files:**
- Create: `exception/ForbiddenException.java`, `dto/request/KycUpdateRequest.java`; test `controller/OwnershipAndKycTest.java`
- Modify: `exception/GlobalExceptionHandler.java` (`ForbiddenException` → 403 `FORBIDDEN`), `controller/UserController.java`, `controller/StoreController.java`, `controller/StoreServiceItemController.java`, `controller/StoreReviewController.java`, `service/UserService.java`, `service/StoreService.java`, `service/StoreServiceItemService.java`, `service/StoreReviewService.java`, `service/mapper/DtoMapper.java`, `dto/request/UserUpdateRequest.java` (remove KYC; add `@JsonIgnoreProperties(ignoreUnknown = true)`), `dto/request/StoreCreateRequest.java` (remove `userId`), `dto/request/StoreReviewRequest.java` (remove `userName`/`userAvatar` requirement — reviewer from caller), `controller/AuthController.java` if `me` mapping needs `includeKyc`.
- Test: update `controller/StoreAndUserControllerTest.java`

**Interfaces:**
- Consumes: `CurrentUser`.
- Produces:
  - `UserController`: private `void assertSelf(Long pathUserId)` → `ForbiddenException("You can only modify your own account")`; applied to `PUT /{id}` and all address endpoints. `PUT /api/users/me/kyc` (`@Valid KycUpdateRequest`) — mapping declared so it doesn't collide with `PUT /{id}` (literal `me` wins over pattern).
  - `KycUpdateRequest(String aadharNumber, String panNumber)`.
  - `UserService.updateKyc(Long userId, KycUpdateRequest)` — normalise (Aadhaar strip `[\s-]`, must match `^\d{12}$`; PAN trim+upper, `^[A-Z]{5}[0-9]{4}[A-Z]$`), else `BadRequestException("Aadhaar must be 12 digits")` / `("PAN must look like ABCDE1234F")`; null field = unchanged.
  - `DtoMapper.toUserResponse(User user, boolean includeStores, boolean includeKyc)` — KYC fields `null` unless `includeKyc`; `GET /api/users/{id}` passes `includeKyc = id.equals(currentUser.optionalUserId().orElse(null))`; `/auth/me`, login, register, refresh, `PUT /users/{id}`, KYC update pass `true`. (Adjust the existing 3-arg call sites; check current second/third params' meaning before changing.)
  - `StoreService.assertStoreOwner(Long storeId, Long userId)` — throws `ResourceNotFoundException` if no store, `ForbiddenException("You don't own this store")` otherwise; called in update, delete, toggle-status and all service-item mutations. `createStore(Long ownerId, StoreCreateRequest)`. `StoreReviewService.addReview(Long storeId, Long reviewerId, StoreReviewRequest)` (name/avatar from the `User`). `recordStoreView(Long id, Optional<Long> viewerId)`; `viewerId` query param removed.

- [ ] **Step 1: Write failing tests** `OwnershipAndKycTest` (login as `aman` and `priya` via `AuthTestSupport`):
  - `cannotUpdateAnotherUser` — aman `PUT /api/users/{priyaId}` → 403 `$.code == "FORBIDDEN"`.
  - `cannotTouchAnotherUsersAddresses` — aman `GET /api/users/{priyaId}/addresses` → 403.
  - `cannotUpdateAnotherUsersStore` — aman `PUT /api/stores/{priyaStoreId}` → 403; `PATCH …/toggle-status` → 403; `POST /api/stores/{priyaStoreId}/services` → 403.
  - `createStoreUsesCaller` — aman creates store; `$.data.userId == amanId`.
  - `reviewerIsCaller` — review posted by aman has `userName == "Aman Sharma"` regardless of body.
  - `writeWithoutCsrfIsRejected` — aman `PUT /api/users/{amanId}` with cookies but no `csrf()` → 403 `CSRF_INVALID`.
  - `kycUpdateEncryptsAndMasks` — `PUT /api/users/me/kyc {"aadharNumber":"123412341234","panNumber":"PQRST6789Z"}` → `$.data.aadharNumber == "XXXXXXXX1234"`, `$.data.panNumber == "XXXXXX789Z"`; raw column via `JdbcTemplate` starts `enc:v1:`.
  - `kycUpdateNormalisesInput` — `"9999 8888-7777"` and `"abcde1234f"` → 200, masks `XXXXXXXX7777`, `XXXXXX234F`.
  - `kycUpdateRejectsBadFormat` — `"12345"` → 400; `"ABC123"` → 400.
  - `updateUserIgnoresKycFields` — `PUT /api/users/{amanId}` with `"aadharNumber":"XXXXXXXX0000"` → 200 and stored Aadhaar still decrypts to seeded value.
  - `publicProfileHidesKyc` — anonymous `GET /api/users/{amanId}` → `$.data.aadharNumber` is null; aman's own → masked.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement; update `StoreAndUserControllerTest` payloads (no `userId` in store create, no KYC in user update).
- [ ] **Step 4:** `.\mvnw.cmd test` → all PASS; `.\mvnw.cmd test-compile` clean.
- [ ] **Step 5: Commit** `feat(backend): owner-only writes, caller-derived identities and KYC update endpoint`.

---

## Frontend

### Task 7: Toast service and toaster component

**Files:**
- Create: `src/app/models/toast.model.ts`, `src/app/services/toast/toast.service.ts`, `src/app/services/toast/toast.service.spec.ts`, `src/app/components/toaster/toaster.ts`, `toaster.html`, `toaster.spec.ts`
- Modify: `src/app/app.ts` (import `ToasterComponent`), `src/app/app.html` (`<app-toaster />` after `<app-navbar />`)

**Interfaces:**
- Produces: `type ToastType = 'success' | 'error' | 'warning' | 'info'`; `interface Toast { id: number; type: ToastType; message: string; title?: string; durationMs: number }`. `ToastService` (singleton — use `@Service()` per client CLAUDE.md; if that decorator does not exist in the installed Angular, use `@Injectable({ providedIn: 'root' })`): `readonly toasts: Signal<Toast[]>`, `success(message, title?)`, `error(message, title?)`, `warning(message, title?)`, `info(message, title?)`, `show(type, message, title?)`, `dismiss(id)`, `clear()`, `pause(id)`, `resume(id)`. Durations 4000 (success/info) / 6000 (warning/error); max 4; duplicate `type+message` restarts timer instead of adding. `ToasterComponent` selector `app-toaster`.

- [ ] **Step 1: Write failing tests.** Service (`vi.useFakeTimers()`): `addsToast`, `autoDismissesSuccessAfter4s` (present at 3999ms, gone at 4000ms), `autoDismissesErrorAfter6s`, `capsAtFour` (5 adds → 4, first dropped), `dedupesIdenticalMessage` (2× same → length 1), `pauseStopsTimer`, `dismissRemoves`. Component: `rendersErrorInAlertRegion` (error toast inside `[role="alert"]`), `rendersSuccessInPoliteRegion` (`[aria-live="polite"]`), `closeButtonDismisses` (button `aria-label="Dismiss notification"` click → empty), `escapeDismissesFocusedToast`.
- [ ] **Step 2:** `npx ng test --watch=false` → FAIL.
- [ ] **Step 3:** Implement. Layout: fixed `top-4 right-4` on `sm:` and up, `inset-x-4 top-4` on mobile; icon + text per type; `motion-safe:` transitions; `(mouseenter)`/`(focusin)` pause, `(mouseleave)`/`(focusout)` resume via `host`-free template bindings.
- [ ] **Step 4:** Tests PASS; `npm run build` clean.
- [ ] **Step 5: Commit** `feat(client): shared toast service and accessible toaster`.

### Task 8: Dev proxy, models, error-toast interceptor

**Files:**
- Create: `aaspass-client/proxy.conf.json` (`{"/api": {"target": "http://localhost:8080", "secure": false, "changeOrigin": false}}`), `src/app/interceptors/http-context.ts`, `src/app/interceptors/error-toast.interceptor.ts`, `error-toast.interceptor.spec.ts`
- Modify: `angular.json` (`serve.options.proxyConfig: "proxy.conf.json"`), `src/app/config/api.config.ts` (`API_BASE_URL = '/api'`), `src/app/models/response.model.ts` (`ApiResponse.code?: ApiErrorCode`; export `type ApiErrorCode = 'TOKEN_EXPIRED' | 'UNAUTHENTICATED' | 'SESSION_REVOKED' | 'INVALID_CREDENTIALS' | 'FORBIDDEN' | 'CSRF_INVALID'`; remove `token`/`tokenType` from `BackendAuthResponse`), `src/app/models/request.model.ts` (remove KYC from `UpdateUserPayload`, add `KycUpdatePayload { aadharNumber?: string; panNumber?: string }`, remove `userId` from `CreateStorePayload`), `src/app/app.config.ts` (`withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' })`, `withInterceptors([errorToastInterceptor])` — refresh interceptor appended in Task 9)

**Interfaces:**
- Produces: `export const SKIP_ERROR_TOAST = new HttpContextToken<boolean>(() => false)`; `export const SKIP_AUTH_REFRESH = new HttpContextToken<boolean>(() => false)`; `export const errorToastInterceptor: HttpInterceptorFn`; `export function toastMessageFor(err: HttpErrorResponse): { type: ToastType; message: string } | null` (pure, exported for tests). Messages copied verbatim from spec §7.1 table. Re-throws via `throwError(() => err)`.

- [ ] **Step 1: Write failing tests** (`provideHttpClient(withInterceptors([errorToastInterceptor]))` + `provideHttpClientTesting()`): one test per §7.1 row asserting `toastMessageFor` output (e.g. `401 {code:'SESSION_REVOKED'}` → `{type:'warning', message:'Your session has ended. Please log in again.'}`; `401 TOKEN_EXPIRED` → `null`; `400 {message:'Username already in use'}` → that message; status 0 → connection message; 503 → server message; 404 without message → fallback); `skipTokenSuppressesToast` (request with `SKIP_ERROR_TOAST` → `toasts()` empty); `errorIsRethrown` (subscriber `error` callback called); `nonApiFailureWithHtmlBodyUsesGenericMessage` (500 with string body → generic message, never raw text).
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement; update `auth-http.service.spec.ts` / `store-http.service.spec.ts` URL expectations to `/api/...`.
- [ ] **Step 4:** Tests PASS; `npm run build` clean.
- [ ] **Step 5: Commit** `feat(client): dev proxy, XSRF config and API error toasts`.

### Task 9: Silent refresh, AuthService rewrite, guard

**Files:**
- Create: `src/app/interceptors/auth-refresh.interceptor.ts`, `auth-refresh.interceptor.spec.ts`
- Modify: `src/app/services/auth/auth-http.service.ts` (add `refresh()`, `me()`, `updateKyc()`; background calls carry `SKIP_ERROR_TOAST`/`SKIP_AUTH_REFRESH` contexts as listed below), `src/app/services/auth/auth.service.ts` (rewrite), `auth.service.spec.ts` (rewrite), `src/app/guards/auth.guard.ts`, `src/app/app.config.ts` (`withInterceptors([errorToastInterceptor, authRefreshInterceptor])`, `provideAppInitializer(() => inject(AuthService).restoreSession())`), `src/app/pages/auth/auth-page.ts|html`, `src/app/components/navbar/navbar.ts|html`, `src/app/services/store/store.service.ts` (replace every `authService.saveSession(x)` with `authService.setCurrentUser(x)`; derive `currentUser` from `authService.currentUser` instead of copying)

**Interfaces:**
- Consumes: `SKIP_ERROR_TOAST`, `SKIP_AUTH_REFRESH`, `ToastService`.
- Produces:
  - `AuthHttpService.refresh(): Observable<ApiResponse<BackendUserResponse>>` (context: skip toast + skip refresh), `me(): Observable<ApiResponse<BackendUserResponse>>` (skip toast), `logout()` (skip toast + skip refresh), `updateKyc(payload: KycUpdatePayload): Observable<ApiResponse<BackendUserResponse>>` → `PUT /users/me/kyc`. `login`/`register` carry `SKIP_AUTH_REFRESH`.
  - `authRefreshInterceptor: HttpInterceptorFn` — on `401` with `code === 'TOKEN_EXPIRED'`, or `UNAUTHENTICATED` while `authService.isLoggedIn()`, and not `SKIP_AUTH_REFRESH`: share one in-flight `refresh()` (module-level `Observable` with `shareReplay({ bufferSize: 1, refCount: false })`, reset on finalize), then retry the original request once; on refresh failure call `authService.handleSessionEnded()` and rethrow the original error.
  - `AuthService`: `readonly currentUser: Signal<UserProfile | null>`; `isLoggedIn`; `readonly sessionRestored: Signal<boolean>`; `restoreSession(): Promise<void>`; `login(usernameOrEmail: string, password: string): Observable<UserProfile>`; `signup(request: SignupRequest): Observable<UserProfile>`; `logout(): void`; `setCurrentUser(user: UserProfile | null): void`; `updateUserProfile(updated: Partial<UserProfile>): Observable<UserProfile>`; `updateKyc(payload: KycUpdatePayload): Observable<UserProfile>`; `handleSessionEnded(): void` (clears user, navigates to `/login?returnUrl=<router.url>`); keep `mapBackendUserToProfile`, modal signals (`isModalOpen`, `modalMode`, `returnUrl`, `openLoginModal`, `openSignupModal`, `closeModal`, `setModalMode`). **Removed:** `authError`, `authSuccessMessage`, `demoAccounts`, `DemoAccount`, `quickLogin`, `getRegisteredAccounts`, `saveSession`, all `localStorage` keys. Success toasts: login `Welcome back, {name}!`, signup `Account created successfully! Welcome to AasPass, {name}!`, logout `You've been logged out.`
  - `authGuard` returns `Promise<boolean | UrlTree>` awaiting `restoreSession()` (memoised promise) before checking `isLoggedIn()`.
  - `auth-page`: local `readonly formError = signal<string | null>(null)` for client-side checks only; subscribes to `login`/`signup` and navigates on success; server errors come from toasts.

- [ ] **Step 1: Write failing tests.** Interceptor (`HttpTestingController`): `refreshesOnceForConcurrent401s` (two requests 401 `TOKEN_EXPIRED` → exactly one `/api/auth/refresh` request; both originals retried and succeed); `retriesOnlyOnce` (retried request 401 again → error surfaces, no second refresh); `doesNotRefreshAuthEndpoints` (401 on `/api/auth/login` → no refresh); `refreshFailureEndsSession` (refresh 401 → `handleSessionEnded` called, original error rethrown); `publicGetRecoversAfterRefresh` (`GET /api/stores` 401 `TOKEN_EXPIRED` → refresh → retried 200); `noToastWhenRefreshSucceeds` (with both interceptors registered, `ToastService.toasts()` empty after recovered 401). AuthService: `loginSetsUserFromBackendOnly` (flush 200 → `currentUser().username === 'aman'`; flush 401 → `currentUser()` null and nothing in `localStorage`); `restoreSessionGuestIsSilent` (`/auth/me` 401 → `sessionRestored()` true, user null, no toasts); `logoutClearsUser`. Guard: `guardWaitsForRestore` (pending `/auth/me` → guard promise unresolved; flush 200 → resolves `true`).
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement; fix all compile errors from removed members (navbar, auth-page, store.service, store-detail).
- [ ] **Step 4:** Tests PASS; `npm run build` clean.
- [ ] **Step 5: Commit** `feat(client): cookie session restore, silent token refresh and backend-only auth state`.

### Task 10: Profile KYC UI, store payloads, toast migration

**Files:**
- Modify: `src/app/pages/profile/profile.ts|html`, `src/app/pages/create-store/create-store.ts|html`, `src/app/pages/store-detail/store-detail.ts|html`, `src/app/services/store/store.service.ts`, `src/app/services/store/store-http.service.ts` (+ spec), `src/app/services/store/store.service.spec.ts`

**Interfaces:**
- Consumes: `AuthService.updateUserProfile`, `AuthService.updateKyc`, `ToastService`.
- Produces: profile page signals `editingKyc = signal<'aadhaar' | 'pan' | null>(null)`, `kycInput = signal('')`; methods `startKycEdit(field)`, `cancelKycEdit()`, `submitKyc()`. `StoreHttpService.recordStoreView(storeId)` (no `viewerId`), `createStore(payload)` without `userId`; review payload without `userName`/`userAvatar`; view-recording request carries `SKIP_ERROR_TOAST`.

- [ ] **Step 1: Write failing tests.** `store-http.service.spec.ts`: `recordStoreViewHasNoViewerParam` (URL `/api/stores/5/views`, no query); `createStorePayloadHasNoUserId`. `store.service.spec.ts` / new `profile` spec: `profileSaveSendsNoKyc` (captured `PUT /api/users/{id}` body has no `aadharNumber`/`panNumber` keys); `submitKycCallsKycEndpoint` (`PUT /api/users/me/kyc` with typed value; on 200 profile shows `XXXXXXXX1234`; on 400 a toast appears and edit stays open).
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement. Profile: masked value read-only with an "Update" button; inline input (`inputmode="numeric"` for Aadhaar, `autocomplete="off"`, uppercase for PAN) + Save/Cancel; remove `editAadhar`/`editPan` from the general form. Replace `showErrorToast`/`errorToastTimer` (create-store), `notificationMessage`/`showToast` (store-detail), `viewSimulationToast` and success alert (profile) with `ToastService` calls; delete their template blocks.
- [ ] **Step 4:** Tests PASS; `npm run build` clean; grep `aaspass-client/src` for `localStorage`, `notificationMessage`, `showErrorToast`, `viewSimulationToast`, `aaspass_auth` → no hits.
- [ ] **Step 5: Commit** `feat(client): masked KYC editing, caller-derived store payloads and unified toasts`.

### Task 11: End-to-end check and docs

**Files:**
- Modify: `README.md` (dev proxy, `AASPASS_JWT_SECRET` / `AASPASS_KYC_KEY`, auth model, demo accounts still `password123`), `doc/PROJECT_DETAILS.md` (security architecture, API table incl. `/auth/refresh`, `/users/me/kyc`, ER diagram `user_sessions`, roadmap: JWT done), `doc/AI-doc/CHANGELOG.md` (new top entry).

- [ ] **Step 1:** `cd aaspass-service-backend; .\mvnw.cmd test-compile; .\mvnw.cmd test` → BUILD SUCCESS, 0 failures.
- [ ] **Step 2:** `cd aaspass-client; npx ng test --watch=false; npm run build` → all pass, build clean.
- [ ] **Step 3: Manual smoke** (backend `spring-boot:run` on MySQL, `npm start`): log in as `aman` → DevTools shows `_sid`/`_rid` HttpOnly, nothing in `localStorage`; Profile shows `XXXXXXXX7777`; reload stays logged in; delete only `_sid` cookie → next action silently refreshes; wrong password shows error toast; logout → toast, protected page redirects to login; MySQL `users.aadhar_number` starts `enc:v1:`, `users.password` starts `$2`.
- [ ] **Step 4:** Update the three docs.
- [ ] **Step 5: Commit** `docs: document cookie JWT auth, encrypted KYC and toaster`.
