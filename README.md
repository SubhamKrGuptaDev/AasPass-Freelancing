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
* **City Selector:** Switch between cities (Bengaluru, Delhi NCR, Mumbai, Pune, Hyderabad).
* **Category Filtering:**
  * 🎬 Video & Short Reels Editing
  * 💻 Web, App & Tech Development
  * 📷 Event & Product Photography
  * 📚 Tutoring & Mentorship
  * 🎨 Graphics, Logos & Brand Design
  * 🛠️ Tech Support, PC Builds & Hardware Setup

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
  * **Aadhaar Card:** 12-digit identity verification with masked security display (`XXXX-XXXX-8921`) and verified badges.
  * **PAN Card:** 10-character tax and payout identification for secure earnings.
* **Store Management Dashboard:** View store performance, quick edit shortcut, and toggle availability (**Open For Gigs** vs. **Paused**).

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | Angular 22 | Modern Standalone Components, Signal-based reactive state |
| **Styling** | Tailwind CSS v4 | Responsive utility-first design, modern gradients & micro-interactions |
| **Backend** | Spring Boot 4.x / Java 17 | REST APIs, Spring Data JPA, Hibernate, Java 17 Records, Maven |
| **Database** | MySQL 8.x | Relational persistence, connection pooling |
| **Documentation** | Markdown Dossiers | `doc/PROJECT_DETAILS.md` (Master Spec) & `doc/AI-doc/CHANGELOG.md` |

---

## 📁 Repository Structure

```
AasPass-Freelancing/
├── aaspass-client/               # Angular 22 Frontend Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/       # Shared UI components (Navbar, AuthModal, SocialLinks)
│   │   │   ├── config/           # API configuration (api.config.ts)
│   │   │   ├── guards/           # Functional route guards (authGuard)
│   │   │   ├── models/           # TypeScript interfaces (User, Store, Requests, Responses)
│   │   │   ├── pages/            # Page components (Home, StoreDetail, CreateStore, Profile, Auth)
│   │   │   └── services/         # Reactive signal services (StoreService, AuthService)
│   │   └── styles.css            # Tailwind CSS imports & global styles
│   └── package.json
├── aaspass-service-backend/      # Spring Boot Java 17 Backend Application
│   ├── src/main/java/com/aaspass/
│   │   ├── config/               # WebMvcConfig (CORS), DataInitializer, Logging filters
│   │   ├── controller/           # REST Controllers (Auth, Store, User, Reviews, Services)
│   │   ├── dto/                  # Java 17 Records (Request, Response, Common)
│   │   ├── entity/               # JPA Entities (User, Store, Address, Reviews, etc.)
│   │   ├── exception/            # GlobalExceptionHandler & Custom Exceptions
│   │   ├── repository/           # Spring Data JPA Repositories
│   │   ├── service/              # Business Service layer & DtoMapper
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

---

### 🔑 Default Demo Accounts

| Username | Email | Password | Role / Account Type |
| :--- | :--- | :--- | :--- |
| `aman` | `aman.sharma@example.com` | `password123` | Regular User / Neighbor (Indiranagar, Bengaluru) |
| `priya` | `priya.nair@example.com` | `password123` | Store Owner: PixelCraft Studios (Video Editing) |
| `rohan` | `rohan.gupta@example.com` | `password123` | Store Owner: FullStack Craft (Web & Tech) |

*(Quick 1-click login buttons are also available inside the frontend login popup modal).*

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
  - [x] Context-aware login popup modal with route interception via `authGuard`.
  - [x] Full-stack REST integration connecting Angular client to Spring Boot endpoints.
  - [x] Aadhaar and PAN KYC tracking with masked security formatting.
- [ ] **Phase 5: Spatial Indexing & Neighborhood Escrow**
  - [ ] Geolocation / spatial indexing (MySQL GIS `ST_Distance_Sphere`) for coordinate queries.
  - [ ] Phone OTP / JWT-based stateless authentication.
  - [ ] In-app direct chat (WebSocket / STOMP).
  - [ ] Milestone-based payment escrow for gig completion.

---

> For exhaustive architectural details, ER schemas, and complete API specifications, see **[`doc/PROJECT_DETAILS.md`](doc/PROJECT_DETAILS.md)**.
