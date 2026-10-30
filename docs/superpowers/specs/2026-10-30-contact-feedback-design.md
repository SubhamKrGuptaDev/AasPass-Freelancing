# Contact & Feedback — Design

**Date:** 2026-10-30
**Status:** Approved in chat, awaiting written-spec review

## Goal

Give anyone on the AasPass client a single place to ask a doubt, leave feedback, or raise a complaint, and give
admins a "Support" inbox in the admin panel where they can see each request, contact the customer by phone or
email, and track it to resolution.

## Decisions (from the user)

| Topic | Decision |
|---|---|
| Form shape | One form with a **type** dropdown: Query/Doubt, Feedback, Complaint. One admin inbox with a type filter. |
| Who can submit | **Anyone.** Guests type name/email/phone; logged-in users get them prefilled and the request is linked to their account. |
| Admin actions | **Status + private note.** NEW → IN_PROGRESS → RESOLVED. Admin contacts the customer outside the app using the shown email/phone. |
| Entry points | Navbar "Contact" link, footer link, and a "Have a doubt? Contact us" section on the home page. |

## Out of scope

- Replying by email from the admin panel (no SMTP is configured).
- File attachments.
- Notifying the customer when the status changes.
- A "my requests" history page for users.

## Backend (`aaspass-service-backend`)

### Data model

New package-level additions follow the existing layout (`entity`, `repository`, `service`, `controller`, `dto`).

`entity/ContactRequest` extends `BaseAuditEntity` (gets `id`, `creationDateTime`, `lastUpdatedDateTime`).
Table `contact_requests`, created by the existing `spring.jpa.hibernate.ddl-auto=update`.

| Field | Type | Rules |
|---|---|---|
| `type` | enum `ContactRequestType` { QUERY, FEEDBACK, COMPLAINT } | required, `@Enumerated(STRING)` |
| `status` | enum `ContactRequestStatus` { NEW, IN_PROGRESS, RESOLVED } | required, defaults to NEW |
| `name` | String(100) | required, trimmed |
| `email` | String(100) | required, valid email, stored lowercase |
| `phone` | String(25) | optional |
| `subject` | String(150) | required |
| `message` | String(2000) | required, `@Column(length = 2000)` |
| `user` | `@ManyToOne(fetch = LAZY)` `User`, nullable | set when the submitter is logged in |
| `submitterIp` | String(64) | from `HttpServletRequest.getRemoteAddr()` (same source as `AuthController`) |
| `adminNote` | String(2000) | nullable, internal only, never returned by the public API |
| `handledByAdminId` | Long | nullable, last admin who changed it |
| `resolvedAt` | LocalDateTime | set when status becomes RESOLVED, cleared if reopened |

Indexes: `(status, creation_date_time)` for the inbox list; `(email, creation_date_time)` and
`(submitter_ip, creation_date_time)` for the throttle.

`repository/ContactRequestRepository` extends `JpaRepository` and `JpaSpecificationExecutor`, plus
`countByEmailAndCreationDateTimeAfter`, `countBySubmitterIpAndCreationDateTimeAfter`, `countByStatus`.

### Public API

`POST /api/contact` — added to the `permitAll` list in `SecurityConfig`.

Request `dto/request/ContactRequestCreate`:
`type`, `name`, `email`, `phone?`, `subject`, `message`, `website` (honeypot; must be empty).
Bean Validation (`@NotNull`, `@NotBlank`, `@Email`, `@Size`) matches the column limits above.

`service/ContactRequestService.create(request, ip)`:

1. If `website` is non-blank, log a warning and return success without saving (bots get no signal).
2. Throttle: if **5 or more** requests already exist in the last hour from the same email **or** the same IP, throw
   a new `RateLimitedException` → HTTP 429 with `ErrorCode.CONTACT_RATE_LIMITED` ("Too many requests, please try again later.").
3. If `CurrentUser.optionalUserId()` is present, load it with `findById(...).orElse(null)`
   and link it (a deleted account just leaves the request unlinked). Submitted name/email/phone are still stored as typed (the user may want a different contact number).
4. Save with status NEW and return `ContactRequestResponse { id, type, status, creationDateTime }` — no admin fields.

Controller `controller/ContactController` follows the existing `[API-CALL]` logging and `ApiResponse.success(...)` wrapper.

Because `/api/contact` is `permitAll`, a request with a valid session cookie is still authenticated by the resource
server, so `optionalUserId()` works. CSRF behaves exactly like the other public POSTs (`/api/stores/*/views`).

### Admin API

Under `/api/admin/contact-requests`, protected by the existing admin security chain.

| Method | Path | Purpose |
|---|---|---|
| GET | `/` | Paged list. Params: `q` (name/email/phone/subject contains), `status` (`all` default), `type` (`all` default), `page`, `size` (default 20). Sorted newest first. Returns `PageResponse<AdminContactRequestSummary>`. |
| GET | `/{id}` | `AdminContactRequestDetail`: all fields, plus `userId`/`username` when linked. 404 via `ResourceNotFoundException`. |
| PATCH | `/{id}` | Body `ContactRequestUpdate { status?, adminNote? }` — at least one required. Sets `handledByAdminId`, maintains `resolvedAt`. Returns the detail. |

`admin/service/AdminContactRequestService` + `AdminContactRequestSpecs` mirror `AdminUserService` / `AdminUserSpecs`.
Mapping goes in `AdminMapper`.

Audit: add `AdminAuditAction.UPDATE_CONTACT_REQUEST` and `AuditTargetType.CONTACT_REQUEST`; each PATCH writes one
entry through `AdminAuditService` with the old → new status in the detail.

Dashboard: `DashboardResponse` gains `newContactRequests` (`countByStatus(NEW)`), filled by `AdminDashboardService`.

## Client (`aaspass-client`)

- `models/contact.model.ts` — `ContactRequestType`, create payload, response.
- `services/contact/contact.service.ts` — `submit(payload)` via `HttpClient` against the configured API base.
- `pages/contact/contact.ts|html` — lazy route `{ path: 'contact', loadComponent: ... , title: 'Contact Us - AasPass' }`.
  - Reactive form: type (select, default QUERY), name, email, phone, subject, message (textarea with a live
    `n / 2000` counter), hidden honeypot `website` input.
  - Uses the existing `ui/` select, input, textarea, button and card parts.
  - If the auth service has a current user, prefill name/email/phone (guarded with `?.` / `??`); fields stay editable.
  - On success: toast + replace the form with a "Thanks — we'll get back to you within 24–48 hours" panel and a
    "Send another" button. On error: the existing error toast; the form keeps its values.
  - Supports a `?type=feedback` query param so entry points can preselect the type.
- Entry points:
  - Navbar: "Contact" link next to the existing links.
  - Footer in `app.html`: "Contact us" and "Give feedback" (`?type=feedback`) links.
  - Home: a short section near the bottom — heading "Have a doubt?", one line of copy, button to `/contact`.

## Admin (`aaspass-admin`)

- `models/admin.models.ts` — summary, detail, update types.
- Service methods next to the existing admin API services.
- Shell sidebar: new **Support** item (after Users) with a badge showing the NEW count from the dashboard response.
- `pages/support/support.ts|html` — list page: search box, status and type filters (existing `search-select`),
  table of date, type, name, subject, status (existing `status-chip`), and the existing `pager`. Row click opens detail.
- `pages/support/support-detail.ts|html` — full message; `mailto:` and `tel:` links; link to `/users/:id` when the
  request came from an account; status select and private note textarea with a Save button (PATCH); shows who
  last handled it and when it was resolved.
- Dashboard: a "New support requests" card linking to `/support?status=NEW`.
- Routes: `support` and `support/:id` under the shell, lazy-loaded like the others. Works in dark mode via the
  existing theme tokens.

## Error handling

- Validation errors come back through the existing `GlobalExceptionHandler` and show as field errors/toasts.
- Throttle → 429 with `CONTACT_RATE_LIMITED`; the client shows its message.
- Admin PATCH with neither field → 400; unknown id → 404.

## Testing

- Backend: `ContactRequestService` tests for valid save, guest vs logged-in linking, honeypot drop, throttle by email
  and by IP; `AdminContactRequestService` tests for filtering, status change setting/clearing `resolvedAt`, audit entry.
- Client: `contact` page spec — prefill when logged in, validation blocks submit, success panel.
- Admin: `support` list and `support-detail` specs — filters call the API, save sends PATCH.
- Builds: `.\mvnw.cmd test-compile` in the backend; `npm run build` in `aaspass-client` and `aaspass-admin`.
