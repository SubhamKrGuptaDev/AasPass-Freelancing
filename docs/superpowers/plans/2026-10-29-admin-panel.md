# Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a separate admin app (`aaspass-admin/`) plus a `/api/admin/**` backend module so admins can log in, search and block stores, suspend users, and verify each user's mobile/PAN/Aadhaar — with real verified badges in the marketplace client.

**Architecture:** One Spring Boot service gains a `com.aaspass.admin` package behind its own `SecurityFilterChain` (issuer `aaspass-admin`, cookies `_asid`/`_arid`, `admin_sessions`). Existing `User`/`Store` entities gain suspension, verification and admin-block fields that the user-facing API enforces. A new Angular 22 workspace consumes the admin API; `aaspass-client` renders the new states.

**Tech Stack:** Java 17, Spring Boot, Spring Security OAuth2 resource server (Nimbus HS256), JPA/Hibernate (MySQL; H2 in tests), Lombok, JUnit 5 + MockMvc; Angular 22, TypeScript 6 strict, Signals, Tailwind 4, Spartan UI, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-29-admin-panel-design.md`

## Global Constraints

- Backend compile check: `cd aaspass-service-backend; .\mvnw.cmd test-compile`. Frontend compile check: `npm run build` in each touched app.
- Java null-safety per `AGENTS.md`: guard chained getters, no bare `Optional.get()`, `"LITERAL".equals(x)`, no unchecked unboxing of `Boolean`/`Long`, return empty collections not `null`.
- Angular per `aaspass-client/CLAUDE.md`: no `any`, no `standalone: true`, no explicit `OnPush`, signals + `inject()`, native control flow, `class`/`style` bindings, `host` object, lazy feature routes, AXE / WCAG AA.
- Error envelope: `ApiResponse.error(message, ErrorCode)`; JSON field `$.code` carries the code.
- New error codes: `ACCOUNT_SUSPENDED`, `STORE_BLOCKED_BY_ADMIN` (both HTTP 403).
- Admin JWT issuer `aaspass-admin`, property `aaspass.admin.jwt-secret` (env `AASPASS_ADMIN_JWT_SECRET`), access TTL `PT15M`, refresh TTL `PT12H`.
- Admin cookies: `_asid` path `/api/admin` SameSite Lax; `_arid` path `/api/admin/auth` SameSite Strict.
- Dev bootstrap admin: `admin@aaspass.local` / `admin12345` / name `AasPass Admin` (dev profile only). Test profile: `admin@test.local` / `admin12345`.
- Reasons (block, reject, suspend): required, 1–500 chars. Suspension `until`: future and ≤ now + 365 days.
- Page `size` default 20, max 100. Dashboard recent lists: 10 rows.
- Admin dev server port 4300; CORS adds `http://localhost:4300`, `http://127.0.0.1:4300`.
- Audit `details` never contain raw phone/PAN/Aadhaar values.
- Commit attribution line on every commit: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Existing users after the schema update** — rows created before this change must load with all three checks `UNVERIFIED` and `adminBlocked=false` (not null, no NPE in mappers). Pinned in Task 1 (`newUserDefaultsToUnverified`, null-safe getters) and Task 2 (mapper test on a user whose embedded checks are null).
2. **User edits a verified value to the same value** — must stay `VERIFIED`; only a real change resets. Pinned in Task 1 (`samePhoneKeepsVerification`).
3. **A user JWT replayed in `_asid`, or an admin JWT in `_sid`** — both must be 401, never 500. Pinned in Task 4.
4. **Owner opens their own blocked store / suspended owner's store link** — owner still sees it (with block notice); everyone else gets 404. Pinned in Task 2.
5. **Admin verifies an item the user has not entered** — 400 with a clear message, no state change. Pinned in Task 6.

---

## File Structure

### Backend (`aaspass-service-backend/src/main/java/com/aaspass/`)

| File | Responsibility |
| :--- | :--- |
| `entity/VerificationStatus.java` (new) | enum `UNVERIFIED, VERIFIED, REJECTED` |
| `entity/VerificationCheck.java` (new) | `@Embeddable` status/reason/decidedAt/decidedByAdminId + `reset()`, `decide(...)` |
| `entity/User.java` | suspension fields, three checks, `isSuspended`, `isFullyVerified`, `updatePhone/updateAadharNumber/updatePanNumber` |
| `entity/Store.java` | `adminBlocked`, `adminBlockReason`, `adminBlockedAt`, `adminReviewedAt`, `reviewedByAdminId`, `isAdminHidden(Instant)` |
| `exception/ErrorCode.java`, `ForbiddenException.java`, `GlobalExceptionHandler.java` | new codes; `ForbiddenException` carries a code |
| `security/session/SessionRevokeReason.java`, `SessionService.java`, `UserSessionRepository.java` | `SUSPENDED`, `revokeAllForUser` |
| `service/AuthService.java`, `UserService.java`, `StoreService.java`, `repository/StoreRepository.java`, `controller/StoreController.java` | enforcement + visibility |
| `dto/response/UserResponse.java`, `StoreResponse.java`, `VerificationView.java` (new), `service/mapper/DtoMapper.java` | new response fields |
| `config/WebMvcConfig.java` | CORS origins from `aaspass.cors.allowed-origins` |
| `security/token/AuthCookieService.java` | public `buildCookie(...)` used by the admin cookie service |
| `config/security/SecurityConfig.java` | `@Order(2)`, explicit `jwt.decoder(...)` |
| `admin/config/AdminProperties.java`, `AdminBootstrap.java`, `AdminSecurityConfig.java` | admin config, seeding, filter chain |
| `admin/entity/AdminUser.java`, `AdminSession.java`, `AdminAuditEntry.java`, `AdminAuditAction.java`, `AuditTargetType.java` | admin persistence |
| `admin/repository/AdminUserRepository.java`, `AdminSessionRepository.java`, `AdminAuditRepository.java` | |
| `admin/security/AdminJwtTokenService.java`, `AdminSessionService.java`, `AdminIssuedSession.java`, `AdminCookieService.java`, `AdminCookieBearerTokenResolver.java`, `AdminActiveSessionValidator.java`, `CurrentAdmin.java` | admin auth |
| `admin/service/AdminAuthService.java`, `AdminAuditService.java`, `AdminStoreService.java`, `AdminUserService.java`, `AdminDashboardService.java`, `AdminStoreSpecs.java`, `AdminUserSpecs.java`, `AdminMapper.java` | admin logic |
| `admin/controller/AdminAuthController.java`, `AdminStoreController.java`, `AdminUserController.java`, `AdminDashboardController.java` | `/api/admin/**` |
| `admin/dto/*.java` | records listed per task |

Tests under `src/test/java/com/aaspass/` mirror these packages; `support/AdminTestSupport.java` logs an admin in.

### Admin app (`aaspass-admin/`) — new

`package.json`, `angular.json`, `proxy.conf.json`, `.postcssrc.json`, `tsconfig*.json`, `AGENTS.md`, `CLAUDE.md`, `scripts/copy-geo.mjs`, `src/styles.css`, `src/app/{app.ts,app.config.ts,app.routes.ts}`, `src/app/models/admin.models.ts`, `src/app/services/{admin-auth.service.ts,admin-api.service.ts,toast.service.ts}`, `src/app/guards/admin-auth.guard.ts`, `src/app/interceptors/{auth-refresh.interceptor.ts,error-toast.interceptor.ts}`, `src/app/components/{shell,toaster,status-chip,reason-dialog,pager}/`, `src/app/pages/{login,dashboard,stores,store-detail,users,user-detail}/`, `src/app/ui/` (copied Spartan helm: button, input, card, badge, separator, skeleton, utils).

### Client (`aaspass-client/src/app/`)

`models/response.model.ts`, `models/user.model.ts`, `models/store.model.ts`, `services/auth/auth.service.ts` (`mapBackendUserToProfile`), `services/store/store.service.ts` (`mapBackendStoreToProfile`), `interceptors/error-toast.interceptor.ts`, `components/verified-badge/` (new), `pages/profile/profile.html|ts`, `pages/store-detail/store-detail.html`, `components/store-card/store-card.html`.

---

## Task 1: Verification and moderation fields on User and Store

**Files:**
- Create: `entity/VerificationStatus.java`, `entity/VerificationCheck.java`
- Modify: `entity/User.java`, `entity/Store.java`, `exception/ErrorCode.java`, `exception/ForbiddenException.java`, `exception/GlobalExceptionHandler.java:44-50`, `service/UserService.java:53-110`
- Test: `src/test/java/com/aaspass/entity/UserVerificationTest.java`, `src/test/java/com/aaspass/controller/OwnershipAndKycTest.java` (add cases)

**Interfaces:**
- Produces:
  - `enum VerificationStatus { UNVERIFIED, VERIFIED, REJECTED }`
  - `@Embeddable class VerificationCheck { VerificationStatus status = UNVERIFIED; String reason; Instant decidedAt; Long decidedByAdminId; void reset(); void decide(VerificationStatus status, String reason, Long adminId, Instant at); boolean isVerified(); }`
  - `User`: `Instant suspendedUntil; String suspensionReason; VerificationCheck phoneVerification, panVerification, aadharVerification;` `boolean isSuspended(Instant now)`, `boolean isFullyVerified()`, `void updatePhone(String)`, `void updateAadharNumber(String)`, `void updatePanNumber(String)`; getters for the three checks never return `null` (lazily replace a null embedded with `new VerificationCheck()`).
  - `Store`: `Boolean adminBlocked = false; String adminBlockReason; Instant adminBlockedAt; Instant adminReviewedAt; Long reviewedByAdminId;` `boolean isAdminHidden(Instant now)` = `Boolean.TRUE.equals(adminBlocked) || (user != null && user.isSuspended(now))`.
  - `ErrorCode.ACCOUNT_SUSPENDED`, `ErrorCode.STORE_BLOCKED_BY_ADMIN`
  - `ForbiddenException(String message, ErrorCode code)`; `ErrorCode code()` (default `FORBIDDEN`).

- [ ] **Step 1: Write failing unit tests** in `UserVerificationTest` (plain JUnit, no Spring):

```java
@Test void newUserDefaultsToUnverified() {
    User u = User.builder().name("A").username("a").email("a@x").password("p").build();
    assertEquals(VerificationStatus.UNVERIFIED, u.getPhoneVerification().getStatus());
    assertEquals(VerificationStatus.UNVERIFIED, u.getPanVerification().getStatus());
    assertEquals(VerificationStatus.UNVERIFIED, u.getAadharVerification().getStatus());
    assertFalse(u.isFullyVerified());
}
@Test void nullEmbeddedCheckIsTreatedAsUnverified() {
    User u = new User(); u.setPhoneVerification(null);
    assertEquals(VerificationStatus.UNVERIFIED, u.getPhoneVerification().getStatus());
}
@Test void changingPhoneResetsOnlyPhoneCheck() {
    User u = verifiedUser(); u.updatePhone("+91 90000 00000");
    assertEquals(VerificationStatus.UNVERIFIED, u.getPhoneVerification().getStatus());
    assertNull(u.getPhoneVerification().getDecidedAt());
    assertEquals(VerificationStatus.VERIFIED, u.getPanVerification().getStatus());
}
@Test void samePhoneKeepsVerification() {
    User u = verifiedUser(); u.updatePhone(u.getPhone());
    assertEquals(VerificationStatus.VERIFIED, u.getPhoneVerification().getStatus());
}
@Test void suspensionIsTimeBound() {
    Instant now = Instant.parse("2026-10-29T10:00:00Z");
    User u = new User(); u.setSuspendedUntil(now.plusSeconds(60));
    assertTrue(u.isSuspended(now)); assertFalse(u.isSuspended(now.plusSeconds(61)));
    u.setSuspendedUntil(null); assertFalse(u.isSuspended(now));
}
@Test void storeHiddenWhenBlockedOrOwnerSuspended() { /* adminBlocked=true → hidden; owner suspended → hidden; neither → not hidden */ }
```
`verifiedUser()` builds a user with phone/PAN/Aadhaar and calls `decide(VERIFIED, null, 1L, Instant.now())` on all three.

- [ ] **Step 2: Run and confirm failure**

Run: `cd aaspass-service-backend; .\mvnw.cmd test -Dtest=UserVerificationTest`
Expected: compilation failure (`VerificationStatus` not found).

- [ ] **Step 3: Implement the entity changes.**
  - `VerificationCheck` columns via `@AttributeOverrides` in `User`: prefixes `phone_`, `pan_`, `aadhar_` → `<p>verification_status`, `<p>verification_reason` (500), `<p>verified_at`, `<p>verified_by_admin_id`. Status column: `@Enumerated(STRING)`, `columnDefinition = "VARCHAR(16) NOT NULL DEFAULT 'UNVERIFIED'"` (backfills existing MySQL rows, same pattern as `stores.is_active`).
  - `User` fields use `@Builder.Default ... = new VerificationCheck()`. `suspended_until` (Instant), `suspension_reason` varchar(500).
  - `Store.adminBlocked`: `@Builder.Default`, `columnDefinition = "BOOLEAN NOT NULL DEFAULT FALSE"`; other new columns nullable; `admin_block_reason` varchar(500).
  - `updatePhone/updateAadharNumber/updatePanNumber`: set value; if `!Objects.equals(old, new)` call that check's `reset()`.
  - `GlobalExceptionHandler.handleForbidden` uses `ex.code()`.

- [ ] **Step 4: Route existing edits through the reset helpers.** In `UserService.updateUser` replace `user.setPhone(...)` with `user.updatePhone(...)`; in `updateKyc` replace `setAadharNumber`/`setPanNumber` with `updateAadharNumber`/`updatePanNumber`.

- [ ] **Step 5: Add integration test** in `OwnershipAndKycTest`:

```java
@Test @DisplayName("Updating PAN resets only the PAN verification")
void kycUpdateResetsPanCheck() throws Exception {
    User aman = userRepository.findByUsername("aman").orElseThrow();
    aman.getPanVerification().decide(VerificationStatus.VERIFIED, null, 1L, Instant.now());
    aman.getAadharVerification().decide(VerificationStatus.VERIFIED, null, 1L, Instant.now());
    userRepository.saveAndFlush(aman);
    mockMvc.perform(put("/api/users/me/kyc").with(csrf()).cookie(login("aman"))
            .contentType(MediaType.APPLICATION_JSON).content("{\"panNumber\":\"ZZZZZ9999Z\"}"))
        .andExpect(status().isOk());
    User after = userRepository.findByUsername("aman").orElseThrow();
    assertEquals(VerificationStatus.UNVERIFIED, after.getPanVerification().getStatus());
    assertEquals(VerificationStatus.VERIFIED, after.getAadharVerification().getStatus());
}
```

- [ ] **Step 6: Run tests**

Run: `.\mvnw.cmd test -Dtest=UserVerificationTest,OwnershipAndKycTest`
Expected: all PASS.

- [ ] **Step 7: Commit** — `feat(backend): add verification, suspension and admin-block fields`

---

## Task 2: Enforce suspension and admin blocks in the user-facing API; expose verification

**Files:**
- Create: `dto/response/VerificationView.java`
- Modify: `security/session/SessionRevokeReason.java`, `security/session/UserSessionRepository.java`, `security/session/SessionService.java`, `service/AuthService.java:45-90`, `service/StoreService.java` (`getStores`, `getStoreById`, `getStoresByUserId`, `setStoreActive`, owner-returning methods), `repository/StoreRepository.java:24-43`, `controller/StoreController.java:66-83`, `dto/response/UserResponse.java`, `dto/response/StoreResponse.java`, `service/mapper/DtoMapper.java:37-80`
- Test: `src/test/java/com/aaspass/controller/ModerationEnforcementTest.java`, `src/test/java/com/aaspass/security/session/SessionServiceTest.java` (add case)

**Interfaces:**
- Consumes: Task 1 entity methods and error codes.
- Produces:
  - `SessionRevokeReason.SUSPENDED`
  - `UserSessionRepository.findByUserIdAndRevokedAtIsNull(Long userId): List<UserSession>`
  - `SessionService.revokeAllForUser(Long userId, SessionRevokeReason reason): int` (count revoked; `@Transactional`)
  - `record VerificationView(ItemView phone, ItemView pan, ItemView aadhar) { record ItemView(VerificationStatus status, String reason) {} static VerificationView of(User u) }`
  - `UserResponse` + `Boolean verified`, `VerificationView verification`, `Instant suspendedUntil`
  - `StoreResponse` + `Boolean ownerVerified`, `Boolean adminBlocked`, `String adminBlockReason`
  - `DtoMapper.toStoreResponse(Store store, boolean includeNested, boolean includeOwnerPrivate)`; the 2-arg overload delegates with `false`. `toUserResponse(..., includePrivate=true)` maps the user's stores with `includeOwnerPrivate=true`.
  - `StoreService.getStoreById(Long id, Optional<Long> callerId)`, `StoreService.getStoresByUserId(Long userId, Optional<Long> callerId)` (old single-arg signatures removed; update callers and existing tests).
  - `StoreRepository.searchStores(country, city, category, query, availableOnly, Instant now)` — adds `AND s.adminBlocked = false AND (s.user.suspendedUntil IS NULL OR s.user.suspendedUntil <= :now)`.

- [ ] **Step 1: Write failing tests** in `ModerationEnforcementTest` (`@SpringBootTest @ActiveProfiles("test") @AutoConfigureMockMvc @Transactional`, seeded users `aman`/`priya`/`rohan`, password `password123`):

```java
@Test void suspendedUserCannotLogIn()       // set priya.suspendedUntil = now+1d, reason "Spam"; POST /api/auth/login → 403, $.code ACCOUNT_SUSPENDED, $.message contains "Spam" and "UTC"
@Test void expiredSuspensionAllowsLogin()   // suspendedUntil = now-1m → login 200
@Test void suspensionRevokesSessions()      // login priya → cookies; sessionService.revokeAllForUser(priyaId, SUSPENDED); GET /api/auth/me with cookies → 401 SESSION_REVOKED
@Test void blockedStoreHiddenFromSearch()   // block priya's store; GET /api/stores?city=Bengaluru → no "PixelCraft Studios"
@Test void suspendedOwnersStoresHiddenFromSearch()
@Test void blockedStoreIs404ForOthersButVisibleToOwner() // GET /api/stores/{id} anon → 404; with priya cookies → 200, $.data.adminBlocked true, $.data.adminBlockReason "Fake listing"
@Test void blockedStoreOmittedFromOwnerListForOthers()   // GET /api/stores/user/{priyaId} anon → size 0; as priya → size 1
@Test void ownerCannotActivateBlockedStore()  // PATCH /api/stores/{id}/activate as priya → 403 STORE_BLOCKED_BY_ADMIN; deactivate → 200
@Test void publicResponsesExposeOnlyVerifiedFlag() // GET /api/users/{priyaId} anon → $.data.verified false, $.data.verification null; after deciding all three VERIFIED → verified true; GET /api/stores/{id} → $.data.ownerVerified true, $.data.adminBlocked false
@Test void meExposesPerItemVerification()   // reject PAN with "Blurry"; GET /api/auth/me as aman → $.data.verification.pan.status "REJECTED", .reason "Blurry"
@Test void userWithNullEmbeddedChecksMapsSafely() // new User() with setPhoneVerification(null) etc. → DtoMapper.toUserResponse(u, false, false, true): verified false, verification.phone.status UNVERIFIED, no exception
```
In `SessionServiceTest`: `revokeAllForUserRevokesEveryActiveSession` — open two sessions, call it, assert both `revokedAt != null`, `revokeReason == SUSPENDED`, return value 2.

- [ ] **Step 2: Run and confirm failure**

Run: `.\mvnw.cmd test -Dtest=ModerationEnforcementTest,SessionServiceTest`
Expected: FAIL (compilation: `SUSPENDED`, `revokeAllForUser` missing).

- [ ] **Step 3: Implement session revocation and the login check.** `AuthService` gains a `Clock` constructor parameter; after the password check, if `user.isSuspended(clock.instant())` throw `new ForbiddenException("Account suspended until " + FORMAT.format(until) + " UTC: " + reason, ErrorCode.ACCOUNT_SUSPENDED)` with `FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm").withZone(ZoneOffset.UTC)`; reason defaults to `"No reason given"` when null.

- [ ] **Step 4: Implement store visibility and the activate guard.** `StoreService` gains a `Clock` constructor parameter. `getStoreById`: if `store.isAdminHidden(now)` and caller is not the owner → `ResourceNotFoundException("Store","id",id)`; owner gets `includeOwnerPrivate=true`. `getStoresByUserId`: non-owners get the list minus admin-hidden stores. `setStoreActive(id, caller, true)` on a blocked store → `ForbiddenException("This store was deactivated by an admin: " + reason, STORE_BLOCKED_BY_ADMIN)`. Owner-mutating methods (`createStore`, `updateStore`, `toggleStoreAvailability`, `setStoreActive`) return `includeOwnerPrivate=true`. `StoreController` passes `currentUser.optionalUserId()`.

- [ ] **Step 5: Implement DTO fields** in `DtoMapper`: `verified = user.isFullyVerified()` always; `verification = includePrivate ? VerificationView.of(user) : null`; `suspendedUntil = includePrivate ? user.getSuspendedUntil() : null`; `ownerVerified = store.getUser() != null && store.getUser().isFullyVerified()`; `adminBlocked = includeOwnerPrivate && Boolean.TRUE.equals(store.getAdminBlocked())`; `adminBlockReason = includeOwnerPrivate ? store.getAdminBlockReason() : null`. Compact constructors default `Boolean` fields to `false` when null (follow the existing `isActive` pattern in `StoreResponse`).

- [ ] **Step 6: Run the full backend suite** (signature changes touch existing tests)

Run: `.\mvnw.cmd test`
Expected: all PASS.

- [ ] **Step 7: Commit** — `feat(backend): enforce suspensions and admin store blocks; expose verification`

---

## Task 3: Admin persistence, properties and bootstrap

**Files:**
- Create: `admin/entity/AdminUser.java`, `AdminSession.java`, `AdminAuditEntry.java`, `AdminAuditAction.java`, `AuditTargetType.java`; `admin/repository/AdminUserRepository.java`, `AdminSessionRepository.java`, `AdminAuditRepository.java`; `admin/config/AdminProperties.java`, `admin/config/AdminBootstrap.java`
- Modify: `src/main/resources/application.properties`, `application-dev.properties`, `src/test/resources/application-test.properties`
- Test: `src/test/java/com/aaspass/admin/config/AdminBootstrapTest.java`, `AdminPropertiesTest.java`

**Interfaces:**
- Produces:
  - `AdminUser extends BaseAuditEntity { String name; String email; String password /* write-only */; Boolean active = true; Instant lastLoginAt; }` table `admin_users`, unique `email`.
  - `AdminSession extends BaseAuditEntity` — same fields as `UserSession` with `AdminUser admin` (`admin_id`), table `admin_sessions`, index on `previous_refresh_token_hash`; `boolean isActive(Instant now)`.
  - `enum AdminAuditAction { LOGIN, VIEW_USER_KYC, VERIFY_ITEM, REJECT_ITEM, SUSPEND_USER, LIFT_SUSPENSION, BLOCK_STORE, UNBLOCK_STORE, REVIEW_STORE }`, `enum AuditTargetType { USER, STORE, NONE }`
  - `AdminAuditEntry extends BaseAuditEntity { Long adminId; AdminAuditAction action; AuditTargetType targetType; Long targetId; String details /* 500 */; }` table `admin_audit_log`.
  - `AdminUserRepository.findByEmailIgnoreCase(String): Optional<AdminUser>`
  - `AdminSessionRepository`: `findBySessionId`, `findForUpdateByRefreshTokenHash`, `findForUpdateByPreviousRefreshTokenHash` (pessimistic write, same as `UserSessionRepository`).
  - `AdminAuditRepository.findByTargetTypeAndTargetIdOrderByIdDesc(AuditTargetType, Long): List<AdminAuditEntry>`
  - `@ConfigurationProperties("aaspass.admin") record AdminProperties(String jwtSecret, Duration accessTokenTtl, Duration refreshTokenTtl, String bootstrapEmail, String bootstrapPassword, String bootstrapName)` — defaults `PT15M` / `PT12H` / `"AasPass Admin"`; `jwtSecret` must base64-decode to ≥ 32 bytes (same validation and redacted `toString()` as `SecurityProperties`); `byte[] jwtSecretBytes()`.
  - `AdminBootstrap implements CommandLineRunner` — if `adminUserRepository.count() == 0` and both bootstrap email and password are non-blank, save one admin (email lower-cased, BCrypt via shared `PasswordEncoder`); if blank, `log.warn` and skip; never log the password.

- [ ] **Step 1: Write failing tests.** `AdminPropertiesTest`: short secret → `IllegalStateException`; null TTLs → defaults; `toString()` contains `***` and not the secret. `AdminBootstrapTest` (`@SpringBootTest @ActiveProfiles("test")`): `adminUserRepository.findByEmailIgnoreCase("ADMIN@test.local")` present, `passwordEncoder.matches("admin12345", hash)`; running `bootstrap.run()` again leaves `count() == 1`.

- [ ] **Step 2: Run and confirm failure** — `.\mvnw.cmd test -Dtest=AdminPropertiesTest,AdminBootstrapTest` → compilation failure.

- [ ] **Step 3: Implement entities, repositories, properties, bootstrap.** Properties:
  - `application.properties`: `aaspass.admin.jwt-secret=${AASPASS_ADMIN_JWT_SECRET:}`, `aaspass.admin.access-token-ttl=PT15M`, `aaspass.admin.refresh-token-ttl=PT12H`, `aaspass.admin.bootstrap-email=${AASPASS_ADMIN_EMAIL:}`, `aaspass.admin.bootstrap-password=${AASPASS_ADMIN_PASSWORD:}`, `aaspass.admin.bootstrap-name=${AASPASS_ADMIN_NAME:AasPass Admin}`, `aaspass.cors.allowed-origins=${AASPASS_CORS_ORIGINS:http://localhost:4200,http://127.0.0.1:4200,http://localhost:3000,http://localhost:4300,http://127.0.0.1:4300}`.
  - `application-dev.properties`: dev-only admin JWT secret (fresh random 48-byte base64), `aaspass.admin.bootstrap-email=${AASPASS_ADMIN_EMAIL:admin@aaspass.local}`, `...bootstrap-password=${AASPASS_ADMIN_PASSWORD:admin12345}`.
  - `application-test.properties`: a different test-only secret, `admin@test.local` / `admin12345`.

- [ ] **Step 4: Run tests** — same command → PASS. Then `.\mvnw.cmd test` → all PASS.

- [ ] **Step 5: Commit** — `feat(admin): add admin accounts, sessions, audit log and bootstrap`

---

## Task 4: Admin authentication and the separate security chain

**Files:**
- Create: `admin/security/AdminJwtTokenService.java`, `AdminIssuedSession.java`, `AdminSessionService.java`, `AdminCookieService.java`, `AdminCookieBearerTokenResolver.java`, `AdminActiveSessionValidator.java`, `CurrentAdmin.java`; `admin/config/AdminSecurityConfig.java`; `admin/service/AdminAuthService.java`, `admin/service/AdminAuditService.java`; `admin/controller/AdminAuthController.java`; `admin/dto/AdminLoginRequest.java`, `admin/dto/AdminProfile.java`
- Modify: `config/security/SecurityConfig.java` (`@Order(2)` on the chain bean; `.jwt(jwt -> jwt.decoder(jwtDecoder))`; rename bean method param to inject the user decoder by name), `security/token/AuthCookieService.java` (extract `public ResponseCookie buildCookie(String name, String value, String sameSite, String path, Duration maxAge, HttpServletRequest req)`; existing methods call it), `config/WebMvcConfig.java` (origins from `@Value("${aaspass.cors.allowed-origins}") List<String>`)
- Test: `src/test/java/com/aaspass/admin/AdminAuthTest.java`, `src/test/java/com/aaspass/admin/AdminSessionServiceTest.java`, `src/test/java/com/aaspass/support/AdminTestSupport.java`

**Interfaces:**
- Consumes: Task 3 entities/properties; `TokenHashing.newRefreshToken()`, `TokenHashing.sha256Hex(String)`; `ApiAuthErrorHandlers`; `CookieCsrfTokenRepository` bean; `CsrfCookieFilter`; `ExpiryValidator`.
- Produces:
  - `AdminJwtTokenService.ISSUER = "aaspass-admin"`; `String issueAccessToken(Long adminId, String email, String sessionId, Instant issuedAt)` — claims `sub`, `sid`, `email`, `typ="admin"`.
  - `record AdminIssuedSession(AdminSession session, String refreshToken, String accessToken)`
  - `AdminSessionService`: `AdminIssuedSession open(AdminUser, String userAgent, String ip)`, `AdminIssuedSession rotate(String refreshToken)`, `void revokeByRefreshToken(String refreshToken)`, `boolean isActive(String sessionId)` — same semantics as `SessionService` incl. 20 s reuse grace and `noRollbackFor = SessionRevokedException.class`; inactive admin on rotate → `SessionRevokedException`.
  - `AdminCookieService`: `ACCESS_COOKIE="_asid"`, `REFRESH_COOKIE="_arid"`, `writeSession(req,res,AdminIssuedSession)`, `clearSession(req,res)` — built with `AuthCookieService.buildCookie`.
  - `CurrentAdmin.requireAdminId(): Long` (401 `UNAUTHENTICATED` when absent; only accepts tokens with `typ=admin`).
  - `AdminAuditService.record(Long adminId, AdminAuditAction action, AuditTargetType type, Long targetId, String details)` — truncates details to 500.
  - `AdminAuthService.login(AdminLoginRequest, String ua, String ip): AdminAuthResult(AdminProfile profile, AdminIssuedSession session)`; unknown email / wrong password / inactive → `UnauthorizedException("Invalid email or password", INVALID_CREDENTIALS)` with dummy BCrypt compare for unknown email; success sets `lastLoginAt`, records `LOGIN`.
  - `record AdminLoginRequest(@NotBlank @Email String email, @NotBlank String password)`, `record AdminProfile(Long id, String name, String email)`
  - Endpoints: `POST /api/admin/auth/login`, `POST /api/admin/auth/refresh`, `POST /api/admin/auth/logout`, `GET /api/admin/auth/me` (behaviour mirrors `AuthController`, incl. clearing cookies on refresh failure).
  - `AdminSecurityConfig.adminSecurityFilterChain` — `@Order(1)`, `securityMatcher("/api/admin/**")`, own `JwtDecoder adminJwtDecoder` (HS256 with `AdminProperties.jwtSecretBytes()`, `JwtIssuerValidator("aaspass-admin")`, `ExpiryValidator`, `AdminActiveSessionValidator`), `AdminCookieBearerTokenResolver` (reads `_asid`, skips the four auth paths), CSRF via the shared repository with `NullAuthenticatedSessionStrategy`, exempt `POST /api/admin/auth/login` and `/api/admin/auth/refresh`, `permitAll` for login/refresh/logout, everything else authenticated.
  - `AdminTestSupport.login(MockMvc): Cookie[]` (`_asid`, `_arid`) using `admin@test.local` / `admin12345`.

- [ ] **Step 1: Write failing tests** in `AdminAuthTest`:

```java
@Test void adminLoginSetsAdminCookies()          // 200, cookies _asid (path /api/admin) and _arid (path /api/admin/auth), $.data.email "admin@test.local"
@Test void wrongPasswordIsGeneric401()           // 401, $.code INVALID_CREDENTIALS
@Test void inactiveAdminCannotLogIn()            // set active=false → 401 INVALID_CREDENTIALS
@Test void meReturnsAdminProfile()               // GET /api/admin/auth/me with admin cookies → 200
@Test void userTokenRejectedOnAdminApi()         // AuthTestSupport.login(aman) → take _sid value → send as cookie "_asid" to GET /api/admin/auth/me → 401
@Test void adminTokenRejectedOnUserApi()         // admin _asid value sent as cookie "_sid" to GET /api/auth/me → 401
@Test void anonymousAdminApiIs401()              // GET /api/admin/auth/me no cookies → 401 UNAUTHENTICATED
@Test void refreshRotatesAdminSession()          // POST /api/admin/auth/refresh with _arid → 200, new _arid differs
@Test void logoutRevokesAdminSession()           // POST logout (with csrf) → then /me with old _asid → 401 SESSION_REVOKED
@Test void adminWriteWithoutCsrfIs403()          // POST /api/admin/auth/logout (not CSRF-exempt) with admin cookies and no csrf → 403, $.code CSRF_INVALID
@Test void loginWritesAuditEntry()
@Test void userLoginStillWorks()                 // regression: AuthTestSupport.login(aman) → 200
```
`AdminSessionServiceTest`: rotate success, reuse after grace revokes, reuse within grace → 401 without revoke, revoked session → `SessionRevokedException` (mirror the existing `SessionServiceTest` cases).

- [ ] **Step 2: Run and confirm failure** — `.\mvnw.cmd test -Dtest=AdminAuthTest,AdminSessionServiceTest` → compilation failure.

- [ ] **Step 3: Implement** the files above. Two `JwtDecoder` beans now exist, so every chain must name its decoder explicitly (`.jwt(jwt -> jwt.decoder(...))`) — `jwt(withDefaults())` would fail with an ambiguous bean.

- [ ] **Step 4: Run tests** — `.\mvnw.cmd test` → all PASS (existing `CsrfCookieTest`, `AuthControllerTest`, `AuthCookieServiceTest` must stay green).

- [ ] **Step 5: Commit** — `feat(admin): add admin login with a separate JWT, cookies and security chain`

---

## Task 5: Admin store search and moderation endpoints

**Files:**
- Create: `admin/service/AdminStoreService.java`, `admin/service/AdminStoreSpecs.java`, `admin/service/AdminMapper.java`, `admin/controller/AdminStoreController.java`, `admin/dto/PageResponse.java`, `AdminStoreSummary.java`, `AdminStoreDetail.java`, `AdminOwnerSummary.java`, `BlockStoreRequest.java`
- Modify: `repository/StoreRepository.java` (`extends JpaSpecificationExecutor<Store>`)
- Test: `src/test/java/com/aaspass/admin/AdminStoreControllerTest.java`

**Interfaces:**
- Consumes: `CurrentAdmin.requireAdminId()`, `AdminAuditService.record(...)`, `AdminTestSupport.login`.
- Produces:
  - `record PageResponse<T>(List<T> content, int page, int size, long totalElements, int totalPages) { static <T> PageResponse<T> of(Page<T>) }`
  - `record AdminStoreSummary(Long id, String storeName, String category, Long ownerId, String ownerName, String ownerUsername, String city, String country, String area, boolean isActive, boolean adminBlocked, boolean reviewed, LocalDateTime creationDateTime)`
  - `record AdminOwnerSummary(Long id, String name, String username, String email, boolean verified, Instant suspendedUntil)`
  - `record AdminStoreDetail(AdminStoreSummary summary, String tagline, String description, String googleMapLink, String adminBlockReason, Instant adminBlockedAt, Instant adminReviewedAt, AdminOwnerSummary owner)`
  - `record BlockStoreRequest(@NotBlank @Size(max = 500) String reason)`
  - `AdminMapper.toStoreSummary(Store)`, `AdminMapper.toOwnerSummary(User)` (null-safe on `store.getUser()`)
  - `AdminStoreSpecs.filter(String country, String city, String name, String status): Specification<Store>`; status `all|active|inactive|blocked|unreviewed` (unknown → `BadRequestException`); `active` = `isActive && !adminBlocked`; `inactive` = `!isActive && !adminBlocked`.
  - `AdminStoreService.search(country, city, name, status, int page, int size): PageResponse<AdminStoreSummary>` — sort `creationDateTime desc`, size clamped to 1..100, page ≥ 0.
  - `AdminStoreService.get(Long id)`, `block(Long id, String reason, Long adminId)`, `unblock(Long id, Long adminId)`, `review(Long id, Long adminId)` → `AdminStoreDetail`; each mutation records `BLOCK_STORE` (details = reason) / `UNBLOCK_STORE` / `REVIEW_STORE`.
  - Endpoints: `GET /api/admin/stores`, `GET /api/admin/stores/{id}`, `PATCH /api/admin/stores/{id}/block`, `PATCH /api/admin/stores/{id}/unblock`, `PATCH /api/admin/stores/{id}/review`.

- [ ] **Step 1: Write failing tests** (seed has PixelCraft Studios and CodeSpark Lab, both Bengaluru/India, active, unreviewed):

```java
@Test void searchByCityAndNameIsCaseInsensitive() // ?city=bengaluru&name=pixel → totalElements 1, content[0].storeName "PixelCraft Studios"
@Test void searchByCountryWithoutMatch()          // ?country=Nepal → totalElements 0
@Test void statusUnreviewedThenReviewed()         // status=unreviewed → 2; PATCH review PixelCraft → status=unreviewed → 1
@Test void blockRequiresReason()                  // PATCH block {"reason":""} → 400
@Test void blockHidesFromPublicAndShowsInBlockedFilter() // block → GET /api/stores (public) lacks it; ?status=blocked → 1, content[0].adminBlocked true
@Test void unblockKeepsOwnersActiveFlag()         // block then unblock → GET detail → summary.isActive true, adminBlocked false
@Test void sizeIsClampedTo100()                   // ?size=1000 → $.data.size 100
@Test void unknownStatusIs400()
@Test void unknownStoreIs404()
@Test void mutationsWriteAuditEntries()           // after block: adminAuditRepository.findByTargetTypeAndTargetIdOrderByIdDesc(STORE, id).get(0).getAction() == BLOCK_STORE
```

- [ ] **Step 2: Run and confirm failure** — `.\mvnw.cmd test -Dtest=AdminStoreControllerTest` → FAIL.
- [ ] **Step 3: Implement** the files above.
- [ ] **Step 4: Run tests** — same command → PASS.
- [ ] **Step 5: Commit** — `feat(admin): add store search, block, unblock and review endpoints`

---

## Task 6: Admin user search, detail, suspension and verification endpoints

**Files:**
- Create: `admin/service/AdminUserService.java`, `admin/service/AdminUserSpecs.java`, `admin/controller/AdminUserController.java`, `admin/dto/AdminUserSummary.java`, `AdminUserDetail.java`, `SuspendUserRequest.java`, `VerificationDecisionRequest.java`, `VerificationItem.java`
- Modify: `repository/UserRepository.java` (`extends JpaSpecificationExecutor<User>`), `admin/service/AdminMapper.java`
- Test: `src/test/java/com/aaspass/admin/AdminUserControllerTest.java`

**Interfaces:**
- Consumes: `SessionService.revokeAllForUser(Long, SessionRevokeReason.SUSPENDED)`, `VerificationCheck.decide(...)`, `AdminMapper.toStoreSummary`, `Clock` bean.
- Produces:
  - `enum VerificationItem { PHONE, PAN, AADHAR; static VerificationItem fromPath(String) }` — accepts `phone|pan|aadhar` (case-insensitive), else `BadRequestException`.
  - `record AdminUserSummary(Long id, String name, String username, String email, String city, String country, VerificationStatus phoneStatus, VerificationStatus panStatus, VerificationStatus aadharStatus, Instant suspendedUntil, int storeCount, LocalDateTime creationDateTime)`
  - `record AdminUserDetail(AdminUserSummary summary, String phone, String aadharNumber, String panNumber, VerificationView verification, String suspensionReason, String bio, String area, List<AdminStoreSummary> stores)` — phone/PAN/Aadhaar unmasked.
  - `record SuspendUserRequest(@NotNull Instant until, @NotBlank @Size(max = 500) String reason)`
  - `record VerificationDecisionRequest(@NotNull VerificationStatus decision, @Size(max = 500) String reason)`
  - `AdminUserSpecs.filter(String q, String verification, Boolean suspended, Instant now): Specification<User>`; `q` contains-match on name/username/email/phone; `verification` `all|pending|verified|rejected` (pending = at least one item with non-blank value and `UNVERIFIED`; verified = all three `VERIFIED`; rejected = any `REJECTED`); `suspended=true` → `suspendedUntil > now`, `false` → null or ≤ now.
  - `AdminUserService.search(q, verification, suspended, page, size): PageResponse<AdminUserSummary>`; `get(Long id, Long adminId): AdminUserDetail` (records `VIEW_USER_KYC`); `suspend(Long id, SuspendUserRequest, Long adminId)`; `liftSuspension(Long id, Long adminId)`; `decide(Long id, VerificationItem item, VerificationDecisionRequest, Long adminId)` — all return `AdminUserDetail`.
  - Rules: `until` ≤ now → 400 "Suspension end must be in the future"; `until` > now+365d → 400 "Suspensions are limited to one year"; `REJECTED` with blank reason → 400 "A reason is required to reject"; `UNVERIFIED` as a decision → 400; item value blank → 400 "<Item> has not been provided by the user". Audit details: `"item=PAN"` / `"item=PAN reason=<reason>"` / `"until=<iso> reason=<reason>"`.
  - Endpoints: `GET /api/admin/users`, `GET /api/admin/users/{id}`, `POST /api/admin/users/{id}/suspension`, `DELETE /api/admin/users/{id}/suspension`, `PUT /api/admin/users/{id}/verification/{item}`.

- [ ] **Step 1: Write failing tests:**

```java
@Test void searchByEmailFragment()               // ?q=priya.nair → 1
@Test void pendingFilterListsUsersWithUnverifiedValues() // seed users all have phone/PAN/Aadhaar → verification=pending → 3
@Test void detailShowsUnmaskedKycAndAudits()     // GET /users/{aman} → $.data.panNumber "ABCDE1234F", $.data.aadharNumber "999988887777"; audit VIEW_USER_KYC exists; its details do not contain "ABCDE1234F"
@Test void verifyAllThreeMakesUserVerifiedPublicly() // PUT phone/pan/aadhar VERIFIED → GET /api/users/{aman} (public) → $.data.verified true; verification=verified filter → contains aman
@Test void rejectNeedsReason()                   // {"decision":"REJECTED"} → 400; with reason "Blurry" → 200, verification.pan.status REJECTED
@Test void cannotVerifyMissingValue()            // set aman.phone null → PUT phone VERIFIED → 400, phone status still UNVERIFIED
@Test void unknownItemIs400()                    // PUT .../verification/passport → 400
@Test void suspendRevokesSessionsAndBlocksLogin() // user cookies before; POST suspension {until: now+7d, reason "Spam"} → 200; GET /api/auth/me with old cookies → 401; login → 403 ACCOUNT_SUSPENDED
@Test void suspendValidatesUntil()               // past → 400; now+400d → 400; blank reason → 400
@Test void liftSuspensionAllowsLogin()
@Test void suspendedFilter()                     // suspended=true → only the suspended user
```

- [ ] **Step 2: Run and confirm failure** — `.\mvnw.cmd test -Dtest=AdminUserControllerTest` → FAIL.
- [ ] **Step 3: Implement** the files above.
- [ ] **Step 4: Run tests** — same command → PASS.
- [ ] **Step 5: Commit** — `feat(admin): add user search, KYC verification and suspension endpoints`

---

## Task 7: Admin dashboard endpoint

**Files:**
- Create: `admin/service/AdminDashboardService.java`, `admin/controller/AdminDashboardController.java`, `admin/dto/DashboardResponse.java`
- Test: `src/test/java/com/aaspass/admin/AdminDashboardControllerTest.java`

**Interfaces:**
- Consumes: `AdminStoreSpecs.filter`, `AdminUserSpecs.filter`, `AdminMapper`.
- Produces: `record DashboardResponse(long totalUsers, long totalStores, long activeStores, long pendingUsers, long unreviewedStores, long blockedStores, long suspendedUsers, List<AdminUserSummary> recentPendingUsers, List<AdminStoreSummary> recentUnreviewedStores)`; `GET /api/admin/dashboard`. Counts via `count(spec)`; recent lists = first page of size 10, newest first.

- [ ] **Step 1: Write failing test** `dashboardCountsReflectModeration`: initially `totalUsers 3`, `totalStores 2`, `pendingUsers 3`, `unreviewedStores 2`, `blockedStores 0`; after reviewing one store, blocking the other and suspending rohan → `unreviewedStores 1`, `blockedStores 1`, `suspendedUsers 1`, `activeStores 1`; `recentUnreviewedStores` size 1. Plus `dashboardRequiresAdmin` (anon → 401).
- [ ] **Step 2: Run and confirm failure** — `.\mvnw.cmd test -Dtest=AdminDashboardControllerTest` → FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** `.\mvnw.cmd test` → all PASS.
- [ ] **Step 5: Commit** — `feat(admin): add dashboard summary endpoint`

---

## Task 8: Scaffold the `aaspass-admin` Angular app

**Files:**
- Create: `aaspass-admin/` workspace (see File Structure), `aaspass-admin/scripts/copy-geo.mjs`, `aaspass-admin/AGENTS.md`, `aaspass-admin/CLAUDE.md` (copy of the client's conventions)
- Modify: `COMMANDS.md` (new "Admin (`aaspass-admin`)" section), `README.md` (one paragraph on the admin app)
- Test: `aaspass-admin/src/app/app.spec.ts`

**Interfaces:**
- Produces: a building app with `npm start` on 4300, `/api` proxy to 8080, Tailwind + Spartan styles identical to the client's `src/styles.css`, `src/app/ui/` containing button, input, card, badge, separator, skeleton, utils copied from `aaspass-client/src/app/ui/`, and `src/app/geo/countries.generated.ts` produced by `copy:geo`.

- [ ] **Step 1: Generate the workspace** from the repo root: `npx -p @angular/cli@22 ng new aaspass-admin --style=css --ssr=false --skip-git --routing`. Then align `package.json` dependency versions with `aaspass-client/package.json` (same Angular, Tailwind, Spartan, ng-icons, Vitest, TypeScript ranges; no `luxon`, `cities.json`, `countries-list`).
- [ ] **Step 2: Configure.**
  - `package.json` scripts: `"start": "ng serve --port 4300"`, `"build": "ng build"`, `"test": "ng test"`, `"copy:geo": "node scripts/copy-geo.mjs"`, `"prestart": "npm run copy:geo"`, `"prebuild": "npm run copy:geo"`, `"pretest": "npm run copy:geo"`.
  - `copy-geo.mjs`: copy `../aaspass-client/src/app/geo/countries.generated.ts` → `src/app/geo/countries.generated.ts`; exit non-zero with a clear message if the source is missing.
  - `.gitignore`: add `src/app/geo/countries.generated.ts`.
  - `angular.json` build assets: keep `public`, add `{ "glob": "**/*.json", "input": "../aaspass-client/public/geo", "output": "geo" }`; serve `proxyConfig: "proxy.conf.json"`; same budgets as the client.
  - `proxy.conf.json`: `{"/api":{"target":"http://localhost:8080","secure":false,"changeOrigin":false}}`; `.postcssrc.json` as in the client; `src/styles.css` copied from the client.
  - `src/index.html` title "AasPass Admin"; `<html lang="en">`.
- [ ] **Step 3: Smoke test** `app.spec.ts`: the root component creates and renders a `<router-outlet>`.
- [ ] **Step 4: Verify** — `cd aaspass-admin; npm install; npm run build; npm test -- --watch=false` → build succeeds, tests PASS.
- [ ] **Step 5: Commit** — `feat(admin-app): scaffold aaspass-admin Angular workspace`

---

## Task 9: Admin app core — auth, interceptors, shell, login

**Files:**
- Create: `src/app/models/admin.models.ts`, `services/admin-auth.service.ts`, `services/admin-api.service.ts`, `services/toast.service.ts`, `guards/admin-auth.guard.ts`, `interceptors/auth-refresh.interceptor.ts`, `interceptors/error-toast.interceptor.ts`, `interceptors/http-context.ts`, `components/toaster/`, `components/shell/`, `pages/login/`
- Modify: `src/app/app.config.ts`, `src/app/app.routes.ts`, `src/app/app.ts|html`
- Test: `admin-auth.guard.spec.ts`, `auth-refresh.interceptor.spec.ts`, `pages/login/login.spec.ts`

**Interfaces:**
- Consumes: backend Task 4 endpoints.
- Produces:
  - `admin.models.ts`: `ApiResponse<T>`, `AdminProfile`, `PageResponse<T>`, `VerificationStatus = 'UNVERIFIED' | 'VERIFIED' | 'REJECTED'`, `VerificationItem = 'phone' | 'pan' | 'aadhar'`, `AdminStoreSummary`, `AdminStoreDetail`, `AdminOwnerSummary`, `AdminUserSummary`, `AdminUserDetail`, `VerificationView`, `DashboardResponse`, `StoreStatusFilter = 'all' | 'active' | 'inactive' | 'blocked' | 'unreviewed'`, `UserVerificationFilter = 'all' | 'pending' | 'verified' | 'rejected'` — field names exactly as the backend records in Tasks 5–7.
  - `AdminAuthService`: signals `admin: Signal<AdminProfile | null>`, `isAuthenticated: Signal<boolean>`; `restore(): Promise<void>` (memoised `GET /api/admin/auth/me`, guest on failure); `login(email, password): Observable<AdminProfile>`; `logout(): Observable<void>`; `handleSessionEnded(): void` (clear state, toast "Your session has ended. Please log in again.", navigate `/login`).
  - `AdminApiService` methods: `dashboard()`, `searchStores(params)`, `getStore(id)`, `blockStore(id, reason)`, `unblockStore(id)`, `reviewStore(id)`, `searchUsers(params)`, `getUser(id)`, `suspendUser(id, untilIso, reason)`, `liftSuspension(id)`, `decideVerification(id, item, decision, reason?)` — each returns `Observable<T>` of the unwrapped `data`.
  - `adminAuthGuard: CanActivateFn` → awaits `restore()`, else `UrlTree` to `/login?returnUrl=…`; `loginRedirectGuard` sends signed-in admins to `/dashboard`.
  - `authRefreshInterceptor`: on 401 `TOKEN_EXPIRED` (or `UNAUTHENTICATED` while authenticated) call `POST /api/admin/auth/refresh` once (shared in-flight `Observable` via `shareReplay`) and retry once; refresh 401 → `handleSessionEnded()`; skips `/api/admin/auth/(login|refresh|logout)`.
  - `errorToastInterceptor`: same mapping as the client's `toastMessageFor`, with 401 `INVALID_CREDENTIALS` → "Invalid email or password." and 400/404 → server message.
  - Routes: `login` (loadComponent, `loginRedirectGuard`), `''` → `ShellComponent` with `canActivate: [adminAuthGuard]` and children `dashboard`, `stores`, `stores/:id`, `users`, `users/:id` (all `loadComponent`), `''` → redirect `dashboard`, `**` → `dashboard`.
  - `app.config.ts`: `provideHttpClient(withFetch(), withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }), withInterceptors([errorToastInterceptor, authRefreshInterceptor]))`, `provideAppInitializer(() => inject(AdminAuthService).restore())`.
  - Shell: `<nav aria-label="Admin">` with links Dashboard / Stores / Users (`routerLinkActive` + `aria-current="page"`), top bar with admin name and Logout button; below `md` the nav is behind a menu button with `aria-expanded`.

- [ ] **Step 1: Write failing specs:** guard redirects a guest to `/login?returnUrl=%2Fusers` and allows an authenticated admin; interceptor retries once after refresh, makes a single refresh call for two concurrent 401s, and calls `handleSessionEnded` when refresh returns 401; login page disables submit while invalid, shows required-field errors, calls `login` and navigates to `returnUrl` or `/dashboard`.
- [ ] **Step 2: Run and confirm failure** — `npm test -- --watch=false` → FAIL.
- [ ] **Step 3: Implement** the files above (Reactive forms for login: email `Validators.required, Validators.email`; password `Validators.required`; labelled inputs; submit button text "Sign in" / "Signing in…").
- [ ] **Step 4: Verify** — `npm test -- --watch=false` PASS; `npm run build` succeeds.
- [ ] **Step 5: Commit** — `feat(admin-app): add admin auth, interceptors, shell and login page`

---

## Task 10: Admin dashboard and store pages

**Files:**
- Create: `components/status-chip/`, `components/reason-dialog/`, `components/pager/`, `pages/dashboard/`, `pages/stores/`, `pages/store-detail/`
- Test: `pages/dashboard/dashboard.spec.ts`, `pages/stores/stores.spec.ts`, `pages/store-detail/store-detail.spec.ts`, `components/reason-dialog/reason-dialog.spec.ts`

**Interfaces:**
- Consumes: `AdminApiService` (Task 9), `GeoService`-equivalent: copy `aaspass-client/src/app/services/geo/geo.service.ts` and `geo/country.ts` into `src/app/services/geo/` and `src/app/geo/` (they read `countries.generated.ts` and `geo/cities/<code>.json`).
- Produces:
  - `StatusChipComponent` — `input.required<'active'|'inactive'|'blocked'|'unreviewed'|'verified'|'pending'|'rejected'|'unverified'|'suspended'>()`; text label always present (colour is not the only signal); green for active/verified, grey for inactive/unverified/pending, amber for unreviewed, red for blocked/rejected/suspended.
  - `ReasonDialogComponent` — native `<dialog>`; inputs `title`, `confirmLabel`, `required = true`; outputs `confirmed: string`, `cancelled: void`; method `open()`; textarea labelled "Reason", max 500, confirm disabled while required and blank; Esc/cancel closes.
  - `PagerComponent` — inputs `page`, `totalPages`; output `pageChange: number`; Prev/Next buttons with `aria-label`s, "Page X of Y".
  - Dashboard: six stat cards (labels: "Users", "Stores", "Pending verifications", "Unreviewed stores", "Blocked stores", "Suspended users"); two tables with "View all" links to `/users?verification=pending` and `/stores?status=unreviewed`; skeletons while loading; empty-state text "Nothing waiting — all caught up."
  - Stores list: filters country (select from `COUNTRIES`, includes "All countries"), city (select from `citiesFor(country)`, disabled until a country is chosen), name (text, debounced 300 ms), status (select); filters ↔ URL query params (`country`, `city`, `name`, `status`, `page`) via `Router.navigate([], { queryParams, queryParamsHandling: 'merge' })`; table columns Store, Owner, Location, Created, Status; row link to `/stores/:id`.
  - Store detail: summary, owner card linking `/users/:ownerId`, block reason/timestamps; buttons "Mark reviewed" (hidden once reviewed), "Block store" (opens `ReasonDialog`) / "Unblock store"; link "View public page" to `http://localhost:4200/stores/<id>` built from `environment`-free constant `PUBLIC_SITE_URL` in `src/app/config.ts` (default `http://localhost:4200`).

- [ ] **Step 1: Write failing specs:** dashboard renders counts from a stubbed `AdminApiService`; stores page reads `?city=Bengaluru&status=blocked` into the form and calls `searchStores` with them, and changing status updates the URL and resets `page` to 0; store detail calls `blockStore(id, 'Fake')` after the dialog confirms and re-renders with the "Blocked" chip; reason dialog keeps confirm disabled for blank input.
- [ ] **Step 2: Run and confirm failure** — `npm test -- --watch=false` → FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Verify** — tests PASS; `npm run build` succeeds.
- [ ] **Step 5: Commit** — `feat(admin-app): add dashboard and store moderation pages`

---

## Task 11: Admin user pages — verification panel and suspension

**Files:**
- Create: `pages/users/`, `pages/user-detail/`, `pages/user-detail/verification-panel/`, `pages/user-detail/suspend-dialog/`
- Test: `pages/users/users.spec.ts`, `pages/user-detail/verification-panel/verification-panel.spec.ts`, `pages/user-detail/suspend-dialog/suspend-dialog.spec.ts`

**Interfaces:**
- Consumes: `AdminApiService`, `StatusChipComponent`, `ReasonDialogComponent`, `PagerComponent`.
- Produces:
  - Users list: search box (`q`, debounced 300 ms), verification select, suspended select (All / Suspended / Not suspended); URL-synced like stores; columns Name, Email, Location, Mobile, PAN, Aadhaar (status chips), Suspended, Joined.
  - `VerificationPanelComponent` — `input.required<AdminUserDetail>()`, output `changed: AdminUserDetail`; one row per item (labels "Mobile number", "PAN card", "Aadhaar card") showing the full value or "Not provided", the status chip and the rejection reason; "Verify" and "Reject" buttons disabled when the value is missing or a request is in flight; "Verify" hidden when already `VERIFIED`; Reject opens `ReasonDialog`.
  - `SuspendDialogComponent` — native `<dialog>`; radio presets "1 day", "7 days", "30 days", "Custom"; custom `datetime-local` input; required reason; output `confirmed: { until: string /* ISO */; reason: string }`; validates custom date is in the future and ≤ 365 days ahead with messages "Pick a time in the future" / "Suspensions are limited to one year".
  - User detail: profile header, stores table (links to `/stores/:id`), suspension card ("Active" or "Suspended until <local date> — <reason>") with "Suspend user" / "Lift suspension".

- [ ] **Step 1: Write failing specs:** verification panel disables buttons for a missing phone, calls `decideVerification(id, 'pan', 'REJECTED', 'Blurry')` after dialog confirm and emits the returned detail; suspend dialog emits `until` ≈ now + 7 days for the 7-day preset and blocks a past custom date with "Pick a time in the future"; users page maps `?verification=pending` into the request.
- [ ] **Step 2: Run and confirm failure** — `npm test -- --watch=false` → FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Verify** — tests PASS; `npm run build` succeeds.
- [ ] **Step 5: Commit** — `feat(admin-app): add user verification and suspension pages`

---

## Task 12: Marketplace client — real verification states, badge, block notice, suspension message

**Files:**
- Create: `aaspass-client/src/app/components/verified-badge/verified-badge.ts|html|spec.ts`
- Modify: `models/response.model.ts` (`BackendUserResponse`, `BackendStoreResponse`), `models/user.model.ts` (`UserProfile`), `models/store.model.ts` (`StoreProfile`), `services/auth/auth.service.ts:88` (`mapBackendUserToProfile`), `services/store/store.service.ts:113` (`mapBackendStoreToProfile`), `interceptors/error-toast.interceptor.ts` (403 branch), `pages/profile/profile.html|ts` (KYC rows ~150-260, store activate control ~560-595, header name), `pages/store-detail/store-detail.html` (owner name), `components/store-card/store-card.html` (owner name)
- Test: `verified-badge.spec.ts`, `interceptors/error-toast.interceptor.spec.ts`, `pages/profile/profile.spec.ts`, `services/store/store.service.spec.ts`

**Interfaces:**
- Consumes: Task 2 response fields.
- Produces:
  - Types: `type VerificationStatus = 'UNVERIFIED' | 'VERIFIED' | 'REJECTED'`; `interface VerificationItemView { status: VerificationStatus; reason?: string | null }`; `interface VerificationView { phone: VerificationItemView; pan: VerificationItemView; aadhar: VerificationItemView }`.
  - `UserProfile` + `verified: boolean`, `verification?: VerificationView`, `suspendedUntil?: string | null`; `StoreProfile` + `ownerVerified: boolean`, `adminBlocked?: boolean`, `adminBlockReason?: string | null`. Mappers default with `?? false` / `?? null`.
  - `VerifiedBadgeComponent` (`app-verified-badge`) — lucide check-badge icon in `text-emerald-600`, `role="img"`, `aria-label="Verified"`, `title="Verified"`; input `size: 'sm' | 'md' = 'sm'`.
  - `toastMessageFor`: 403 with code `ACCOUNT_SUSPENDED` or `STORE_BLOCKED_BY_ADMIN` → `{ type: 'error', message: serverMessage(err) ?? "You don't have permission to do that." }`.
  - Profile KYC rows for Mobile, Aadhaar, PAN: remove the hard-coded "✓ Verified" chip; render via one helper `kycChip(item: 'phone' | 'pan' | 'aadhar')` returning `'verified' | 'pending' | 'rejected' | null` (null when no value): green "✓ Verified", slate "Pending verification", red "Rejected — <reason>" (`data-testid="kyc-<item>-status"`). Add a Mobile row next to Aadhaar/PAN if the profile has none, showing the phone and its chip (editing stays in the existing profile form).
  - Owner store card on profile: when `store.adminBlocked`, show `role="alert"` notice "Deactivated by admin: <reason>. Contact support to restore it." and disable the Activate button.
  - `<app-verified-badge>` next to the user's name in the profile header (when `verified`), on store detail and store card next to the owner name (when `ownerVerified`).

- [ ] **Step 1: Write failing specs:** badge renders with `aria-label="Verified"`; interceptor returns the server message for 403 `ACCOUNT_SUSPENDED`; profile shows "Pending verification" for an unverified PAN with a value, "Rejected — Blurry" for a rejected one, no chip when Aadhaar is absent, and no "✓ Verified" when status is `UNVERIFIED`; blocked store shows the notice and the activate button is disabled; `mapBackendStoreToProfile` defaults `ownerVerified` to `false` when the field is missing.
- [ ] **Step 2: Run and confirm failure** — `cd aaspass-client; npm test -- --watch=false` → FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Verify** — `npm test -- --watch=false` PASS; `npm run build` succeeds.
- [ ] **Step 5: Commit** — `feat(client): show real verification states, verified badge and admin-block notice`

---

## Task 13: End-to-end verification and review

**Files:** none new (fixes only, if found).

- [ ] **Step 1: Full checks** — `cd aaspass-service-backend; .\mvnw.cmd test` (PASS); `cd aaspass-client; npm run build; npm test -- --watch=false` (PASS); `cd aaspass-admin; npm run build; npm test -- --watch=false` (PASS).
- [ ] **Step 2: Manual run** (backend via `.\mvnw.cmd spring-boot:run`, client `npm start` on 4200, admin `npm start` on 4300 — separate workspaces, separate caches): log in to admin as `admin@aaspass.local`; dashboard shows 3 pending users and 2 unreviewed stores; verify aman's mobile/PAN/Aadhaar → aman's profile in the client shows three green chips and the name badge; block PixelCraft Studios → gone from client `/stores`, priya sees the block notice and cannot activate; suspend rohan for 1 day → rohan's open client tab is logged out and login shows "Account suspended until … UTC: …"; lift → rohan can log in.
- [ ] **Step 3: Whole-branch review** with the `reviewer-agent` checklist from `AGENTS.md` (diff audit, null-safety, compile checks); fix findings and re-run Step 1.
- [ ] **Step 4: Commit** any fixes — `fix: address admin panel review findings`
