## Store booking workflow and owner dashboard

Replaces the toast-only "Book Service" button with a real owner-confirmed booking flow, and gives store owners a dashboard showing how many people click Book Service, how far they get, and who abandons.

Spec: `docs/superpowers/specs/2026-10-31-store-booking-dashboard-design.md` · Plan: `docs/superpowers/plans/2026-10-31-store-booking-dashboard.md`

### What's in it
- **Availability**: owners set a slot length (15–120 min), the longest booking, weekly hours with breaks (up to 4 ranges/day), and date-specific overrides (extra open hours or blocked days/times). The editor is shared by create store, edit store, and a new Availability page.
- **Booking flow**: Book Service → `/stores/:key/book/:serviceId` → pick date, duration, free slot (shows "N others requested") → request. Requests start PENDING; only CONFIRMED bookings block a slot. Users see and cancel their requests on **My bookings**.
- **Owner inbox and schedule** (`/owner-dashboard`, `/owner-dashboard/schedule`): overlapping requests are flagged ("Overlaps with N") and shown side by side in schedule lanes. Confirming warns first, then auto-rejects overlapping pending requests ("Slot no longer available"). Confirm/cancel take a store row lock at READ_COMMITTED, so two owners acting at the same moment can't both confirm overlapping requests on MySQL.
- **Funnel tracking**: BOOK_CLICK → BOOKING_PAGE_VIEW → SLOT_SELECTED → BOOKED. The public endpoint is throttled per IP, skips the owner's own clicks, and drops duplicates within 30 minutes.
- **Analytics**: KPI tiles with step conversion, funnel bars, daily trend chart (the admin SVG column chart, copied into the client), per-service breakdown, and a list of logged-in users who abandoned (anonymous visitors only count toward the number).
- **Navbar**: pending-bookings badge for owners, plus My bookings, Owner dashboard and Availability links.

### Schema
`ddl-auto=update` creates `store_availability_ranges`, `store_availability_exceptions`, `bookings`, `booking_funnel_events`, and adds nullable `slot_minutes` / `max_booking_minutes` to `stores`. Existing stores show "Bookings not open yet" until the owner sets hours.

### Testing
- Backend `./mvnw test`: 320 tests, 0 failures.
- Client `ng test`: 40 files, 345 tests pass. `npm run build` OK (the initial bundle budget warning was already there; this branch adds about 20 kB).
- Browser walkthrough against local MySQL: owner set 45-min slots → customer booked 16:30 → second overlapping request → dashboard funnel, badge and overlap badge → schedule lanes → confirm auto-rejected the overlap → public slot shows BOOKED.
- Each task was reviewed (spec + quality), then the whole branch, and the findings were fixed.

### Known follow-ups (not blocking)
- Old PENDING requests don't expire, and a PENDING request in the past can still be confirmed.
- The "All" analytics period loads every event for the store; switch to projection/count queries later.
- The "Rejected & Cancelled" inbox tab merges two status queries, so its paging is approximate.
- Before a time is picked, the booking page URL briefly shows `time=null`.
- `PageResponse` lives in `admin.dto`; move it to a shared package.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
