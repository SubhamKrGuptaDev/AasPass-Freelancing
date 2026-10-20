# AI Development & Change Tracking Log

This document tracks all AI-assisted changes across the **AasPass** codebase for auditing, history, and project tracking.

---

## Change Log

### [2026-10-20 18:50:00 IST] - Removal of Frontend Hardcoded Dummy Data & Direct Live API Binding
* **What Changed:**
  * **Removed Hardcoded Mock Stores from Frontend**:
    * Deleted ~360 lines of hardcoded mock stores (`store-1` through `store-7`) and demo stores (`store-user-001`, `store-user-002`) from `StoreService`.
    * Stores are now exclusively initialized empty `stores = signal<StoreProfile[]>([])` and fetched directly from Spring Boot REST API `GET /api/stores` via `loadStoresFromApi()`.
    * Added dynamic `fetchStoreById(id)` to retrieve single stores on demand from `GET /api/stores/{id}` when direct navigation occurs, reactively updating the store signals.
    * Removed `buildDemoStore1()`, `buildDemoStore2()`, and `toggleDemoStore()` from `StoreService`.
    * Removed demo store toggle button (`⚡ Preview as Store Owner`) from `ProfileComponent`.
    * Removed `'store-user-001'` fallback in `NavbarComponent.activeStoreId`.
  * **Removed Hardcoded Guest Profile**:
    * Replaced default "Aman Sharma" guest fallback in `StoreService.currentUser` with `EMPTY_USER_PROFILE`.
    * User profile data is now populated strictly from active authentication sessions (`/api/auth/login`, `/api/auth/register`, `/api/users/{id}`).
  * **Cleaned Up `localStorage` Mock Pre-Seeding**:
    * Updated `AuthService.initDefaultAccounts()` to remove `seedUsers` so dummy accounts are not pre-written into browser `localStorage`.
  * **Loading State & UX Polish**:
    * Added animated loading skeletons on `HomeComponent` and `StoreDetailComponent` while fetching store data from live APIs.
  * **Verification & Test Coverage**:
    * Updated unit test suite (`store.service.spec.ts`, `auth.service.spec.ts`) with dedicated test fixture data.
    * Verified 100% test pass rate on Angular client (31/31 passed) and Spring Boot backend (18/18 passed).
* **Why Changed:** User requested removal of all hardcoded dummy data from the frontend, ensuring only data originating from live backend APIs is rendered.
* **Files Modified:**
  * `aaspass-client/src/app/services/store.service.ts`
  * `aaspass-client/src/app/services/store.service.spec.ts`
  * `aaspass-client/src/app/services/auth.service.ts`
  * `aaspass-client/src/app/services/auth.service.spec.ts`
  * `aaspass-client/src/app/components/navbar/navbar.ts`
  * `aaspass-client/src/app/pages/home/home.ts`
  * `aaspass-client/src/app/pages/store-detail/store-detail.ts`
  * `aaspass-client/src/app/pages/profile/profile.ts`
  * `doc/AI-doc/CHANGELOG.md`


### [2026-10-20 17:45:00 IST] - Random Avatar Fallback for UserDetails & Database Duplicate Prevention
* **What Changed:**
  * **Random Avatar Assignment for User Details**:
    * Created `AvatarGenerator` (`com.aaspass.util.AvatarGenerator`) in backend to generate unique, deterministic or random SVG avatars via Dicebear Avataaars whenever a user does not provide an image.
    * Added `avatarUrl` field to `RegisterRequest` in Spring Boot backend.
    * Updated `AuthService.register()` to check if avatar is provided; if not provided, automatically assigns a random avatar using `AvatarGenerator.getOrDefault()`.
    * Updated `UserService.updateUser()` and `DtoMapper.toUserResponse()` to guarantee all user responses have a valid avatar, falling back to random avatars instead of hardcoded photos.
    * Created client-side `getRandomAvatarUrl()` in `user.model.ts` and integrated into `AuthService.signup()`, `AuthService.mapBackendUserToProfile()`, and `StoreService.updateUserProfile()`.
    * Upgraded `ProfileComponent` to include avatar preview, URL editing, and a "🎲 Random Avatar" generator button in the User Details edit section, ensuring `saveUserDetails()` automatically assigns a random avatar if no image is present.
    * Added optional Profile Avatar input and "🎲 Random Avatar" button in `AuthPageComponent` signup form.
  * **Database Duplicate Data Prevention on Startup & Tests**:
    * Updated `DataInitializer` in backend to check both `userRepository.count() > 0` and `storeRepository.count() > 0`. If existing data is detected in the database, demo data creation is skipped entirely to prevent duplicate records.
    * Added idempotent checks (`existsByUsername`, `existsByEmail`, `existsByStoreName`) before persisting each demo entity in `DataInitializer`.
    * Added `existsByStoreName` and `existsByUserIdAndStoreName` to `StoreRepository`.
    * Added `@Transactional` to `StoreAndUserControllerTest` and `AuthControllerTest` to ensure all integration test entities are automatically rolled back, preventing test runs from accumulating duplicate records in MySQL.
    * Cleaned up existing duplicate test records from MySQL database.
    * Added test cases verifying random avatar fallback in both Spring Boot (`AuthControllerTest`, `StoreAndUserControllerTest`) and Angular (`auth.service.spec.ts`).
* **Why Changed:** Addressed validated issues in the AasPass system where users without images lacked random avatars during UserDetails creation, and application startup / test runs caused duplicate records to accumulate in the database.
* **Files Created/Modified:**
  * `aaspass-service-backend/src/main/java/com/aaspass/util/AvatarGenerator.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/dto/request/RegisterRequest.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/service/AuthService.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/service/UserService.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/service/mapper/DtoMapper.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/repository/StoreRepository.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/config/DataInitializer.java`
  * `aaspass-service-backend/src/test/java/com/aaspass/controller/AuthControllerTest.java`
  * `aaspass-service-backend/src/test/java/com/aaspass/controller/StoreAndUserControllerTest.java`
  * `aaspass-client/src/app/models/user.model.ts`
  * `aaspass-client/src/app/services/auth.service.ts`
  * `aaspass-client/src/app/services/auth.service.spec.ts`
  * `aaspass-client/src/app/services/store.service.ts`
  * `aaspass-client/src/app/pages/profile/profile.ts`
  * `aaspass-client/src/app/pages/auth/auth-page.ts`
  * `doc/AI-doc/CHANGELOG.md`


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

### [2026-10-19 10:10:00 IST] - Implemented JPA Base Superclasses & Domain Entities for Backend
* **What Changed:**
  * **Superclass 1 (`BaseIdEntity`):** Designed `@MappedSuperclass` `BaseIdEntity` declaring auto-increment `id` with getter-only access (`getId()`) and strictly NO setter, preventing ID mutation across all entities.
  * **Superclass 2 (`BaseAuditEntity`):** Designed `@MappedSuperclass` `BaseAuditEntity` extending `BaseIdEntity`. Declares `creationDateTime` and `lastUpdatedDateTime` with automatic timestamp lifecycle callbacks (`@PrePersist`, `@PreUpdate`) and getters/setters.
  * **Domain Entities (Mirroring Client-Side Models):**
    * `User` (table `users`): Maps `UserProfile` & `UserAccount` with identity/KYC fields (`aadharNumber`, `panNumber`), password encryption placeholder, bio, area, city, and `@OneToMany` multi-store association.
    * `Store` (table `stores`): Maps `StoreProfile` with category, headline, element collection `skills`, pricing, proximity radius, owner name, ratings, embeddable `StoreEngagementStats` views, embeddable `SocialLinks`, and bidirectional associations.
    * `StoreServiceItem` (table `store_services`): Individual service packages with pricing, duration, and details.
    * `SocialMediaLink` (table `store_social_links`): Dynamic multi-channel social & portfolio links with platform name and URL.
    * `StoreReview` (table `store_reviews`): Client ratings [1.0 - 5.0] and feedback.
    * `StoreViewRecord` (table `store_view_records`): Timestamped view history logs for analytics.
    * `StoreEngagementStats` (Embeddable): Daily, weekly, monthly, and lifetime view counters.
    * `SocialLinks` (Embeddable): Legacy static social handles.
  * **Unit Test Suite:** Created `EntityDesignTest` verifying absence of `setId` methods, timestamp lifecycle triggers, relationship integrity, and builder ergonomics. All tests pass with Hibernate DDL validation.
* **Why Changed:** Started backend persistence implementation in Spring Boot / JPA per requirements: two-tier superclass hierarchy (read-only ID and auditing timestamps) and client-aligned domain entities.
* **Files Created/Modified:**
  * `aaspass-service-backend/src/main/java/com/aaspass/entity/base/BaseIdEntity.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/entity/base/BaseAuditEntity.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/entity/User.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/entity/Store.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/entity/StoreServiceItem.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/entity/SocialMediaLink.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/entity/StoreReview.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/entity/StoreViewRecord.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/entity/StoreEngagementStats.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/entity/SocialLinks.java`
  * `aaspass-service-backend/src/test/java/com/aaspass/entity/EntityDesignTest.java`
  * `doc/AI-doc/CHANGELOG.md`

### [2026-10-19 10:30:00 IST] - Implemented Address Entity with One-to-Many User Mapping
* **What Changed:**
  * **Address Entity ([`Address`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-service-backend/src/main/java/com/aaspass/entity/Address.java)):** Created new JPA entity mapped to table `addresses`. Extends `BaseAuditEntity` (inheriting read-only `id`, `creationDateTime`, and `lastUpdatedDateTime`). Contains fields: `addressType` (Home, Work, Other), `addressLine` (Flat/House/Street), `area` (Neighborhood), `city`, `state`, `pincode`, `landmark`, `latitude`, `longitude` (for hyperlocal proximity queries), and `isDefault`.
  * **User Mapping ([`User`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-service-backend/src/main/java/com/aaspass/entity/User.java)):** Added `@OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true) private List<Address> addresses = new ArrayList<>()` to support multiple addresses per user profile, with bidirectional synchronization helpers `addAddress` and `removeAddress`.
  * **Unit & DDL Testing:** Updated [`EntityDesignTest.java`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-service-backend/src/test/java/com/aaspass/entity/EntityDesignTest.java) to verify immutable ID, timestamp auditing, multiple address additions, default flag behavior, and address deletion. Verified MySQL Hibernate DDL table creation and foreign key constraint (`addresses -> users`).
* **Why Changed:** Addressed user requirement: "One user can have multiple address so I need seperate address table to map with user".
* **Files Created/Modified:**
  * `aaspass-service-backend/src/main/java/com/aaspass/entity/Address.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/entity/User.java`
  * `aaspass-service-backend/src/test/java/com/aaspass/entity/EntityDesignTest.java`
  * `doc/AI-doc/CHANGELOG.md`

### [2026-10-19 10:48:00 IST] - Renamed SocialLinks to UserSocialLinks & Embedded into User / Store Owner
* **What Changed:**
  * **Backend Refactoring ([`UserSocialLinks.java`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-service-backend/src/main/java/com/aaspass/entity/UserSocialLinks.java)):** Renamed and refactored `SocialLinks` embeddable to `UserSocialLinks` (`instagram`, `linkedin`, `github`, `portfolio`, `twitter`, `youtube`), deleted obsolete `SocialLinks.java`.
  * **Store Owner User Mapping ([`User.java`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-service-backend/src/main/java/com/aaspass/entity/User.java)):** Embedded `UserSocialLinks userSocialLinks` into the `User` entity so users adding their store owner details can record their personal social media accounts. Added convenience alias methods `getSocialLinks()` and `setSocialLinks()`.
  * **Store Entity Update ([`Store.java`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-service-backend/src/main/java/com/aaspass/entity/Store.java)):** Updated `Store` to embed `UserSocialLinks userSocialLinks` with backward-compatible `getSocialLinks()` / `setSocialLinks()` accessors.
  * **Frontend Models:**
    * In [`store.model.ts`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/models/store.model.ts), exported `interface UserSocialLinks` alongside `export type SocialLinks = UserSocialLinks`, and added `userSocialLinks?: UserSocialLinks` to `StoreProfile`.
    * In [`user.model.ts`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/models/user.model.ts), added `userSocialLinks?: UserSocialLinks` to `UserProfile`.
    * In [`create-store.ts`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/pages/create-store/create-store.ts), updated imports for `UserSocialLinks`.
  * **Tests & Verification:** Both frontend (30 unit tests) and backend (Spring Boot context + `EntityDesignTest` with MySQL DDL table alteration) passed with `BUILD SUCCESS`.
* **Why Changed:** Addressed user request: "please change SocialLinks to UserSocialLinks in every where, it's like a Store Owner User Details that time User can add there Social media links".
* **Files Created/Modified:**
  * `aaspass-service-backend/src/main/java/com/aaspass/entity/UserSocialLinks.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/entity/User.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/entity/Store.java`
  * `aaspass-client/src/app/models/store.model.ts`
  * `aaspass-client/src/app/models/user.model.ts`
  * `aaspass-client/src/app/pages/create-store/create-store.ts`
  * `doc/AI-doc/CHANGELOG.md`

### [2026-10-19 12:45:00 IST] - Segregated StoreSocialMediaLinks vs UserSocialMediaLinks & Created Common Component
* **What Changed:**
  * **Backend Entity Architecture:**
    * Created [`StoreSocialMediaLinks.java`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-service-backend/src/main/java/com/aaspass/entity/StoreSocialMediaLinks.java) embeddable with columns `store_social_instagram`, `store_social_linkedin`, `store_social_github`, `store_social_portfolio`, `store_social_twitter`, `store_social_youtube`.
    * Updated [`Store.java`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-service-backend/src/main/java/com/aaspass/entity/Store.java) to embed `StoreSocialMediaLinks storeSocialMediaLinks` with backward-compatible `getUserSocialLinks()` / `setUserSocialLinks()` alias methods.
    * Created [`UserSocialMediaLinks.java`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-service-backend/src/main/java/com/aaspass/entity/UserSocialMediaLinks.java) embeddable with columns `user_social_instagram`, `user_social_linkedin`, `user_social_github`, `user_social_portfolio`, `user_social_twitter`, `user_social_youtube`.
    * Updated [`User.java`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-service-backend/src/main/java/com/aaspass/entity/User.java) to embed `UserSocialMediaLinks userSocialMediaLinks` with alias methods. Deleted obsolete `UserSocialLinks.java`.
  * **Frontend Common Component:**
    * Created standalone [`SocialMediaLinksComponent`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/components/social-media-links/social-media-links.ts) (`<app-social-media-links>`).
    * Configurable via `@Input()` properties: `title`, `subtitle`, `badgeNumber`, `showPresets`, `idPrefix`, and two-way binding `[(links)]`.
    * Built-in quick preset chips (`+ Instagram`, `+ LinkedIn`, `+ GitHub`, `+ YouTube`, `+ Portfolio`, `+ Twitter / X`, `+ Behance`, `+ Dribbble`), platform name datalist, direct redirect test buttons, remove buttons, and reactive link synchronization.
  * **Store Integration:**
    * In [`create-store.ts`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/pages/create-store/create-store.ts), replaced duplicated HTML with `<app-social-media-links>` configured with title *"Store Social Media & Online Portfolios"*.
    * Computes `StoreSocialMediaLinks` via `toStoreSocialMediaLinks` and saves both store dynamic and embeddable links.
  * **User Profile Integration:**
    * In [`profile.ts`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/pages/profile/profile.ts), added personal user social media display in Section 1 ("1. Basic Personal Details") with platform icons, clean URL handles, and direct redirect badges.
    * Integrated `<app-social-media-links>` in the edit form with title *"Personal Social Media Links"* and subtitle *"Add your personal social media profiles so nearby customers, clients, and collaborators can connect with you directly."*.
    * Added `startEditUser()`, `toggleEditUser()`, and updated `saveUserDetails()` to persist `userSocialMediaLinks` and personal `socialMediaLinks`.
    * Clarified Section 2 as *"Linked Store Social Media & Portfolios"*.
  * **Storefront Customer Connection:**
    * In [`store-detail.ts`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/pages/store-detail/store-detail.ts), added a dedicated *"Connect with Owner"* sidebar section alongside *"Verified Store Channels"*, displaying the store owner's personal social media channels so clients can connect directly with the freelancer.
  * **Models & Services:**
    * In [`store.model.ts`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/models/store.model.ts), defined `StoreSocialMediaLinks`, `UserSocialMediaLinks`, `toStoreSocialMediaLinks()`, and `toUserSocialMediaLinks()`.
    * In [`user.model.ts`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/models/user.model.ts), updated `UserProfile` with `userSocialMediaLinks` and `socialMediaLinks`.
    * In [`store.service.ts`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/services/store.service.ts), updated `currentUser`, `createStore`, `updateStore`, and `updateUserProfile`.
* **Why Changed:** Addressed user request to differentiate between `StoreSocialMediaLinks` (for the store) and `UserSocialMediaLinks` (for the personal user account / store owner), build a common reusable component for both, update backend entity columns, and allow clients to connect with store owners directly.
* **Files Created/Modified:**
  * `aaspass-service-backend/src/main/java/com/aaspass/entity/StoreSocialMediaLinks.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/entity/UserSocialMediaLinks.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/entity/Store.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/entity/User.java`
  * `aaspass-client/src/app/components/social-media-links/social-media-links.ts`
  * `aaspass-client/src/app/models/store.model.ts`
  * `aaspass-client/src/app/models/user.model.ts`
  * `aaspass-client/src/app/pages/create-store/create-store.ts`
  * `aaspass-client/src/app/pages/profile/profile.ts`
  * `aaspass-client/src/app/pages/store-detail/store-detail.ts`
  * `aaspass-client/src/app/services/store.service.ts`
  * `doc/AI-doc/CHANGELOG.md`

### [2026-10-19 23:20:00 IST] - Implemented Complete Spring Boot MVC REST API Layer with Login & Logging
* **What Changed:**
  * **MVC Pattern Structure:**
    * **Model Layer:** Domain entities (`User`, `Store`, `Address`, `StoreServiceItem`, `StoreReview`, `StoreViewRecord`, `SocialMediaLink`, `StoreEngagementStats`), request DTOs (`LoginRequest`, `RegisterRequest`, `UserUpdateRequest`, `AddressRequest`, `StoreCreateRequest`, `StoreUpdateRequest`, `ServiceItemRequest`, `StoreReviewRequest`), response DTOs (`ApiResponse<T>`, `AuthResponse`, `UserResponse`, `StoreResponse`, `AddressResponse`, `ServiceItemResponse`, `StoreReviewResponse`), and Spring Data JPA Repositories (`UserRepository`, `StoreRepository`, `AddressRepository`, `StoreServiceItemRepository`, `StoreReviewRepository`, `SocialMediaLinkRepository`, `StoreViewRecordRepository`).
    * **Service Layer:** `AuthService` (authentication, password validation, token issuance), `UserService` (profile & KYC updates, multi-address management), `StoreService` (catalog discovery, multi-criteria search, storefront creation/updates, status toggle, view analytics), `StoreServiceItemService` (gig package CRUD), and `StoreReviewService` (customer reviews & rating recalculations).
    * **Controller Layer:** `@RestController` classes `AuthController`, `UserController`, `StoreController`, `StoreServiceItemController`, and `StoreReviewController` with CORS enabled for frontend clients (`http://localhost:4200`).
  * **Basic Login & Auth API:**
    * Implemented `POST /api/auth/login` supporting login via username or email with password verification.
    * Implemented `POST /api/auth/register` with duplicate username/email detection.
    * Implemented `GET /api/auth/me` and `POST /api/auth/logout`.
    * Added `DataInitializer` pre-seeding demo accounts (`aman`, `priya`, `rohan`) with password `password123` so login is functional out-of-the-box.
  * **API Call Tracking & Logging Everywhere:**
    * Created `ApiLoggingFilter` (`OncePerRequestFilter`) logging every incoming and outgoing HTTP API call with unique request ID, HTTP method, URI, query string, client IP, response status, and duration in milliseconds.
    * Integrated SLF4J loggers in all Controllers, Services, and `GlobalExceptionHandler` (`@RestControllerAdvice`) for full end-to-end auditability.
  * **Comprehensive Unit & Integration Tests:**
    * Created `AuthControllerTest` and `StoreAndUserControllerTest` covering all API endpoints, auth flows, and edge cases (16 passing tests).
* **Why Changed:** Addressed user request: "let's start the API implementation and please follow mvc pattern: create all the API which are needed, implement basic login API, and add logs everywhere for track API calls".
* **Files Created/Modified:**
  * `aaspass-service-backend/src/main/java/com/aaspass/dto/response/ApiResponse.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/dto/response/AuthResponse.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/dto/response/UserResponse.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/dto/response/StoreResponse.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/dto/response/AddressResponse.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/dto/response/ServiceItemResponse.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/dto/response/StoreReviewResponse.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/dto/common/SocialMediaLinkDto.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/dto/request/LoginRequest.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/dto/request/RegisterRequest.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/dto/request/UserUpdateRequest.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/dto/request/AddressRequest.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/dto/request/StoreCreateRequest.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/dto/request/StoreUpdateRequest.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/dto/request/ServiceItemRequest.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/dto/request/StoreReviewRequest.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/repository/UserRepository.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/repository/StoreRepository.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/repository/AddressRepository.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/repository/StoreServiceItemRepository.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/repository/StoreReviewRepository.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/repository/SocialMediaLinkRepository.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/repository/StoreViewRecordRepository.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/service/AuthService.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/service/UserService.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/service/StoreService.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/service/StoreServiceItemService.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/service/StoreReviewService.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/service/mapper/DtoMapper.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/controller/AuthController.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/controller/UserController.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/controller/StoreController.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/controller/StoreServiceItemController.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/controller/StoreReviewController.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/config/WebMvcConfig.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/config/DataInitializer.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/config/logging/ApiLoggingFilter.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/exception/ResourceNotFoundException.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/exception/BadRequestException.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/exception/UnauthorizedException.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/exception/DuplicateResourceException.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/exception/GlobalExceptionHandler.java`
  * `aaspass-service-backend/src/test/java/com/aaspass/controller/AuthControllerTest.java`
  * `aaspass-service-backend/src/test/java/com/aaspass/controller/StoreAndUserControllerTest.java`
  * `aaspass-service-backend/pom.xml`
  * `doc/AI-doc/CHANGELOG.md`

### [2026-10-20 12:40:00 IST] - Integrated Backend REST APIs with Frontend & Fixed Entity Cascade Mappings
* **What Changed:**
  * **Frontend HTTP Client Setup:** Configured `provideHttpClient(withFetch())` in [`app.config.ts`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/app.config.ts) to enable native Angular HTTP requests across the frontend.
  * **API Configuration & DTO Contracts:** Created [`api.config.ts`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/config/api.config.ts) declaring `API_BASE_URL` (`http://localhost:8080/api`), generic `ApiResponse<T>`, and TypeScript contracts mirroring Spring Boot response DTOs (`BackendAuthResponse`, `BackendUserResponse`, `BackendStoreResponse`).
  * **Auth Service REST API Integration:** Upgraded [`AuthService`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/services/auth.service.ts) to communicate with Spring Boot endpoints:
    * `login()` -> `POST /api/auth/login` (with credentials, token persistence, and fallback to pre-seeded accounts).
    * `signup()` -> `POST /api/auth/register` (creates user in MySQL with duplicate detection).
    * `logout()` -> `POST /api/auth/logout`.
    * `updateUserProfile()` -> `PUT /api/users/{id}`.
  * **Store Service REST API Integration:** Upgraded [`StoreService`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/services/store.service.ts) to communicate with backend storefront endpoints:
    * Startup loading -> `GET /api/stores` (populates signal state from database).
    * `createStore()` -> `POST /api/stores`.
    * `updateStore()` -> `PUT /api/stores/{id}`.
    * `deleteStore()` -> `DELETE /api/stores/{id}`.
    * `toggleStoreAvailability()` -> `PATCH /api/stores/{id}/toggle-status`.
    * `addReview()` -> `POST /api/stores/{storeId}/reviews`.
    * `recordStoreView()` -> `POST /api/stores/{id}/views`.
  * **Backend Entity Bi-directional Mapping Fixes:**
    * Implemented helper methods in [`User.java`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-service-backend/src/main/java/com/aaspass/entity/User.java): `addStore(store)` (assigns `store.setUser(this)`), `removeStore(store)`, `addAddress(address)` (assigns `address.setUser(this)`), `removeAddress(address)`.
    * Implemented helper methods in [`Store.java`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-service-backend/src/main/java/com/aaspass/entity/Store.java): `addService(item)` (assigns `item.setStore(this)`), `removeService(item)`, `addSocialMediaLink(link)`, `addReview(review)`, `addViewRecord(record)`.
    * Enabled `PATCH` and `OPTIONS` in [`WebMvcConfig.java`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-service-backend/src/main/java/com/aaspass/config/WebMvcConfig.java) CORS policy.
    * Linked demo store packages, addresses, and reviews in [`DataInitializer.java`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-service-backend/src/main/java/com/aaspass/config/DataInitializer.java).
  * Cleaned up stale emitted `.js` files from `src/app`.
* **Why Changed:** Addressed user request to integrate backend REST APIs with the Angular frontend while keeping the existing avatar URL flow intact.
* **Files Created/Modified:**
  * `aaspass-client/src/app/app.config.ts`
  * `aaspass-client/src/app/config/api.config.ts`
  * `aaspass-client/src/app/services/auth.service.ts`
  * `aaspass-client/src/app/services/store.service.ts`
  * `aaspass-client/src/app/guards/auth.guard.ts`
  * `aaspass-client/src/app/services/auth.service.spec.ts`
  * `aaspass-service-backend/src/main/java/com/aaspass/entity/User.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/entity/Store.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/config/WebMvcConfig.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/config/DataInitializer.java`
  * `doc/AI-doc/CHANGELOG.md`

### [2026-10-20 13:10:00 IST] - Null-Safety Hardening & Compiler Diagnostics Across Backend & Frontend
* **What Changed:**
  * **Backend Null Safety:**
    * Hardened bi-directional relationship helpers in [`User.java`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-service-backend/src/main/java/com/aaspass/entity/User.java) (`addAddress`, `removeAddress`, `addStore`, `removeStore`) with defensive initialization and null-checks on the collections to prevent `NullPointerException`s if uninitialized collections or null entities are passed.
    * Hardened bi-directional relationship helpers in [`Store.java`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-service-backend/src/main/java/com/aaspass/entity/Store.java) (`addService`, `removeService`, `addSocialMediaLink`, `addReview`, `addViewRecord`) with defensive lazy collection initialization and null-checks.
    * Fixed potential unboxing NPE in [`StoreReviewService.java`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-service-backend/src/main/java/com/aaspass/service/StoreReviewService.java) when evaluating `request.getRating()`, and guarded `request.getUserName().trim()`.
    * Streamlined store removal in [`StoreService.java`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-service-backend/src/main/java/com/aaspass/service/StoreService.java) by using `user.removeStore(store)` and guarded `store.getSocialMediaLinks()` against null before `.clear()`.
  * **Frontend Null Safety:**
    * In [`AuthService`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/services/auth.service.ts): Protected `loadStoredSession()` and `getRegisteredAccounts()` by validating parsed JSON structure (`typeof parsed === 'object'` and `Array.isArray(parsed)`). Guarded `mapBackendUserToProfile` against null input and filtered null items in nested arrays (`stores`, `services`, `reviews`, `socialMediaLinks`).
    * In [`StoreService`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/services/store.service.ts): Guarded `mapBackendStoreToProfile` against null input and safely transformed nested arrays. Hardened ID string parsing across `createStore`, `updateStore`, `deleteStore`, `addReview`, and `recordStoreView`.
    * In [`authGuard`](file:///c:/Users/subha_0yq0lj/Documents/projects/AasPass-Freelancing/aaspass-client/src/app/guards/auth.guard.ts): Added defensive fallback `state?.url || '/'` for unauthenticated redirection.
  * **Build Verification:**
    * Backend: `./mvnw.cmd test-compile` and `./mvnw.cmd test` succeeded cleanly (all 16 tests passing).
    * Frontend: `npm run build` and `npm test` succeeded cleanly (all 30 tests passing).
* **Why Changed:** Code quality, null-safety, and compiler diagnostics review following full-stack REST API integration.
* **Files Modified:**
  * `aaspass-service-backend/src/main/java/com/aaspass/entity/User.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/entity/Store.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/service/StoreReviewService.java`
  * `aaspass-service-backend/src/main/java/com/aaspass/service/StoreService.java`
  * `aaspass-client/src/app/services/auth.service.ts`
  * `aaspass-client/src/app/services/store.service.ts`
  * `aaspass-client/src/app/guards/auth.guard.ts`
  * `doc/AI-doc/CHANGELOG.md`




