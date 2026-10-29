# Country + City Pickers — Design

**Date:** 2026-10-28
**Branch:** `feature/country-city-pickers` (from `main` at `cd36c1b`)
**Scope:** `aaspass-client` (pickers, data, browsing, forms) and `aaspass-service-backend` (store `country`).

## 1. Goal

Replace the hard-coded 5-city list and the duplicated 9-country lists with every country and its cities, chosen through searchable Country → City pickers, and give stores a `country`.

### Decisions made with the user

| Topic | Decision |
| :--- | :--- |
| City scope | Pick a country, then any city of that country |
| Data source | Static per-country files generated at build time (no backend geo API) |
| Placement | Browsing (navbar, Home hero, `/stores`), Create/Edit Store, Signup & Profile |
| Licences | `countries-list` (MIT) + `cities.json` (CC-BY-4.0, GeoNames). **Never** `country-state-city` (GPL-3.0) |

### Out of scope

- Currency (stays ₹), states/districts, distance or geolocation.
- Backend validation that a city exists (backend only requires non-blank values, as today).

## 2. Existing system

- `StoreService.availableCities` = `['Bengaluru', 'Delhi NCR', 'Mumbai', 'Pune', 'Hyderabad']`, used by: navbar location dropdown (custom Tailwind), Home hero (`hlm-select`) and "Cities we serve" chips + "5 cities" stat, `/stores` filter (`hlm-select`) and `parseStoresQuery` whitelist, Create Store (native `<select>`), Profile (native `<select>`); Signup has a city text input.
- `StoreService.availableCountries` and `AuthPageComponent.availableCountries` duplicate a 9-country list (Profile and Signup country `<select>`).
- `StoreService.selectedCity` (default `'Bengaluru'`) + `filteredStores` filter by city; `store-query.ts` parses `/stores` URL params (`city` canonicalised against `availableCities`).
- Users already have `country` (name string, default `'India'`). Stores have only `area` + `city` (backend `Store` entity, `StoreCreateRequest`, `StoreUpdateRequest`, `StoreResponse`; `GET /api/stores?city=` via `storeRepository.searchStores(city, category, query, availableOnly)`).
- Hibernate `ddl-auto=update` (main), `create-drop` (tests, H2).

## 3. Geo data (build time)

- Dev dependencies: `countries-list`, `cities.json`.
- Script `aaspass-client/scripts/build-geo.mjs` (run via `npm run build:geo`; outputs are committed, so normal builds do not need it):
  - `src/app/geo/countries.generated.ts` — `export const COUNTRIES: readonly { code: string; name: string }[]` (ISO-3166 alpha-2 code, English name), sorted by name.
  - `public/geo/cities/<CODE>.json` — JSON array of unique city names (trimmed, de-duplicated case-insensitively, sorted with `localeCompare`), one file per country that has cities.
  - Always-merged extras so existing data keeps working: India (`IN`) gets `Bengaluru`, `Delhi NCR`, `Mumbai`, `Pune`, `Hyderabad` even if GeoNames spells them differently.
- Attribution in the app footer: "City data © GeoNames (CC BY 4.0)".
- Country values stored and used everywhere are the **country name** (matches existing `user.country` values such as `'India'`).

## 4. Frontend units

### 4.1 `GeoService` (`src/app/services/geo/geo.service.ts`, `providedIn: 'root'`)
- `readonly countries = COUNTRIES` (sync).
- `countryByName(name: string | null | undefined): { code; name } | undefined` — case-insensitive, trimmed.
- `citiesFor(countryName: string): Signal<readonly string[]>` — lazily `GET /geo/cities/<CODE>.json` (relative to the app base href, not `/api`), cached per code; unknown country or failed fetch → empty list and one error toast via the existing `ToastService`; never throws.
- `isLoading(countryName)`: `Signal<boolean>`.

### 4.2 `CountryPickerComponent` and `CityPickerComponent` (`src/app/components/location-picker/`)
- Spartan brain combobox/autocomplete-based searchable pickers (type to filter, keyboard navigation, visible or `sr-only` label, AXE/WCAG AA).
- Each supports both usages:
  - signal binding: `value = model<string>('')`;
  - reactive forms: implements `ControlValueAccessor` (`NG_VALUE_ACCESSOR`).
- `CityPickerComponent` input `country = input.required<string>()`; shows the first 50 matches for the typed text (prefix matches first, then contains); when the country changes, the city value is cleared unless it exists in the new country's list.
- Inputs: `label`, `inputId`, `placeholder`; disabled state supported.

### 4.3 Browsing
- `StoreService`: add `selectedCountry = signal('India')` + `setSelectedCountry(name)` (sets city to `''` when the country changes); remove `availableCities` and `availableCountries`; `filteredStores` filters `store.country` (missing → `'India'`) and, when `selectedCity()` is non-empty, `store.city` case-insensitively.
- New computed `citiesWithStores` = distinct `city` values of stores in `selectedCountry`, sorted.
- `store-query.ts`: `StoresQuery` gains `country: string | null`; `parseStoresQuery(params, countries, categories)` canonicalises `country` against `COUNTRIES` names (unknown → `null`), and accepts `city` as any trimmed string capped at 100 chars (empty → `null`); `toStoresQueryParams` always writes `country` and `city` (city omitted when empty).
- `/stores`: country + city pickers in the filter bar; URL `?country=India&city=Pune`; unknown country falls back to the current `selectedCountry`.
- Home: hero uses the pickers; "Find talent" sends `country`, `city`, `q`; the "Cities" stat and "Cities we serve" chips use `citiesWithStores` (chips link to `/stores?country=…&city=…`; if empty, show "No stores in {country} yet").
- Navbar: the location dropdown is replaced by a compact popover holding both pickers, showing "City, Country" (or just the country when no city is chosen).

### 4.4 Forms
- Create/Edit Store: country + city pickers (default country = user's country ?? `'India'`); payload sends `country`.
- Signup and Profile: country + city pickers replace the `<select>`s/text input; remove the duplicated country arrays.
- `StoreProfile`, `BackendStoreResponse`, `CreateStorePayload`, `UpdateStorePayload` gain `country`.

## 5. Backend

- `Store` entity: `@Builder.Default @Column(name = "country", nullable = false, columnDefinition = "VARCHAR(60) NOT NULL DEFAULT 'India'") private String country = "India";` — Hibernate `update` adds the column and MySQL fills existing rows with `'India'`.
- `StoreCreateRequest` / `StoreUpdateRequest`: optional `country` (`@Size(max = 60)`); create: blank/null → `'India'`; update: null → unchanged, blank → validation error-free no-op (unchanged).
- `StoreResponse` + `DtoMapper`: `country`.
- `GET /api/stores?country=` → `StoreService.getStores(country, city, …)` → repository filter `(:country IS NULL OR LOWER(s.country) = LOWER(:country))`; city filter also becomes case-insensitive.
- `DataInitializer` demo stores: `country("India")`.
- Tests: create without country → `'India'`; filter by country; case-insensitive city.

## 6. Error handling & edge cases

- City file fetch failure: empty list + one toast; pickers still allow the current value to display.
- Unknown `?country=` → current country; overlong `city` truncated to 100; city not in the dataset is still accepted (filters to zero stores, empty state shown).
- Stores from before the change have `country = 'India'` (DB default); frontend treats a missing `country` as `'India'`.

## 7. Testing

- Unit: `GeoService` (lookup, caching, failure), pickers (search ordering, cap 50, clear-on-country-change, CVA write/emit/disable), `store-query` country parsing, `StoreService` country filter + `citiesWithStores`, `/stores` URL sync with country.
- Backend: country default, filter, update behaviour.
- Verification: `npm test`, `npm run build` (initial bundle must stay < 1 MB; city files are not in the bundle), backend `mvnw test`, browser check (India → Pune, switch to United States → pick a city, invalid `?country=`, 375 px width, Create Store and Profile pickers).

## 8. Files touched (expected)

- New: `scripts/build-geo.mjs`, `src/app/geo/countries.generated.ts`, `public/geo/cities/*.json`, `src/app/services/geo/*`, `src/app/components/location-picker/*`.
- Changed (client): `package.json`, `store.service.ts`, `store-query.ts`, `pages/stores/*`, `pages/home/*`, `components/navbar/*`, `pages/create-store/*`, `pages/profile/*`, `pages/auth/*`, models, app footer (`app.html`), README + CHANGELOG.
- Changed (backend): `Store`, `StoreCreateRequest`, `StoreUpdateRequest`, `StoreResponse`, `DtoMapper`, `StoreService`, `StoreRepository`, `StoreController`, `DataInitializer`, tests.
