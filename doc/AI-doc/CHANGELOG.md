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
### [2026-10-17 18:50:00 IST] - Implemented Dynamic Multiple Social Media & Portfolio Links with Direct Redirect
* **What Changed:**
  * Defined `SocialMediaLink` interface (`id`, `name`, `url`) in `store.model.ts` and added `socialMediaLinks` collection to `StoreProfile`.
  * Added URL sanitation & display utilities: `formatSocialUrl` (ensures `https://` prefix so external links redirect properly), `displaySocialUrl` (clean domain handle display), `getSocialIcon` (platform-specific icons for Instagram, LinkedIn, GitHub, YouTube, Twitter / X, Portfolio, Behance, Dribbble, etc.), and `getSocialBadgeClass`.
  * Added `normalizeSocialLinks` utility to guarantee backward compatibility with legacy `socialLinks` object structures.
  * Replaced static hardcoded "Connected →" cards in `ProfileComponent` under "Linked Social Media & Portfolios" with a dynamic grid of links showing platform name, icon, clean URL, and a direct redirect button that opens the social channel in a new tab (`target="_blank" rel="noopener noreferrer"`).
  * Upgraded `CreateStoreComponent` to allow users to add multiple social media and portfolio links with custom platform names, quick preset chips (`+ Instagram`, `+ LinkedIn`, `+ GitHub`, `+ YouTube`, `+ Portfolio`, `+ Twitter / X`, `+ Behance`, `+ Dribbble`), live redirect test buttons, link removal, and real-time live preview.
  * Upgraded `StoreDetailComponent` sidebar to display all verified social channels added by the freelancer with direct redirect buttons for clients/viewers.
  * Added unit test cases to `store.service.spec.ts` validating multiple social link storage and custom store link creation.
* **Why Changed:** Addressed user requirement where store creators can add multiple custom social media links with social media names, replacing static "connects" in the profile section with clickable links that directly redirect viewers to their external profiles.
* **Files Created/Modified:**
  * `aaspass-client/src/app/models/store.model.ts`
  * `aaspass-client/src/app/services/store.service.ts`
  * `aaspass-client/src/app/services/store.service.spec.ts`
  * `aaspass-client/src/app/pages/create-store/create-store.ts`
  * `aaspass-client/src/app/pages/profile/profile.ts`
  * `aaspass-client/src/app/pages/store-detail/store-detail.ts`
  * `doc/AI-doc/CHANGELOG.md`

### [2026-10-17 18:58:00 IST] - Aligned "Edit My Store" Button in Single Line on Store Detail Page
* **What Changed:**
  * Updated [`StoreDetailComponent`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/pages/store-detail/store-detail.ts) header card flex layout to `sm:items-center justify-between`.
  * Added `min-w-0 flex-1` and `truncate` to the store details block so it does not compress the action button.
  * Applied `inline-flex items-center justify-center whitespace-nowrap flex-shrink-0 self-start sm:self-center` to the **"✏️ Edit My Store"** button, preventing button text from wrapping across multiple lines and aligning it cleanly in a single line.
* **Why Changed:** Fixed layout misalignment on store detail pages (such as `/stores/store-user-001`) where the edit button wrapped and misaligned.
* **Files Created/Modified:**
  * `aaspass-client/src/app/pages/store-detail/store-detail.ts`
  * `doc/AI-doc/CHANGELOG.md`

### [2026-10-17 19:12:00 IST] - Added creationDateTime and lastUpdateDateTime Backend Metadata Timestamps
* **What Changed:**
  * Added `creationDateTime: string` and `lastUpdateDateTime: string` fields to `UserProfile` in [`user.model.ts`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/models/user.model.ts).
  * Added `creationDateTime: string` and `lastUpdateDateTime: string` fields to `StoreProfile` in [`store.model.ts`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/models/store.model.ts).
  * Initialized ISO 8601 timestamps on `currentUser` and all mock stores in [`StoreService`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/services/store.service.ts).
  * Automatically assigned `creationDateTime` and `lastUpdateDateTime` upon store creation (`createStore`).
  * Automatically updated `lastUpdateDateTime` on store edits (`updateStore`) and user details edits (`updateUserProfile`).
  * Timestamps are reserved for backend audit / synchronization and kept out of the UI view as requested.
  * Added unit test assertions in [`store.service.spec.ts`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/services/store.service.spec.ts).
* **Why Changed:** Required for backend data synchronization, auditing, and persistence of User and Store Owner records.
* **Files Created/Modified:**
  * `aaspass-client/src/app/models/user.model.ts`
  * `aaspass-client/src/app/models/store.model.ts`
  * `aaspass-client/src/app/services/store.service.ts`
  * `aaspass-client/src/app/services/store.service.spec.ts`
  * `doc/AI-doc/CHANGELOG.md`

### [2026-10-17 19:33:00 IST] - Implemented Multi-Store Support for Single User Profile
* **What Changed:**
  * Added `stores?: StoreProfile[]` array to [`UserProfile`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/models/user.model.ts) while preserving `store?: StoreProfile` and `hasStore: boolean` for backward compatibility.
  * Added `userStores = computed(() => this.stores().filter(s => s.userId === this.currentUser().id))` signal to [`StoreService`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/services/store.service.ts).
  * Upgraded `createStore` in `StoreService` to append newly created stores to the user's `stores` collection without overwriting existing stores.
  * Added `updateStore(updated, storeId?)`, `deleteStore(storeId)`, and `toggleStoreAvailability(storeId?)` in `StoreService` to target specific stores by ID.
  * Updated `toggleDemoStore()` in `StoreService` to generate 2 distinct demo stores for user `user-001` (Aman Sharma): "Aman Tech & Creative Studio" (Web & Tech) and "Aman Lens & Aerial Films" (Video & Editing / Photography) for testing.
  * Upgraded [`CreateStoreComponent`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/pages/create-store/create-store.ts):
    * Reads `editStoreId` query parameter via `ActivatedRoute`. When present, loads and updates that specific store.
    * When no `editStoreId` is provided, always allows creating a brand-new additional store under the unified user account.
    * Dynamically displays Store count indicator ("Store #X under unified profile") and Back to Profile navigation.
  * Upgraded [`ProfileComponent`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/pages/profile/profile.ts):
    * Section 2 redesigned as "2. My Neighborhood Skill Stores" with a horizontal tab bar / store switcher showing active status dot, store name, category badge, and rating for each owned store.
    * Added "+ Open Another Store" button to create more stores at any time.
    * Selected store view shows store headline, individual active/pause toggle, direct link to public storefront, Edit Store button, Delete Store button, Key Metrics grid, store-specific social media links with direct redirects, and verified customer reviews with "+ Add Test Review" support.
  * Upgraded [`NavbarComponent`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/components/navbar/navbar.ts) to display "My Stores ({count})" linking to the profile store manager when a user owns multiple stores.
  * Updated [`StoreDetailComponent`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/pages/store-detail/store-detail.ts) "Edit My Store" button to route to `/create-store?editStoreId={store.id}`.
  * Added unit test suite in [`store.service.spec.ts`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/services/store.service.spec.ts) validating multi-store creation, individual store updates, availability toggling, store deletion, and demo toggle.
* **Why Changed:** Addressed user request: "1 user have can have multiple stores in his/her profile please do the implementation for that" so freelancers can manage multiple specialized niche businesses (e.g. Web Development and Video Editing) with dedicated pricing, portfolios, and reviews under a single unified user account.
* **Files Created/Modified:**
  * `aaspass-client/src/app/models/user.model.ts`
  * `aaspass-client/src/app/services/store.service.ts`
  * `aaspass-client/src/app/pages/create-store/create-store.ts`
  * `aaspass-client/src/app/pages/profile/profile.ts`
  * `aaspass-client/src/app/pages/store-detail/store-detail.ts`
  * `aaspass-client/src/app/components/navbar/navbar.ts`
  * `aaspass-client/src/app/services/store.service.spec.ts`
  * `doc/AI-doc/CHANGELOG.md`

### [2026-10-17 19:55:00 IST] - Investigated and Fixed "My Store" Navigation and Route Reactivity
* **What Changed:**
  * **Root Cause 1 - Navbar Link Target:** When a user had multiple stores (`userStores().length > 1`), the Navbar button routed to `/profile` with the label `My Stores (X)`. When users were already on the profile page or expected to open their storefront, clicking the button either did nothing (route was already active) or took them to profile instead of their storefront.
    * **Fix:** Upgraded [`NavbarComponent`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/components/navbar/navbar.ts) to provide a primary "My Store" button that always links directly to the user's active storefront (`/stores/{activeStoreId}`). For multi-store owners, added an adjacent dropdown switcher toggle (`▼`) displaying all their owned stores with live status dots, names, rates, and direct links, plus shortcuts to "Manage Stores in Profile" and "Open Another Store".
  * **Root Cause 2 - Route Parameter Caching:** In [`StoreDetailComponent`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/pages/store-detail/store-detail.ts), store ID was read once using `this.route.snapshot.paramMap.get('id')` inside a `computed` signal. Navigating between stores (e.g., from `/stores/store-user-001` to `/stores/store-user-002`) reused the component instance, so the snapshot never updated and clicking between stores appeared broken.
    * **Fix:** Converted `this.route.paramMap` to an Angular signal via `toSignal(this.route.paramMap)`, ensuring the `store` signal reactively updates and re-renders the component whenever the route parameter changes.
  * **Root Cause 3 - Direct URL Store Resolution:** Navigating directly to `http://localhost:4200/stores/store-user-001` resulted in "Store Not Found" if the demo store had not been explicitly toggled on in that specific browser session.
    * **Fix:** Enhanced `getStoreById` in [`StoreService`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/services/store.service.ts) to search master stores, fallback to user profile stores, and automatically resolve demo stores (`store-user-001` / `store-user-002`) so direct storefront links and "My Store" navigation always resolve immediately.
  * **Root Cause 4 - QueryParam Reactivity on Edit:** Subscribed to `this.route.queryParamMap` in [`CreateStoreComponent`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/pages/create-store/create-store.ts) so clicking "Edit My Store" dynamically switches between editing different stores without requiring a page refresh.
  * Added unit test in [`store.service.spec.ts`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/services/store.service.spec.ts) verifying direct resolution of user demo stores via `getStoreById`.
* **Why Changed:** Resolved the issue reported by the user where clicking "My Store" was not working or navigating properly, especially when managing multiple stores or navigating between store URLs.
* **Files Created/Modified:**
  * `aaspass-client/src/app/components/navbar/navbar.ts`
  * `aaspass-client/src/app/services/store.service.ts`
  * `aaspass-client/src/app/pages/store-detail/store-detail.ts`
  * `aaspass-client/src/app/pages/create-store/create-store.ts`
  * `aaspass-client/src/app/services/store.service.spec.ts`
  * `doc/AI-doc/CHANGELOG.md`

### [2026-10-18 21:30:00 IST] - Implemented Store-Level View Count & Owner Engagement Analytics
* **What Changed:**
  * Defined `EngagementViewType` (`'daily' | 'weekly' | 'monthly' | 'lifetime'`), `StoreEngagementStats` (`daily`, `weekly`, `monthly`, `lifetime`), `StoreViewRecord`, and `ENGAGEMENT_TYPE_OPTIONS` in [`store.model.ts`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/models/store.model.ts).
  * Added `views?: StoreEngagementStats` and `viewHistory?: StoreViewRecord[]` to `StoreProfile` with helper utilities `getStoreViews` and `getEngagementCount`.
  * Added initial views data breakdown to all mock stores (`store-1` through `store-6`) and demo stores (`store-user-001`, `store-user-002`) in [`StoreService`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/services/store.service.ts).
  * Added `recordStoreView(storeId, viewerId?)`, `getStoreViews(storeId)`, and `getStoreEngagement(storeId, type)` methods in `StoreService`, ensuring real-time incrementing across daily, weekly, monthly, and lifetime timeframes, appending view history, and syncing to current user store signals.
  * Initialized view counts (`daily: 1, weekly: 1, monthly: 1, lifetime: 1`) on newly created stores in `createStore`.
  * Upgraded [`ProfileComponent`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/pages/profile/profile.ts):
    * Expanded Key Store Metrics Grid to 5 columns including dynamic Store Views display.
    * Added dedicated **Store Engagement & View Analytics** panel exclusively for Store Owners with interactive timeframe pill selector (`Daily`, `Weekly`, `Monthly`, `Lifetime`).
    * Implemented detailed view metric card with live timeframe descriptions, 4-pill mini overview grid, and an interactive `+ Simulate Store View (+1)` testing action.
    * Automatically updates when switching between multiple stores under a user profile.
  * Upgraded [`StoreDetailComponent`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/pages/store-detail/store-detail.ts):
    * Automatic view recording upon visiting store details via Angular `effect` and `untracked`.
    * Added store view count badge (`👁️ X views`) in the storefront header for social proof.
    * Added interactive Store Owner Engagement Dashboard widget when `isOwner()` is true, enabling the owner to toggle between `daily`, `weekly`, `monthly`, and `lifetime` view counts right on their storefront.
  * Added view count badge indicator on store cards in [`HomeComponent`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/pages/home/home.ts) discovery list.
  * Added comprehensive unit test suite in [`store.service.spec.ts`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/services/store.service.spec.ts) validating store initialization, view recording increment, type-based retrieval, creation initialization, and store-level independence for multi-store owners.
* **Why Changed:** Addressed requirement to implement store-level view count where store owners can inspect engagement metrics filtered by daily, weekly, monthly, and lifetime timeframes.
* **Files Created/Modified:**
  * `aaspass-client/src/app/models/store.model.ts`
  * `aaspass-client/src/app/services/store.service.ts`
  * `aaspass-client/src/app/pages/profile/profile.ts`
  * `aaspass-client/src/app/pages/store-detail/store-detail.ts`
  * `aaspass-client/src/app/pages/home/home.ts`
  * `aaspass-client/src/app/services/store.service.spec.ts`
  * `doc/AI-doc/CHANGELOG.md`

### [2026-10-19 09:10:00 IST] - Implemented Username/Password Authentication, Login & Signup Modal Popup, and Protected Route Guards
* **What Changed:**
  * **Auth Data Models:** Extended [`user.model.ts`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/models/user.model.ts) with `UserAccount`, `AuthCredentials`, `SignupRequest`, and `AuthResult` interfaces.
  * **Reactive Authentication Service:** Created [`AuthService`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/services/auth.service.ts) using Angular signals (`currentUser`, `isLoggedIn`, `isModalOpen`, `modalMode`, `returnUrl`, `authError`, `authSuccessMessage`). Handles username/email and password credential verification, account registration (sign up), demo account 1-click quick logins (`Aman Sharma`, `Priya Nair`, `Rohan Gupta`), session persistence in `localStorage`, and modal popup controls.
  * **Interactive Login & Signup Modal / Popup:** Implemented [`AuthModalComponent`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/components/auth-modal/auth-modal.ts) globally rendered in `app.html`. Supports seamless switching between **Log In** and **Sign Up** tabs, password show/hide eye toggle, dynamic context banner indicating why login was required (e.g. for `/create-store` or `/profile`), and quick demo account buttons.
  * **Dedicated Auth Page Component:** Implemented [`AuthPageComponent`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/pages/auth/auth-page.ts) mapped to `/login` and `/signup` routes for direct URL navigation.
  * **Route Protection via Angular Guard:** Implemented [`authGuard`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/guards/auth.guard.ts). Ensures **Home page (`/`)** and **Store URLs (`/stores/:id`)** require NO authentication. When an unauthenticated user accesses protected URLs (`/profile`, `/create-store`), `authGuard` intercepts, triggers the login popup modal with `returnUrl`, and auto-redirects them to their destination upon login/signup.
  * **Navbar Upgrades:** Upgraded [`NavbarComponent`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/components/navbar/navbar.ts) to display guest actions ("List Services", "Log In", "Sign Up") when unauthenticated, and user profile pill with dropdown menu ("My Profile", "Open Skill Store", "Sign Out") when logged in.
  * **Store & Profile Integration:** 
    * Updated [`StoreDetailComponent`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/pages/store-detail/store-detail.ts) to display a friendly "Log In to Leave a Review" card for guests, and restrict owner portal to verified owners.
    * Updated [`ProfileComponent`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/pages/profile/profile.ts) with an explicit "Sign Out" button in the header.
    * Synchronized [`StoreService`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/services/store.service.ts) state with active `AuthService` session.
  * **Comprehensive Unit Testing:** Created [`auth.service.spec.ts`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/services/auth.service.spec.ts) with 14 unit test cases verifying authentication, credential checks, validation errors, duplicate usernames, signup flow, session restoration, demo quick-login, and route guard behavior. All 30 tests in the project pass cleanly.
* **Why Changed:** Addressed user request for username and password login page implementation, keeping Home page and Store URLs public without requiring authentication, popping up login when protected URLs are requested, and including a signup option.
* **Files Created/Modified:**
  * `aaspass-client/src/app/models/user.model.ts`
  * `aaspass-client/src/app/services/auth.service.ts`
  * `aaspass-client/src/app/services/auth.service.spec.ts`
  * `aaspass-client/src/app/guards/auth.guard.ts`
  * `aaspass-client/src/app/components/auth-modal/auth-modal.ts`
  * `aaspass-client/src/app/pages/auth/auth-page.ts`
  * `aaspass-client/src/app/app.routes.ts`
  * `aaspass-client/src/app/app.ts`
  * `aaspass-client/src/app/app.html`
  * `aaspass-client/src/app/components/navbar/navbar.ts`
  * `aaspass-client/src/app/services/store.service.ts`
  * `aaspass-client/src/app/pages/store-detail/store-detail.ts`
  * `aaspass-client/src/app/pages/profile/profile.ts`
  * `doc/AI-doc/CHANGELOG.md`
