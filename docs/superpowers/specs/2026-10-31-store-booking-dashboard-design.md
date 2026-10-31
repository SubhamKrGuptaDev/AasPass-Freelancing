# Store Booking & Owner Dashboard — Design

**Date:** 2026-10-31
**Status:** Approved in chat, awaiting written-spec review

## Goal

Turn the toast-only "Book Service" button into a real booking workflow, and give store owners a dashboard that shows
how many users click "Book Service", how far they get through the booking flow, who abandons it, and lets the owner
accept or reject incoming bookings while seeing which requests compete for the same time.

Workflow: **User clicks Book Service → Booking page → picks date, duration and time → books the slot → owner
confirms or rejects.**

## Decisions (from the user)

| Topic | Decision |
|---|---|
| Transaction | **Booking only, no payment.** Price is snapshotted on the booking for display. |
| Who decides | Every booking starts **PENDING**; the store owner **confirms or rejects** it. |
| Slot blocking | **Only CONFIRMED bookings block a slot.** PENDING requests may overlap each other. |
| Overlap on confirm | Confirming a booking **auto-rejects** every other PENDING request that overlaps it (reason "Slot no longer available"). |
| Availability source | Owner sets **weekly hours**: open days, **multiple time ranges per day** (breaks allowed). |
| Date overrides | Owner can **add extra open time** or **block a date/time** on specific dates. |
| Availability entry points | Create-store form, edit-store form, and a **separate Store Availability page**. Optional; new stores prefilled Mon–Sat 09:00–18:00. |
| Slot length | Owner sets a per-store **slot length** (15, 30, 45, 60, 90 or 120 min, default 30). It is the **minimum booking**, the **duration step**, and the **start-time grid**. |
| Duration | Multiples of the slot length up to a per-store maximum the owner sets. |
| Slot visibility | Owner sees free / requested / booked slots; **users also see free slots and "N others requested"** (count only). |
| Overlap visibility for owner | **Both** an "Overlaps with N" badge in the inbox **and** a day/week schedule timeline with overlapping requests stacked in lanes. |
| Dashboard content | Booking funnel with conversion %, daily trend chart, per-service breakdown, bookings inbox. |
| Abandoned flow | Funnel shows **abandoned count + %**; dashboard **lists logged-in users** who abandoned (name, service, last step, when). Anonymous visitors only count. |
| Dashboard location | New **`/owner-dashboard`** route family in `aaspass-client` (not inside `profile`). |

## Out of scope

- Online payment, refunds, invoices.
- Email/SMS/push notifications to user or owner (users see status in "My bookings").
- Automatic reminders to users who abandoned.
- Recurring bookings, multi-staff stores, per-service availability (availability is per store).
- Admin-panel views of bookings or funnel data.
- Time zones other than the store's local time (all stores are treated as IST; times stored as `LocalDateTime`/`LocalTime`).

## Glossary

- **Slot length** — `Store.slotMinutes`, set by the owner (15/30/45/60/90/120).
- **Slot** — a `slotMinutes`-long cell on a given date. Slots are laid out from the start of each effective range
  (e.g. range 09:00–13:00 with 45-min slots → 09:00, 09:45, 10:30, 11:15; the 12:00–13:00 remainder is too short
  for a full slot and is unused). A booking covers `durationMinutes / slotMinutes` consecutive slots.
- **Effective availability** of a date — weekly ranges for that weekday ∪ `OPEN` exceptions on that date − `BLOCKED` exceptions on that date.
- **Overlap** — two bookings of the same store whose `[startAt, endAt)` intervals intersect.
- **Attempt** — a `BOOK_CLICK` event plus every later funnel event from the same `visitorId` for the same store within 1 hour.
- **Abandoned attempt** — an attempt with no `BOOKED` event within 1 hour of its `BOOK_CLICK`, and whose `BOOK_CLICK` is older than 1 hour.

## Backend (`aaspass-service-backend`)

Follows existing layout and conventions: entities extend `BaseAuditEntity` (Long `id`, audit timestamps), schema via
`ddl-auto=update`, DTOs are records mapped in `DtoMapper`, controllers return `ResponseEntity<ApiResponse<T>>` and log
with `[API-CALL]`, mutating service methods are `@Transactional`, ownership enforced via
`StoreService.assertStoreOwner(storeId, userId)` (→ `ForbiddenException`), caller from `CurrentUser`.

### Data model

New enums are `@Enumerated(STRING)` with explicit `length`, sized for future values (ddl-auto never widens columns).

**`Store` (existing) — new field**

| Field | Type | Rules |
|---|---|---|
| `slotMinutes` | Integer | one of 15, 30, 45, 60, 90, 120; default 30; null treated as 30 |
| `maxBookingMinutes` | Integer | `slotMinutes`..720, multiple of `slotMinutes`, default 120 (or `slotMinutes` if larger); null treated as the default. When `slotMinutes` changes, the server rounds `maxBookingMinutes` down to the nearest multiple (never below `slotMinutes`) |

Changing `slotMinutes` affects only new bookings: existing PENDING/CONFIRMED bookings keep their `startAt` and
`durationMinutes`. Overlap checks use time intervals, not slot indexes, so bookings made under an older slot length
still block correctly; a slot is `BOOKED` if any CONFIRMED interval intersects it.

**`StoreAvailabilityRange`** — table `store_availability_ranges`

| Field | Type | Rules |
|---|---|---|
| `store` | ManyToOne `Store` | required, indexed |
| `dayOfWeek` | `java.time.DayOfWeek` | required |
| `startTime` | `LocalTime` | required, on 15-min boundary |
| `endTime` | `LocalTime` | required, on 15-min boundary, `> startTime` |

Rules: max 4 ranges per day; ranges on the same day must not overlap or touch-overlap (`a.end <= b.start`). A store
with zero ranges and zero `OPEN` exceptions has **bookings not open**.

**`StoreAvailabilityException`** — table `store_availability_exceptions`

| Field | Type | Rules |
|---|---|---|
| `store` | ManyToOne `Store` | required; index `(store_id, date)` |
| `date` | `LocalDate` | required, today or later on create |
| `type` | enum `AvailabilityExceptionType` { OPEN, BLOCKED } | required |
| `startTime` / `endTime` | `LocalTime` | OPEN: both required. BLOCKED: both null = whole day, else both required. 15-min boundaries, end > start |
| `reason` | String(200) | optional |

**`Booking`** — table `bookings`

| Field | Type | Rules |
|---|---|---|
| `store` | ManyToOne `Store` | required |
| `service` | ManyToOne `StoreServiceItem` | nullable column; required and must belong to `store` at creation; set to null if the service is later deleted |
| `user` | ManyToOne `User` | required (booker) |
| `startAt` / `endAt` | `LocalDateTime` | `startAt` must be a slot start (see glossary); `endAt = startAt + durationMinutes` |
| `durationMinutes` | Integer | `store.slotMinutes`..`store.maxBookingMinutes`, multiple of `slotMinutes` (checked at creation only) |
| `status` | enum `BookingStatus` { PENDING, CONFIRMED, REJECTED, CANCELLED, COMPLETED } | default PENDING |
| `note` | String(500) | optional, from user |
| `ownerNote` | String(500) | optional, from owner (rejection reason / auto-reject reason) |
| `priceAtBooking` | BigDecimal(10,2) | copied from service price |
| `serviceNameAtBooking` | String(150) | copied, survives service rename/delete |
| `decidedAt` | LocalDateTime | set on CONFIRM/REJECT |
| `autoRejected` | Boolean | true when rejected by the overlap rule |

Indexes: `(store_id, status, start_at)`, `(user_id, status)`.

Status transitions (anything else → `BadRequestException`):

| From | To | Who |
|---|---|---|
| PENDING | CONFIRMED | owner |
| PENDING | REJECTED | owner, or system (overlap auto-reject) |
| PENDING / CONFIRMED | CANCELLED | booking user |
| CONFIRMED | COMPLETED | owner, only when `startAt` is in the past |

Deleting a `StoreServiceItem` that has bookings: its bookings' `service` is set to null first (they keep the
snapshot fields) so the service delete is not blocked. Deleting a store cascades its availability
rows; bookings and funnel events are deleted with the store.

**`BookingFunnelEvent`** — table `booking_funnel_events`

| Field | Type | Rules |
|---|---|---|
| `store` | ManyToOne `Store` | required |
| `serviceId` | Long | nullable (plain column, no FK, so deleted services keep history) |
| `step` | enum `FunnelStep` { BOOK_CLICK, BOOKING_PAGE_VIEW, SLOT_SELECTED, BOOKED } | required |
| `visitorId` | String(64) | required; client-generated UUID kept in localStorage |
| `userId` | Long | nullable; from `CurrentUser.optionalUserId()` (never trusted from the body) |
| `occurredAt` | LocalDateTime | server time |

Index: `(store_id, step, occurred_at)`, `(store_id, visitor_id, occurred_at)`.

### Shared domain logic (single sources of truth)

- **`AvailabilityResolver`** — `List<TimeRange> effectiveRanges(Store, LocalDate)`: applies the glossary rule.
  Used by slot calculation, booking validation, and the schedule endpoint.
- **`SlotCalculator`** — `List<SlotView> slotsFor(Store, LocalDate)`: returns every `slotMinutes` slot inside effective
  ranges with status `FREE`, `REQUESTED(pendingCount)`, `BOOKED` (covered by a CONFIRMED booking), or `CLOSED`
  (in the past). Also `List<LocalTime> startTimesFor(Store, LocalDate, durationMinutes)`: start times where all covered
  slots are inside one continuous effective range, none is `BOOKED`, and the start is in the future.
- **`BookingOverlapQuery`** — repository method finding bookings of a store with given statuses whose interval
  intersects `[start, end)` (`b.startAt < :end AND b.endAt > :start`).

### API — availability (owner)

| Method & path | Body / params | Notes |
|---|---|---|
| `GET /api/stores/{id}/availability` | — | Public (booking page needs it). Returns `{slotMinutes, maxBookingMinutes, ranges:[{day,start,end}]}` |
| `PUT /api/stores/{id}/availability` | same shape | Owner. Replaces all ranges, slot length and max duration. Returns saved value plus `confirmedOutsideCount` (CONFIRMED future bookings now outside effective availability) for a warning |
| `GET /api/stores/{id}/availability/exceptions?from&to` | — | Owner. Default from = today, to = today + 60 days |
| `POST /api/stores/{id}/availability/exceptions` | `{date,type,start?,end?,reason?}` | Owner. Returns created row plus `confirmedOutsideCount` |
| `DELETE /api/stores/{id}/availability/exceptions/{exceptionId}` | — | Owner |

`StoreCreateRequest` and `StoreUpdateRequest` gain an optional `availability` field (same shape as the PUT body),
saved in the same transaction as the store. Absent on update = leave availability unchanged.

### API — booking (users)

| Method & path | Notes |
|---|---|
| `GET /api/stores/{id}/slots?date&duration` | Public. Returns `{date, open:boolean, slots:[{time,status,pendingCount}], startTimes:[time]}`. `pendingCount` exposed as a number only, never identities. Date must be within today..today+30 |
| `POST /api/bookings` | Login required. `{storeId, serviceId, startAt, durationMinutes, note?, visitorId}`. Validates: store active and not admin-hidden, not the owner's own store, service belongs to store, date within 30 days, `startAt` in `startTimesFor(...)`, user has no other PENDING booking for this store overlapping the interval. Creates PENDING booking and a `BOOKED` funnel event in one transaction |
| `GET /api/bookings/mine?status&page` | Login required. Paged, newest first |
| `PATCH /api/bookings/{id}/cancel` | Booking user only |

### API — owner inbox & schedule

| Method & path | Notes |
|---|---|
| `GET /api/stores/{id}/bookings?status&from&to&page` | Owner. Each row includes `overlapPendingCount`, `overlapConfirmedCount`, `outsideAvailability` |
| `GET /api/stores/{id}/bookings/{bookingId}/overlaps` | Owner. Competing PENDING/CONFIRMED bookings for the side-by-side view |
| `GET /api/stores/{id}/bookings/{bookingId}/confirm-preview` | Owner. `{canConfirm, conflictingConfirmed:[…], willAutoReject:[…]}` |
| `PATCH /api/bookings/{id}` | Owner. `{action: CONFIRM \| REJECT \| COMPLETE, ownerNote?}` |
| `GET /api/stores/{id}/schedule?from&to` | Owner. Max 7 days. Returns effective ranges per day, exceptions, and PENDING + CONFIRMED bookings each with a `lane` index (greedy interval-partitioning per day so overlapping requests stack side by side) and a `conflictGroup` id |

**Confirm algorithm** (`@Transactional`):
1. `SELECT … FOR UPDATE` the `Store` row (pessimistic write lock) so concurrent confirms serialize.
2. Reload the booking; require status PENDING and caller is owner.
3. If any CONFIRMED booking overlaps → `ConflictException` (new, mapped to **409** in `GlobalExceptionHandler`).
4. Set CONFIRMED, `decidedAt = now`.
5. Every other PENDING booking overlapping it → REJECTED, `autoRejected = true`, `ownerNote = "Slot no longer available"`.
6. Return the confirmed booking and `autoRejectedCount`.

Confirming a booking outside effective availability is allowed (owner's choice); the UI warns.

### API — funnel tracking & analytics

| Method & path | Notes |
|---|---|
| `POST /api/stores/{id}/funnel-events` | Public. `{step, serviceId?, visitorId}`. `BOOKED` is rejected here (server-only). Skips silently (204) when caller is the store owner or when an identical `(store, visitorId, step, serviceId)` event exists within the last 30 minutes. Throttled per IP like `ContactRequestService` → 429 |
| `GET /api/stores/{id}/booking-analytics?period=7D\|30D\|ALL` | Owner. See response below |
| `GET /api/stores/{id}/booking-analytics/abandoned?period&page` | Owner. Paged abandoned attempts by logged-in users: `{userId, userName, avatarUrl, serviceName, lastStep, clickedAt}` |

`BookingAnalyticsResponse`:
- `funnel`: distinct-visitor counts for each `FunnelStep` + `confirmed` (bookings confirmed in period) with step-to-step conversion %.
- `abandoned`: `{count, percentOfClicks}`.
- `trend`: `buckets` (List<LocalDate>, daily; ALL = last 90 days) with aligned `clicks`, `bookings`, `abandoned` lists — same shape style as `AdminChartsResponse`.
- `services`: per service `{serviceId, name, clicks, bookings, confirmed, conversionPercent}`.
- `pendingCount` for the header badge.

Aggregation runs as JPQL group-by queries over `booking_funnel_events` and `bookings`; abandoned attempts are computed
in Java from the store's events in the period (bounded by period + index).

`visitorId` ↔ user linkage: the same `visitorId` is sent before and after login, so an attempt is attributed to a user
if any of its events carries a `userId`.

### Security config

Add to the public matchers in `SecurityConfig`: `GET /api/stores/*/availability`, `GET /api/stores/*/slots`,
`POST /api/stores/*/funnel-events`. Everything else above requires login; owner checks happen in services.

## Client (`aaspass-client`)

### Routes (`app.routes.ts`)

| Path | Component | Guard |
|---|---|---|
| `stores/:storeKey/book/:serviceId` | `BookServiceComponent` (lazy) | none (login prompted at submit) |
| `my-bookings` | `MyBookingsComponent` (lazy) | `authGuard` |
| `owner-dashboard` | `OwnerDashboardComponent` (lazy) | `authGuard` + owner check (redirect to `create-store` if user owns no store) |
| `owner-dashboard/schedule` | `OwnerScheduleComponent` (lazy) | same |
| `owner-dashboard/availability` | `OwnerAvailabilityComponent` (lazy) | same |

Owner pages take `?store={id}` and share an `OwnerStoreSwitcherComponent` (defaults to the first owned store).
Links: profile store section and user menu → "Owner dashboard"; header shows a pending-bookings count badge.

### Shared pieces

- **`FunnelTrackingService`** — owns the `visitorId` (localStorage, wrapped in try/catch, falls back to an in-memory
  UUID) and `track(storeId, step, serviceId?)`; fire-and-forget, errors swallowed and logged.
- **`BookingHttpService`** / **`AvailabilityHttpService`** — HTTP calls following `store-http.service.ts` patterns.
- **`AvailabilityEditorComponent`** (`<app-availability-editor>`) — reactive-form control for
  `{slotMinutes, maxBookingMinutes, ranges}`: slot-length select (15/30/45/60/90/120), per weekday open/closed toggle, ranges with "+ Add time" (max 4) and remove,
  "Copy to all open days", 15-min time selects, max-duration select (multiples of the slot length), inline validation (end > start, no overlap).
  Used by create-store, edit-store and the availability page.
- **`ColumnChartComponent`** — ported from `aaspass-admin/src/app/components/column-chart` (same inputs, same
  `--chart-series-n` CSS variables, dark-mode aware). No chart library added.

### Store detail changes

- "Book Service" → `track(BOOK_CLICK)` then navigate to `stores/:storeKey/book/:serviceId`.
- If the store has no availability, the button reads "Bookings not open yet" and is disabled.
- Owner viewing their own store sees "Manage bookings" instead.

### Booking page (`BookServiceComponent`)

1. On load: `track(BOOKING_PAGE_VIEW)`; show service name, price, store.
2. Date strip: today..+30 days; days with no effective availability disabled (from slots `open:false`).
3. Duration select: multiples of `slotMinutes` up to `maxBookingMinutes` (labelled "45 min", "1 h 30 min" …).
4. Time grid from `/slots`: `startTimes` selectable; booked/closed slots shown greyed; free slots with
   `pendingCount > 0` show "N others requested". Picking a time → `track(SLOT_SELECTED)`.
5. Optional note; Submit. Anonymous → `authService.openLoginModal(currentUrl)`; selection kept in component state
   (and query params) so the user returns to a filled form.
6. Success screen: "Request sent — waiting for the owner to confirm", link to My bookings.
7. 409/400 from the server (slot taken meanwhile) → message and slot list refresh.

### Create / edit store

`create-store` embeds `<app-availability-editor>` in a new "Availability" section; create prefills Mon–Sat
09:00–18:00; edit loads current availability. Sent as `availability` in the existing save request.

### Owner dashboard (`OwnerDashboardComponent`)

- Header: store switcher, period tabs (7D / 30D / All), links to Schedule, Availability, Edit store.
- KPI tiles: Book clicks, Booking page views, Slot selected, Booking requests, Confirmed, Abandoned — each with % of previous step.
- Funnel bars (horizontal, drop-off %).
- Trend: `ColumnChartComponent` with clicks / bookings / abandoned series.
- Per-service table.
- **Bookings inbox**: tabs Pending / Confirmed / Completed / Rejected & Cancelled. Rows: user, service, date/time,
  duration, price, note, `outsideAvailability` warning, "Overlaps with N" badge → expands competing requests side by
  side. Actions: Confirm (opens confirm-preview: "This will auto-reject N overlapping requests"), Reject (optional
  note), Mark complete. List refreshes after each action.
- **Abandoned list**: paged logged-in users (avatar, name, service, last step, time ago).
- Empty states: no availability (link to Availability page), no activity yet.

### Owner schedule (`OwnerScheduleComponent`)

Day and week views. Effective availability as background bands, CONFIRMED as solid blocks, PENDING as outlined blocks
placed in their `lane` so overlaps sit side by side; blocked exceptions hatched. Click a block → same
confirm/reject panel as the inbox. Prev/next/today navigation.

### Owner availability (`OwnerAvailabilityComponent`)

Two tabs: **Weekly hours** (`<app-availability-editor>` + Save; shows `confirmedOutsideCount` warning) and
**Date overrides** (list of upcoming exceptions; form to add OPEN range or BLOCKED day/range with reason; delete).

### My bookings (`MyBookingsComponent`)

User's bookings with status chips, owner note on rejection, Cancel for PENDING/CONFIRMED.

## Error handling

| Case | Response | Client behaviour |
|---|---|---|
| Not the owner | 403 `ForbiddenException` | Redirect to dashboard home with toast |
| Slot no longer bookable / overlapping own pending | 400 `BadRequestException` | Message + refresh slots |
| Confirm conflicts with a CONFIRMED booking | 409 `ConflictException` | Message, refresh inbox |
| Invalid transition | 400 | Toast, refresh |
| Invalid availability (overlap, grid, >4 ranges) | 400 with message | Inline form error |
| Funnel throttle | 429 | Ignored (fire-and-forget) |
| Store hidden/blocked by admin | 404 (existing behaviour) | Store-not-found page |

All Java code follows AGENTS.md null-safety rules (guarded getters, `Optional.orElseThrow`, constant-first equals,
no unguarded unboxing — e.g. `slotMinutes` null → 30, `maxBookingMinutes` null → default). TypeScript uses `?.` / `??` and `@if` guards.

## Testing

Backend integration tests in `src/test/java/com/aaspass/controller/` (style of `OwnershipAndKycTest`,
`AdminChartControllerTest`):
- `AvailabilityResolver`: weekly ranges, OPEN adds, BLOCKED whole-day and partial subtract.
- `SlotCalculator`: grid for each allowed slot length (incl. 45-min remainder handling), past slots CLOSED, BOOKED vs REQUESTED counts, start times respect duration and range edges.
- Availability PUT validation (overlap, 15-min boundaries, max 4, slot length values, max duration rounding) and owner-only access; create/update store with availability.
- Booking create: happy path writes `BOOKED` event; rejects outside availability, own store, >30 days, overlapping own pending.
- Confirm: auto-rejects overlapping pending only; 409 when a confirmed overlap exists; non-owner 403.
- Transitions: cancel, complete-only-after-start, invalid transitions.
- Funnel: owner events skipped, 30-min dedupe, `BOOKED` refused on the public endpoint.
- Analytics: funnel counts, abandoned attempts (with and without login linkage), trend buckets.

Compile gates (AGENTS.md): `.\mvnw.cmd test-compile` in the backend and `npm run build` in `aaspass-client`; then a
browser walkthrough of book → confirm → dashboard numbers.

## Implementation phases

Each phase compiles and ships on its own:

1. **Availability** — entities, resolver, availability + exception APIs, editor component, create/edit store, availability page.
2. **Booking flow** — `Booking`, slot calculator, slots + booking APIs, booking page, My bookings, store-detail button.
3. **Funnel tracking** — event entity/API, `FunnelTrackingService`, tracking calls in store detail and booking page.
4. **Owner inbox & schedule** — inbox, overlaps, confirm-preview + confirm algorithm, schedule page.
5. **Analytics dashboard** — analytics endpoints, ported column chart, KPI/funnel/trend/per-service/abandoned UI.
