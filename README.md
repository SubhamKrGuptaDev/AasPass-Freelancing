# AasPass (आस-पास) - Hyperlocal Freelancing & Gig Marketplace

**AasPass** is a neighborhood-first freelancing and gig platform designed to connect skilled individuals, students, and side-hustlers with clients in their immediate vicinity (2 to 10 km).

---

## 💡 The Core Vision

### The Problem
* **Global Freelance Sites (Upwork, Fiverr):** Highly saturated, steep 20% commission fees, and impossible for newcomers to win clients without hundreds of past reviews.
* **Service Directories (Urban Company):** Strictly standardized for manual household repairs (plumbing, cleaning, AC service), completely ignoring creative, digital, and professional skills.
* **Google Maps:** Only caters to brick-and-mortar commercial storefronts. A student editing reels or a developer doing weekend projects cannot list a commercial shop address on Google Maps without exposing their private home.
* **Apartment / Society Groups:** Local demand currently hides in unorganized WhatsApp and society groups where requests get buried in chat streams.

### The AasPass Solution
AasPass bridges this gap by creating **Neighborhood Skill Storefronts**:
* **Physical Proximity & Trust:** Hire someone 1–3 km away whom you can meet at a local cafe or collaborate with in person.
* **Low Barrier for Newcomers:** Tailored for students and individuals new to a city wanting flexible side income without needing a physical commercial shop.
* **Zero Commission:** AasPass takes no commission on your earnings.
* **Anyone Can Open a Store:** A pandit, astrologer, car driver, teacher, self-defense coach, home cook, tailor or anyone with a skill that neighbors would value can open a store.
* **Fast Turnaround:** Direct, neighborhood-speed execution for same-day video edits, tutoring, photography, web fixes, or event support.

---

## 👥 Architecture: Unified Account Model (Option A)

AasPass implements a **single, unified account model** (similar to Airbnb and OLX):
1. **Any User Can Hire:** Upon signup, every user can search, filter by proximity, and hire local service providers.
2. **Any User Can Earn:** Users can click **"List Your Services / Open Store"** at any time to launch their own digital storefront and start receiving gigs.

---

## ✨ Key Features & User Journey

### 1. Proximity-Based Discovery & Search
* **Radius Filters:** Find talent within **2 km**, **5 km**, **10 km**, or across the **Entire City**.
* **City Selector:** Country → city selector covering every country (GeoNames data).
* **Category Filtering:**
  * 🎬 Video & Short Reels Editing
  * 💻 Web, App & Tech Development
  * 📷 Event & Product Photography
  * 📚 Tutoring & Mentorship
  * 🎨 Graphics, Logos & Brand Design
  * 🛠️ Tech Support, PC Builds & Hardware Setup
  * 🔮 Astrology & Spiritual (puja and astrology)
  * 🚗 Driving & Transport
  * 🥋 Fitness & Self-Defense
  * 🎵 Art, Music & Hobbies (drawing and music classes)
  * 🏠 Home & Personal Services (cooking, tailoring)
* **Public Stores Page:** Browse every store at `/stores` without signing in, with city, category, search, sort and "Open for gigs" filters kept in the URL.

### 2. Digital Skill Storefronts
* **Public Profile:** Showcases bio, years of experience, standard hourly rate, and starting gig price.
* **Service Packages:** Transparent offerings with turnaround times (e.g. *30-sec Instagram Reel – ₹450 / 24 hrs*).
* **Verified Social Media:** Direct links to Instagram, LinkedIn, GitHub, and external portfolios.
* **Inquiry & Direct Booking:** One-click service booking requests and callback requests.

### 3. Store Creation with Real-Time Live Preview
* Form capturing store identity, category, hourly rates, neighborhood radius, and social media links.
* **Live Preview Card:** Visualizes how the store card will appear to neighbors in real time before publishing.

### 4. Comprehensive User Profile & Verification
* **Personal Details:** Name, email, phone, neighborhood area, city, and bio (with inline editing).
* **Government ID & KYC:**
  * **Aadhaar Card:** 12-digit identity verification stored AES-256-GCM encrypted and shown masked (`XXXXXXXX1234`) with verified badges.
  * **PAN Card:** 10-character tax and payout identification, encrypted at rest and shown masked (`XXXXXX234F`).
* **Store Management Dashboard:** View store performance, quick edit shortcut, and toggle availability (**Open For Gigs** vs. **Paused**).

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | Angular 22 | Modern Standalone Components, Signal-based reactive state |
| **Styling** | Tailwind CSS v4 | Responsive utility-first design, modern gradients & micro-interactions |
| **UI Components** | Spartan UI | Accessible `@spartan-ng/helm` components (select, tabs, accordion, card, badge, button) with Lucide icons |
| **Backend** | Spring Boot 4.x / Java 17 | REST APIs, Spring Data JPA, Hibernate, Java 17 Records, Maven |
| **Security** | Spring Security, JWT in HttpOnly cookies | Access/refresh cookie sessions, CSRF protection, BCrypt(12), AES-256-GCM encrypted KYC |
| **Database** | MySQL 8.x | Relational persistence, connection pooling |
| **Documentation** | Markdown Dossiers | `doc/PROJECT_DETAILS.md` (Master Spec) & `doc/AI-doc/CHANGELOG.md` |

---

## 📁 Repository Structure

```
AasPass-Freelancing/
├── aaspass-client/               # Angular 22 Frontend Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/       # Shared UI components (Navbar, Toaster, SocialLinks)
│   │   │   ├── config/           # API configuration (api.config.ts)
│   │   │   ├── guards/           # Functional route guards (authGuard)
│   │   │   ├── models/           # TypeScript interfaces (User, Store, Requests, Responses)
│   │   │   ├── pages/            # Page components (Home, StoreDetail, CreateStore, Profile, Auth)
│   │   │   └── services/         # Reactive signal services (StoreService, AuthService)
│   │   └── styles.css            # Tailwind CSS imports & global styles
│   └── package.json
├── aaspass-service-backend/      # Spring Boot Java 17 Backend Application
│   ├── src/main/java/com/aaspass/
│   │   ├── config/               # WebMvcConfig, DataInitializer, Logging filters
│   │   │   └── security/         # SecurityConfig, cookie bearer resolver, JWT validators, CurrentUser
│   │   ├── controller/           # REST Controllers (Auth, Store, User, Reviews, Services)
│   │   ├── dto/                  # Java 17 Records (Request, Response, Common)
│   │   ├── entity/               # JPA Entities (User, Store, Address, Reviews, etc.)
│   │   ├── exception/            # GlobalExceptionHandler & Custom Exceptions
│   │   ├── repository/           # Spring Data JPA Repositories
│   │   ├── service/              # Business Service layer & DtoMapper
│   │   ├── security/             # token (JWT, cookies), session and crypto (KYC) services
│   │   └── util/                 # Helper utilities (AvatarGenerator)
│   ├── src/main/resources/       # application.properties (Datasource & JPA)
│   └── pom.xml
├── doc/
│   ├── AI-doc/
│   │   └── CHANGELOG.md          # AI development log with timestamped records
│   └── PROJECT_DETAILS.md        # Complete master project specifications & architecture
├── AGENTS.md                     # Engineering guidelines, zero-assumptions & coding standards
└── README.md                     # Project overview and quick start guide
```

---

## 🚀 Getting Started

> Day-to-day commands (build, test, cache cleanup, troubleshooting) are listed in [COMMANDS.md](COMMANDS.md).

### Prerequisites
* **Java 17 LTS** (JDK 17) & **Maven**
* **Node.js** (v20+ recommended) & **npm**
* **MySQL 8.x** running locally on port `3306`

### Running the Backend Service
1. Ensure MySQL is running and the database exists:
   ```sql
   CREATE DATABASE IF NOT EXISTS aaspass;
   ```
2. Navigate to `aaspass-service-backend` and run the application:
   ```powershell
   cd aaspass-service-backend
   .\mvnw.cmd spring-boot:run
   ```
   *(On macOS / Linux use `./mvnw spring-boot:run`)*  
   The backend REST API will be available at `http://localhost:8080/api`. Default demo accounts will be auto-seeded on initial launch if the database is empty.

### Running the Frontend
In a separate terminal:
```powershell
cd aaspass-client
npm install
npm start
```
Navigate to `http://localhost:4200` to access the application.

`npm start` runs the Angular dev server with a proxy (`proxy.conf.json`) that forwards `/api` to `http://localhost:8080`, so the browser talks to a single origin and the auth cookies work without CORS. API errors and confirmations (login, logout, KYC saved, review posted, ...) are shown through a shared toaster.

The country and city lists are static files in `public/geo`. `npm run build:geo` regenerates them from the `countries-list` and `cities.json` packages (only needed when updating the data).

---

### 🔑 Default Demo Accounts

| Username | Email | Password | Role / Account Type |
| :--- | :--- | :--- | :--- |
| `aman` | `aman.sharma@example.com` | `password123` | Regular User / Neighbor (Indiranagar, Bengaluru) |
| `priya` | `priya.nair@example.com` | `password123` | Store Owner: PixelCraft Studios (Video Editing) |
| `rohan` | `rohan.gupta@example.com` | `password123` | Store Owner: FullStack Craft (Web & Tech) |

Passwords are stored as BCrypt (cost 12) hashes; the seeded demo accounts all use `password123`.

---

### Authentication & Security Model

* **Cookie-based JWT sessions.** Tokens are never exposed to JavaScript or stored in `localStorage`.

  | Cookie | Purpose | Lifetime | Flags |
  | :--- | :--- | :--- | :--- |
  | `_sid` | Access JWT | 15 minutes | HttpOnly, SameSite=Lax, Path `/api` |
  | `_rid` | Refresh token | 30-day absolute session | HttpOnly, SameSite=Strict, Path `/api/auth` |

* `Secure` is applied automatically on every host except `localhost`, `127.0.0.1` and `::1`. `Domain` is never set on localhost/IP hosts; elsewhere it is set only when `AASPASS_COOKIE_DOMAIN` is provided.
* **CSRF:** the backend issues an `XSRF-TOKEN` cookie and requires its value in the `X-XSRF-TOKEN` header on state-changing requests (the Angular client does this automatically).
* **Refresh-token rotation with reuse detection:** every `POST /api/auth/refresh` issues a new `_rid`. Replaying an already-rotated refresh token revokes the whole session. A logged-out or revoked session can never be rejoined. The client silently refreshes on a 401 and ends the session only when the refresh itself is rejected. A failed refresh clears both cookies.
* **Passwords** are hashed with BCrypt (cost 12). Legacy plaintext passwords are migrated at startup.
* **KYC data:** Aadhaar and PAN are encrypted at rest with AES-256-GCM and only ever returned masked (`XXXXXXXX1234`, `XXXXXX234F`). They are updated through `PUT /api/users/me/kyc`.
* **Authorization:** catalog reads (stores, reviews, services, public user profiles) and login/register/refresh/logout are public. Everything else requires a valid session, and writes are owner-only (a user can only modify their own profile, addresses and stores). The review form is hidden from a store's own owner in the UI only; the server does not enforce this.

### Configuration, Secrets & Production

The backend resolves its secrets from environment variables:

| Variable | Required in production | Format |
| :--- | :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | Yes (set to anything other than `dev`, e.g. `prod`) | profile name |
| `AASPASS_JWT_SECRET` | Yes | base64, at least 32 bytes |
| `AASPASS_KYC_KEY` | Yes | base64, exactly 32 bytes |
| `AASPASS_COOKIE_DOMAIN` | Optional | cookie `Domain` for real hostnames |

Generate keys with:
```bash
openssl rand -base64 48   # AASPASS_JWT_SECRET
openssl rand -base64 32   # AASPASS_KYC_KEY
```

For the full production checklist, including the admin panel, see [Production configuration](#production-configuration).

> **Warning:** the `dev` profile is the default (`spring.profiles.default=dev`) and its committed JWT/KYC keys in `application-dev.properties` are **DEV ONLY**. Never run production on them. Environment variables always override the dev keys. Rotating `AASPASS_KYC_KEY` makes existing encrypted KYC values unreadable, so back it up.

### Verifying the Auth Flow Locally

With MySQL running, start the backend (`.\mvnw.cmd spring-boot:run`; the first start migrates existing plaintext passwords/KYC data in your local database, so back it up if it matters) and the client (`npm start`), then:

1. Log in as `aman` / `password123`. In DevTools > Application > Cookies, `_sid` and `_rid` are HttpOnly, and `localStorage` holds no tokens or user data.
2. Open Profile: Aadhaar shows `XXXXXXXX7777`.
3. Reload the page: you stay logged in (session restored from the cookie).
4. Delete only the `_sid` cookie and perform any action: the client silently refreshes and the action succeeds.
5. Log in with a wrong password: an error toast is shown.
6. Log out: a toast confirms it, and opening a protected page redirects to login.
7. In MySQL: `users.aadhar_number` starts with `enc:v1:` and `users.password` starts with `$2`.

---

## 📋 Development Roadmap

- [x] **Phase 1: Project Alignment & Architecture Design**
  - [x] Concept validation and global/local market comparison.
  - [x] Adoption of Option A (Unified Account Model).
- [x] **Phase 2: Core Frontend Flows**
  - [x] Proximity discovery and distance-radius search (2km, 5km, 10km, City).
  - [x] Store detail pages with service packages and dual verified social channels.
  - [x] Store registration flow with real-time live preview.
  - [x] Profile management with multi-store ownership and multi-address book.
  - [x] Store engagement view analytics (Daily, Weekly, Monthly, Lifetime).
- [x] **Phase 3: Backend REST Services & Persistence**
  - [x] Spring Boot 4.x layered architecture (Controller, Service, JPA Repository).
  - [x] Domain entities with two-tier superclasses (`BaseIdEntity`, `BaseAuditEntity`).
  - [x] MySQL database persistence with Hibernate DDL updates.
  - [x] Modern Java 17 immutable Records for request/response DTOs.
  - [x] Store, Gig Package, Review, and User Address CRUD endpoints.
  - [x] End-to-end API call logging (`ApiLoggingFilter`) and Global Exception Handling.
- [x] **Phase 4: Authentication & Client Integration**
  - [x] Username/email & password authentication with pre-seeded demo accounts.
  - [x] JWT authentication in HttpOnly cookies with rotating refresh tokens, CSRF protection and server-side sessions.
  - [x] Encrypted Aadhaar/PAN storage with masked display, owner-only writes and BCrypt(12) passwords.
  - [x] Dev proxy and shared toaster for API errors and confirmations.
  - [x] Context-aware login popup modal with route interception via `authGuard`.
  - [x] Full-stack REST integration connecting Angular client to Spring Boot endpoints.
  - [x] Aadhaar and PAN KYC tracking with masked security formatting.
- [ ] **Phase 5: Spatial Indexing & Neighborhood Escrow**
  - [ ] Geolocation / spatial indexing (MySQL GIS `ST_Distance_Sphere`) for coordinate queries.
  - [ ] Phone OTP login.
  - [ ] In-app direct chat (WebSocket / STOMP).
  - [ ] Milestone-based payment escrow for gig completion.

---

> For exhaustive architectural details, ER schemas, and complete API specifications, see **[`doc/PROJECT_DETAILS.md`](doc/PROJECT_DETAILS.md)**.

---

## Admin Panel

`aaspass-admin/` is a separate Angular app for AasPass staff (store moderation, user KYC and suspension, dashboard). It talks to the admin API under `/api/admin` with its own JWT and cookies, and runs on <http://localhost:4300> (`npm start` inside `aaspass-admin`). See `COMMANDS.md` for details.

---

## Production configuration

Every production deployment must set these. The committed fallbacks in `application-dev.properties` are DEV ONLY.

| Setting | Required | Notes |
| :--- | :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | Yes | e.g. `prod`. It must not fall back to `dev`: `spring.profiles.default=dev` would load the dev secrets and the well-known dev admin (`admin@aaspass.local` / `admin12345`). The backend logs an ERROR at startup if it seeds an admin with that dev password. |
| `AASPASS_JWT_SECRET` | Yes | Marketplace JWT signing key, base64, at least 32 bytes (`openssl rand -base64 48`). |
| `AASPASS_KYC_KEY` | Yes | AES-256-GCM key for Aadhaar/PAN, base64, exactly 32 bytes (`openssl rand -base64 32`). Back it up: rotating it makes stored KYC unreadable. |
| `AASPASS_ADMIN_JWT_SECRET` | Yes | Admin-panel JWT signing key, base64, at least 32 bytes. Use a different value from `AASPASS_JWT_SECRET`. |
| `AASPASS_ADMIN_EMAIL` / `AASPASS_ADMIN_PASSWORD` / `AASPASS_ADMIN_NAME` | Yes for the first start | Seed the first administrator when no admin exists yet (the name is optional, default `AasPass Admin`). Use a strong, unique password. |
| `AASPASS_CORS_ORIGINS` | Yes | Comma-separated origins of the marketplace client and the admin app, e.g. `https://aaspass.com,https://admin.aaspass.com`. |
| `AASPASS_COOKIE_DOMAIN` | Optional | Cookie `Domain` for real hostnames. If set to a parent domain (e.g. `aaspass.com`), the client and admin apps share the `XSRF-TOKEN` cookie, and admin login/logout rotates it: expect one CSRF retry in the other app. |
| Admin app public-site URL | Yes | `publicSiteUrl` in `aaspass-admin/src/environments/environment.ts` (production build; placeholder `https://aaspass.com`) is used for "View public page" links. Change it to your marketplace host before `npm run build`. Development builds use `environment.development.ts` (`http://localhost:4200`). |
