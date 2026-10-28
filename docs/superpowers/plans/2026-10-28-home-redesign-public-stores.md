# Home Redesign + Public City Stores Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce Spartan UI, rebuild the Home page as a landing page with a top-stores preview, and add a public `/stores` page filtered by city through URL query params.

**Architecture:** `StoreService` stays the single source of truth (all stores loaded once; `selectedCity`/`selectedCategory`/`searchQuery` signals). Pure helpers in `services/store/store-query.ts` do parsing, sorting and ranking; a shared `StoreCardComponent` renders a store; `HomeComponent` and the new `StoresComponent` compose them with Spartan helm components copied into `src/app/ui/`.

**Tech Stack:** Angular 22 (standalone, signals), Tailwind CSS v4, Spartan UI (`@spartan-ng/brain` 1.8.x + helm source), `@ng-icons/lucide`, Vitest via `ng test`.

**Spec:** `docs/superpowers/specs/2026-10-28-home-redesign-public-stores-design.md`

## Global Constraints

- Frontend only (`aaspass-client`); no backend changes.
- Spartan applies only to Home, Stores and `StoreCardComponent`; other pages keep their current markup.
- Brand tokens: primary = indigo-600, accent = pink, radius `0.75rem`; `--border` = slate-200; `--background` = current page background. No dark mode.
- `/stores` route is public (no guard) and declared before `stores/:storeKey`.
- URL params on `/stores`: `city`, `category`, `q`, `sort`, `open` (`open=1`); defaults are omitted from the URL; city is always written; updates use `replaceUrl: true` and `queryParamsHandling: 'merge'`.
- Sort keys: `rating` (default), `price-asc`, `price-desc`, `experience`, `views`.
- `q` is trimmed and capped at 100 characters. Search input debounce: 300 ms.
- Home preview: max 6 stores, city-only (ignores category/search), rating desc then reviewCount desc.
- All copy comes from `README.md`; no pricing/commission claims.
- Production budget `anyComponentStyle` 4 kB warning / 8 kB error must not be exceeded.
- Null-safety rules from `AGENTS.md` (`?.`, `??`, guarded `find()`).
- Test command: `npx ng test --watch=false` (single file: add `--include <path>`). Build: `npm run build`.
- Every commit message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Navbar city change while on `/stores`** — URL must follow the navbar exactly once with no navigate↔effect loop (test in Task 4).
2. **Deep link with non-canonical values** (`/stores?city=pune&category=web%20%26%20tech`) — resolves to `Pune` / `Web & Tech`; unknown values fall back without throwing (tests in Task 2 and Task 4).
3. **Stores with missing numeric fields** (`views` undefined, `rating`/`hourlyRate` `NaN`/`undefined`) — sorting stays deterministic, missing values sort last (test in Task 2).
4. **`/stores` vs `/stores/:storeKey`** — `/stores` renders the listing, `/stores/store-7` still renders the detail page (test in Task 4).
5. **Theme base layer bleeding into untouched pages** — Profile, Create Store, Store Detail and Auth look unchanged (visual check in Task 6).

---

### Task 1: Spartan UI foundation and theme

**Files:**
- Modify: `package.json`, `package-lock.json`, `tsconfig.json` (`compilerOptions.baseUrl`/`paths`), `src/styles.css`, `src/index.html` (no change expected; only if a font is required)
- Create: `src/app/ui/<component>/` helm sources for `button, card, input, select, badge, tabs, accordion, skeleton, separator, toggle-group, switch, icon`
- Test: `src/app/ui/ui-smoke.spec.ts`

**Interfaces:**
- Produces: path alias `@spartan-ng/helm/<name>` → `src/app/ui/<name>/src/index.ts` (match whatever layout the generator emits; keep imports in later tasks as `@spartan-ng/helm/<name>`). Exported import arrays used later: `HlmButtonImports`, `HlmCardImports`, `HlmInputImports`, `HlmSelectImports`, `BrnSelectImports`, `HlmBadgeImports`, `HlmTabsImports`, `HlmAccordionImports`, `HlmSkeletonImports`, `HlmSeparatorImports`, `HlmToggleGroupImports`, `HlmSwitchImports`, `HlmIconImports` (use the exact export names the generated sources define, and record any differences at the top of this task's commit message).

- [ ] **Step 1: Install runtime deps**

Run: `npm i @spartan-ng/brain@1.8.3 @angular/cdk@22.2.4 class-variance-authority clsx tailwind-merge tw-animate-css luxon @ng-icons/core @ng-icons/lucide`
Expected: install succeeds with no peer-dependency errors.

- [ ] **Step 2: Generate helm components**

Run: `npm i -D @spartan-ng/cli@1.8.3` then `npx ng g @spartan-ng/cli:ui` selecting the 12 components above, target directory `src/app/ui`.
If the generator fails on Angular 22: copy the helm sources for those components from the official `spartan-ng/spartan` GitHub repo at tag matching 1.8.3 (`libs/helm/<name>`) into `src/app/ui/<name>`, add the `paths` alias by hand, and skip the CLI.
Either way, finish with `npm un @spartan-ng/cli` so the CLI is not left as a dependency.

- [ ] **Step 3: Theme tokens in `src/styles.css`**

After `@import 'tailwindcss';` add `@import 'tw-animate-css';`, shadcn `:root` variables and the `@theme inline` mapping (`--color-primary: var(--primary)` etc.). Values: `--primary` indigo-600 / `--primary-foreground` white, `--accent` pink-500 tones, `--border`/`--input` slate-200, `--ring` indigo-500, `--background` matching the current `bg-slate-50`-ish body (check `app.html`; use white if body has no background), `--radius: 0.75rem`. Do not add a `.dark` block.

- [ ] **Step 4: Write smoke test** `ui-smoke.spec.ts`: a host component using `hlmBtn`, `hlmCard`, `hlmBadge`, `hlmInput` renders; assert the button element has a non-empty `class` containing `inline-flex` and the badge text is present.

- [ ] **Step 5: Run tests and build**

Run: `npx ng test --watch=false` → all specs pass (existing + smoke).
Run: `npm run build` → success, no budget errors.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json tsconfig.json src/styles.css src/app/ui
git commit -m "build(client): add Spartan UI helm components and brand theme tokens"
```

---

### Task 2: Store query helpers (parse, sort, rank)

**Files:**
- Create: `src/app/services/store/store-query.ts`
- Test: `src/app/services/store/store-query.spec.ts`

**Interfaces:**
- Produces:
  - `type StoreSortKey = 'rating' | 'price-asc' | 'price-desc' | 'experience' | 'views'`
  - `const STORE_SORT_OPTIONS: ReadonlyArray<{ key: StoreSortKey; label: string }>` — labels: `Top rated`, `Price: low to high`, `Price: high to low`, `Most experienced`, `Most viewed`
  - `const DEFAULT_STORE_SORT: StoreSortKey = 'rating'`
  - `const MAX_SEARCH_LENGTH = 100`
  - `interface StoresQuery { city: string | null; category: string; q: string; sort: StoreSortKey; openOnly: boolean }`
  - `parseStoresQuery(params: ParamMap, cities: readonly string[], categories: readonly string[]): StoresQuery` — `city` = canonical match (case-insensitive, trimmed) or `null`; `category` canonical match or `'All'`; `q` trimmed, sliced to 100; `sort` known key or default; `openOnly` = `params.get('open') === '1'`.
  - `toStoresQueryParams(query: StoresQuery): Params` — defaults become `null` (`category 'All'`, empty `q`, `sort 'rating'`, `openOnly false`); `city` always included.
  - `sortStores(stores: readonly StoreProfile[], sort: StoreSortKey): StoreProfile[]` — returns a new array.
  - `topStoresForCity(stores: readonly StoreProfile[], city: string, limit = 6): StoreProfile[]`

- [ ] **Step 1: Write failing tests** (use a `makeStore(overrides: Partial<StoreProfile>)` factory in the spec)

```ts
it('parses canonical city/category case-insensitively', () => {
  const q = parseStoresQuery(convertToParamMap({ city: ' pune ', category: 'web & tech' }), CITIES, CATS);
  expect(q).toEqual({ city: 'Pune', category: 'Web & Tech', q: '', sort: 'rating', openOnly: false });
});
it('falls back on unknown values', () => {
  const q = parseStoresQuery(convertToParamMap({ city: 'Atlantis', category: 'Magic', sort: 'nope', open: 'yes' }), CITIES, CATS);
  expect(q).toEqual({ city: null, category: 'All', q: '', sort: 'rating', openOnly: false });
});
it('trims and caps q at 100 chars', () => {
  expect(parseStoresQuery(convertToParamMap({ q: '  ' + 'a'.repeat(150) }), CITIES, CATS).q.length).toBe(100);
});
it('omits defaults when building params', () => {
  expect(toStoresQueryParams({ city: 'Pune', category: 'All', q: '', sort: 'rating', openOnly: false }))
    .toEqual({ city: 'Pune', category: null, q: null, sort: null, open: null });
  expect(toStoresQueryParams({ city: 'Pune', category: 'Photography', q: 'reels', sort: 'views', openOnly: true }))
    .toEqual({ city: 'Pune', category: 'Photography', q: 'reels', sort: 'views', open: '1' });
});
it('sorts by each key without mutating input', () => { /* rating desc then reviewCount desc; price-asc/desc by hourlyRate; experience desc; views desc by views?.lifetime ?? 0 */ });
it('puts missing/NaN numbers last for every sort', () => {
  // stores with rating undefined, hourlyRate NaN, views undefined end up after valid ones, order otherwise stable
});
it('topStoresForCity filters by city case-insensitively, ranks by rating then reviewCount, caps at 6', () => {
  // 8 stores in Bengaluru + 2 in Pune → 6 Bengaluru stores, highest rating first; tie broken by reviewCount
});
```

- [ ] **Step 2: Run** `npx ng test --watch=false --include src/app/services/store/store-query.spec.ts` → FAIL (module not found).

- [ ] **Step 3: Implement** `store-query.ts` with the signatures above. Use one comparator helper that treats non-finite numbers as `-Infinity` for desc sorts and `+Infinity` for asc so they sort last; `Array.prototype.toSorted` or `[...arr].sort` (stable).

- [ ] **Step 4: Run** the same command → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/services/store/store-query.ts src/app/services/store/store-query.spec.ts
git commit -m "feat(client): store query parsing, sorting and city ranking helpers"
```

---

### Task 3: Shared `StoreCardComponent`

**Files:**
- Create: `src/app/components/store-card/store-card.ts`, `store-card.html`
- Test: `src/app/components/store-card/store-card.spec.ts`

**Interfaces:**
- Consumes: `StoreService.getStoreUrlKey(store)`, helm `HlmCardImports`, `HlmBadgeImports`, `HlmButtonImports`, `HlmIconImports` (Task 1).
- Produces: `<app-store-card [store]="s" />` with `store = input.required<StoreProfile>()`.

- [ ] **Step 1: Write failing tests**

```ts
it('renders name, owner, rate and rating', ...)          // 'PixelCraft', 'by Priya', '₹450', '4.8'
it('shows max 3 skills plus "+N"', ...)                   // skills length 5 → 3 badges + '+2'
it('links to the store detail key', ...)                  // anchor href ends with '/stores/' + service.getStoreUrlKey(store)
it('shows 0 views when views is undefined', ...)
it('shows "Open for gigs" vs "Paused" from isAvailable', ...)
```

- [ ] **Step 2: Run** `npx ng test --watch=false --include src/app/components/store-card/store-card.spec.ts` → FAIL.

- [ ] **Step 3: Implement** the card per spec §4.1 (gradient strip via `bannerGradient`, distance + area badge, availability badge, rating/reviews, views, avatar, name, owner + years, 2-line tagline, skill badges, hourly rate, `hlmBtn` "View store" link). Tailwind only, no component CSS file.

- [ ] **Step 4: Run** → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/components/store-card
git commit -m "feat(client): shared Spartan store card component"
```

---

### Task 4: Public `/stores` page, route and navbar link

**Files:**
- Create: `src/app/pages/stores/stores.ts`, `stores.html`
- Modify: `src/app/app.routes.ts` (add route before `stores/:storeKey`), `src/app/components/navbar/navbar.html` (add "Browse Stores" link after "Explore Gigs", same classes, `routerLink="/stores"`, `routerLinkActive`, `[routerLinkActiveOptions]="{exact: true}"`; add to the mobile menu next to its existing links too)
- Test: `src/app/pages/stores/stores.spec.ts`

**Interfaces:**
- Consumes: `parseStoresQuery`, `toStoresQueryParams`, `sortStores`, `STORE_SORT_OPTIONS`, `StoresQuery`, `StoreSortKey`, `MAX_SEARCH_LENGTH` (Task 2); `StoreCardComponent` (Task 3); `StoreService` signals/setters.
- Produces: `StoresComponent` with public members used by the template and tests:
  - `readonly sort = signal<StoreSortKey>('rating')`, `readonly openOnly = signal(false)`
  - `readonly results = computed<StoreProfile[]>` — `sortStores(filteredStores().filter(openOnly ? isAvailable : all), sort())`
  - `readonly searchControl: FormControl<string>`
  - `setCity(city: string)`, `setCategory(cat: string)`, `setSort(key: StoreSortKey)`, `setOpenOnly(v: boolean)`, `resetFilters()` — each calls a private `syncUrl()` that runs `router.navigate([], { relativeTo: route, queryParams: toStoresQueryParams(current), queryParamsHandling: 'merge', replaceUrl: true })`.

- [ ] **Step 1: Write failing tests** (TestBed with `provideRouter(routes)` + `RouterTestingHarness`, `provideHttpClient` + `provideHttpClientTesting`; flush `GET /api/stores` with fixtures)

```ts
it('applies URL params to StoreService on load', async () => {
  await harness.navigateByUrl('/stores?city=pune&category=photography&q=reels&sort=views&open=1');
  expect(service.selectedCity()).toBe('Pune');
  expect(service.selectedCategory()).toBe('Photography');
  expect(service.searchQuery()).toBe('reels');
  expect(cmp.sort()).toBe('views'); expect(cmp.openOnly()).toBe(true);
});
it('keeps current city when URL city is unknown', ...)            // service city 'Mumbai' stays, no throw
it('writes filter changes to the URL with replaceUrl', ...)      // spy router.navigate; setCategory('Web & Tech') → queryParams include category, replaceUrl true
it('follows a navbar city change exactly once', ...)             // service.setSelectedCity('Delhi NCR'); flush effects; router.url contains city=Delhi%20NCR; navigate spy called once
it('filters to open stores and sorts results', ...)              // fixtures with isAvailable false excluded; price-asc order
it('/stores renders the list and /stores/store-7 renders detail', ...)  // harness.routeNativeElement contains app-store-card vs StoreDetailComponent instance
it('shows empty state with other-city links', ...)
```

- [ ] **Step 2: Run** `npx ng test --watch=false --include src/app/pages/stores/stores.spec.ts` → FAIL.

- [ ] **Step 3: Implement** `StoresComponent` per spec §4.3: subscribe to `route.queryParamMap` (`takeUntilDestroyed`) → `parseStoresQuery` → apply to service (city only when non-null) and local signals, patch `searchControl` with `emitEvent: false`; `searchControl.valueChanges` with `debounceTime(300)`, `distinctUntilChanged` → `setSearchQuery` + `syncUrl()`; an `effect` on `storeService.selectedCity()` that calls `syncUrl()` only when the URL's `city` param differs (read via `untracked(() => route.snapshot.queryParamMap.get('city'))`). Template: filter bar (city `hlm-select`, search `hlmInput`, category `hlm-toggle-group`, sort `hlm-select`, `hlm-switch` "Open for gigs only", reset `hlmBtn variant="ghost"`), results header "{{ results().length }} stores in {{ city }}", grid of `app-store-card`, 6 `hlm-skeleton` cards while `isLoading()`, empty state with other cities as `routerLink` + `queryParams`.

- [ ] **Step 4: Add route** `{ path: 'stores', component: StoresComponent, title: 'Browse Local Stores - AasPass' }` above `stores/:storeKey` in the "Public routes" block; add navbar links.

- [ ] **Step 5: Run** the spec → PASS; then `npx ng test --watch=false` → all pass.

- [ ] **Step 6: Commit**

```bash
git add src/app/pages/stores src/app/app.routes.ts src/app/components/navbar/navbar.html
git commit -m "feat(client): public city stores page with URL-synced filters"
```

---

### Task 5: Home landing page redesign

**Files:**
- Create: `src/app/pages/home/home.content.ts`
- Modify: `src/app/pages/home/home.ts`, `home.html`, `home.css` (keep empty or delete and drop `styleUrl`), `README.md` (stack table row "UI Components | Spartan UI | …"; mention `/stores` public page in Key Features §1), `doc/AI-doc/CHANGELOG.md` (timestamped entry following the file's existing format)
- Test: `src/app/pages/home/home.spec.ts`

**Interfaces:**
- Consumes: `topStoresForCity` (Task 2), `StoreCardComponent` (Task 3), `StoreService.selectedCity/availableCities/isLoading/stores`, helm imports (Task 1).
- Produces (in `home.content.ts`, typed `readonly` arrays):
  - `HOME_CATEGORIES: { name: string; icon: string; description: string }[]` — 6 entries whose `name` equals `StoreService.categories` minus `'All'` exactly
  - `HIRE_STEPS`, `EARN_STEPS: { title: string; description: string }[]` (3 each)
  - `COMPARISONS: { problem: string; issue: string; aaspass: string }[]` (4: Global freelance sites, Service directories, Google Maps, Apartment / society groups)
  - `VALUE_PROPS` (3), `TRUST_POINTS` (4), `FAQS: { question: string; answer: string }[]` (4)
- `HomeComponent` members: `readonly topStores = computed(() => topStoresForCity(storeService.stores(), storeService.selectedCity()))`, `readonly heroSearch = new FormControl('', { nonNullable: true })`, `findTalent(): void` → `router.navigate(['/stores'], { queryParams: { city: selectedCity(), q: trimmed q || null } })`.

- [ ] **Step 1: Write failing tests**

```ts
it('topStores is city-only, rating-ranked, max 6', ...)   // set category 'Photography' + searchQuery 'zzz' on service; topStores still lists 6 Bengaluru stores
it('findTalent navigates to /stores with city and q', ...) // heroSearch 'reels' → navigate(['/stores'], { queryParams: { city: 'Bengaluru', q: 'reels' } })
it('findTalent omits empty q', ...)                         // q: null
it('category cards match StoreService categories', ...)     // HOME_CATEGORIES names deep-equal service.categories.filter(c => c !== 'All')
```

- [ ] **Step 2: Run** `npx ng test --watch=false --include src/app/pages/home/home.spec.ts` → FAIL.

- [ ] **Step 3: Implement** the 9 sections from spec §4.2 in order (hero with city `hlm-select` bound to `selectedCity`/`setSelectedCity`, categories, `hlm-tabs` how-it-works, why AasPass, top stores with skeletons/empty state/"View all stores in {city} →", trust & safety, cities, earn CTA, `hlm-accordion` FAQ). Remove the old `searchControl` ↔ `searchQuery` sync from `home.ts`. Copy from README only.

- [ ] **Step 4: Run** the spec → PASS; `npx ng test --watch=false` → all pass; `npm run build` → success within budgets.

- [ ] **Step 5: Update README and CHANGELOG**, then commit

```bash
git add src/app/pages/home ../README.md ../doc/AI-doc/CHANGELOG.md
git commit -m "feat(client): redesign home as Spartan landing page with top stores preview"
```

---

### Task 6: Full verification and visual check

**Files:** none expected (fix-ups only).

- [ ] **Step 1:** `npx ng test --watch=false` → all specs pass.
- [ ] **Step 2:** `npm run build` → success, no budget errors.
- [ ] **Step 3:** `cd ../aaspass-service-backend; .\mvnw.cmd test-compile` → BUILD SUCCESS (unchanged backend, per AGENTS.md).
- [ ] **Step 4:** Start backend + `npm start`; in the browser check: Home (all 9 sections, city switch updates preview), `/stores?city=Pune`, `/stores?city=Atlantis&sort=nope` (falls back cleanly), navbar city change while on `/stores` updates URL, `/stores/<key>` detail still works, logged-out access to `/stores` works, 375 px mobile width has no horizontal scroll.
- [ ] **Step 5:** Regression look at Profile, Create Store, Store Detail, Auth for theme base-layer changes (borders, background, focus rings). Fix tokens in `styles.css` if anything shifted.
- [ ] **Step 6:** Commit any fix-ups: `git commit -am "fix(client): <what>"`.
