# JWT Cookie Authentication, Encrypted KYC & Ownership Lockdown — Design

**Date:** 2026-10-27
**Status:** Draft — awaiting review
**Scope:** `aaspass-service-backend` (Spring Boot 4.0.8 / Java 17) and `aaspass-client` (Angular 22)

---

## 1. Goals

1. Replace the placeholder login (plaintext password compare + random UUID "token" that nothing validates) with **Spring Security + JWT**.
2. **Access token lifetime: 15 minutes.** When it expires, a **refresh token** silently issues a new access token *and* a new refresh token, each set as a new cookie.
3. Session identifiers and tokens travel **only in `HttpOnly` cookies** — never in JSON bodies, `localStorage`, or JS-readable storage.
4. Passwords stored with **BCrypt** (one-way, salted, cost 12).
5. **Aadhaar and PAN encrypted at rest** with AES-256-GCM. The backend decrypts and masks them; the frontend only ever receives the masked form (last 4 characters visible, the rest `X`).
6. **Full lockdown:** every write endpoint requires authentication, the acting user is derived from the token, and users may only modify their own data.

### Decisions taken during brainstorming

| Topic | Decision |
|---|---|
| Password scheme | BCrypt, cost 12 (Spring `BCryptPasswordEncoder`) |
| Refresh token | 30-day absolute lifetime, stored server-side (hashed), rotated on every refresh, reuse ⇒ session revoked |
| KYC display | Decrypt + mask in backend; masked string sent to UI |
| KYC editing | Dedicated KYC update action; general profile save never touches KYC |
| Scope | Full lockdown incl. ownership checks and removal of frontend `localStorage` fake-auth |
| Implementation approach | Spring Security OAuth2 Resource Server (Nimbus JWT, HS256) with a cookie-based `BearerTokenResolver` |

### Out of scope

OTP/SMS login, "manage devices / log out everywhere" UI, real KYC verification against government APIs, login rate limiting / account lockout, production deployment config (HTTPS termination, real secret management).

---

## 2. Architecture

### 2.1 Approach

Add `spring-boot-starter-security` and `spring-boot-starter-oauth2-resource-server`.

- **Validation:** `oauth2ResourceServer().jwt()` with a `NimbusJwtDecoder` built from the HS256 secret. Spring validates signature, `exp`, `nbf`, `iss`.
- **Token source:** custom `CookieBearerTokenResolver` reads the `AASPASS_AT` cookie (header `Authorization` is ignored).
- **Session check:** a custom `OAuth2TokenValidator<Jwt>` (`ActiveSessionValidator`) rejects tokens whose `sid` session is revoked or expired, so logout takes effect immediately.
- **Issuing:** `JwtTokenService` uses `NimbusJwtEncoder` (HS256) to mint access tokens.
- `SessionCreationPolicy.STATELESS` — no `HttpSession`/`JSESSIONID`.

### 2.2 Dev topology change

The Angular dev server gets a proxy (`aaspass-client/proxy.conf.json`, wired via `angular.json` `serve.options.proxyConfig`) forwarding `/api` → `http://localhost:8080`. `API_BASE_URL` becomes `'/api'`.

Reasons: browser and API become same-origin, so cookies can be `SameSite=Strict`, CORS is not on the critical path, and Angular's built-in XSRF support works (it skips absolute URLs).

`WebMvcConfig` CORS rules remain (for direct `:8080` access) and are exposed to Spring Security via `http.cors()`. All 10 controller-level `@CrossOrigin` annotations are removed.

### 2.3 Cookies

| Cookie | Value | HttpOnly | Secure | SameSite | Path | Max-Age |
|---|---|---|---|---|---|---|
| `AASPASS_AT` | Access JWT | yes | configurable (`aaspass.security.cookie-secure`, default `true`) | Strict | `/api` | 900 s |
| `AASPASS_RT` | Opaque refresh token (32 random bytes, base64url) | yes | configurable | Strict | `/api/auth` | 30 days minus elapsed session age |
| `XSRF-TOKEN` | CSRF token | **no** (Angular must read it) | configurable | Strict | `/` | session |

Cookies are built in one place: `AuthCookieService` (`ResponseCookie` builder), which also produces the clearing variants (`Max-Age=0`).

### 2.4 Access JWT claims

| Claim | Value |
|---|---|
| `iss` | `aaspass` |
| `sub` | user id (string) |
| `sid` | session id (UUID) |
| `username` | username |
| `iat` / `exp` | issued-at / issued-at + 15 min |

No PII beyond username; no KYC, email or phone.

---

## 3. Flows

### 3.1 Login — `POST /api/auth/login`
1. Look up user by username or email (case-insensitive, trimmed).
2. `passwordEncoder.matches(raw, hash)`; on miss or mismatch → `401 INVALID_CREDENTIALS` with the generic message "Invalid username or password". A dummy BCrypt compare is run when the user does not exist to keep timing uniform.
3. Create `UserSession` (new `sessionId`, `refreshTokenHash = sha256(rt)`, `userAgent`, `ipAddress`, `expiresAt = now + 30d`, `lastUsedAt = now`).
4. Set `AASPASS_AT` and `AASPASS_RT` cookies; body = `ApiResponse<AuthResponse>` where `AuthResponse` contains `success`, `message`, `user`. **`token` and `tokenType` fields are removed.**

### 3.2 Register — `POST /api/auth/register`
Same as today's validation and duplicate checks, but password is BCrypt-hashed. Then identical to login steps 3–4 (auto-login).

### 3.3 Authenticated request
Browser sends `AASPASS_AT` automatically → resolver → decoder → `ActiveSessionValidator` → `JwtAuthenticationToken`. Controllers obtain the user via `CurrentUser` (see §5.2).

### 3.4 Refresh — `POST /api/auth/refresh`
1. Read `AASPASS_RT`; missing → `401 UNAUTHENTICATED`.
2. Find session by `sha256(rt)`.
   - Not found by current hash but found by `previousRefreshTokenHash` → **reuse detected**: revoke session (`REUSE_DETECTED`), clear cookies, `401 SESSION_REVOKED`.
   - Not found at all → clear cookies, `401 UNAUTHENTICATED`.
3. Session revoked or `expiresAt` passed → clear cookies, `401 SESSION_REVOKED`.
4. Rotate: `previousRefreshTokenHash = refreshTokenHash`, `refreshTokenHash = sha256(newRt)`, `lastUsedAt = now`. `expiresAt` is **not** extended (30-day absolute cap).
5. Set new `AASPASS_AT` + `AASPASS_RT`; body = `ApiResponse<UserResponse>`.

Rotation runs in a transaction with a pessimistic write lock on the session row so two concurrent refreshes with the same token cannot both succeed.

### 3.5 Logout — `POST /api/auth/logout`
Public. If a refresh cookie or valid access cookie identifies a session, mark it revoked (`LOGOUT`). Always clear `AASPASS_AT` and `AASPASS_RT`. Returns `200`.

**A logged-out session can never be rejoined.** Revocation is permanent and the session id is dead for good:
- Session ids are random UUIDs generated per login and **never reused**; there is no code path that clears `revoked_at` or "reactivates" a session.
- Any request carrying an access JWT whose `sid` is revoked → `401 SESSION_REVOKED`, even if the JWT's own `exp` is still in the future (enforced by `ActiveSessionValidator` on every request).
- `POST /api/auth/refresh` with the session's current **or any previous** refresh token → `401 SESSION_REVOKED`; no new cookies are issued.
- A new login always creates a **new** `UserSession` with a new `session_id` and a new refresh token; it never reuses or reattaches to an old session, even for the same user on the same device.
- This holds even if the client kept copies of the old cookies (e.g. copied out of DevTools before logout) — the server-side revocation, not cookie deletion, is what enforces it.

### 3.6 Current user — `GET /api/auth/me`
Authenticated. `?userId=` parameter removed; returns the token user's `UserResponse`.

### 3.7 Page reload (frontend)
On bootstrap `AuthService.restoreSession()` calls `GET /api/auth/me`. If the access token is expired the interceptor refreshes first. Final `401` ⇒ guest.

---

## 4. Data model

### 4.1 New entity `UserSession` → table `user_sessions` (extends `BaseAuditEntity`)

| Column | Type | Notes |
|---|---|---|
| `id` | bigint PK | |
| `session_id` | varchar(36) | UUID, unique, indexed |
| `user_id` | bigint FK → `users.id` | `@ManyToOne(fetch = LAZY)` |
| `refresh_token_hash` | char(64) | hex SHA-256, unique, indexed |
| `previous_refresh_token_hash` | char(64) | nullable, indexed; for reuse detection |
| `user_agent` | varchar(255) | truncated |
| `ip_address` | varchar(45) | |
| `expires_at` | datetime | login + 30 days |
| `last_used_at` | datetime | |
| `revoked_at` | datetime | nullable |
| `revoke_reason` | varchar(32) | enum `SessionRevokeReason`: `LOGOUT`, `REUSE_DETECTED`, `PASSWORD_CHANGED` |

Repository `UserSessionRepository`: `findBySessionId`, `findByRefreshTokenHash` (with `@Lock(PESSIMISTIC_WRITE)` variant), `findByPreviousRefreshTokenHash`.

Refresh tokens are 256-bit random values, so a fast SHA-256 hash is sufficient (no salt/BCrypt needed).

### 4.2 `User` changes
- `password`: holds BCrypt hash (column already 255).
- `aadharNumber`, `panNumber`: annotated `@Convert(converter = KycEncryptedConverter.class)`; column length → 255.

### 4.3 KYC encryption
- `KycCryptoService`: AES-256-GCM, 12-byte random IV per value, 128-bit tag. Stored format: `"enc:v1:" + base64(iv ‖ ciphertext ‖ tag)`. The prefix allows detection of legacy plaintext and future key rotation.
- `KycEncryptedConverter implements AttributeConverter<String, String>` delegates to `KycCryptoService` (obtained via a static holder set at startup, since JPA instantiates converters). `null`/blank → `null`.
- Decryption failure → `IllegalStateException` logged without the value; never silently returns ciphertext.

### 4.4 Masking (backend, `KycMasking` utility used by `DtoMapper`)
| Field | Stored (plain, normalized) | Sent to UI |
|---|---|---|
| Aadhaar | `999988887777` | `XXXXXXXX7777` |
| PAN | `ABCDE1234F` | `XXXXXX234F` |
| absent | `null` | `null` |

Values shorter than 4 characters are fully masked.

### 4.5 Configuration
| Property | Env var | Requirement |
|---|---|---|
| `aaspass.security.jwt-secret` | `AASPASS_JWT_SECRET` | base64, ≥ 32 bytes decoded |
| `aaspass.security.kyc-key` | `AASPASS_KYC_KEY` | base64, exactly 32 bytes decoded |
| `aaspass.security.cookie-secure` | — | boolean, default `true` |
| `aaspass.security.access-token-ttl` | — | default `PT15M` |
| `aaspass.security.refresh-token-ttl` | — | default `P30D` |

Bound to a `@ConfigurationProperties` record `SecurityProperties`, validated at startup (fail fast). Dev defaults live only in `application-dev.properties`; `application.properties` sets `spring.profiles.active=dev` for local runs, overridable by env.

### 4.6 Existing data migration
`SecurityDataMigration` (`ApplicationRunner`; order relative to `DataInitializer` does not matter because seeds are written already hashed/encrypted and the migration skips such rows):
- Passwords not starting with `$2` → BCrypt-hash.
- Aadhaar/PAN not starting with `enc:v1:` → normalize and encrypt. Legacy pre-masked seed values (containing `X`) are set to `null`.
- Idempotent; logs counts only.

`DataInitializer` seeds use realistic test numbers (`999988887777`/`ABCDE1234F`, etc.) and BCrypt-hashed `password123`, so demo logins `aman`/`priya`/`rohan` continue to work.

---

## 5. Authorization

### 5.1 Endpoint rules (`SecurityFilterChain`)

| Endpoint | Rule |
|---|---|
| `POST /api/auth/login`, `/register`, `/refresh`, `/logout` | permitAll |
| `GET /api/auth/me` | authenticated |
| `GET /api/stores/**` (list, by id, by user, reviews, services) | permitAll |
| `POST /api/stores/{id}/views` | permitAll (viewer id taken from token when present; `viewerId` param ignored) |
| `GET /api/users/{id}` | permitAll — KYC fields returned only when `id` is the caller |
| everything else under `/api/**` | authenticated |

### 5.2 Ownership
- `CurrentUser` component: `requireUserId()` (throws `UnauthorizedException`), `optionalUserId()`.
- New `ForbiddenException` → `403 FORBIDDEN` in `GlobalExceptionHandler`.
- `UserController` `{id}` / `{userId}` paths must equal the caller → else 403.
- `StoreService.assertStoreOwner(storeId, userId)` used by update, delete, toggle-status and all service-item mutations.
- `createStore`: owner = caller; the client-supplied owner id is no longer read (the field is removed from `StoreCreateRequest` and the frontend payload).
- `addReview`: reviewer = caller (name taken from user record, not request).

### 5.3 CSRF
`CookieCsrfTokenRepository.withHttpOnlyFalse()` with cookie `XSRF-TOKEN`, header `X-XSRF-TOKEN`, `CsrfTokenRequestAttributeHandler` (plain, non-XOR, compatible with Angular). Ignored for `login`, `register`, `refresh` (protected by `SameSite=Strict` and needing no prior state). A `CsrfCookieFilter` forces the token to be materialized so the cookie is issued on first response.

### 5.4 KYC update endpoint
`PUT /api/users/me/kyc` — body `KycUpdateRequest(String aadharNumber, String panNumber)`, both optional.
- Aadhaar: strip spaces/dashes, must match `^\d{12}$`.
- PAN: uppercase/trim, must match `^[A-Z]{5}[0-9]{4}[A-Z]$`.
- Returns `ApiResponse<UserResponse>` with masked values.
- `aadharNumber` / `panNumber` are removed from `UserUpdateRequest`.

---

## 6. Error contract

`ApiResponse` gains an optional `code` field for errors. Spring Security's `AuthenticationEntryPoint` and `AccessDeniedHandler` write the same JSON envelope.

| HTTP | `code` | When |
|---|---|---|
| 401 | `TOKEN_EXPIRED` | access JWT `exp` passed (frontend refreshes) |
| 401 | `UNAUTHENTICATED` | no/invalid token, missing refresh cookie |
| 401 | `SESSION_REVOKED` | session revoked, expired, or refresh reuse |
| 401 | `INVALID_CREDENTIALS` | login failure |
| 403 | `FORBIDDEN` | ownership violation |
| 403 | `CSRF_INVALID` | missing/invalid XSRF token |

Logging: user id and session id only. Never tokens, passwords, raw/encrypted KYC.

---

## 7. Frontend changes (`aaspass-client`)

- `proxy.conf.json` + `angular.json` `proxyConfig`; `API_BASE_URL = '/api'`.
- `app.config.ts`: `provideHttpClient(withFetch(), withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }), withInterceptors([errorToastInterceptor, authRefreshInterceptor]))`; `provideAppInitializer(() => inject(AuthService).restoreSession())`. Order matters: `errorToastInterceptor` is outermost, so it only sees the *final* error after any refresh-and-retry.
- `interceptors/auth-refresh.interceptor.ts`: on `401` with `code === 'TOKEN_EXPIRED'` (or `UNAUTHENTICATED` when a user is believed logged in), call `/auth/refresh` through a single shared in-flight observable, then retry the original request once. Never intercepts `/auth/refresh`, `/auth/login`, `/auth/logout`. On refresh failure: clear `currentUser`, navigate to `/login?returnUrl=<current>`.
- `AuthService` rewrite:
  - Remove `STORAGE_KEY_*`, `getRegisteredAccounts`, local login/signup fallback, `saveSession` token persistence, `demoAccounts` with passwords, `quickLogin`.
  - `login()` / `signup()` return `Observable<AuthResult>` driven by the HTTP result; existing callers (`auth-page`, navbar modal) updated.
  - `currentUser` set only from backend responses; `restoreSession(): Promise<void>` and `sessionRestored` signal.
  - `updateUserProfile` uses `/users/{id}` from `currentUser().id` (no `parseInt` fallback to `1`), without KYC fields; no optimistic local persistence.
  - New `updateKyc(payload)` → `PUT /users/me/kyc`.
- `authGuard`: awaits `sessionRestored` before deciding.
- `profile` page: masked Aadhaar/PAN displayed read-only; "Update" opens an empty input bound to `updateKyc`; KYC removed from general profile save.
- Models: remove `token`/`tokenType` from `BackendAuthResponse`; remove KYC from `UpdateUserPayload`; add `KycUpdatePayload`; `ApiResponse` gets optional `code`.
- `StoreService` / `StoreHttpService`: drop client-supplied `userId`/`viewerId` where the backend now derives it.

### 7.1 Shared toaster

One toast system for the whole app, replacing the four hand-rolled toasts (`create-store` error toast, `store-detail` notification, `profile` simulation toast and success alert), each of which has its own timer and markup today.

**`services/toast/toast.service.ts`** (singleton, signal-based)
- `toasts = signal<Toast[]>([])` — `Toast { id, type: 'success' | 'error' | 'warning' | 'info', message, title?, durationMs }`. Updated immutably (`update`, never mutate).
- `success()`, `error()`, `warning()`, `info()`, `show(toast)`, `dismiss(id)`, `clear()`.
- Auto-dismiss: 4 s for success/info, 6 s for warning/error; timer paused while hovered or focused.
- At most 4 visible; oldest dropped first. An identical `type + message` already visible is not duplicated (its timer restarts instead).

**`components/toaster/toaster.ts`** (`<app-toaster>`, rendered once in the app shell `app.html`)
- Stacked top-right on desktop, top-centre full-width (16px gutter) on mobile; Tailwind, colour + icon per type.
- Accessibility (AXE / WCAG AA): container `aria-live="polite"` for success/info and a separate `role="alert"` / `aria-live="assertive"` region for error/warning; each toast has a close button with `aria-label="Dismiss notification"`; dismissible with `Esc` when focused; colour is never the only signal (icon + text); contrast ≥ 4.5:1; enter/exit animation disabled under `prefers-reduced-motion`.

**`interceptors/error-toast.interceptor.ts`** — turns API failures into user-friendly toasts:

| Condition | Toast | Type |
|---|---|---|
| `401 TOKEN_EXPIRED` | none (refresh handles it; only reached if refresh logic is bypassed) | — |
| `401 SESSION_REVOKED` | "Your session has ended. Please log in again." | warning |
| `401 UNAUTHENTICATED` | "Please log in to continue." | warning |
| `401 INVALID_CREDENTIALS` | "Invalid username or password." | error |
| `403 FORBIDDEN` | "You don't have permission to do that." | error |
| `403 CSRF_INVALID` | "Security check failed. Please refresh the page and try again." | error |
| `400` / `409` with server `message` | server `message` (validation / duplicate username etc.) | error |
| `404` | server `message` or "We couldn't find what you were looking for." | error |
| status `0` (network) | "Can't reach AasPass right now. Check your connection." | error |
| `5xx` | "Something went wrong on our side. Please try again." | error |

- Never shows stack traces, raw JSON, or technical exception text; server `message` is used only for 4xx where the backend writes user-facing messages.
- Opt-out via `HttpContextToken<boolean> SKIP_ERROR_TOAST` for background calls whose failure is expected: startup `restoreSession()` (`GET /auth/me` as a guest), `POST /auth/refresh`, `POST /auth/logout`, and `POST /stores/{id}/views`.
- The error is re-thrown after toasting so callers can still react (e.g. stop a spinner).

**Migration of existing feedback**
- `create-store`, `store-detail`, `profile`: remove local `showToast` / `showErrorToast` / `notificationMessage` / `viewSimulationToast` state, timers and markup; call `ToastService` instead (success messages such as "review posted" become `success` toasts).
- `auth-page` / login modal: server errors (invalid credentials, duplicate username/email) come from the interceptor toast; the `authError` signal and its inline banner are removed. Client-side field validation (e.g. "Passwords do not match") stays inline next to the field, since it belongs to the field, not the request.
- Logout and successful login/signup show a `success` toast ("Welcome back, {name}!", "You've been logged out.").

---

## 8. Testing

### Backend (JUnit 5 + MockMvc, H2 test profile with fixed test secrets)
- Login: sets `AASPASS_AT` and `AASPASS_RT` with `HttpOnly`, `SameSite=Strict`, correct `Path` and `Max-Age`; body contains no token.
- Wrong password and unknown user both → `401 INVALID_CREDENTIALS`, same message.
- Protected endpoint without cookie → `401 UNAUTHENTICATED`; with expired JWT → `401 TOKEN_EXPIRED`.
- Refresh rotates both cookies; reusing the old refresh token → `401 SESSION_REVOKED` and the new token is also dead.
- Logout revokes session; old access token → `401 SESSION_REVOKED`.
- **No rejoin after logout:** capture the `AASPASS_AT` and `AASPASS_RT` cookie values, log out, then replay them manually → `GET /api/auth/me` gives `401 SESSION_REVOKED` and `POST /api/auth/refresh` gives `401 SESSION_REVOKED` with no `Set-Cookie` for new tokens.
- Logging in again after logout yields a **different** `sid` claim and a different refresh token than the revoked session.
- Ownership: user A `PUT /api/users/{B}` → 403; A updating B's store → 403.
- CSRF: authenticated `PUT` without `X-XSRF-TOKEN` → 403.
- `KycCryptoService`: round-trip; same plaintext ⇒ different ciphertext; tampered ciphertext throws.
- `KycMasking`: Aadhaar, PAN, null, short values.
- KYC endpoint: invalid formats → 400; response masked; DB column contains `enc:v1:` prefix.
- `SecurityDataMigration`: plaintext → hashed/encrypted; second run is a no-op.
- Update existing `AuthControllerTest` and `StoreAndUserControllerTest`.

### Frontend (Vitest)
- Refresh interceptor: concurrent 401s trigger exactly one refresh; original request retried once; refresh failure clears user and redirects.
- `authGuard` waits for `restoreSession`.
- `AuthService.login` sets `currentUser` from backend response only.
- `ToastService`: add/dismiss; auto-dismiss timings (fake timers); max 4 visible; duplicate suppression.
- `errorToastInterceptor`: each row of the §7.1 mapping table; `SKIP_ERROR_TOAST` suppresses; `TOKEN_EXPIRED` that is then refreshed successfully produces **no** toast; error is re-thrown.
- `Toaster` component: renders per type, close button dismisses, error toasts land in the `role="alert"` region.

### Build verification (AGENTS.md)
`.\mvnw.cmd test-compile`, `.\mvnw.cmd test`, `npm run build`.

---

## 9. Docs to update on completion
- `README.md` — dev proxy, env vars, auth model.
- `doc/PROJECT_DETAILS.md` — security architecture, API table, ER diagram (`user_sessions`).
- `doc/AI-doc/CHANGELOG.md` — entry for the implementation.
