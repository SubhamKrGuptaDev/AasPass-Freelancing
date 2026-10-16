# AI Development & Change Tracking Log

This document tracks all AI-assisted changes across the **AasPass** codebase for auditing, history, and project tracking.

---

## Change Log

### [2026-10-15 08:48:00 IST] - Initial Frontend Discovery & Unified Account Implementation
* **What Changed:** Created the initial Angular frontend architecture including `StoreService` (signal-based state management), Discovery/Home page with distance-radius filtering, Store Detail page, Create Store flow with live preview, and a Unified User Profile page.
* **Why Changed:** Set up the core user journey for Option A (Unified Account) allowing any user to search nearby gigs or publish a skill store for local side-income before backend integration.
* **Files Created/Modified:**
  * `aaspass-client/src/app/models/store.model.ts`
  * `aaspass-client/src/app/models/user.model.ts`
  * `aaspass-client/src/app/services/store.service.ts`
  * `aaspass-client/src/app/components/navbar/navbar.ts`
  * `aaspass-client/src/app/pages/home/home.ts`
  * `aaspass-client/src/app/pages/store-detail/store-detail.ts`
  * `aaspass-client/src/app/pages/create-store/create-store.ts`
  * `aaspass-client/src/app/pages/profile/profile.ts`
  * `aaspass-client/src/app/app.routes.ts`
  * `aaspass-client/src/app/app.ts`
  * `aaspass-client/src/app/app.html`

### [2026-10-16 17:45:00 IST] - Added Aadhaar Card and PAN Card Fields to Profile
* **What Changed:** Added Aadhaar Card and PAN Card identity fields to the user profile model, store service state, and profile UI (both view mode with verification badges and edit mode with input fields).
* **Why Changed:** Required for user identity verification (KYC), neighborhood trust building, and tax/payout tracking for users providing local freelance services.
* **Files Created/Modified:**
  * `aaspass-client/src/app/models/user.model.ts`
  * `aaspass-client/src/app/services/store.service.ts`
  * `aaspass-client/src/app/pages/profile/profile.ts`

### [2026-10-16 17:50:00 IST] - Fixed Search Results Summary Bar Visibility and Clipping
* **What Changed:** Redesigned the search results count and location filter header on the home discovery page with high-contrast badges, clear typography, and removed the negative top margin (`-mt-6`) to prevent overlap with the hero section.
* **Why Changed:** Resolved an issue where the results bar ("Found X local stores & freelancers near City") was poorly visible and clipped underneath the dark hero gradient.
* **Files Created/Modified:**
  * `aaspass-client/src/app/pages/home/home.ts`

### [2026-10-16 18:22:00 IST] - Implemented Store Owner Rating & Review Section
* **What Changed:** 
  * Defined `StoreReview` model with `rating` (bounded strictly between min 1.0 and max 5.0), `userName` (Review User name), and `message`.
  * Added `reviews` collection to `StoreProfile` and populated mock stores with realistic customer reviews.
  * Added `addReview` service method with strict clamping [1.0 - 5.0] and dynamic recalculation of store average rating and review counts.
  * Added a dedicated Customer Reviews & Ratings section in `ProfileComponent` exclusively visible to Store Owners (`hasStore: true`), including score cards, customer review history, and an interactive test review submission tool.
  * Added quick "⚡ Preview as Store Owner" / "Switch to Regular User" toggle in the profile header for testing both account states seamlessly.
  * Integrated the public Reviews & Ratings section on `StoreDetailComponent` with an interactive 1-5 star / numeric rating input (min 1.0, max 5.0), Review User name field, message textarea, validation checks, and store owner view protection (preventing self-rating).
  * Added unit test suite in `store.service.spec.ts` verifying rating bounds [1.0 - 5.0], review calculation, and store owner state toggling.
* **Why Changed:** Implemented client review and rating features exclusively for Store Owners to build local trust, establish social proof, and reflect neighborhood gig feedback on a 1.0 - 5.0 rating scale.
* **Files Created/Modified:**
  * `aaspass-client/src/app/models/store.model.ts`
  * `aaspass-client/src/app/services/store.service.ts`
  * `aaspass-client/src/app/services/store.service.spec.ts`
  * `aaspass-client/src/app/pages/store-detail/store-detail.ts`
  * `aaspass-client/src/app/pages/profile/profile.ts`
  * `aaspass-client/src/app/app.spec.ts`
  * `doc/AI-doc/CHANGELOG.md`
