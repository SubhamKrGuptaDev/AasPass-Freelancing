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
| **Backend** | Spring Boot 4.x / Java 25 | REST APIs, Maven build system |
| **Change Tracking** | Markdown Documentation | `doc/AI-doc/CHANGELOG.md` for historical change auditing |

---

## 📁 Repository Structure

```
AasPass-Freelancing/
├── aaspass-client/               # Angular 22 Frontend Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/       # Shared UI components (Navbar, etc.)
│   │   │   ├── models/           # TypeScript interfaces (User, Store, Services)
│   │   │   ├── pages/            # Page components (Home, StoreDetail, CreateStore, Profile)
│   │   │   └── services/         # Reactive signal services (StoreService)
│   │   └── styles.css            # Tailwind CSS imports & global styles
│   └── package.json
├── aaspass-service/              # Spring Boot Java Backend Application
│   ├── src/main/java/com/aaspass/
│   ├── src/main/resources/
│   └── pom.xml
├── doc/
│   └── AI-doc/
│       └── CHANGELOG.md          # AI development log with timestamped records
└── README.md                     # Project overview and architecture guide
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v20+ recommended) & **npm**
* **Java 25** & **Maven**

### Running the Frontend
```powershell
cd aaspass-client
npm install
npm start
```
Navigate to `http://localhost:4200` to access the application.

### Running the Backend Service
```powershell
cd aaspass-service
./mvnw spring-boot:run
```

---

## 📋 Development Roadmap

- [x] **Phase 1: Project Alignment & Architecture Design**
  - [x] Concept validation and global/local market comparison.
  - [x] Adoption of Option A (Unified Account Model).
- [x] **Phase 2: Core Frontend Flows**
  - [x] Proximity discovery and distance-radius search.
  - [x] Store detail pages with service packages and social media profiles.
  - [x] Store registration flow with real-time live preview.
  - [x] Profile management with Aadhaar and PAN verification fields.
- [ ] **Phase 3: Backend REST Services & Persistence**
  - [ ] Spring Boot entity models and database schema (PostgreSQL / MongoDB).
  - [ ] Geolocation / spatial indexing for coordinate-based radius queries.
  - [ ] Store and gig package CRUD endpoints.
- [ ] **Phase 4: Authentication & Security**
  - [ ] Phone OTP / JWT-based authentication.
  - [ ] KYC verification integration.
- [ ] **Phase 5: Messaging & Neighborhood Escrow**
  - [ ] In-app direct chat.
  - [ ] Milestone-based payment escrow for gig completion.