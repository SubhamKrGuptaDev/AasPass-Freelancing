# Country + City Pickers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 5-city / 9-country lists with every country and its cities via searchable Country → City pickers, and give stores a `country`.

**Architecture:** A build script turns `countries-list` + `cities.json` into a bundled `COUNTRIES` constant and lazily fetched `public/geo/cities/<CODE>.json` files; `GeoService` serves them; shared `CountryPickerComponent` / `CityPickerComponent` (signal `model()` + `ControlValueAccessor`) are used by navbar, Home, `/stores`, Create Store, Signup and Profile. `StoreService` gains `selectedCountry`; the backend `Store` gains a `country` column defaulting to `'India'`.

**Tech Stack:** Angular 22 (signals, reactive forms), Tailwind v4, Spartan UI 1.8.3 (brain combobox/autocomplete + vendored helm), Vitest; Spring Boot 4 / Java 17 / JPA / MySQL (H2 in tests).

**Spec:** `docs/superpowers/specs/2026-10-28-country-city-pickers-design.md`

## Global Constraints

- Data licences: `countries-list` (MIT) and `cities.json` (CC-BY-4.0) as **devDependencies** only. Never add `country-state-city` (GPL-3.0).
- Footer attribution text exactly: `City data © GeoNames (CC BY 4.0)`.
- Country values are English country **names** everywhere (e.g. `'India'`); default country `'India'`; default city stays `'Bengaluru'`.
- India city file always contains `Bengaluru`, `Delhi NCR`, `Mumbai`, `Pune`, `Hyderabad`.
- City picker shows at most 50 matches: prefix matches first, then contains matches, each group in list order.
- `/stores` URL params: `country`, `city`, `category`, `q`, `sort`, `open`; `country` always written; `city` omitted when empty; city capped at 100 chars.
- Backend column: `country VARCHAR(60) NOT NULL DEFAULT 'India'`; create with null/blank country → `'India'`; update with null/blank country → unchanged.
- Initial bundle must stay < 1 MB (`npm run build`); city files must not be in the bundle.
- `aaspass-client/CLAUDE.md`: no `any`, don't set `standalone: true` or `ChangeDetectionStrategy.OnPush`, signals/`input()`/`model()`/`inject()`, native control flow, no `CommonModule`, `host` object not `@HostBinding`, AXE + WCAG AA.
- `AGENTS.md` null-safety (`?.`, `??`, guarded `find()`; Java `"LIT".equals(x)`, no bare `Optional.get()`).
- Tests: `npx ng test --watch=false` (client), `.\mvnw.cmd test` (backend). Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Navbar country change while on `/stores`** — URL updates to the new country with city cleared, no navigation loop (test in Task 5).
2. **Switching country in a form when the city also exists in the new country** — city is kept; otherwise cleared (test in Task 3).
3. **City file fetch fails (offline / 404)** — picker shows no options, one toast, no crash, current value still displayed (test in Task 2 and Task 3).
4. **Existing stores without `country` in the API or DB** — treated as India and still listed under India (tests in Task 1 and Task 4).
5. **Very large city lists (e.g. US ~ 20k)** — typing stays responsive because only 50 options render (test in Task 3).

---

### Task 1: Backend — store `country`

**Files:**
- Modify: `aaspass-service-backend/src/main/java/com/aaspass/entity/Store.java` (add field near `city`), `dto/request/StoreCreateRequest.java`, `dto/request/StoreUpdateRequest.java`, `dto/response/StoreResponse.java`, `service/mapper/DtoMapper.java`, `service/StoreService.java` (`getStores`, create, update), `repository/StoreRepository.java:24-41`, `controller/StoreController.java:48-59`, `config/DataInitializer.java` (demo stores `.country("India")`)
- Test: `src/test/java/com/aaspass/controller/StoreAndUserControllerTest.java`

**Interfaces:**
- Produces (API): `StoreResponse.country: String`; `POST/PUT /api/stores` accept optional `country`; `GET /api/stores?country=`.

- [ ] **Step 1: Failing tests** in `StoreAndUserControllerTest`:
  - `testCreateStoreDefaultsCountryToIndia` — create without `country` → response `data.country == "India"`.
  - `testCreateStoreWithCountry` — create with `"country":"United States"` → `"United States"`.
  - `testGetStoresFilterByCountry` — seeded India stores + one created US store; `GET /api/stores?country=india` returns only India stores (case-insensitive), `?country=United States` returns the US one.
  - `testUpdateStoreWithoutCountryKeepsCountry` — update a US store without `country` → still `"United States"`.
- [ ] **Step 2: Run** `.\mvnw.cmd test -Dtest=StoreAndUserControllerTest` → new tests FAIL.
- [ ] **Step 3: Implement.** Entity: `@Builder.Default @Column(name = "country", nullable = false, columnDefinition = "VARCHAR(60) NOT NULL DEFAULT 'India'") private String country = "India";`. Requests: `@Size(max = 60) String country` (optional). Service create: blank/null → `"India"` (trimmed otherwise); update: apply only when non-blank. Repository: add `@Param("country") String country` with `(:country IS NULL OR :country = '' OR LOWER(s.country) = LOWER(:country))`. `getStores(String country, String city, String category, String query, Boolean availableOnly)`; controller `@RequestParam(value = "country", required = false)` and log it. Mapper `.country(store.getCountry())`.
- [ ] **Step 4: Run** `.\mvnw.cmd test` → all backend tests PASS.
- [ ] **Step 5: Commit** `feat(backend): add store country with India default and country filter`.

---

### Task 2: Geo data + `GeoService` + attribution

**Files:**
- Create: `aaspass-client/scripts/build-geo.mjs`, `src/app/geo/countries.generated.ts`, `public/geo/cities/*.json`, `src/app/services/geo/geo.service.ts`, `src/app/services/geo/geo.service.spec.ts`
- Modify: `aaspass-client/package.json` (devDeps `countries-list`, `cities.json`; script `"build:geo": "node scripts/build-geo.mjs"`), `src/app/app.html` (footer attribution)

**Interfaces:**
- Produces:
  - `interface Country { code: string; name: string }`; `export const COUNTRIES: readonly Country[]` (sorted by `name`).
  - `GeoService` (`providedIn: 'root'`): `readonly countries: readonly Country[]`; `countryByName(name: string | null | undefined): Country | undefined`; `citiesFor(countryName: string): Signal<readonly string[]>`; `isLoading(countryName: string): Signal<boolean>`.

- [ ] **Step 1: Generate data.** `npm i -D countries-list cities.json`; write `build-geo.mjs` (Node ESM, no network): read `countries-list` `countries` (keyed by ISO2 → `.name`) and `cities.json` (array of `{ name, country }`); per country: trim names, drop empty, de-duplicate case-insensitively, merge the India extras, sort with `localeCompare`, write `public/geo/cities/<CODE>.json`; write `countries.generated.ts` with a "generated — do not edit; run npm run build:geo" header. Run `npm run build:geo`; confirm `public/geo/cities/IN.json` contains all five India extras and `US.json` exists.
- [ ] **Step 2: Failing tests** (`geo.service.spec.ts`, `HttpTestingController`):
  - `countryByName('  india ')?.code === 'IN'`; unknown → `undefined`.
  - `citiesFor('India')` triggers one `GET geo/cities/IN.json`; flush `['Pune','Bengaluru']` → signal equals that array; second `citiesFor('India')` makes no new request.
  - failed request (404) → `citiesFor` signal `[]`, `isLoading` false, exactly one error toast in `ToastService.toasts()`.
  - unknown country → `[]`, no request.
- [ ] **Step 3: Run** `npx ng test --watch=false --include src/app/services/geo/geo.service.spec.ts` → FAIL.
- [ ] **Step 4: Implement** `GeoService`: request URL `geo/cities/${code}.json` (relative, resolves against base href; not via `API_BASE_URL`), use `SKIP_ERROR_TOAST` context and raise one toast yourself on error; cache per code in a `Map<string, WritableSignal<readonly string[]>>`.
- [ ] **Step 5: Footer** in `app.html`: add `City data © GeoNames (CC BY 4.0)` linking to `https://www.geonames.org/` (`rel="noopener"`, `target="_blank"`).
- [ ] **Step 6: Run** the spec → PASS; `npm run build` → OK and `public/geo` files are copied as assets (not in the initial chunk list).
- [ ] **Step 7: Commit** `feat(client): generated country/city data and GeoService`.

---

### Task 3: `CountryPickerComponent` + `CityPickerComponent`

**Files:**
- Create: `src/app/components/location-picker/country-picker.ts` (+ `.html`), `city-picker.ts` (+ `.html`), `filter-cities.ts`, `location-picker.spec.ts`
- Vendor if needed: Spartan helm for the combobox/autocomplete used (same process as before: render the official 1.8.3 templates; add `@spartan-ng/helm/<name>` path alias in `tsconfig.json`)

**Interfaces:**
- Consumes: `GeoService` (Task 2).
- Produces:
  - `filterCities(cities: readonly string[], term: string, limit = 50): string[]` — prefix matches first, then contains, case-insensitive, max `limit`; empty term → first `limit`.
  - `<app-country-picker [(value)]="…" label inputId placeholder />` and `formControlName` support; `value = model<string>('')`.
  - `<app-city-picker [country]="…" [(value)]="…" label inputId placeholder />` and `formControlName` support; `country = input.required<string>()`, `value = model<string>('')`.
  - Both: `disabled` via CVA `setDisabledState`; emit on selection only (not on every keystroke).

- [ ] **Step 1: Failing tests:**
  - `filterCities(['Pune','Puducherry','Kanpur','Ahmedabad'], 'pu')` → `['Pune','Puducherry','Kanpur']`; 20k generated names + term `'a'` → length 50.
  - Country picker: typing `ind` shows `India` (and `Indonesia`); selecting sets `value()` to `'India'`; in a `FormGroup`, `setValue('Canada')` displays Canada, selection calls `onChange('India')`, disabled control disables the input.
  - City picker: with `country='India'` and cities flushed, typing `pun` lists `Pune` first; changing `country` to a country whose list lacks the city clears `value` to `''`; to one that contains it keeps it; when the city file fails, no options render and current value text still shows.
  - Accessibility: input has an associated `<label>` (visible or `sr-only`) and `role="combobox"` with `aria-expanded`.
- [ ] **Step 2: Run** `npx ng test --watch=false --include src/app/components/location-picker/location-picker.spec.ts` → FAIL.
- [ ] **Step 3: Implement** with Spartan brain combobox or autocomplete (pick whichever 1.8.3 primitive supports free-text filtering with a bounded option list; record which in the commit body). Keep options to `filterCities(...)` output.
- [ ] **Step 4: Run** the spec → PASS; full suite → PASS; `npm run build` → OK.
- [ ] **Step 5: Commit** `feat(client): searchable country and city pickers`.

---

### Task 4: Country in `StoreService` and `store-query`

**Files:**
- Modify: `src/app/services/store/store.service.ts`, `src/app/services/store/store-query.ts`, `src/app/models/store.model.ts`, `src/app/models/response.model.ts`, `src/app/models/request.model.ts`
- Test: `store.service.spec.ts`, `store-query.spec.ts`

**Interfaces:**
- Consumes: `COUNTRIES` (Task 2).
- Produces:
  - `StoreProfile.country: string`; `BackendStoreResponse.country?: string`; `CreateStorePayload.country?: string`; `UpdateStorePayload.country?: string`.
  - `StoreService.selectedCountry: WritableSignal<string>` (default `'India'`); `setSelectedCountry(name: string): void` (sets city to `''` when the country actually changes); `citiesWithStores: Signal<string[]>` (distinct cities of stores in `selectedCountry`, sorted); mapping sets `country: s.country || 'India'`.
  - `filteredStores` also filters `store.country` (case-insensitive) and treats `selectedCity() === ''` as "all cities".
  - `StoresQuery.country: string | null`; `parseStoresQuery(params: ParamMap, countries: readonly Country[], categories: readonly string[]): StoresQuery` (country canonical name or `null`; city = trimmed string ≤ 100 chars or `null`); `toStoresQueryParams` writes `country` always and `city` only when non-empty.
  - Keep `availableCities` / `availableCountries` for now (removed in Task 6).

- [ ] **Step 1: Failing tests:** country filter (India vs US stores), store with no country listed under India, `setSelectedCountry('United States')` clears city, `citiesWithStores` distinct+sorted for India, `parseStoresQuery` with `country=india&city=  Pune ` → `{ country: 'India', city: 'Pune' }`, unknown country → `null`, 150-char city → 100 chars, `toStoresQueryParams` omits empty city.
- [ ] **Step 2: Run** the two specs → FAIL.
- [ ] **Step 3: Implement** per Interfaces; update existing callers so the build compiles (`StoresComponent` passes `COUNTRIES`; country-less behaviour unchanged until Task 5).
- [ ] **Step 4: Run** full suite → PASS; `npm run build` → OK.
- [ ] **Step 5: Commit** `feat(client): store country filter and country-aware stores query`.

---

### Task 5: Browsing UI — `/stores`, Home, navbar

**Files:**
- Modify: `src/app/pages/stores/stores.{ts,html}`, `src/app/pages/home/home.{ts,html}`, `src/app/components/navbar/navbar.{ts,html}`
- Test: `stores.spec.ts`, `home.spec.ts`, new `navbar.spec.ts` if none exists

**Interfaces:**
- Consumes: pickers (Task 3), `selectedCountry`, `setSelectedCountry`, `citiesWithStores`, `StoresQuery.country` (Task 4).

- [ ] **Step 1: Failing tests:**
  - `/stores?country=united%20states&city=Austin` → `selectedCountry() === 'United States'`, `selectedCity() === 'Austin'`; `?country=Atlantis` keeps current country and URL is rewritten with the canonical country.
  - Navbar country change while on `/stores` → URL has new `country`, no `city`, navigation called once (loop guard like the existing city effect).
  - Home: hero submit navigates with `{ country, city, q }` (empty city/q → `null`); "Cities we serve" chips equal `citiesWithStores()` and link with `{ country, city }`; with no stores in the country shows `No stores in {country} yet`; the stat shows `citiesWithStores().length`.
- [ ] **Step 2: Run** the specs → FAIL.
- [ ] **Step 3: Implement:** replace city `hlm-select`s with country + city pickers bound to `selectedCountry` / `selectedCity` (via `setSelectedCountry` / `setSelectedCity`); navbar: replace the custom city dropdown with a popover holding both pickers, trigger text `"{city}, {country}"` or `"{country}"` when no city; keep the existing `hidden md:inline-flex` visibility. Empty-state "other cities" links in `/stores` use `citiesWithStores()` minus the current city.
- [ ] **Step 4: Run** full suite → PASS; `npm run build` → OK.
- [ ] **Step 5: Commit** `feat(client): country and city pickers for browsing`.

---

### Task 6: Forms — Create/Edit Store, Signup, Profile; cleanup; docs

**Files:**
- Modify: `src/app/pages/create-store/create-store.{ts,html}`, `src/app/pages/auth/auth-page.{ts,html}`, `src/app/pages/profile/profile.{ts,html}`, `src/app/services/store/store.service.ts` (remove `availableCities`, `availableCountries`), `src/app/services/auth/auth.service.ts` (map store `country`), `README.md`, `doc/AI-doc/CHANGELOG.md`
- Test: `profile.spec.ts`, new `create-store.spec.ts`, auth page spec if present

**Interfaces:**
- Consumes: pickers via `formControlName` (Task 3), `CreateStorePayload.country` (Task 4).

- [ ] **Step 1: Failing tests:** Create Store form has a `country` control defaulting to the user's country ?? `'India'`; submit payload includes `country`; Profile and Signup render `app-country-picker` + `app-city-picker` bound to `country` / `city` controls; no component references `availableCountries` (compile-level: arrays removed).
- [ ] **Step 2: Run** the specs → FAIL.
- [ ] **Step 3: Implement**; remove `AuthPageComponent.availableCountries` and both `StoreService` arrays; replace every `<select>` of countries/cities and the signup city text input.
- [ ] **Step 4: Docs:** README — Key Features city selector line becomes "Country → city selector covering every country (GeoNames data)"; mention `npm run build:geo`. CHANGELOG — new top entry in the existing format.
- [ ] **Step 5: Run** full client suite + `npm run build` + backend `.\mvnw.cmd test` → all PASS.
- [ ] **Step 6: Commit** `feat(client): country and city pickers in store, signup and profile forms`.

---

### Task 7: Verification

- [ ] `npx ng test --watch=false`, `npm run build` (initial < 1 MB; `geo/cities/*.json` not in initial chunks), `.\mvnw.cmd test` → all pass.
- [ ] Browser (controller): India → Pune on `/stores`; switch to United States and pick a city; `?country=Atlantis`; navbar change while on `/stores`; Create Store and Profile pickers save and reload; 375 px width without horizontal scroll; keyboard-only selection in both pickers; footer attribution visible.
