# Store Booking & Owner Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the toast-only "Book Service" button with a real owner-confirmed booking workflow, owner-managed availability, funnel tracking, and an owner dashboard (funnel, trend, per-service, inbox, schedule, abandoned list).

**Architecture:** Backend adds a `booking` slice (entities, repositories, pure domain helpers `AvailabilityResolver` / `SlotCalculator` / `ScheduleLanes` / `AbandonedAttempts`, services, controllers) inside the existing Spring Boot layout. The client adds booking models, HTTP services, a funnel tracker, a shared availability editor, a booking page, My bookings, and three lazy owner pages. All time logic runs in store-local time (IST) from the injected `Clock`.

**Tech Stack:** Spring Boot / Java 17 / JPA (ddl-auto=update, H2 in tests) / MockMvc integration tests; Angular 22 signals + reactive forms, spartan-ng `hlm` UI, Tailwind 4, Vitest via `ng test`.

**Spec:** `docs/superpowers/specs/2026-10-31-store-booking-dashboard-design.md`

## Global Constraints

- Entities extend `BaseAuditEntity` (inherits `id`, `creationDateTime`, `lastUpdatedDateTime`); enums `@Enumerated(STRING)` with explicit `length = 20`.
- DTOs are Java records; controllers return `ResponseEntity<ApiResponse<T>>` and log `[API-CALL]`; mutating service methods `@Transactional`.
- Ownership via `StoreService.assertStoreOwner(storeId, userId)`; caller via `CurrentUser.requireUserId()` / `optionalUserId()`. `GET /api/stores/**` is already `permitAll`, so owner-only GETs under `/api/stores` rely on `requireUserId()` (→ 401) + `assertStoreOwner` (→ 403).
- Store-local zone: `ZoneId.of("Asia/Kolkata")`; "now" is always `LocalDateTime.now(clock.withZone(STORE_ZONE))`, never bare `LocalDateTime.now()`.
- `slotMinutes` ∈ {15, 30, 45, 60, 90, 120}, default 30. `maxBookingMinutes` ∈ [`slotMinutes`, 720], multiple of `slotMinutes`, default `max(120 rounded down to a multiple, slotMinutes)`.
- Availability range/exception times on 15-minute boundaries, `end > start`, ≤ 4 ranges per weekday, no overlap within a day. New stores prefilled Mon–Sat 09:00–18:00.
- Booking window: today..today+30 days. Only `CONFIRMED` blocks slots. Confirm auto-rejects overlapping `PENDING` with `ownerNote = "Slot no longer available"`.
- Funnel dedupe window 30 minutes; abandoned window 1 hour; analytics periods `7D | 30D | ALL` (ALL trend = last 90 days).
- AGENTS.md null-safety: guarded getters, `Optional.orElseThrow`, constant-first `equals`, no unguarded unboxing; TS `?.` / `??`, `@if` guards.
- Compile gates after every task that touches that side: `cd aaspass-service-backend; .\mvnw.cmd test-compile` and `cd aaspass-client; npm run build`. Never start a second `ng serve` (shared `.angular/cache`).
- Spec addition (needed for per-IP throttle): `BookingFunnelEvent.submitterIp` String(45), nullable.

## Review Focus

1. **Two owners confirming overlapping requests at the same moment** → exactly one wins; the other gets 409. Pinned in Task 9 (`confirmSecondOverlapGets409`) — the pessimistic lock is what makes it true in production.
2. **Booking whose duration crosses a break or the range end** (e.g. 12:30 + 60 min with range ending 13:00) → start time not offered and POST rejected. Pinned in Task 5 (`startTimesNeverCrossRangeEnd`) and Task 6 (`rejectsStartNotInStartTimes`).
3. **Owner shrinks slot length or hours after bookings exist** → existing bookings untouched, still block, warning count returned. Pinned in Task 2 (`putReturnsConfirmedOutsideCount`) and Task 5 (`bookedUsesIntervalsNotGrid`).
4. **Anonymous user picks a slot, logs in, returns** → form restored from query params; events before and after login attributed to the same user. Pinned in Task 12 (`abandonedAttributedViaLaterLoggedInEvent`) and Task 7 (`restoresSelectionFromQueryParams`).
5. **Service deleted while bookings reference it** → service delete succeeds; bookings keep snapshot name/price. Pinned in Task 9 (`deletingServiceKeepsBookingSnapshot`).

---

## File Structure

Backend root `aaspass-service-backend/src/main/java/com/aaspass/` (tests mirror under `src/test/java/com/aaspass/`):

| Path | Responsibility |
|---|---|
| `entity/booking/StoreAvailabilityRange.java`, `StoreAvailabilityException.java`, `AvailabilityExceptionType.java` | availability data |
| `entity/booking/Booking.java`, `BookingStatus.java` | bookings |
| `entity/booking/BookingFunnelEvent.java`, `FunnelStep.java` | tracking |
| `entity/Store.java` (modify) | `slotMinutes`, `maxBookingMinutes`, cascade lists for ranges/exceptions |
| `repository/booking/*Repository.java` | one repository per new entity |
| `booking/StoreTime.java` | zone constant + `now(Clock)` / `today(Clock)` |
| `booking/TimeRange.java` | `record TimeRange(LocalTime start, LocalTime end)` + `overlaps` |
| `booking/AvailabilityRules.java` | validation + slot/max normalisation (pure) |
| `booking/AvailabilityResolver.java` | effective ranges for a date (pure) |
| `booking/SlotCalculator.java` | slot statuses + start times (pure) |
| `booking/ScheduleLanes.java` | lane + conflict-group assignment (pure) |
| `booking/AbandonedAttempts.java` | attempt grouping from events (pure) |
| `service/booking/StoreAvailabilityService.java` | availability + exceptions CRUD |
| `service/booking/BookingService.java` | slots, create, mine, cancel |
| `service/booking/OwnerBookingService.java` | inbox, overlaps, preview, decide, schedule |
| `service/booking/FunnelService.java` | event recording |
| `service/booking/BookingAnalyticsService.java` | analytics + abandoned list |
| `controller/booking/StoreAvailabilityController.java`, `BookingController.java`, `OwnerBookingController.java`, `FunnelController.java`, `BookingAnalyticsController.java` | HTTP |
| `dto/booking/*.java` | request/response records (named `StoreAvailabilityDto` to avoid clashing with existing `dto/response/AvailabilityResponse`) |
| `exception/ConflictException.java` + `GlobalExceptionHandler` (modify) | 409 |

Client root `aaspass-client/src/app/`:

| Path | Responsibility |
|---|---|
| `models/booking.model.ts` | all booking/availability/analytics types |
| `services/booking/availability-http.service.ts`, `booking-http.service.ts`, `owner-booking-http.service.ts`, `funnel-tracking.service.ts`, `index.ts` | HTTP + tracking |
| `utils/booking-time.ts` | duration options, label formatting, date strip (pure) |
| `components/availability-editor/*` | shared editor (ControlValueAccessor) |
| `components/column-chart/*` | ported from admin |
| `pages/book-service/*`, `pages/my-bookings/*` | user pages |
| `pages/owner/owner-store-switcher.ts`, `owner.guard.ts`, `owner-dashboard/*`, `owner-schedule/*`, `owner-availability/*`, `owner/booking-decision-panel/*` | owner pages |

---

## Phase 1 — Availability

### Task 1: Booking data model and pure availability rules

**Files:**
- Create: `entity/booking/{StoreAvailabilityRange,StoreAvailabilityException,AvailabilityExceptionType,Booking,BookingStatus,BookingFunnelEvent,FunnelStep}.java`
- Create: `repository/booking/{StoreAvailabilityRangeRepository,StoreAvailabilityExceptionRepository,BookingRepository,BookingFunnelEventRepository}.java`
- Create: `booking/{StoreTime,TimeRange,AvailabilityRules,AvailabilityResolver}.java`
- Modify: `entity/Store.java` (add fields + `@OneToMany(mappedBy="store", cascade=ALL, orphanRemoval=true)` lists `availabilityRanges`, `availabilityExceptions`, `bookings`, `funnelEvents` so store delete cascades)
- Test: `booking/AvailabilityRulesTest.java`, `booking/AvailabilityResolverTest.java` (plain JUnit, no Spring)

**Interfaces:**
- Produces:
  - Entities exactly as in the spec tables (plus `BookingFunnelEvent.submitterIp`). `Booking.service` is `@ManyToOne(optional = true)`.
  - `StoreTime.ZONE`, `static LocalDateTime now(Clock)`, `static LocalDate today(Clock)`.
  - `record TimeRange(LocalTime start, LocalTime end)` with `boolean overlaps(TimeRange o)` (`start < o.end && end > o.start`).
  - `AvailabilityRules.SLOT_OPTIONS = List.of(15,30,45,60,90,120)`; `static int slotOrDefault(Integer)`; `static int maxOrDefault(Integer max, int slot)` (null → default; rounds down to a multiple, floors at `slot`); `static void validateRanges(Map<DayOfWeek, List<TimeRange>>)` and `static void validateException(AvailabilityExceptionType, LocalTime, LocalTime)` throwing `BadRequestException` with messages: `"Times must be on 15-minute boundaries"`, `"End time must be after start time"`, `"At most 4 time ranges per day"`, `"Time ranges on the same day must not overlap"`, `"Slot length must be one of 15, 30, 45, 60, 90, 120"`.
  - `AvailabilityResolver.effectiveRanges(LocalDate date, List<StoreAvailabilityRange> weekly, List<StoreAvailabilityException> exceptions) -> List<TimeRange>` — sorted, merged, OPEN added, BLOCKED subtracted (whole day when times null).
  - `BookingRepository.findOverlapping(Long storeId, Collection<BookingStatus> statuses, LocalDateTime start, LocalDateTime end)` — JPQL `b.startAt < :end and b.endAt > :start`.

- [ ] **Step 1: Write failing tests**

```java
// AvailabilityResolverTest
@Test void weeklyRangesForWeekday() {   // Monday 09:00-13:00 + 16:00-20:00
    assertEquals(List.of(r("09:00","13:00"), r("16:00","20:00")),
        AvailabilityResolver.effectiveRanges(MONDAY_DATE, weekly(MONDAY,"09:00","13:00",MONDAY,"16:00","20:00"), List.of()));
}
@Test void openExceptionAddsAndMerges() { /* weekly 09-13, OPEN 12-15 → [09:00-15:00] */ }
@Test void blockedWholeDayEmpties()     { /* BLOCKED null/null → [] */ }
@Test void blockedPartialSplits()       { /* weekly 09-18, BLOCKED 12-13 → [09-12, 13-18] */ }
@Test void otherDatesExceptionsIgnored() { /* exception on another date → weekly unchanged */ }

// AvailabilityRulesTest
@Test void maxRoundsDownToSlotMultiple() { assertEquals(90, AvailabilityRules.maxOrDefault(120, 45)); }
@Test void maxFloorsAtSlot()             { assertEquals(90, AvailabilityRules.maxOrDefault(30, 90)); }
@Test void nullsUseDefaults()            { assertEquals(30, AvailabilityRules.slotOrDefault(null));
                                           assertEquals(120, AvailabilityRules.maxOrDefault(null, 30)); }
@Test void rejectsOverlapSameDay()       { /* 09-12 + 11-14 → BadRequestException "…must not overlap" */ }
@Test void rejectsFifthRange()           { /* 5 ranges Monday → "At most 4 time ranges per day" */ }
@Test void rejectsOffGrid()              { /* 09:10 → "…15-minute boundaries" */ }
@Test void touchingRangesAllowed()       { /* 09-12 + 12-14 → no exception */ }
```

- [ ] **Step 2: Run, expect compile failure**
Run: `cd aaspass-service-backend; .\mvnw.cmd test -Dtest="AvailabilityResolverTest,AvailabilityRulesTest"` → FAIL (classes missing).

- [ ] **Step 3: Create entities, repositories, `StoreTime`, `TimeRange`, `AvailabilityRules`, `AvailabilityResolver`; add `Store` fields**

- [ ] **Step 4: Run tests** → PASS. Also run the full suite `.\mvnw.cmd test` → existing tests still PASS (Store schema change must not break `DataInitializer`).

- [ ] **Step 5: Commit** `feat(booking): data model and availability rules`

### Task 2: Availability API and store create/update integration

**Files:**
- Create: `dto/booking/{StoreAvailabilityDto,AvailabilityRangeDto,AvailabilityExceptionRequest,AvailabilityExceptionResponse,AvailabilitySaveResult}.java`
- Create: `service/booking/StoreAvailabilityService.java`, `controller/booking/StoreAvailabilityController.java`
- Modify: `dto/request/StoreCreateRequest.java`, `dto/request/StoreUpdateRequest.java` (add `StoreAvailabilityDto availability`), `service/StoreService.java` (`createStore` / `updateStore` call `StoreAvailabilityService.replace(store, dto)` when non-null)
- Test: `controller/booking/StoreAvailabilityControllerTest.java` (style of `OwnershipAndKycTest`: `@SpringBootTest @ActiveProfiles("test") @AutoConfigureMockMvc @Transactional`, seeded users `priya` (owns PixelCraft), `aman`, password `password123`)

**Interfaces:**
- Consumes: Task 1 entities/rules.
- Produces:
  - `record AvailabilityRangeDto(DayOfWeek day, LocalTime start, LocalTime end)`
  - `record StoreAvailabilityDto(Integer slotMinutes, Integer maxBookingMinutes, List<AvailabilityRangeDto> ranges)`
  - `record AvailabilitySaveResult(StoreAvailabilityDto availability, long confirmedOutsideCount)`
  - `record AvailabilityExceptionRequest(LocalDate date, AvailabilityExceptionType type, LocalTime start, LocalTime end, @Size(max=200) String reason)`; `AvailabilityExceptionResponse(Long id, LocalDate date, type, start, end, reason, long confirmedOutsideCount)`
  - `StoreAvailabilityService`: `StoreAvailabilityDto get(Long storeId)`, `AvailabilitySaveResult replace(Long storeId, Long callerId, StoreAvailabilityDto)`, `void replace(Store, StoreAvailabilityDto)` (no ownership check; used inside store save), `List<AvailabilityExceptionResponse> listExceptions(Long storeId, Long callerId, LocalDate from, LocalDate to)`, `AvailabilityExceptionResponse addException(...)`, `void deleteException(Long storeId, Long exceptionId, Long callerId)`, `boolean hasAnyAvailability(Store)`, `List<TimeRange> effectiveRanges(Store, LocalDate)` (single entry point other services use).
  - `confirmedOutsideCount`: future `CONFIRMED` bookings of the store whose `[startAt,endAt)` is not fully inside one effective range of its date.
  - `StoreResponse` gains `boolean bookingsOpen` (= `hasAnyAvailability`) via `DtoMapper`.
  - Endpoints per spec "API — availability"; `from` defaults to today, `to` to today+60.

- [ ] **Step 1: Write failing tests**
  - `getIsPublic` — anonymous `GET /api/stores/{priyaStore}/availability` → 200, `$.data.slotMinutes == 30`.
  - `putReplacesRangesAndSlot` — priya PUTs `{slotMinutes:45,maxBookingMinutes:120,ranges:[MONDAY 09:00–13:00]}` → 200, `$.data.availability.maxBookingMinutes == 90` (rounded), GET returns one range.
  - `putByNonOwnerForbidden` — aman → 403 `$.code == "FORBIDDEN"`.
  - `putInvalidOverlap400` — overlapping Monday ranges → 400, message contains `must not overlap`.
  - `putReturnsConfirmedOutsideCount` — insert a CONFIRMED booking next Monday 10:00–11:00 via repository, PUT ranges without Monday → `$.data.confirmedOutsideCount == 1`, booking still CONFIRMED.
  - `exceptionsCrud` — POST BLOCKED whole day, GET lists it, DELETE removes; aman DELETE → 403.
  - `createStoreWithAvailability` — aman POSTs `/api/stores` with `availability` → GET availability returns those ranges; `createStoreWithoutAvailabilityHasNone` → `bookingsOpen == false`.
  - `updateStoreWithoutAvailabilityLeavesIt` — PUT store without the field keeps ranges.
- [ ] **Step 2: Run** `.\mvnw.cmd test -Dtest=StoreAvailabilityControllerTest` → FAIL.
- [ ] **Step 3: Implement DTOs, service, controller, StoreService/DtoMapper changes.**
- [ ] **Step 4: Run test class, then full `.\mvnw.cmd test`** → PASS.
- [ ] **Step 5: Commit** `feat(booking): store availability API`

### Task 3: Client models, HTTP services and availability editor in create/edit store

**Files:**
- Create: `models/booking.model.ts`, `services/booking/availability-http.service.ts` (+ `.spec.ts`), `services/booking/index.ts`, `utils/booking-time.ts` (+ `.spec.ts`), `components/availability-editor/availability-editor.{ts,html,spec.ts}`
- Modify: `pages/create-store/create-store.{ts,html}`, `models/store.model.ts` (`bookingsOpen?: boolean`), store mapping in `services/store/store.service.ts` / `store-http.service.ts` so `availability` is sent and `bookingsOpen` read.

**Interfaces:**
- Produces (TS):
  - `type DayOfWeek = 'MONDAY'|…|'SUNDAY'`; `interface AvailabilityRange { day: DayOfWeek; start: string; end: string }` (`'HH:mm'`); `interface StoreAvailability { slotMinutes: number; maxBookingMinutes: number; ranges: AvailabilityRange[] }`; `SLOT_OPTIONS = [15,30,45,60,90,120] as const`; `DEFAULT_AVAILABILITY` (slot 30, max 120, Mon–Sat 09:00–18:00).
  - `AvailabilityHttpService`: `get(storeId): Observable<StoreAvailability>`, `save(storeId, a): Observable<{availability: StoreAvailability; confirmedOutsideCount: number}>`, `listExceptions(storeId, from?, to?)`, `addException(storeId, req)`, `deleteException(storeId, id)`.
  - `booking-time.ts`: `durationOptions(slot: number, max: number): number[]`, `formatDuration(min: number): string` (`45 → "45 min"`, `90 → "1 h 30 min"`, `120 → "2 h"`), `timeOptions(stepMinutes = 15): string[]`, `validateDayRanges(ranges: {start:string;end:string}[]): string | null` (same messages as backend), `bookingDateStrip(today: Date, days = 31): string[]` (`'yyyy-MM-dd'`).
  - `<app-availability-editor>`: `ControlValueAccessor` over `StoreAvailability`; per-weekday open toggle (`hlm-switch`), range rows with 15-min selects, "+ Add time" disabled at 4, remove, "Copy to all open days", slot select, max select from `durationOptions`; changing slot re-clamps max like backend; inline errors from `validateDayRanges`.
- [ ] **Step 1: Write failing specs** — `booking-time.spec.ts`: `durationOptions(45,120)` → `[45,90]`; `formatDuration` cases above; `validateDayRanges` overlap/touching/off-grid. `availability-http.service.spec.ts`: GET/PUT URL `/api/stores/7/availability`, unwraps `data` (style of `contact.service.spec.ts`). `availability-editor.spec.ts`: `writeValue(DEFAULT_AVAILABILITY)` renders 6 open days; clicking "Copy to all open days" copies Monday ranges; "+ Add time" disabled after 4 rows.
- [ ] **Step 2: Run** `cd aaspass-client; npx ng test --watch=false` → new specs FAIL.
- [ ] **Step 3: Implement**; in `create-store`, add an "Availability" section bound to a `availability` FormControl (create → `DEFAULT_AVAILABILITY`; edit → loaded via `AvailabilityHttpService.get`), included in the save payload.
- [ ] **Step 4: Run specs + `npm run build`** → PASS.
- [ ] **Step 5: Commit** `feat(client): availability editor in store builder`

### Task 4: Owner shell and Store Availability page

**Files:**
- Create: `pages/owner/owner.guard.ts` (+ spec), `pages/owner/owner-store-switcher.ts`, `pages/owner/owner-availability/owner-availability.{ts,html,spec.ts}`
- Modify: `app.routes.ts` (lazy `owner-dashboard/availability`; `owner-dashboard` and `owner-dashboard/schedule` added in later tasks), `components/navbar/navbar.{ts,html}` and `pages/profile/profile.html` (links "Owner dashboard", "Availability")

**Interfaces:**
- Consumes: Task 3 services/editor; existing `StoreService` owned-stores signal (read `services/store/store.service.ts` for its exact name — the exploration found `userStores()`).
- Produces: `ownerGuard: CanActivateFn` (requires login like `authGuard`; redirects to `/create-store` when the user owns no store); `OwnerStoreSwitcherComponent` (`selectedStoreId = model<string>()`, syncs `?store=` query param, defaults to first owned store); `OwnerAvailabilityComponent` with tabs **Weekly hours** (editor + Save; toast warning `"N confirmed bookings are now outside your hours"` when `confirmedOutsideCount > 0`) and **Date overrides** (list, add OPEN/BLOCKED form, delete).
- [ ] **Step 1: Failing specs** — guard redirects non-owner to `/create-store`; availability page calls `save` with the edited value and shows the warning toast for `confirmedOutsideCount: 2`.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: specs + `npm run build`** → PASS.
- [ ] **Step 5: Commit** `feat(client): owner availability page`

## Phase 2 — Booking flow

### Task 5 (backend): Slot calculation and public slots endpoint

**Files:**
- Create: `booking/SlotCalculator.java`, `booking/SlotStatus.java`, `dto/booking/{SlotView,DaySlotsResponse}.java`
- Create: `service/booking/BookingService.java` (slots part), `controller/booking/BookingController.java` (slots part)
- Modify: `config/security/SecurityConfig.java` — nothing needed for `GET /api/stores/*/slots` (covered by `GET /api/stores/**`); add a comment listing the new public booking paths beside the existing matchers.
- Test: `booking/SlotCalculatorTest.java` (pure), `controller/booking/SlotsControllerTest.java`

**Interfaces:**
- Produces:
  - `enum SlotStatus { FREE, REQUESTED, BOOKED, CLOSED }`; `record SlotView(LocalTime time, SlotStatus status, int pendingCount)`.
  - `SlotCalculator.slots(LocalDate date, List<TimeRange> effective, int slotMinutes, List<Booking> pendingAndConfirmed, LocalDateTime now) -> List<SlotView>` — slots laid from each range start in `slotMinutes` steps, only full slots; `CLOSED` if slot start ≤ now; `BOOKED` if any CONFIRMED interval intersects; else `REQUESTED` with count of PENDING intersecting, else `FREE`.
  - `SlotCalculator.startTimes(... same inputs ..., int durationMinutes) -> List<LocalTime>` — slot starts where `start + duration ≤ range.end` of the same range, no covered slot BOOKED or CLOSED.
  - `record DaySlotsResponse(LocalDate date, boolean open, int slotMinutes, int maxBookingMinutes, List<SlotView> slots, List<LocalTime> startTimes)`.
  - `BookingService.slots(Long storeId, LocalDate date, Integer duration)` — 404 if store missing/admin-hidden/inactive; 400 `"Date must be within the next 30 days"`; duration null → `slotMinutes`; 400 `"Duration must be a multiple of the slot length up to the maximum"`.
  - Endpoint `GET /api/stores/{id}/slots?date=yyyy-MM-dd&duration=`.
- [ ] **Step 1: Failing tests** — `SlotCalculatorTest`:
  - `fortyFiveMinuteSlotsDropRemainder` — range 09:00–13:00, slot 45 → times `09:00,09:45,10:30,11:15`.
  - `startTimesNeverCrossRangeEnd` — ranges 09:00–13:00 & 14:00–18:00, slot 30, duration 60 → contains `12:00`, not `12:30`, not `13:30`.
  - `confirmedBlocksPendingCounts` — CONFIRMED 10:00–11:00, two PENDING 11:00–12:00 → 10:00/10:30 `BOOKED`, 11:00 `REQUESTED` with `pendingCount 2`.
  - `bookedUsesIntervalsNotGrid` — slot 30 but CONFIRMED 10:15–11:00 (legacy 45-min grid) → 10:00 and 10:30 `BOOKED`.
  - `pastSlotsClosed` — `now` = date 10:05 → 09:00–10:00 `CLOSED`, 10:00 `CLOSED`, 10:30 `FREE`.
  `SlotsControllerTest`: anonymous 200 with `open:false` when no availability; 400 for date+31; after PUT availability (Monday 09–12) next Monday returns 6 slots.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run + full suite** → PASS.
- [ ] **Step 5: Commit** `feat(booking): slot calculation`

### Task 6 (backend): Create, list-mine and cancel bookings

**Files:**
- Create: `dto/booking/{BookingCreateRequest,BookingResponse}.java`; extend `BookingService`, `BookingController`
- Modify: `service/mapper/DtoMapper.java` (`toBookingResponse`)
- Test: `controller/booking/BookingControllerTest.java`

**Interfaces:**
- Consumes: Task 5 `SlotCalculator.startTimes`, Task 2 `effectiveRanges`, Task 1 `BookingFunnelEventRepository`.
- Produces:
  - `record BookingCreateRequest(@NotNull Long storeId, @NotNull Long serviceId, @NotNull LocalDateTime startAt, @NotNull Integer durationMinutes, @Size(max=500) String note, @Size(max=64) String visitorId)`.
  - `record BookingResponse(Long id, Long storeId, String storeName, Long serviceId, String serviceName, Long userId, String userName, String userAvatarUrl, LocalDateTime startAt, LocalDateTime endAt, int durationMinutes, BookingStatus status, String note, String ownerNote, BigDecimal price, LocalDateTime decidedAt, boolean autoRejected, LocalDateTime creationDateTime)`.
  - `BookingService.create(Long callerId, BookingCreateRequest, String ip) -> BookingResponse` — validations from the spec in this order with these messages: store not bookable → 404; owner → 400 `"You can't book your own store"`; service not in store → 400 `"Service does not belong to this store"`; date window → 400 `"Date must be within the next 30 days"`; duration → 400 (Task 5 message); start not in `startTimes` → 400 `"This time is no longer available"`; caller already has an overlapping PENDING for this store → 400 `"You already have a pending request at this time"`. Saves PENDING with `priceAtBooking`/`serviceNameAtBooking`, then a `BOOKED` `BookingFunnelEvent` (visitorId from request, or `"user-" + callerId` when blank).
  - `Page<BookingResponse> mine(Long callerId, BookingStatus status, Pageable)` newest first; `BookingResponse cancel(Long bookingId, Long callerId)` (403 when not the booker; 400 `"Only pending or confirmed bookings can be cancelled"`).
  - Endpoints `POST /api/bookings`, `GET /api/bookings/mine`, `PATCH /api/bookings/{id}/cancel` (all authenticated by default rules).
- [ ] **Step 1: Failing tests** — `createsPendingAndBookedEvent` (aman books priya's service next Monday 10:00/60 → 200 PENDING, one BOOKED event with aman's id); `anonymousGets401`; `rejectsOwnStore`; `rejectsStartNotInStartTimes` (12:30 + 60 with range ending 13:00); `rejectsBeyond30Days`; `rejectsOverlappingOwnPending`; `twoUsersMayRequestSameSlot` (aman + rohan both PENDING 10:00 → both 200); `mineListsNewestFirst`; `cancelByOtherUserForbidden`; `cancelTwiceRejected`.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run + full suite** → PASS.
- [ ] **Step 5: Commit** `feat(booking): create and cancel bookings`

### Task 7 (client): Booking page, store-detail button and My bookings

**Files:**
- Create: `services/booking/booking-http.service.ts` (+ spec), `pages/book-service/book-service.{ts,html,spec.ts}`, `pages/my-bookings/my-bookings.{ts,html,spec.ts}`
- Modify: `app.routes.ts` (`stores/:storeKey/book/:serviceId` lazy, `my-bookings` lazy + `authGuard`), `pages/store-detail/store-detail.{ts,html}` (`selectService` → navigate; disabled "Bookings not open yet" when `!store.bookingsOpen`; owner sees "Manage bookings" → `/owner-dashboard?store=`), navbar "My bookings" link.

**Interfaces:**
- Consumes: Task 3 models/`booking-time.ts`; existing `AuthService.isLoggedIn()` and `openLoginModal(returnUrl)`; store lookup by key from `StoreService`.
- Produces (TS): `BookingStatus`, `SlotView`, `DaySlots`, `BookingCreatePayload`, `Booking` mirroring Task 5/6 records; `BookingHttpService`: `slots(storeId, date, duration)`, `create(payload)`, `mine(status?, page?)`, `cancel(id)`.
- Behaviour: booking page keeps `date`, `duration`, `time`, `note` in signals mirrored to query params (`?date=&duration=&time=`); on init restores them; anonymous Submit → `openLoginModal(router.url)`; on 400 shows message and reloads slots; success view text `"Request sent — waiting for the owner to confirm"` with link to `/my-bookings`. Slot buttons: BOOKED/CLOSED disabled greyed; `pendingCount > 0` shows `"{n} other(s) requested"`.
- [ ] **Step 1: Failing specs** — `booking-http.service.spec.ts` URLs/unwrap; `book-service.spec.ts`: `restoresSelectionFromQueryParams` (route query `date=2026-11-02&duration=60&time=10:00` → signals set, slots requested with those values); `anonymousSubmitOpensLoginModal`; `showsOthersRequested` (slot with `pendingCount: 2` renders "2 others requested"). `my-bookings.spec.ts`: Cancel button only for PENDING/CONFIRMED.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: specs + `npm run build`** → PASS.
- [ ] **Step 5: Commit** `feat(client): booking page and my bookings`

## Phase 3 — Funnel tracking

### Task 8: Funnel events (backend + client tracker)

**Files:**
- Create: `dto/booking/FunnelEventRequest.java`, `service/booking/FunnelService.java`, `controller/booking/FunnelController.java`, `exception/ErrorCode.java` (add `FUNNEL_RATE_LIMITED` if `RateLimitedException` takes a code — mirror `CONTACT_RATE_LIMITED` usage)
- Modify: `config/security/SecurityConfig.java` (`.requestMatchers(HttpMethod.POST, "/api/stores/*/funnel-events").permitAll()` next to `/views`)
- Create (client): `services/booking/funnel-tracking.service.ts` (+ spec); Modify `store-detail.ts` (BOOK_CLICK before navigate), `book-service.ts` (BOOKING_PAGE_VIEW on init, SLOT_SELECTED on time pick, pass `visitorId` in create payload)
- Test: `controller/booking/FunnelControllerTest.java`

**Interfaces:**
- Produces:
  - `record FunnelEventRequest(@NotNull FunnelStep step, Long serviceId, @NotBlank @Size(max=64) String visitorId)`.
  - `FunnelService.record(Long storeId, FunnelEventRequest, Optional<Long> callerId, String ip)` — 400 `"BOOKED is recorded by the server"` for BOOKED; 404 for missing/hidden store; silent skip when caller is owner or identical `(store, visitorId, step, serviceId)` within 30 min; 429 when the IP has ≥ 120 events in the last hour. Endpoint returns **204** in all success/skip cases.
  - TS `FunnelTrackingService`: `visitorId(): string` (localStorage key `aaspass.visitorId`, try/catch, in-memory `crypto.randomUUID()` fallback); `track(storeId: string, step: 'BOOK_CLICK'|'BOOKING_PAGE_VIEW'|'SLOT_SELECTED', serviceId?: string): void` — fire-and-forget, `catchError` → log + `EMPTY`, request marked to skip the error-toast interceptor (use the existing context token in `interceptors/http-context.ts`).
- [ ] **Step 1: Failing tests** — `anonymousClickRecorded` (204, one row, `userId` null); `ownerEventSkipped`; `duplicateWithin30MinSkipped`; `bookedRefused400`; `throttledAfter120` (seed 120 rows for the IP via repository → 429). Client: `visitorIdStableAcrossCalls`, `trackSwallowsErrors` (500 → no throw, no toast context).
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: backend suite + client specs + `npm run build`** → PASS.
- [ ] **Step 5: Commit** `feat(booking): funnel event tracking`

## Phase 4 — Owner inbox & schedule

### Task 9 (backend): Owner inbox, overlaps, confirm preview and decisions

**Files:**
- Create: `exception/ConflictException.java`; Modify `exception/GlobalExceptionHandler.java` (→ 409, `[API CONFLICT]` log, same body shape as `DuplicateResourceException`)
- Create: `dto/booking/{OwnerBookingRow,ConfirmPreview,BookingDecisionRequest,BookingDecisionResult}.java`, `service/booking/OwnerBookingService.java`, `controller/booking/OwnerBookingController.java`
- Modify: `repository/StoreRepository.java` (`@Lock(PESSIMISTIC_WRITE) @Query("select s from Store s where s.id = :id") Optional<Store> findByIdForUpdate(Long id)`), `service/StoreServiceItemService.java` (before deleting a service: `bookingRepository.detachService(serviceId)` — `update Booking b set b.service = null where b.service.id = :id`)
- Test: `controller/booking/OwnerBookingControllerTest.java`

**Interfaces:**
- Produces:
  - `record OwnerBookingRow(BookingResponse booking, long overlapPendingCount, long overlapConfirmedCount, boolean outsideAvailability)`.
  - `record ConfirmPreview(boolean canConfirm, List<BookingResponse> conflictingConfirmed, List<BookingResponse> willAutoReject)`.
  - `enum BookingAction { CONFIRM, REJECT, COMPLETE }`; `record BookingDecisionRequest(@NotNull BookingAction action, @Size(max=500) String ownerNote)`; `record BookingDecisionResult(BookingResponse booking, int autoRejectedCount)`.
  - `OwnerBookingService`: `Page<OwnerBookingRow> list(storeId, callerId, BookingStatus status, LocalDate from, LocalDate to, Pageable)` (PENDING sorted by `startAt` asc, others by `startAt` desc); `List<BookingResponse> overlaps(storeId, bookingId, callerId)`; `ConfirmPreview preview(...)`; `BookingDecisionResult decide(Long bookingId, Long callerId, BookingDecisionRequest)` — confirm algorithm exactly as the spec (lock via `findByIdForUpdate`, 409 `"This time overlaps a confirmed booking"`, auto-reject sets `autoRejected=true`, `ownerNote="Slot no longer available"`, `decidedAt`); COMPLETE requires CONFIRMED and `startAt` < now else 400 `"Only past confirmed bookings can be completed"`; invalid transitions 400 `"Booking is no longer pending"`.
  - Endpoints per spec "API — owner inbox & schedule" (except schedule, Task 10).
- [ ] **Step 1: Failing tests** — `listShowsOverlapCounts` (3 PENDING overlapping → each row `overlapPendingCount 2`); `previewListsAutoRejects`; `confirmAutoRejectsOverlapsOnly` (non-overlapping PENDING stays PENDING); `confirmSecondOverlapGets409` (confirm A, then force-insert PENDING B overlapping A via repository, confirm B → 409); `nonOwnerForbidden` (aman on priya's inbox → 403); `rejectStoresNote`; `completeFutureRejected`; `confirmOutsideAvailabilityAllowedAndFlagged` (row `outsideAvailability true`, confirm 200); `deletingServiceKeepsBookingSnapshot` (DELETE service → 200; booking GET shows `serviceName` snapshot, `serviceId` null).
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run + full suite** → PASS.
- [ ] **Step 5: Commit** `feat(booking): owner inbox and confirm workflow`

### Task 10 (backend): Schedule endpoint with lanes

**Files:**
- Create: `booking/ScheduleLanes.java`, `dto/booking/{ScheduleResponse,ScheduleDay,ScheduleBooking}.java`; extend `OwnerBookingService`, `OwnerBookingController`
- Test: `booking/ScheduleLanesTest.java` (pure), add `scheduleRangeLimitedTo7Days` + `scheduleReturnsLanes` to `OwnerBookingControllerTest`

**Interfaces:**
- Produces:
  - `ScheduleLanes.assign(List<Booking> sortedByStart) -> Map<Long, Placement>` with `record Placement(int lane, int conflictGroup)`. Algorithm (not determined by the signature):
    ```
    lanesEnd = []                       // end time per lane
    group = -1; groupEnd = MIN
    for b in sorted by (startAt, endAt):
        if b.startAt >= groupEnd: group++; lanesEnd.clear()   // new connected cluster
        lane = first i with lanesEnd[i] <= b.startAt, else append
        lanesEnd[lane] = b.endAt; groupEnd = max(groupEnd, b.endAt)
    ```
  - `record ScheduleBooking(BookingResponse booking, int lane, int conflictGroup)`; `record ScheduleDay(LocalDate date, List<TimeRange> openRanges, List<AvailabilityExceptionResponse> exceptions, List<ScheduleBooking> bookings, int laneCount)`; `record ScheduleResponse(int slotMinutes, List<ScheduleDay> days)`.
  - `GET /api/stores/{id}/schedule?from&to` — owner only; `to - from > 6 days` → 400 `"Schedule range is at most 7 days"`; PENDING + CONFIRMED only.
- [ ] **Step 1: Failing tests** — `ScheduleLanesTest`: `nonOverlappingShareLane0`, `threeMutualOverlapsGetLanes012SameGroup`, `chainOverlapSameGroup` (A 10–11, B 10:30–11:30, C 11:15–12 → one group, lanes 0,1,0), `touchingIsNewGroup` (10–11, 11–12 → groups 0,1).
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run + suite** → PASS.
- [ ] **Step 5: Commit** `feat(booking): owner schedule with lanes`

### Task 11 (client): Owner dashboard inbox and schedule page

**Files:**
- Create: `services/booking/owner-booking-http.service.ts` (+ spec), `pages/owner/booking-decision-panel/booking-decision-panel.{ts,html,spec.ts}`, `pages/owner/owner-dashboard/owner-dashboard.{ts,html,spec.ts}` (inbox section only in this task), `pages/owner/owner-schedule/owner-schedule.{ts,html,spec.ts}`
- Modify: `app.routes.ts` (`owner-dashboard`, `owner-dashboard/schedule` lazy + `ownerGuard`), navbar pending badge (polls `list(storeId,'PENDING',0,1).totalElements` on navigation, like admin `ShellComponent`)

**Interfaces:**
- Consumes: Task 9/10 endpoints; Task 4 switcher/guard.
- Produces (TS): `OwnerBookingRow`, `ConfirmPreview`, `BookingDecisionResult`, `Schedule*` types; `OwnerBookingHttpService`: `list(storeId, status, page, size)`, `overlaps(storeId, bookingId)`, `preview(storeId, bookingId)`, `decide(bookingId, action, ownerNote?)`, `schedule(storeId, from, to)`.
- `BookingDecisionPanelComponent` (`booking = input.required<OwnerBookingRow>()`, `decided = output<void>()`): Confirm loads preview; when `willAutoReject.length > 0` shows `"Confirming will auto-reject {n} overlapping request(s)"` and requires a second click; `canConfirm=false` shows the conflicting booking and disables Confirm; Reject with optional note; Mark complete for past CONFIRMED; 409 → toast + `decided.emit()` to refresh. Used by both inbox and schedule.
- Inbox: tabs Pending / Confirmed / Completed / Rejected & Cancelled; "Overlaps with N" badge expands `overlaps()` side by side; `outsideAvailability` warning chip.
- Schedule: day/week toggle, prev/next/today, `?date=`; bookings absolutely positioned by time, width `1/laneCount`, left `lane/laneCount`; CONFIRMED solid, PENDING outlined, BLOCKED exceptions hatched; click → decision panel.
- [ ] **Step 1: Failing specs** — decision panel: auto-reject warning requires second click before `decide` is called; Confirm disabled when `canConfirm` false. Schedule: three bookings with `laneCount 3` render at 0%, 33.3%, 66.7% left. Dashboard: badge text "Overlaps with 2".
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: specs + `npm run build`** → PASS.
- [ ] **Step 5: Commit** `feat(client): owner inbox and schedule`

## Phase 5 — Analytics dashboard

### Task 12 (backend): Booking analytics and abandoned list

**Files:**
- Create: `booking/AbandonedAttempts.java`, `booking/AnalyticsPeriod.java`, `dto/booking/{BookingAnalyticsResponse,FunnelStepCount,ServiceFunnelRow,AbandonedAttemptRow}.java`, `service/booking/BookingAnalyticsService.java`, `controller/booking/BookingAnalyticsController.java`
- Modify: `repository/booking/BookingFunnelEventRepository.java` (distinct-visitor counts per step, per service, per day; `findByStoreIdAndOccurredAtGreaterThanEqualOrderByVisitorIdAscOccurredAtAsc`)
- Test: `booking/AbandonedAttemptsTest.java` (pure), `controller/booking/BookingAnalyticsControllerTest.java`

**Interfaces:**
- Produces:
  - `enum AnalyticsPeriod { D7, D30, ALL }` with `fromParam("7D"|"30D"|"ALL")` (400 otherwise), `LocalDate start(LocalDate today)` (`today-6`, `today-29`, `null`), `LocalDate trendStart(LocalDate today)` (ALL → `today-89`).
  - `record Attempt(String visitorId, Long userId, Long serviceId, LocalDateTime clickedAt, FunnelStep lastStep, boolean booked)`; `AbandonedAttempts.group(List<BookingFunnelEvent> sortedByVisitorThenTime, LocalDateTime now) -> List<Attempt>` — each `BOOK_CLICK` that is not inside a previous attempt's 1-hour window starts an attempt; events in `[click, click+1h)` join it; `userId` = first non-null in the window; `lastStep` = highest ordinal; attempts with `clickedAt > now-1h` and not booked are excluded (still in progress). Abandoned = `!booked`.
  - `record FunnelStepCount(FunnelStep step, long visitors, double conversionPercent)` (percent of previous step, 1 decimal, 0 when previous is 0; first step 100).
  - `record ServiceFunnelRow(Long serviceId, String name, long clicks, long bookings, long confirmed, double conversionPercent)`.
  - `record BookingAnalyticsResponse(String period, List<FunnelStepCount> funnel, long confirmed, long abandonedCount, double abandonedPercent, List<LocalDate> buckets, List<Long> clicks, List<Long> bookings, List<Long> abandoned, List<ServiceFunnelRow> services, long pendingCount)`.
  - `record AbandonedAttemptRow(Long userId, String userName, String avatarUrl, String serviceName, FunnelStep lastStep, LocalDateTime clickedAt)`; `Page<AbandonedAttemptRow>` from `GET …/booking-analytics/abandoned?period&page&size` (logged-in attempts only, newest first).
  - `confirmed` = bookings with status CONFIRMED or COMPLETED and `decidedAt` in period.
- [ ] **Step 1: Failing tests** — `AbandonedAttemptsTest`: `clickWithoutBookingIsAbandoned`; `bookingWithinHourNotAbandoned`; `bookingAfterHourStillAbandoned`; `recentClickExcluded`; `abandonedAttributedViaLaterLoggedInEvent` (anonymous BOOK_CLICK, then SLOT_SELECTED with userId 5 → `userId 5`, `lastStep SLOT_SELECTED`). Controller: `funnelCountsDistinctVisitors` (same visitor twice > 30 min apart counts 1); `trendHas7BucketsFor7D`; `servicesBreakdown`; `abandonedListOnlyLoggedIn`; `nonOwnerForbidden`; `badPeriod400`.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run + suite** → PASS.
- [ ] **Step 5: Commit** `feat(booking): owner booking analytics`

### Task 13 (client): Column chart port and analytics sections

**Files:**
- Create: `components/column-chart/column-chart.{ts,spec.ts}` (copied from `aaspass-admin/src/app/components/column-chart/`, imports adjusted)
- Modify: `src/styles.css` (add the `--chart-series-1..3` variables, light + dark, copied from `aaspass-admin/src/styles.css`), `services/booking/owner-booking-http.service.ts` (`analytics(storeId, period)`, `abandoned(storeId, period, page)`), `pages/owner/owner-dashboard/owner-dashboard.{ts,html,spec.ts}`

**Interfaces:**
- Consumes: Task 12 response types (add to `booking.model.ts`).
- Produces: dashboard header (switcher, period tabs 7D/30D/All, links Schedule/Availability/Edit store), KPI tiles (Book clicks, Booking page views, Slot selected, Booking requests, Confirmed, Abandoned — each with `% of previous`), horizontal funnel bars, trend `<app-column-chart>` with series Clicks / Bookings / Abandoned, per-service table, abandoned list (paged; avatar, name, service, last step, relative time), empty states: `!bookingsOpen` → link to Availability; all-zero funnel → "No booking activity yet".
- [ ] **Step 1: Failing specs** — copied `column-chart.spec.ts` passes unchanged; dashboard: period tab change refetches with `30D`; KPI shows `"50%"` for page views 5 / clicks 10; empty state rendered when funnel all zero.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: specs + `npm run build`** → PASS.
- [ ] **Step 5: Commit** `feat(client): owner booking analytics dashboard`

### Task 14: Full verification

- [ ] **Step 1:** `cd aaspass-service-backend; .\mvnw.cmd test` → all PASS (paste the summary line).
- [ ] **Step 2:** `cd aaspass-client; npx ng test --watch=false` and `npm run build` → PASS, no new warnings.
- [ ] **Step 3:** Browser walkthrough with the user's running dev server (do not start a second `ng serve`): priya sets availability (slot 45, Monday 09–13, block next Sunday) → aman opens PixelCraft, clicks Book Service, picks a slot, submits → rohan requests the same slot → priya's dashboard shows clicks/page views/slot selected/requests, inbox shows "Overlaps with 1", schedule shows two lanes → priya confirms aman → rohan's request auto-rejected with note; aman's My bookings shows CONFIRMED. Screenshot dashboard and schedule.
- [ ] **Step 4:** Run the `reviewer-agent` pass required by AGENTS.md over the branch diff; fix findings; re-run Steps 1–2.
- [ ] **Step 5: Commit** any fixes `fix(booking): review findings`.
