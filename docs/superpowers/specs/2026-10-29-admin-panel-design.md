# Admin Panel — Design

**Date:** 2026-10-29
**Branch:** `feature/admin-panel`
**Scope:** New Angular app `aaspass-admin/`, new `com.aaspass.admin` backend module, small changes to `aaspass-client` and existing backend user/store flows.

## 1. Goal

Give AasPass operators a separate admin application (own folder, own URL) to:

1. Log in as an admin.
2. Search stores by country, city and store name, and browse all created stores.
3. Block (deactivate) and unblock stores.
4. Suspend a user for a period of time, and lift a suspension early.
5. Verify a user's **mobile number**, **PAN** and **Aadhaar** individually (verify or reject with a reason).
6. See a dashboard of new stores awaiting review and users awaiting verification.

Verified items show a green ✓ on the user's own profile; a public green verified tick appears next to the user's name and on their stores once all three items are verified.

### Decisions already made with the user

| Topic | Decision |
| :--- | :--- |
| Architecture | New `aaspass-admin/` Angular app + `/api/admin/**` module inside the existing Spring Boot service (one deployable, strictly separated security) |
| Admin accounts | Separate `admin_users` table; first super-admin seeded from env config; admin and marketplace identities never mix |
| Store deactivation by admin | Separate `adminBlocked` flag with reason; owner cannot reactivate; only an admin can unblock |
| Suspension effect | All sessions revoked immediately, login/refresh refused with reason and end date, user's stores hidden from search; lifts automatically at end time; admin can lift early |
| Verification states | Per item: `UNVERIFIED` / `VERIFIED` / `REJECTED` (reason shown to user); editing the value resets it to `UNVERIFIED`; admin sees full unmasked values; views and decisions are audit-logged |
| Verified badge | Per-item on own profile; public tick only when all three items are `VERIFIED` |
| Store review | Stores get an `adminReviewedAt` marker so the dashboard can list unreviewed new stores; review does not change visibility |

### Out of scope (future)

- Admin login lockout / rate limiting.
- Managing other admins from the UI; admin roles/permissions.
- OTP-based phone verification, document (image) uploads, government-API KYC checks.
- Notifications (email/SMS) to users about verification or suspension.

## 2. Existing system (what we build on)

- **Auth:** stateless HS256 access JWT (issuer `aaspass`, claims `sub`=user id, `sid`, `username`) in HttpOnly cookie `_sid` (path `/api`); rotating refresh token in `_rid` (path `/api/auth`), hashed in `user_sessions` (`SessionService`, `TokenHashing`). `ActiveSessionValidator` checks the session on every request. CSRF via `XSRF-TOKEN` cookie / `X-XSRF-TOKEN` header. Cookie Secure/Domain rules in `AuthCookieService.applyHostRules`.
- **CORS:** `WebMvcConfig` hard-codes `localhost:4200`, `127.0.0.1:4200`, `localhost:3000`.
- **User:** single `User` entity, no roles. `phone` plain; `aadharNumber`/`panNumber` encrypted via `KycEncryptedConverter`, masked in responses (`KycMasking`). Users update KYC via `PUT /api/users/me/kyc`.
- **Store:** owner-controlled `isActive` (`PATCH /api/stores/{id}/activate|deactivate`); public search shows only active stores.
- **Client profile:** shows a hard-coded "✓ Verified" chip whenever an Aadhaar number exists (`profile.html:165`) — this is replaced by real state.
- **Errors:** `ApiResponse` envelope, `GlobalExceptionHandler`, `ErrorCode` enum.

## 3. Data model

### 3.1 New tables

**`admin_users`** (`AdminUser extends BaseAuditEntity`)

| Column | Notes |
| :--- | :--- |
| `name` | varchar(100), not null |
| `email` | varchar(100), unique, not null; stored lower-cased |
| `password` | BCrypt (shared `PasswordEncoder`), write-only |
| `active` | boolean, default true; inactive admins cannot log in |
| `last_login_at` | Instant, nullable |

Bootstrap: `AdminBootstrap` (`CommandLineRunner`) creates one admin from `aaspass.admin.bootstrap-email` / `aaspass.admin.bootstrap-password` / `aaspass.admin.bootstrap-name` **only when `admin_users` is empty**. `application-dev.properties` supplies dev defaults (`admin@aaspass.local` / `admin12345`); outside dev, missing values log a warning and skip seeding.

**`admin_sessions`** (`AdminSession`) — same shape as `user_sessions` (session id, refresh hash, previous hash, user agent, IP, expires/last-used/revoked, revoke reason) but FK to `admin_users`. Refresh-token rotation and reuse detection reuse `TokenHashing`; common rotation logic is extracted from `SessionService` where it splits cleanly, otherwise mirrored in `AdminSessionService`.

**`admin_audit_log`** (`AdminAuditEntry`)

| Column | Notes |
| :--- | :--- |
| `admin_id` | FK `admin_users` |
| `action` | enum: `LOGIN`, `VIEW_USER_KYC`, `VERIFY_ITEM`, `REJECT_ITEM`, `SUSPEND_USER`, `LIFT_SUSPENSION`, `BLOCK_STORE`, `UNBLOCK_STORE`, `REVIEW_STORE` |
| `target_type` | `USER` / `STORE` / `NONE` |
| `target_id` | nullable Long |
| `details` | varchar(500): item name, reason, suspension end — never raw KYC values |
| `creation_date_time` | from base entity |

### 3.2 `users` changes

- `suspended_until` (Instant, nullable), `suspension_reason` (varchar 500, nullable). `User.isSuspended(Instant now)` = `suspendedUntil != null && suspendedUntil.isAfter(now)`. No scheduler: suspension lifts by time.
- Three embedded `VerificationCheck` values (one `@Embeddable`, used with `@AttributeOverrides`): `phoneVerification`, `panVerification`, `aadharVerification`, each:
  - `status` enum `VerificationStatus { UNVERIFIED, VERIFIED, REJECTED }` — column default `'UNVERIFIED'` so `ddl-auto=update` backfills existing users.
  - `reason` varchar(500), `decided_at` Instant, `decided_by_admin_id` Long.
- `User.isFullyVerified()` = all three `VERIFIED`.
- **Reset rule:** when `phone`, `aadharNumber` or `panNumber` changes to a different value (via profile update or `PUT /me/kyc`), that item's check resets to `UNVERIFIED` and clears reason/decision fields. Setting the same value is a no-op.

### 3.3 `stores` changes

- `admin_blocked` boolean not null default false, `admin_block_reason` varchar(500), `admin_blocked_at` Instant.
- `admin_reviewed_at` Instant nullable, `reviewed_by_admin_id` Long nullable.
- **Public visibility rule** (search, listing, home preview): `isActive && !adminBlocked && !owner.isSuspended(now)`. `GET /api/stores/{id}` for a hidden store returns 404 to the public, but still returns it to its owner (so they see the block notice).

## 4. Backend

### 4.1 Package layout

```
com.aaspass.admin
├── config/       AdminSecurityConfig, AdminSecurityProperties, AdminBootstrap
├── controller/   AdminAuthController, AdminDashboardController, AdminStoreController, AdminUserController
├── dto/          request + response records (AdminLoginRequest, BlockStoreRequest, SuspendUserRequest, VerificationDecisionRequest, AdminStoreSummary, AdminUserSummary, AdminUserDetail, DashboardResponse, PageResponse<T>, ...)
├── entity/       AdminUser, AdminSession, AdminAuditEntry
├── repository/   AdminUserRepository, AdminSessionRepository, AdminAuditRepository
├── security/     CurrentAdmin, AdminJwtTokenService, AdminActiveSessionValidator
└── service/      AdminAuthService, AdminSessionService, AdminStoreService, AdminUserService, AdminDashboardService, AdminAuditService
```

Shared entities `VerificationCheck` / `VerificationStatus` live in `com.aaspass.entity` (used by `User`).

### 4.2 Security

- **Second filter chain** `adminSecurityFilterChain`, `@Order(1)`, `securityMatcher("/api/admin/**")`. The existing chain gets `@Order(2)` and is otherwise unchanged.
- **Separate JWT:** issuer `aaspass-admin`, signed with `aaspass.security.admin-jwt-secret` (`AASPASS_ADMIN_JWT_SECRET`; dev default like the user secret, with `DevKeysWarning`). Claims: `sub`=admin id, `sid`, `email`, `typ`=`admin`. Access TTL 15 min, refresh TTL 12 h (admin sessions are deliberately shorter). The user chain's decoder already requires issuer `aaspass`, so admin tokens fail there; the admin decoder requires `aaspass-admin`, so user tokens fail there.
- **Cookies:** `_asid` (access, path `/api/admin`, SameSite Lax) and `_arid` (refresh, path `/api/admin/auth`, SameSite Strict). `AuthCookieService` is generalised (`cookie(name, value, sameSite, path, ttl, req)`) so host/Secure/Domain rules stay single-sourced; the admin side uses a small `AdminCookieService` on top of it. The admin chain uses a cookie bearer resolver reading `_asid`.
- **CSRF:** same `CookieCsrfTokenRepository` bean and `CsrfCookieFilter`; exempt `POST /api/admin/auth/login` and `/api/admin/auth/refresh`.
- **Authorization:** `permitAll` for `POST auth/login|refresh|logout`; everything else under `/api/admin/**` requires an authenticated admin.
- **CORS:** allowed origins move to `aaspass.cors.allowed-origins` (comma-separated), defaulting to the current three plus `http://localhost:4300` and `http://127.0.0.1:4300`.
- **Login:** case-insensitive email, BCrypt check, inactive admin → same generic `401 INVALID_CREDENTIALS` (no account enumeration). Updates `last_login_at`, writes `LOGIN` audit entry.

### 4.3 Admin endpoints (all `ApiResponse<T>`)

**Auth**

| Method | Path | Body / result |
| :--- | :--- | :--- |
| POST | `/api/admin/auth/login` | `{email, password}` → `AdminProfile {id, name, email}`, sets cookies |
| POST | `/api/admin/auth/refresh` | rotates `_arid`, reissues `_asid` |
| POST | `/api/admin/auth/logout` | revokes session, clears cookies |
| GET | `/api/admin/auth/me` | `AdminProfile` |

**Dashboard** — `GET /api/admin/dashboard` → `{ totals: {users, stores, activeStores}, pendingUsers: count, unreviewedStores: count, blockedStores: count, suspendedUsers: count, recentPendingUsers: AdminUserSummary[10], recentUnreviewedStores: AdminStoreSummary[10] }`.

- *Pending user* = has at least one non-blank value among phone/PAN/Aadhaar whose check is `UNVERIFIED`. Ordered by `creationDateTime` desc.
- *Unreviewed store* = `adminReviewedAt IS NULL`, ordered by `creationDateTime` desc.

**Stores**

| Method | Path | Notes |
| :--- | :--- | :--- |
| GET | `/api/admin/stores?country=&city=&name=&status=&page=0&size=20` | `country`/`city` exact case-insensitive; `name` case-insensitive contains; `status ∈ {all, active, inactive, blocked, unreviewed}` (default `all`); `size` capped at 100. Returns `PageResponse<AdminStoreSummary>` |
| GET | `/api/admin/stores/{id}` | `AdminStoreDetail` (store fields + owner summary + block/review state) |
| PATCH | `/api/admin/stores/{id}/block` | `{reason}` required (1–500 chars). Idempotent on already-blocked (updates reason) |
| PATCH | `/api/admin/stores/{id}/unblock` | Clears block fields. Does not change owner's `isActive` |
| PATCH | `/api/admin/stores/{id}/review` | Sets `adminReviewedAt`/`reviewedByAdminId` |

`AdminStoreSummary`: `id, storeName, category, ownerId, ownerName, ownerUsername, city, country, area, isActive, adminBlocked, reviewed, creationDateTime`.

**Users**

| Method | Path | Notes |
| :--- | :--- | :--- |
| GET | `/api/admin/users?q=&verification=&suspended=&page=0&size=20` | `q` contains-match on name/username/email/phone (KYC is encrypted, not searchable); `verification ∈ {all, pending, verified, rejected}` (`verified` = fully verified, `rejected` = any item rejected); `suspended ∈ {true,false}` optional |
| GET | `/api/admin/users/{id}` | `AdminUserDetail`: profile, **unmasked** phone/PAN/Aadhaar, three checks, suspension state, store summaries. Writes `VIEW_USER_KYC` |
| POST | `/api/admin/users/{id}/suspension` | `{until: ISO instant, reason}`; `until` must be in the future and ≤ 1 year ahead; reason required. Sets fields, revokes all user sessions (`SessionRevokeReason.SUSPENDED`) |
| DELETE | `/api/admin/users/{id}/suspension` | Clears suspension fields |
| PUT | `/api/admin/users/{id}/verification/{item}` | `item ∈ {phone, pan, aadhar}`; `{decision: VERIFIED\|REJECTED, reason}`; reason required for `REJECTED`; `400` if the item's value is blank |

`AdminUserSummary`: `id, name, username, email, city, country, phoneStatus, panStatus, aadharStatus, suspendedUntil, storeCount, creationDateTime`.

All mutating endpoints write an audit entry in the same transaction.

### 4.4 Changes to existing user-facing backend

- **Login / refresh (`AuthService`):** after credential check, if `user.isSuspended(now)` → `403` with new `ErrorCode.ACCOUNT_SUSPENDED`, message `"Account suspended until <date>: <reason>"`, and `details: {suspendedUntil, reason}`. Refresh also revokes the presented session.
- **`SessionRevokeReason`:** add `SUSPENDED`. Suspending calls a new `SessionService.revokeAllForUser(userId, reason)` (reuse if an equivalent exists).
- **Store activation (`StoreService.activateStore`):** if `adminBlocked` → `403 STORE_BLOCKED_BY_ADMIN`. Deactivate stays allowed.
- **Public store queries (`StoreRepository`/`StoreService`):** apply the visibility rule from §3.3.
- **`UserService` updates / `PUT /me/kyc`:** apply the reset rule from §3.2.
- **`ErrorCode`:** add `ACCOUNT_SUSPENDED`, `STORE_BLOCKED_BY_ADMIN`.
- **DTOs (`DtoMapper`):**
  - `UserResponse` + `verified: boolean` (always), + `verification: {phone, pan, aadhar: {status, reason}}` and `suspendedUntil` (only for the caller's own record; `null` otherwise).
  - `StoreResponse` + `ownerVerified: boolean` (always), + `adminBlocked`, `adminBlockReason` (only when the caller is the owner; otherwise `false`/`null`).

## 5. Admin frontend (`aaspass-admin/`)

### 5.1 Project

- New Angular 22 workspace at repo root, same toolchain as `aaspass-client` (TypeScript 6 strict, Tailwind 4, Vitest, `@spartan-ng/brain`, `@ng-icons/lucide`). Copies only the Spartan helm components it needs (button, input, card, badge, select, table styles, dialog, separator, skeleton) into `src/app/ui/`.
- `npm start` → `ng serve --port 4300`; `proxy.conf.json` proxies `/api` → `http://localhost:8080`. Separate workspace ⇒ separate `.angular/cache`, so it can run next to the client.
- `AGENTS.md` / `CLAUDE.md` with the same Angular conventions as the client; `COMMANDS.md` gains an "Admin (`aaspass-admin`)" section; root `README.md` mentions the app.
- Country/city filter options reuse the client's generated `public/geo` files (copied by an npm script `copy:geo`, not hand-duplicated).

### 5.2 Core

- `AdminAuthService` (signals: `admin`, `isAuthenticated`, `isReady`): `login`, `logout`, `loadMe` on app start.
- `adminAuthGuard` on all routes except `/login`; `/login` redirects to `/dashboard` when already signed in.
- `authRefreshInterceptor`: on `401 TOKEN_EXPIRED` call `/api/admin/auth/refresh` once (shared in-flight request) and retry; otherwise clear state and go to `/login`. Same structure as the client interceptor.
- `errorToastInterceptor` + toaster component (same pattern as client).
- `AdminApiService` per area: `DashboardApi`, `AdminStoresApi`, `AdminUsersApi`; typed models in `models/`.

### 5.3 Shell and pages (lazy routes)

Layout: left sidebar (Dashboard, Stores, Users), top bar (admin name, Logout); sidebar collapses to a menu button below `md`.

| Route | Content |
| :--- | :--- |
| `/login` | Email + password form; generic error on failure |
| `/dashboard` | Stat cards (users, stores, pending verifications, unreviewed stores, blocked stores, suspended users); tables "Users awaiting verification" and "New stores awaiting review" (10 rows each, "View all" → filtered list) |
| `/stores` | Filters: country, city, store name, status; paged table (name, owner, location, created, status badges Active/Inactive/Blocked/Unreviewed). Filters live in URL query params |
| `/stores/:id` | Store details, owner card (links to `/users/:id`), actions **Mark reviewed**, **Block** (reason dialog) / **Unblock**; link to public store page |
| `/users` | Search box, verification filter, suspended filter; paged table with status chips. Filters in URL |
| `/users/:id` | Profile, stores list, **Verification panel** (Mobile, PAN, Aadhaar: full value, status chip, Verify / Reject-with-reason), **Suspension** card (status; **Suspend** dialog with 1/7/30 days or custom end date + reason; **Lift suspension**) |

All actions disable while in flight, update the page from the response, and toast success/failure. All pages pass AXE / WCAG AA (labelled inputs, focus-trapped dialogs, status conveyed by text not colour only).

## 6. `aaspass-client` changes

- **Models:** `User` gains `verified`, `verification?`, `suspendedUntil?`; `StoreProfile` gains `ownerVerified`, `adminBlocked?`, `adminBlockReason?`.
- **`verified-badge` component** (`components/verified-badge`): green check icon with accessible label "Verified"; used next to the name on the profile header, public user profile, store detail owner section and store card.
- **Profile KYC rows** (Mobile, Aadhaar, PAN): replace the hard-coded chip with status chips — green "✓ Verified", grey "Pending verification" (value present, unverified), red "Rejected — <reason>"; nothing when no value. Existing Update flow unchanged; after update the chip shows Pending.
- **Owner store screens:** when `adminBlocked`, show a red notice "Deactivated by admin: <reason>. Contact support." and disable the activate control.
- **Login page:** `403 ACCOUNT_SUSPENDED` shows the backend message instead of the generic error.

## 7. Error handling summary

| Case | Response |
| :--- | :--- |
| Bad admin credentials / inactive admin | `401 INVALID_CREDENTIALS` |
| User token on `/api/admin/**` or admin token on user API | `401 UNAUTHENTICATED` |
| Missing/blank reason on block, reject, suspend | `400` validation error |
| Suspension `until` in the past or > 1 year | `400` |
| Verify an item with no value | `400` |
| Unknown user/store id | `404` |
| Suspended user logs in / refreshes | `403 ACCOUNT_SUSPENDED` |
| Owner activates admin-blocked store | `403 STORE_BLOCKED_BY_ADMIN` |

## 8. Testing

**Backend** (JUnit 5, Spring Boot slice/integration tests with the existing test setup):
- Admin auth: login success/failure, refresh rotation, logout; user JWT rejected on `/api/admin/dashboard`; admin JWT rejected on `/api/users/me`; CSRF required on admin writes.
- Suspension: sessions revoked; login and refresh return `ACCOUNT_SUSPENDED`; login works again after `suspendedUntil` passes (clock-controlled); lift clears it; stores hidden from public search while suspended.
- Store block: hidden from search; owner activate → `403`; unblock restores prior `isActive` state.
- Verification: verify/reject rules; reason required for reject; blank value → `400`; editing phone/PAN/Aadhaar resets only that item; `verified` flag in `UserResponse` and `ownerVerified` in `StoreResponse`.
- Search filters: country/city/name/status combinations and paging bounds.
- Audit entries written for each action; no raw KYC in `details`.

**Frontend** (Vitest):
- Admin: guard, refresh interceptor, login page, verification panel (verify / reject dialog validation), suspend dialog (duration presets, custom date validation), stores filter ↔ URL sync.
- Client: profile KYC chip states, verified badge rendering, blocked-store notice, suspended login message.

**Verification before completion:** `.\mvnw.cmd test` and `test-compile` (backend), `npm run build` + `npm test -- --watch=false` in both `aaspass-client` and `aaspass-admin`, then a manual end-to-end pass in the browser (admin login → verify a user → green tick visible in the client; block a store → hidden in client search).
