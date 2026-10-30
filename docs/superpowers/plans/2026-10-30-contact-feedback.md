# Contact & Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A public Contact & Feedback form on the client and a Support inbox in the admin panel where admins track each request to resolution.

**Architecture:** One `ContactRequest` JPA entity. A public `POST /api/contact` endpoint (honeypot plus a per-email/per-IP throttle). Admin list/detail/PATCH endpoints under `/api/admin/contact-requests`, with audit entries. A lazy `/contact` page in `aaspass-client` and lazy `support` and `support/:id` pages in `aaspass-admin`.

**Tech Stack:** Spring Boot 3 / Java 17 / JPA / Lombok; Angular 22 standalone components with signals, Tailwind, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-30-contact-feedback-design.md`

## Global Constraints

- Column limits: name 100, email 100 (stored lowercase, trimmed), phone 25, subject 150, message 2000, adminNote 2000, submitterIp 64.
- Types `QUERY | FEEDBACK | COMPLAINT`; statuses `NEW | IN_PROGRESS | RESOLVED`; new requests start `NEW`.
- Throttle: reject when **5 or more** requests already exist in the last hour for the same email **or** the same IP. Respond with **HTTP 429**, `code: "CONTACT_RATE_LIMITED"` and message `Too many requests, please try again later.`
- Honeypot field `website`: if it is non-blank, return the normal success response without saving.
- The public response never includes `adminNote`, `handledByAdminId`, `submitterIp` or the linked user.
- Success copy on the client: `Thanks — we'll get back to you within 24–48 hours.`
- Follow AGENTS.md null-safety rules: `"X".equals(v)`, no bare `Optional.get()`, use `?.` / `??` in TS.
- Controllers log with `[API-CALL] METHOD /path` and wrap responses in `ApiResponse.success(data, message)`.
- Backend tests are MockMvc integration tests (`@SpringBootTest @ActiveProfiles("test") @AutoConfigureMockMvc @Transactional`). Use `.with(csrf())` on mutating calls, `AuthTestSupport.login(mockMvc, "aman", "password123")` for a user and `AdminTestSupport.login(mockMvc)` for an admin.
- Do **not** run a second `ng serve`. Verify with `npm run build` / `npm test` only.

## Review Focus

1. **A logged-in user whose access cookie has expired** submits the form. Spring's resource server rejects an invalid bearer token with 401 even on `permitAll`, so the client's existing refresh interceptor must retry. Task 3 tests that the service call goes through `HttpClient`, so the interceptor applies. Note it in the PR.
2. **A guest submits with leading/trailing spaces or a mixed-case email.** It must be stored trimmed and lowercased, and still count toward the throttle for the same address. Task 1 adds `throttlesByEmailCaseInsensitively`.
3. **An admin reopens a resolved request** (RESOLVED → IN_PROGRESS). `resolvedAt` must clear. Task 2 adds `reopeningClearsResolvedAt`.
4. **A PATCH with a blank note only** (`{"adminNote":"  "}`) should clear the note, not fail as "no fields". A body with both fields null fails with 400. Task 2 adds `blankNoteClearsNote`.
5. **A long message with line breaks** must render with its line breaks in the admin detail view, not collapsed. Task 6 renders it with `whitespace-pre-wrap` and asserts the class.

---

### Task 1: Backend — entity and public submit endpoint

**Files:**
- Create: `aaspass-service-backend/src/main/java/com/aaspass/entity/ContactRequest.java`, `ContactRequestType.java`, `ContactRequestStatus.java` (same package)
- Create: `.../repository/ContactRequestRepository.java`
- Create: `.../dto/request/ContactRequestCreate.java`, `.../dto/response/ContactRequestResponse.java`
- Create: `.../service/ContactRequestService.java`, `.../controller/ContactController.java`
- Create: `.../exception/RateLimitedException.java`
- Modify: `.../exception/ErrorCode.java` (add `CONTACT_RATE_LIMITED`), `.../exception/GlobalExceptionHandler.java` (map `RateLimitedException` → 429 using `ApiResponse.error(message, code)`), `.../config/security/SecurityConfig.java:203-212` (add `.requestMatchers(HttpMethod.POST, "/api/contact").permitAll()`)
- Test: `aaspass-service-backend/src/test/java/com/aaspass/controller/ContactControllerTest.java`

**Interfaces:**
- Produces:
  - `ContactRequest extends BaseAuditEntity`, table `contact_requests`, Lombok `@Getter @Setter`. Fields per spec: `type`, `status`, `name`, `email`, `phone`, `subject`, `message`, `user` (`@ManyToOne(fetch = LAZY) @JoinColumn(name = "user_id")`, nullable), `submitterIp`, `adminNote`, `handledByAdminId`, `resolvedAt`. `@Table(indexes = …)` on `(status, creation_date_time)`, `(email, creation_date_time)`, `(submitter_ip, creation_date_time)`.
  - `ContactRequestRepository extends JpaRepository<ContactRequest, Long>, JpaSpecificationExecutor<ContactRequest>` with `long countByEmailAndCreationDateTimeAfter(String email, LocalDateTime after)`, `long countBySubmitterIpAndCreationDateTimeAfter(String ip, LocalDateTime after)`, `long countByStatus(ContactRequestStatus status)`.
  - `record ContactRequestCreate(@NotNull ContactRequestType type, @NotBlank @Size(max=100) String name, @NotBlank @Email @Size(max=100) String email, @Size(max=25) String phone, @NotBlank @Size(max=150) String subject, @NotBlank @Size(max=2000) String message, String website)`
  - `record ContactRequestResponse(Long id, ContactRequestType type, ContactRequestStatus status, LocalDateTime creationDateTime)`. For a honeypot hit, return `(null, type, NEW, now)`.
  - `ContactRequestService.create(ContactRequestCreate req, String ip): ContactRequestResponse` (`@Transactional`). It uses `CurrentUser.optionalUserId()` and `UserRepository.findById(...).orElse(null)`.
  - `RateLimitedException(String message)` exposes `ErrorCode getCode()` returning `CONTACT_RATE_LIMITED`.
  - `POST /api/contact` → 201 `ApiResponse<ContactRequestResponse>`, message `Request submitted`.

- [ ] **Step 1: Write the failing tests** in `ContactControllerTest`:
  - `guestSubmitIsSavedAsNew`: POST a valid QUERY body with name `"  Asha  "` and email `"Asha@Example.com"`. Expect 201, `$.data.status == "NEW"` and `$.data.id` present. Then load the entity: name `"Asha"`, email `"asha@example.com"`, `user == null`, `submitterIp == "127.0.0.1"`.
  - `loggedInSubmitIsLinkedToUser`: same POST with the aman cookies; the entity's `user.getUsername()` is `"aman"`.
  - `responseHidesAdminFields`: `$.data.adminNote`, `$.data.submitterIp` and `$.data.user` do not exist.
  - `honeypotIsDroppedSilently`: body with `"website":"http://spam"`. Expect 201, and `repository.count()` is unchanged.
  - `invalidBodyIs400`: blank subject → 400; message of 2001 chars → 400; missing type → 400.
  - `throttlesByIp`: 5 POSTs with different emails from `remoteAddr 10.0.0.9` (`.with(r -> { r.setRemoteAddr("10.0.0.9"); return r; })`) are 201; the 6th is 429 with `$.code == "CONTACT_RATE_LIMITED"`.
  - `throttlesByEmailCaseInsensitively`: 5 POSTs with `a@x.com` from different IPs, then the 6th with `A@X.com ` → 429.

- [ ] **Step 2: Run them and confirm they fail**
  Run: `cd aaspass-service-backend; .\mvnw.cmd test -Dtest=ContactControllerTest`
  Expected: FAIL (404 / compile errors for the missing classes).

- [ ] **Step 3: Implement** the files above. In the controller, take the IP from `HttpServletRequest.getRemoteAddr()`, as `AuthController` does. Normalize name, email, phone and subject with `trim()` (email also `toLowerCase(Locale.ROOT)`) **before** the throttle count. Blank phone → `null`. The throttle window is `LocalDateTime.now().minusHours(1)`. Log a honeypot hit with `log.warn("[CONTACT] honeypot hit from ip={}", ip)`.

- [ ] **Step 4: Run the tests and confirm they pass**
  Run: `.\mvnw.cmd test -Dtest=ContactControllerTest`
  Expected: `Tests run: 7, Failures: 0, Errors: 0`

- [ ] **Step 5: Commit**
  `git commit -m "feat(contact-api): public contact and feedback submission with throttle"`

---

### Task 2: Backend — admin inbox, audit and dashboard count

**Files:**
- Create: `.../admin/dto/AdminContactRequestSummary.java`, `AdminContactRequestDetail.java`, `ContactRequestUpdate.java`
- Create: `.../admin/service/AdminContactRequestService.java`, `AdminContactRequestSpecs.java`
- Create: `.../admin/controller/AdminContactRequestController.java`
- Modify: `.../admin/entity/AdminAuditAction.java` (+ `UPDATE_CONTACT_REQUEST`), `.../admin/entity/AuditTargetType.java` (+ `CONTACT_REQUEST`), `.../admin/service/AdminMapper.java` (two mapping methods), `.../admin/dto/DashboardResponse.java` (append `long newContactRequests` **after** `suspendedUsers`), `.../admin/service/AdminDashboardService.java` (inject the repository; `countByStatus(NEW)`)
- Test: `.../src/test/java/com/aaspass/admin/AdminContactRequestControllerTest.java`; extend `AdminDashboardControllerTest`

**Interfaces:**
- Consumes: `ContactRequest`, `ContactRequestRepository`, the enums from Task 1; `AdminAuditService.record(Long adminId, AdminAuditAction, AuditTargetType, Long targetId, String details)`; `CurrentAdmin.requireAdminId()`; `PageResponse.of(Page)`.
- Produces (JSON shapes consumed by Tasks 5–6):
  - `record AdminContactRequestSummary(Long id, ContactRequestType type, ContactRequestStatus status, String name, String email, String subject, LocalDateTime creationDateTime)`
  - `record AdminContactRequestDetail(Long id, ContactRequestType type, ContactRequestStatus status, String name, String email, String phone, String subject, String message, String adminNote, Long userId, String username, Long handledByAdminId, LocalDateTime resolvedAt, LocalDateTime creationDateTime, LocalDateTime lastUpdatedDateTime)`
  - `record ContactRequestUpdate(ContactRequestStatus status, @Size(max=2000) String adminNote)`
  - `AdminContactRequestSpecs.filter(String q, String status, String type): Specification<ContactRequest>`. `q` does a case-insensitive contains on name/email/phone/subject; `"all"` or blank status/type means no filter; unknown values → `BadRequestException`.
  - `GET /api/admin/contact-requests?q&status=all&type=all&page=0&size=20` → `PageResponse<AdminContactRequestSummary>`, sorted `creationDateTime` desc, size capped at 100.
  - `GET /api/admin/contact-requests/{id}` → detail; unknown id → `ResourceNotFoundException` (404).
  - `PATCH /api/admin/contact-requests/{id}` → detail.
  - `DashboardResponse.newContactRequests: long`

- [ ] **Step 1: Write the failing tests** in `AdminContactRequestControllerTest`. Seed rows directly via the repository in `@BeforeEach`: Q1 QUERY/NEW "Ravi", F1 FEEDBACK/NEW "Meena", C1 COMPLAINT/RESOLVED "Ravi".
  - `listsNewestFirstWithFilters`: no params → 3 rows, newest first; `status=NEW` → 2; `type=COMPLAINT` → 1; `q=ravi` → 2; `status=bogus` → 400.
  - `requiresAdmin`: GET without the admin cookie → 401; with the aman user cookie → 401 or 403 (whatever the admin chain returns today for user tokens; assert `is4xxClientError()`).
  - `detailIncludesNoteAndUser`: a row linked to aman → `$.data.username == "aman"`.
  - `patchStatusSetsResolvedAtAndAudits`: PATCH Q1 `{"status":"RESOLVED","adminNote":"Called on phone"}` → status RESOLVED, `resolvedAt` not null, `handledByAdminId` not null; `AdminAuditRepository` holds one `UPDATE_CONTACT_REQUEST` entry with targetId Q1 and details containing `NEW -> RESOLVED`.
  - `reopeningClearsResolvedAt`: PATCH C1 `{"status":"IN_PROGRESS"}` → `resolvedAt` null.
  - `blankNoteClearsNote`: PATCH `{"adminNote":"  "}` → 200, `adminNote` null, status unchanged.
  - `emptyPatchIs400`: PATCH `{}` → 400.
  - `unknownIdIs404`.
  - In `AdminDashboardControllerTest.dashboardCountsReflectModeration`, add `jsonPath("$.data.newContactRequests", is(0))`, then save one NEW row and assert `is(1)` in the second call.

- [ ] **Step 2: Run them and confirm they fail**
  Run: `.\mvnw.cmd test -Dtest="AdminContactRequestControllerTest,AdminDashboardControllerTest"`
  Expected: FAIL.

- [ ] **Step 3: Implement.** Mirror `AdminUserController` / `AdminUserService` / `AdminUserSpecs` structure. PATCH rules: both fields null → `BadRequestException("Nothing to update")`. A blank note becomes `null`. On a status change, set `resolvedAt = now` when entering RESOLVED and `null` when leaving it. Always set `handledByAdminId`. Audit details: `"status " + old + " -> " + new` and/or `"note updated"`.

- [ ] **Step 4: Run all backend tests**
  Run: `.\mvnw.cmd test`
  Expected: `BUILD SUCCESS`. Other tests that construct `DashboardResponse` positionally must be updated if any fail to compile.

- [ ] **Step 5: Commit**
  `git commit -m "feat(admin-api): contact request inbox, status updates and dashboard count"`

---

### Task 3: Client — contact service and `/contact` page

**Files:**
- Create: `aaspass-client/src/app/models/contact.model.ts`
- Create: `aaspass-client/src/app/services/contact/contact.service.ts` (+ `.spec.ts`)
- Create: `aaspass-client/src/app/pages/contact/contact.ts`, `contact.html` (+ `contact.spec.ts`)
- Modify: `aaspass-client/src/app/app.routes.ts` (add before `'**'`: `{ path: 'contact', loadComponent: () => import('./pages/contact/contact').then(m => m.ContactComponent), title: 'Contact Us - AasPass' }`)

**Interfaces:**
- Consumes: `POST /api/contact` from Task 1; `AuthService.currentUser` (`Signal<UserProfile | null>`, with fields `name`, `email`, `phone`); `ToastService.success(message, title?)`; `API_BASE_URL`; the `ApiResponse` type from `models/response.model.ts`.
- Produces:
  - `type ContactRequestType = 'QUERY' | 'FEEDBACK' | 'COMPLAINT'`; `interface ContactRequestPayload { type; name; email; phone?; subject; message; website: string }`; `interface ContactRequestResult { id: number | null; type; status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED'; creationDateTime: string }`; `const CONTACT_TYPE_OPTIONS: { value: ContactRequestType; label: string }[]` = Query / Doubt, Feedback, Complaint.
  - `ContactService.submit(payload: ContactRequestPayload): Observable<ContactRequestResult>`, built on `HttpClient.post` to `${API_BASE_URL}/contact` and unwrapping `.data`.
  - `ContactComponent` (selector `app-contact`), route `/contact`, reads the query param `type` (`feedback` | `complaint` | `query`, case-insensitive; anything else → QUERY).

- [ ] **Step 1: Write the failing tests**
  - `contact.service.spec.ts` › `posts to /api/contact and unwraps data`: use `HttpTestingController`, expect a POST to `/api/contact` with the payload, flush `{ success: true, data: {...} }`, and assert the emitted value equals `data`.
  - `contact.spec.ts`:
    - `prefills name, email and phone for a logged-in user`: stub `AuthService` with `currentUser: signal({ name: 'Asha', email: 'asha@x.com', phone: '999', ... })`; the inputs hold those values.
    - `leaves fields empty for a guest`.
    - `preselects type from ?type=feedback`.
    - `does not submit an invalid form`: click submit with an empty form; `submit` is not called and the name field shows an error.
    - `shows the success panel after submit`: fill valid fields; `submit` returns `of(result)`; the text `Thanks — we'll get back to you within 24–48 hours.` appears; clicking `Send another` shows the form again with type reset.
    - `keeps values after an error`: `submit` returns `throwError(() => new Error())`; the form is still shown with its values.
    - `sends website from the hidden honeypot input`: the payload's `website` is `''`.

- [ ] **Step 2: Run them and confirm they fail**
  Run: `cd aaspass-client; npx ng test --watch=false --include=src/app/pages/contact --include=src/app/services/contact`
  Expected: FAIL (modules not found).

- [ ] **Step 3: Implement.** Use a reactive `FormGroup` with validators matching the Global Constraints limits, and the existing `ui/` input, select, textarea, button and card primitives (look at `create-store` for usage). Show a live `n / 2000` counter under the message. Hide the honeypot with `class="hidden" tabindex="-1" autocomplete="off" aria-hidden="true"`. A `submitted = signal(false)` toggles the success panel; a `sending` signal disables the button. Errors rely on the existing error-toast interceptor, so add no extra toast.

- [ ] **Step 4: Run the tests and the build**
  Run: `npx ng test --watch=false --include=src/app/pages/contact --include=src/app/services/contact` then `npm run build`
  Expected: all pass; the build completes with no errors.

- [ ] **Step 5: Commit**
  `git commit -m "feat(client): contact and feedback page"`

---

### Task 4: Client — entry points (navbar, footer, home)

**Files:**
- Modify: `aaspass-client/src/app/components/navbar/navbar.html` (a "Contact" link after the `/stores` link, same classes and `routerLinkActive`, in both the desktop and mobile menus if both exist)
- Modify: `aaspass-client/src/app/app.html:19-23` (footer: add `Contact us` → `/contact` and `Give feedback` → `/contact?type=feedback` links; `app.ts` imports `RouterLink` if it doesn't already)
- Modify: `aaspass-client/src/app/pages/home/home.html` and `home.content.ts` (a section before the footer: heading `Have a doubt?`, line `Questions about a store, your account, or how AasPass works? Send us a message and our team will contact you.`, button `Contact us` → `/contact`)
- Test: extend `navbar` spec if it exists, otherwise `home.spec.ts`

**Interfaces:**
- Consumes: the `/contact` route from Task 3.

- [ ] **Step 1: Write the failing tests:** `home.spec.ts` › `links to the contact page`, which finds an anchor with text `Contact us` whose `href` ends in `/contact`. The navbar spec (or `app` spec) gets `shows a Contact link`.
- [ ] **Step 2: Run them and confirm they fail:** `npx ng test --watch=false --include=src/app/pages/home --include=src/app/components/navbar`
- [ ] **Step 3: Implement** the three entry points. Put the home copy in `home.content.ts`, following how that file holds the other home text.
- [ ] **Step 4: Run the tests and `npm run build`.** Expected: pass, and the whole client test suite (`npm test -- --watch=false`) stays green.
- [ ] **Step 5: Commit:** `git commit -m "feat(client): contact entry points in navbar, footer and home"`

---

### Task 5: Admin — API methods, status chip and Support list page

**Files:**
- Modify: `aaspass-admin/src/app/models/admin.models.ts` (types below; add `newContactRequests: number` to `DashboardResponse`)
- Modify: `aaspass-admin/src/app/services/admin-api.service.ts` (three methods)
- Modify: `aaspass-admin/src/app/components/status-chip/status-chip.ts` (add `'new' | 'in progress' | 'resolved'` to `ChipStatus` and `TONES`: new = amber, in progress = indigo `bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-200`, resolved = emerald)
- Modify: `aaspass-admin/src/app/components/shell/shell.ts:25-28` and `shell.html` (nav item `{ label: 'Support', path: '/support' }` after Users; a count badge from `dashboard().newContactRequests` when > 0, refreshed on each navigation end)
- Modify: `aaspass-admin/src/app/app.routes.ts` (`support` and `support/:id` lazy children)
- Create: `aaspass-admin/src/app/pages/support/support.ts`, `support.html`, `support.spec.ts`
- Create: `aaspass-admin/src/app/pages/support/contact-status.ts`: `toChipStatus(s: ContactRequestStatus): ChipStatus` and `CONTACT_TYPE_LABELS: Record<ContactRequestType, string>`

**Interfaces:**
- Consumes: the JSON shapes from Task 2.
- Produces:
  - `type ContactRequestType = 'QUERY' | 'FEEDBACK' | 'COMPLAINT'`; `type ContactRequestStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED'`; `interface AdminContactRequestSummary`, `interface AdminContactRequestDetail`, `interface ContactRequestUpdate`, mirroring Task 2's records (dates as `string`, nullable fields `| null`); `interface ContactRequestSearchParams { q?: string; status?: string; type?: string; page?: number; size?: number }`.
  - `AdminApiService.searchContactRequests(params?: ContactRequestSearchParams): Observable<PageResponse<AdminContactRequestSummary>>`, `getContactRequest(id: number): Observable<AdminContactRequestDetail>`, `updateContactRequest(id: number, body: ContactRequestUpdate): Observable<AdminContactRequestDetail>`, using the existing `unwrap` / `toParams`.
  - `SupportPage` (route `support`). Filters live in the URL query params `q`, `status`, `type` and `page`, the same way `StoresPage` does it.

- [ ] **Step 1: Write the failing tests** in `support.spec.ts`, modelled on `pages/stores/stores.spec.ts` (`RouterTestingHarness`, `pickSearchSelect`):
  - `loads with filters from the URL`: navigate to `/support?status=NEW&type=FEEDBACK` → `searchContactRequests` is called with `{ status: 'NEW', type: 'FEEDBACK', page: 0 }` (plus the `q` default the page uses).
  - `renders a row with type label and status chip`: the row shows `Feedback`, the name, the subject and the chip text `New`.
  - `changing the status filter updates the URL and reloads`: `pickSearchSelect` picks `Resolved` → the router URL contains `status=RESOLVED`.
  - `row click navigates to detail`: the URL becomes `/support/5`.
  - `shows an empty state`: no rows → `No requests match these filters.`
- [ ] **Step 2: Run them and confirm they fail:** `cd aaspass-admin; npx ng test --watch=false --include=src/app/pages/support`
- [ ] **Step 3: Implement** the files listed. The page shows a table with Date, Type, Name, Email, Subject and Status columns, plus `app-pager` and two `app-search-select` filters (All / New / In progress / Resolved, and All / Query / Feedback / Complaint) and a search input. Shell spec: add `shows Support nav item with a badge` (stub `dashboard` returning `newContactRequests: 3`; the badge text is `3`).
- [ ] **Step 4: Run the admin tests and the build:** `npm test -- --watch=false` then `npm run build`. Expected: green, and the build has no errors.
- [ ] **Step 5: Commit:** `git commit -m "feat(admin): support inbox list with filters and nav badge"`

---

### Task 6: Admin — request detail and dashboard card

**Files:**
- Create: `aaspass-admin/src/app/pages/support/support-detail.ts`, `support-detail.html`, `support-detail.spec.ts`
- Modify: `aaspass-admin/src/app/pages/dashboard/dashboard.ts|html` (a "New support requests" stat card linking to `/support?status=NEW`), `dashboard.spec.ts`

**Interfaces:**
- Consumes: `getContactRequest`, `updateContactRequest`, `toChipStatus`, `CONTACT_TYPE_LABELS` from Task 5; `ToastService` (admin) success.
- Produces: `SupportDetailPage` (route `support/:id`).

- [ ] **Step 1: Write the failing tests** in `support-detail.spec.ts`:
  - `shows message with preserved line breaks`: the message element has class `whitespace-pre-wrap` and contains `line one\nline two`.
  - `renders mailto and tel links`: `a[href="mailto:asha@x.com"]` exists, and `a[href="tel:999"]` exists. When phone is null there is no `tel:` link.
  - `links to the user when linked`: `userId: 7` → an anchor to `/users/7` showing `@asha`; when `userId` is null there is no anchor.
  - `save sends only changed fields`: change the status to RESOLVED and click Save → `updateContactRequest(5, { status: 'RESOLVED' })`. Change only the note → `{ adminNote: 'Called' }`. After the response, the view shows the returned detail and a success toast fires.
  - `save is disabled when nothing changed`.
  - `unknown id shows not found`: `getContactRequest` errors with status 404 → text `Request not found.`
  - `dashboard.spec.ts` › `shows new support requests card`: `newContactRequests: 4` → the card shows `4`, and its link has `queryParams` `status=NEW`.
- [ ] **Step 2: Run them and confirm they fail:** `npx ng test --watch=false --include=src/app/pages/support --include=src/app/pages/dashboard`
- [ ] **Step 3: Implement.** Detail layout: header (subject, type label, status chip, received date), a contact card (name, email `mailto:`, phone `tel:`, user link), the message block (`whitespace-pre-wrap break-words`), and a handling card (status `<select>`, note `<textarea maxlength="2000">`, Save button, "Last handled by admin #id", "Resolved at …"). A `dirty` computed compares the form with the loaded detail; Save sends only the changed keys.
- [ ] **Step 4: Run the admin tests and the build:** `npm test -- --watch=false` then `npm run build`. Expected: green, with no build errors.
- [ ] **Step 5: Commit:** `git commit -m "feat(admin): support request detail and dashboard card"`

---

### Task 7: Whole-branch verification

- [ ] **Step 1:** `cd aaspass-service-backend; .\mvnw.cmd test-compile; .\mvnw.cmd test` → `BUILD SUCCESS`.
- [ ] **Step 2:** `cd aaspass-client; npm run build; npm test -- --watch=false` → no errors, all tests pass.
- [ ] **Step 3:** `cd aaspass-admin; npm run build; npm test -- --watch=false` → no errors, all tests pass.
