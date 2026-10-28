# Home Page Redesign + Public City Stores Page — Design

**Date:** 2026-10-28
**Branch:** `feature/home-redesign-stores-page`
**Scope:** Frontend only (`aaspass-client`). No backend changes.

## 1. Goal

1. Turn the home page into a richer, modern landing page that explains AasPass (content sourced from `README.md`) and previews top stores in the selected city.
2. Add a dedicated **public** `/stores` page listing stores filtered by city (and category / search), with filters held in the URL so links are shareable.
3. Introduce **Spartan UI** (shadcn/ui for Angular, Tailwind v4–native) as the component library for these two pages.

### Decisions already made with the user

| Topic | Decision |
| :--- | :--- |
| Home page role | Landing page + "Top stores in {city}" preview (6 cards); full browsing moves to `/stores` |
| UI library | Spartan UI (chosen over Angular Material / PrimeNG for Tailwind v4 fit and modern look) |
| Library scope | New Home + Stores pages (and the shared store card) only; other pages untouched |
| City source on `/stores` | URL query params: `/stores?city=Pune&category=Web%20%26%20Tech&q=react` |
| Auth on `/stores` | Public, no guard |

### Out of scope

- Migrating navbar, auth, profile, create-store, store-detail to Spartan.
- Backend changes (`GET /api/stores` and `GET /api/stores/*` are already `permitAll`; stores are already loaded client-side).
- Distance/radius filtering (no geolocation exists today; `distanceKm` is display-only).
- Any pricing/commission claims not present in the README.

## 2. Existing system (what we build on)

- `StoreService` (`services/store/store.service.ts`) loads all stores once via `GET /api/stores` and exposes signals `searchQuery`, `selectedCategory`, `selectedCity`, `isLoading`, plus computed `filteredStores` (city + category + text). Constants `categories` (with `'All'`) and `availableCities`. Setters `setSearchQuery`, `setSelectedCategory`, `setSelectedCity`, `resetFilters` (does not reset city). `getStoreUrlKey(store)` builds the `/stores/:storeKey` link.
- Navbar city selector writes `selectedCity` — global and shared.
- Route `stores/:storeKey` → `StoreDetailComponent` (public).
- `StoreProfile` fields used by cards: `storeName, ownerName, avatarUrl, tagline, category, skills, experienceYears, hourlyRate, startingPrice, area, city, distanceKm, rating, reviewCount, views.lifetime, bannerGradient, isAvailable`.

**Single source of truth stays `StoreService`.** Home and Stores read/write its filter signals; no second fetch path.

## 3. Spartan UI setup

### Dependencies

- Runtime: `@spartan-ng/brain` (1.8.x, peers: Angular CDK 22, Tailwind ≥4, `tw-animate-css`, `clsx`, `luxon`), `@angular/cdk@22.2.x`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`, `@ng-icons/core` + `@ng-icons/lucide` (icons).
- Helm components (styled layer) are **source code copied into the repo** under `src/app/ui/` (e.g. `src/app/ui/button/`), with a `@spartan-ng/helm/*` path alias in `tsconfig.json`.

### Installation path

1. Try the official generator: `npm i -D @spartan-ng/cli` then `ng g @spartan-ng/cli:ui` for the components below.
2. **Fallback** (the CLI depends on Nx and `@schematics/angular@21`, which may not run against Angular 22): copy each helm component's source from the official `spartan-ng/spartan` repository at the tag matching `@spartan-ng/brain` 1.8.3, and remove `@spartan-ng/cli` again so it does not stay as a dependency.

Helm components needed: `button`, `card`, `input`, `select`, `badge`, `tabs`, `accordion`, `skeleton`, `separator`, `toggle-group` (category chips), `switch` (open-for-gigs filter), `icon`.

### Theme

- Add shadcn CSS variables to `src/styles.css` (`:root` tokens + `@theme inline` mapping + `@import 'tw-animate-css'`), with **primary = indigo-600**, accent = pink, radius `0.75rem`, to match current branding.
- Base-layer risk: shadcn's base (`* { @apply border-border }`, `body { @apply bg-background text-foreground }`) affects every page. Mitigation: set `--border` = slate-200 and `--background` to the current page background so existing pages render unchanged; verify Profile, Create Store, Store Detail, Auth visually.
- Dark mode: not introduced (the app has none today).

## 4. Components

### 4.1 `StoreCardComponent` (new, `components/store-card/`)

- Input: `store = input.required<StoreProfile>()`; uses `StoreService.getStoreUrlKey`.
- Spartan `hlmCard` showing: gradient banner strip (`bannerGradient`), distance + area badge, availability badge ("Open for gigs" / "Paused"), rating + review count, lifetime views, avatar, store name, owner + experience, tagline (2-line clamp), up to 3 skill badges + "+N", hourly rate and "View store" button (`routerLink` to `/stores/:storeKey`).
- Replaces the card markup now inlined in `home.html` (DRY: Home preview and Stores page both use it).
- Null safety: `views?.lifetime ?? 0`, `skills ?? []`, avatar fallback handled by existing data.

### 4.2 Home page (`pages/home/`, rewritten)

Sections, top to bottom:

1. **Hero** — badge "Hyperlocal gig economy • within 2–10 km", headline, subtext; search `hlmInput` + city `hlm-select` (bound to `StoreService.selectedCity`) + "Find talent" button → `router.navigate(['/stores'], { queryParams: { city, q } })`. Quick stats row: 5 cities · 6 categories · 2–10 km radius.
2. **Browse by category** — 6 cards (icon, name, one-line description from README) → `/stores?city={city}&category={cat}`.
3. **How it works** — `hlm-tabs` with two tabs: *Hire talent* (Search nearby → View storefront & packages → Book or request a callback) and *Earn with your skills* (Sign up → Open store with live preview → Receive neighborhood gigs).
4. **Why AasPass** — 4 comparison cards from README "The Problem": Global freelance sites, Service directories, Google Maps, WhatsApp/society groups — each with the AasPass answer. Plus 3 value props: physical proximity & trust, low barrier for newcomers, fast turnaround.
5. **Top stores in {city}** — up to 6 stores computed from `StoreService.stores()` filtered by `selectedCity` only (category/search filters are deliberately ignored on Home), sorted by rating desc, then reviewCount desc. Skeletons while `isLoading`; empty state "No stores in {city} yet — be the first" with Open Store CTA. "View all stores in {city} →" link.
6. **Trust & safety** — Aadhaar/PAN encrypted (AES-256-GCM) and shown masked; HttpOnly cookie sessions; verified social links; neighbor reviews.
7. **Cities we serve** — badges for `availableCities` → `/stores?city=…`.
8. **Earn CTA banner** — existing "New in town or want extra income?" banner restyled; button → `/create-store`.
9. **FAQ** — `hlm-accordion`: Do I need a shop? · How close are providers? · Is my ID data safe? · Can I both hire and earn? (answers from README).

Home no longer owns the search `FormControl` sync with `StoreService.searchQuery`; the hero search is local and only applied on submit (navigates to `/stores`).

Home static content (categories meta, steps, comparisons, FAQ) lives in a `home.content.ts` constant file to keep the component and template lean.

### 4.3 Stores page (`pages/stores/`, new)

- Route: `{ path: 'stores', component: StoresComponent, title: 'Browse Local Stores - AasPass' }`, declared **before** `stores/:storeKey`, no guard.
- **Filter bar:** city `hlm-select`, search `hlmInput` (debounced 300 ms), category `hlm-toggle-group` (single select, includes "All"), sort `hlm-select`, "Open for gigs only" `hlm-switch`, "Reset" button.
- **Sort options** (component-local computed over `filteredStores`): Top rated (default; rating desc, reviewCount desc) · Price: low → high (`hourlyRate`) · Price: high → low · Most experienced (`experienceYears`) · Most viewed (`views.lifetime ?? 0`).
- **Results:** header "N stores in {city}" + active category badge; grid of `StoreCardComponent` (1/2/3 columns); 6 skeleton cards while `isLoading`; empty state listing other cities as quick links + "Reset filters".

#### URL ↔ state sync

- URL params: `city`, `category`, `q`, `sort`, `open` (`open=1`).
- **URL → state** (on every `queryParamMap` emission): validate `city` against `availableCities` (case-insensitive match → canonical name); invalid/missing → keep current `selectedCity`. Validate `category` against `categories`; invalid/missing → `'All'`. `q` → `setSearchQuery` (trimmed, max 100 chars). `sort` must be a known key, else default. `open` = `'1'` → true.
- **State → URL**: user changes in the filter bar call `router.navigate([], { queryParams, queryParamsHandling: 'merge', replaceUrl: true })`; default values are omitted (`null`) to keep URLs clean. City is always written.
- **Navbar city change** while on `/stores`: an `effect` on `selectedCity` writes the city into the URL if it differs (guarded to avoid loops).
- Leaving `/stores` does not reset filters (existing global behavior); entering Home shows city-only preview regardless.

### 4.4 Navbar

- Add a "Browse Stores" link (`routerLink="/stores"`, `routerLinkActive`) next to existing links, in the existing Tailwind style. No other navbar changes.

## 5. Error handling & edge cases

- API failure: existing `errorToastInterceptor` shows the toast; pages show the empty state, not a crash.
- `StoreService` already handles loading; pages render skeletons while `isLoading()`.
- Unknown query params are ignored; malformed values fall back to defaults (never throw).
- Stores with missing optional fields render with fallbacks (`?? 0`, `?? []`, `?? ''`).

## 6. Testing

Vitest specs:

- `store-card.spec.ts`: renders name/rate/rating; caps skills at 3 with "+N"; link uses `getStoreUrlKey`; handles missing `views`.
- `stores.spec.ts`: query params → service signals (valid, case-insensitive city, invalid city/category fallback); filter change → `router.navigate` with merged params and `replaceUrl`; each sort order; "open only" filter; empty state.
- `home.spec.ts`: top-stores preview is city-only, sorted by rating, max 6; hero submit navigates to `/stores` with `city` and `q`.
- Existing specs keep passing (`npm test`).

Verification: `npm run build` (watch the 4 kB component-style budget), `npm test`, backend `.\mvnw.cmd test-compile` (unchanged, per AGENTS.md), then a visual check in the browser of Home, `/stores?city=Pune`, an invalid-city URL, the mobile width, and a quick regression look at Profile / Create Store / Store Detail / Auth for the theme base-layer change.

## 7. Files touched

- New: `src/app/ui/**` (Spartan helm), `components/store-card/*`, `pages/stores/*`, `pages/home/home.content.ts`, spec files.
- Changed: `pages/home/home.{ts,html,css}`, `app.routes.ts`, `components/navbar/navbar.html`, `styles.css`, `tsconfig.json` (path alias), `package.json` / `package-lock.json`, `README.md` (stack table: add Spartan UI; mention `/stores`), `doc/AI-doc/CHANGELOG.md`.
