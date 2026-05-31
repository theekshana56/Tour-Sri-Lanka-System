# TSL — Tourism Sri Lanka · Complete Cursor Prompt Guide
## Tech Stack (exact)
| Layer | Technology | Free Hosting |
|---|---|---|
| Frontend | React + Next.js + Tailwind CSS | Vercel |
| Backend | Spring Boot 3 (Java) | Render / Railway |
| Database | MongoDB Atlas | Atlas free tier (M0) |
| Auth | Spring Security + JWT | — |
| File Storage | Cloudinary | Free tier |
| Email | Resend | Free tier |
| CI/CD | GitHub Actions | Free |
| CDN + SSL | Cloudflare | Free |

> Paste each prompt into **Cursor Agent mode (Ctrl+I / Cmd+I)**. Complete one prompt fully before starting the next. Never skip a phase.

---

# PHASE 1 — Project Scaffold & Monorepo Setup

---

## Prompt 1.1 — Create the Full Monorepo Structure
```
Create a monorepo project called "tsl-platform" with this exact folder structure:

tsl-platform/
├── frontend/        ← Next.js 14 app (React + Tailwind)
├── backend/         ← Spring Boot 3 Java app
└── .github/
    └── workflows/   ← GitHub Actions CI/CD

Frontend setup inside frontend/:
- Next.js 14 with App Router and TypeScript
- Tailwind CSS (configured with tailwind.config.ts)
- shadcn/ui → run: npx shadcn@latest init (style: default, base color: neutral, CSS variables: yes)
- Install these exact packages:
  npm install axios @tanstack/react-query zustand react-hook-form zod @hookform/resolvers
  npm install leaflet react-leaflet @types/leaflet
  npm install react-hot-toast
  npm install react-day-picker date-fns
  npm install canvas-confetti @types/canvas-confetti
  npm install next-intl
  npm install recharts
  npm install lucide-react

Create this folder structure inside frontend/src/:
  app/                    ← Next.js App Router pages
  components/
    ui/                   ← shadcn auto-generated
    layout/               ← Navbar, Sidebar, Footer
    places/               ← PlaceCard, PlaceModal etc.
    booking/              ← BookingForm, BookingSummary etc.
    common/               ← LoadingSpinner, StatusBadge etc.
  lib/
    api.ts                ← Axios instance
    utils.ts              ← helper functions
  store/
    authStore.ts          ← Zustand auth store
    tripStore.ts          ← Zustand trip planner store
  types/
    index.ts              ← all TypeScript interfaces
  hooks/                  ← custom React hooks

Create frontend/.env.local:
  NEXT_PUBLIC_API_URL=http://localhost:8080/api
  NEXT_PUBLIC_APP_URL=http://localhost:3000

Run npm run dev and confirm it starts with zero errors on port 3000.
```

---

## Prompt 1.2 — Spring Boot 3 Backend Scaffold
```
Inside the backend/ folder, create a Spring Boot 3.2 project using Java 21.

Create pom.xml with these dependencies:
- org.springframework.boot:spring-boot-starter-web
- org.springframework.boot:spring-boot-starter-security
- org.springframework.boot:spring-boot-starter-data-mongodb
- org.springframework.boot:spring-boot-starter-validation
- org.springframework.boot:spring-boot-starter-mail
- org.springframework.boot:spring-boot-starter-actuator
- io.jsonwebtoken:jjwt-api:0.12.3
- io.jsonwebtoken:jjwt-impl:0.12.3 (runtime scope)
- io.jsonwebtoken:jjwt-jackson:0.12.3 (runtime scope)
- org.springdoc:springdoc-openapi-starter-webmvc-ui:2.3.0
- org.projectlombok:lombok
- com.cloudinary:cloudinary-http44:1.36.0
- com.itextpdf:itext7-core:7.2.5 (for PDF generation)
- com.google.zxing:core:3.5.2 (for QR codes in PDF)
- com.google.zxing:javase:3.5.2

Create package structure under src/main/java/com/tsl/:
  config/           ← SecurityConfig, CorsConfig, JwtConfig, CloudinaryConfig
  controller/       ← All @RestController classes
  service/          ← All @Service classes
  repository/       ← All MongoRepository interfaces
  model/            ← All @Document classes
  dto/
    request/        ← incoming request bodies
    response/       ← outgoing response bodies
  exception/        ← custom exceptions + GlobalExceptionHandler
  util/             ← JwtUtil, BookingIdGenerator, PdfGenerator
  filter/           ← JwtAuthFilter

Create backend/src/main/resources/application.yml:
```yaml
server:
  port: 8080

spring:
  data:
    mongodb:
      uri: ${MONGODB_URI:mongodb://localhost:27017/tsldb}
  mail:
    host: smtp.resend.com
    port: 465
    username: resend
    password: ${RESEND_API_KEY:placeholder}
    protocol: smtps
    properties:
      mail.smtp.auth: true
      mail.smtp.ssl.enable: true

app:
  jwt:
    secret: ${JWT_SECRET:tsl-super-secret-key-change-in-production-must-be-256-bits}
    expiration-ms: 900000        # 15 minutes
    refresh-expiration-ms: 604800000  # 7 days
  cloudinary:
    cloud-name: ${CLOUDINARY_CLOUD_NAME:placeholder}
    api-key: ${CLOUDINARY_API_KEY:placeholder}
    api-secret: ${CLOUDINARY_API_SECRET:placeholder}
  frontend-url: ${FRONTEND_URL:http://localhost:3000}
  admin-emails:
    - admin@tsl.lk

springdoc:
  api-docs:
    path: /api-docs
  swagger-ui:
    path: /swagger-ui.html
```

Create a health check: GET /api/health → returns { "status": "UP", "service": "TSL Platform" }

Run mvn clean compile and confirm zero compilation errors.
```

---

## Prompt 1.3 — Git, GitHub Actions CI/CD & Docker Compose
```
Set up version control and CI/CD for the tsl-platform monorepo.

1. Root .gitignore:
# Frontend
frontend/node_modules/
frontend/.next/
frontend/.env.local
frontend/.env.production

# Backend
backend/target/
backend/.env
*.class

# General
.DS_Store
*.log
.idea/
.vscode/

2. docker-compose.yml at project root (for local MongoDB only):
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7.0
    container_name: tsl-mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    environment:
      MONGO_INITDB_DATABASE: tsldb

volumes:
  mongo-data:
```

3. Create .github/workflows/frontend.yml:
```yaml
name: Frontend CI
on:
  push:
    branches: [main]
    paths: ['frontend/**']
  pull_request:
    branches: [main]
    paths: ['frontend/**']
jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
      - run: npm run build
```

4. Create .github/workflows/backend.yml:
```yaml
name: Backend CI
on:
  push:
    branches: [main]
    paths: ['backend/**']
  pull_request:
    branches: [main]
    paths: ['backend/**']
jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: 'maven'
      - run: mvn clean package -DskipTests
```

5. Create README.md at project root with:
- Project overview
- Local setup instructions (clone → docker-compose up → run backend → run frontend)
- Environment variables list
- Deployment guide summary

6. Create backend/src/main/resources/application-dev.yml (local dev overrides) and backend/src/main/resources/application-prod.yml (production settings with logging at WARN level).

Initialize git repo and make first commit: "feat: initial TSL platform scaffold"
```

---

# PHASE 2 — Authentication & User Management

---

## Prompt 2.1 — Backend: JWT Auth System with Spring Security
```
Build the complete authentication system in the Spring Boot backend using Spring Security + JWT.

MODELS — create these MongoDB @Document classes:

1. com.tsl.model.User:
@Document(collection = "users")
Fields:
- String id (@Id)
- String fullName (@NotBlank)
- String email (@Email, unique index)
- String password (BCrypt hashed, @JsonIgnore)
- String phone (WhatsApp number with country code, e.g. +94771234567)
- Role role (enum: CUSTOMER, ADMIN, MANAGER, FINANCE_MANAGER, DRIVER)
- boolean isActive (default true)
- String profileImageUrl (nullable, Cloudinary URL)
- String licenseNumber (nullable, only for DRIVER)
- String assignedVehicleId (nullable, only for DRIVER)
- boolean isAvailable (default true, only meaningful for DRIVER)
- LocalDateTime createdAt, updatedAt
- @CreatedDate / @LastModifiedDate using @EnableMongoAuditing

2. com.tsl.model.RefreshToken:
@Document(collection = "refresh_tokens")
Fields:
- String id
- String token (UUID)
- String userId
- LocalDateTime expiryDate
- boolean revoked (default false)

3. com.tsl.model.Counter (for booking ID generation):
@Document(collection = "counters")
Fields:
- String id (e.g. "booking_counter")
- long sequence

SECURITY CONFIG (com.tsl.config.SecurityConfig):
- Stateless SessionCreationPolicy
- BCryptPasswordEncoder bean (strength 12)
- JwtAuthFilter extends OncePerRequestFilter (reads Bearer token, sets SecurityContext)
- Public (permitAll) endpoints:
  POST /api/auth/**
  GET  /api/places/**
  GET  /api/vehicles/**
  GET  /api/availability/**
  GET  /api/pricing/**
  GET  /api/bookings/number/**
  GET  /api/health
  GET  /swagger-ui/**
  GET  /api-docs/**
- All other endpoints: authenticated
- CORS: allow http://localhost:3000 and ${app.frontend-url} for all methods and headers

JWT UTIL (com.tsl.util.JwtUtil):
- Use HMAC-SHA256 with the secret from application.yml
- generateAccessToken(User user): 15 min expiry, claims: userId, email, role
- generateRefreshToken(): secure random UUID stored in MongoDB
- validateToken(String token): returns boolean
- extractUserId(String token): returns String
- extractRole(String token): returns String

AUTH ENDPOINTS (com.tsl.controller.AuthController):

POST /api/auth/register
  Request: { fullName, email, password, confirmPassword, phone }
  Validation: email unique check, password == confirmPassword, phone not blank
  Creates user with role = CUSTOMER
  Returns: { accessToken, refreshToken, user: { id, fullName, email, role, phone } }

POST /api/auth/login
  Request: { email, password }
  Returns: { accessToken, refreshToken, user: { id, fullName, email, role, phone, profileImageUrl } }

POST /api/auth/refresh
  Request: { refreshToken }
  Validates token in DB (not revoked, not expired)
  Returns: { accessToken, refreshToken (rotated) }

POST /api/auth/logout
  Authenticated. Revokes the provided refreshToken in DB.
  Returns: { message: "Logged out successfully" }

GET /api/auth/me
  Authenticated. Returns current user profile (no password).

ADMIN USER MANAGEMENT (com.tsl.controller.UserController):
All require ADMIN role (@PreAuthorize("hasRole('ADMIN')"))

POST /api/admin/users
  Creates ADMIN, MANAGER, FINANCE_MANAGER, or DRIVER accounts
  Request: { fullName, email, temporaryPassword, phone, role, licenseNumber? }
  Sends welcome email via Resend with login credentials

GET /api/admin/users?role=DRIVER&page=0&size=20
  Paginated list of all users, filterable by role

PUT /api/admin/users/{id}
  Update user details

PUT /api/admin/users/{id}/toggle-status
  Flip isActive boolean. Inactive users cannot login.

Use Lombok @Data @Builder @NoArgsConstructor @AllArgsConstructor on all models and DTOs.
Use @Valid on all @RequestBody parameters.
Return consistent error responses using GlobalExceptionHandler.
```

---

## Prompt 2.2 — Frontend: Auth Pages + Route Protection
```
Build the complete authentication UI in the Next.js 14 frontend using React + Tailwind + shadcn/ui.

ZUSTAND AUTH STORE (store/authStore.ts):
interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  refreshAccessToken: () => Promise<void>
  setUser: (user: User) => void
}
- Persist { user, refreshToken } to localStorage using zustand/middleware persist
- Store accessToken in memory only (not localStorage) for security
- On app load: if refreshToken in localStorage exists, call /api/auth/refresh automatically

AXIOS CLIENT (lib/api.ts):
- baseURL: process.env.NEXT_PUBLIC_API_URL
- Request interceptor: attach Authorization: Bearer {accessToken} from authStore
- Response interceptor: on 401, call refreshAccessToken(), retry original request once, then logout + redirect to /login
- Export typed API functions: authApi, placesApi, bookingApi, adminApi, driverApi, financeApi

TYPESCRIPT TYPES (types/index.ts):
Define interfaces for: User, Place, Vehicle, Booking, PriceQuote, AvailabilityCalendar, PricingRule, ExchangeRate — matching the backend models exactly.

PAGES TO BUILD:

1. app/(auth)/login/page.tsx:
Layout: full-screen split. Left half: dark overlay on a Sri Lanka beach image (use https://picsum.photos/seed/srilanka/800/1000 as placeholder). Right half: white card with form.
Form fields: Email, Password. "Remember me" checkbox. "Forgot password?" link.
Submit → authStore.login() → redirect based on role:
  CUSTOMER → /dashboard
  ADMIN → /admin/dashboard
  MANAGER → /manager/dashboard
  FINANCE_MANAGER → /finance/dashboard
  DRIVER → /driver/dashboard
Show toast error on failure.

2. app/(auth)/register/page.tsx:
Same split layout.
Form fields: Full Name, Email, WhatsApp Number (with +94 prefix shown), Password, Confirm Password.
All validated with React Hook Form + Zod before submit.
On success → redirect to /dashboard.

3. app/(auth)/forgot-password/page.tsx:
Simple centered card. Email input. "Send reset link" button.
For now: show success message "If this email exists, you'll receive a reset link." (backend not wired yet — TODO).

ROUTE PROTECTION (middleware.ts at frontend/ root):
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const roleRoutes = {
  '/admin': ['ADMIN'],
  '/manager': ['ADMIN', 'MANAGER'],
  '/finance': ['FINANCE_MANAGER'],
  '/driver': ['DRIVER'],
  '/dashboard': ['CUSTOMER', 'ADMIN', 'MANAGER', 'FINANCE_MANAGER', 'DRIVER'],
}

Logic:
- Read role from a cookie "tsl-role" (set on login, httpOnly: false so middleware can read)
- If accessing a protected route without auth → redirect to /login?redirect={path}
- If wrong role → redirect to their correct dashboard
- If accessing /login or /register when already authenticated → redirect to their dashboard

After login success, set two cookies:
  document.cookie = `tsl-role=${user.role}; path=/`
  document.cookie = `tsl-authenticated=true; path=/`

SHARED LAYOUT:
Create app/(auth)/layout.tsx with no navbar — just renders children.
Create app/(protected)/layout.tsx that wraps all dashboard pages and checks auth on client side too.
```

---

# PHASE 3 — Places, Vehicles & Pricing

---

## Prompt 3.1 — Backend: Places, Vehicles & Cloudinary Upload
```
Build the Places and Vehicles modules in the Spring Boot backend.

MODELS:

1. com.tsl.model.Place:
@Document(collection = "places")
Fields:
- String id
- String name
- String description (long text)
- PlaceCategory category (enum: DESTINATION, ACCOMMODATION, RESTAURANT, ACTIVITY)
- String district (e.g. "Galle", "Kandy", "Colombo")
- String province
- Double latitude, longitude
- List<String> imageUrls (Cloudinary URLs)
- String thumbnailUrl (first image, for cards)
- PriceRange priceRange (enum: BUDGET, MID_RANGE, LUXURY)
- Double rating (0.0 to 5.0)
- List<String> tags (e.g. ["beach", "heritage", "wildlife", "surfing"])
- List<String> highlights (short bullet points, max 5)
- String bestTimeToVisit
- boolean isActive (default true)
- boolean isFeatured (default false)
- LocalDateTime createdAt, updatedAt

2. com.tsl.model.Vehicle:
@Document(collection = "vehicles")
Fields:
- String id
- String name (e.g. "Toyota Prius", "Toyota HiAce")
- VehicleType type (enum: SEDAN, SUV, VAN, MINIBUS, LUXURY_SUV)
- int capacity (max passengers: SEDAN=3, SUV=6, VAN=10, MINIBUS=20, LUXURY_SUV=6)
- String description
- String imageUrl (Cloudinary URL)
- String registrationNumber
- boolean isActive (default true)
- String assignedDriverId (nullable)

CLOUDINARY CONFIG (com.tsl.config.CloudinaryConfig):
@Configuration bean that initializes Cloudinary with cloud-name, api-key, api-secret from application.yml.

CLOUDINARY SERVICE (com.tsl.service.CloudinaryService):
- String uploadImage(MultipartFile file, String folder): uploads to Cloudinary folder, returns secure_url
- void deleteImage(String publicId): deletes by public ID
- String uploadPdf(byte[] pdfBytes, String filename): uploads PDF, returns secure_url

PLACE ENDPOINTS (PlaceController):

PUBLIC (no auth needed):
GET  /api/places
  Query params: category, district, priceRange, tags (comma-separated), search (text), page (default 0), size (default 12)
  Returns paginated PlaceResponse list

GET  /api/places/{id}
  Returns full place details

GET  /api/places/districts
  Returns sorted list of all distinct districts from active places

GET  /api/places/featured
  Returns top 8 places where isFeatured=true and isActive=true, sorted by rating desc

ADMIN ONLY:
POST   /api/admin/places                     ← create place (JSON body, no image yet)
PUT    /api/admin/places/{id}                ← update place
DELETE /api/admin/places/{id}                ← soft delete (isActive=false)
POST   /api/admin/places/{id}/images         ← upload image (MultipartFile), adds URL to imageUrls list, sets thumbnailUrl if first image
PUT    /api/admin/places/{id}/feature        ← toggle isFeatured
DELETE /api/admin/places/{id}/images/{index} ← remove image by index

VEHICLE ENDPOINTS (VehicleController):

PUBLIC:
GET /api/vehicles?capacity=4   ← returns active vehicles where capacity >= requested
GET /api/vehicles/{id}

ADMIN ONLY:
POST   /api/admin/vehicles
PUT    /api/admin/vehicles/{id}
DELETE /api/admin/vehicles/{id}   ← soft delete
POST   /api/admin/vehicles/{id}/image   ← upload vehicle image

DATA SEEDER (com.tsl.config.DataSeeder implements CommandLineRunner):
Run only if places collection is empty. Insert these 15 Sri Lanka places with realistic data:
1. Sigiriya Rock Fortress - DESTINATION - Matale district - tags: heritage, UNESCO, history - LUXURY
2. Galle Dutch Fort - DESTINATION - Galle district - tags: heritage, colonial, beach - MID_RANGE
3. Yala National Park - ACTIVITY - Hambantota district - tags: wildlife, safari, leopard - LUXURY
4. Ella Rock & Nine Arches Bridge - DESTINATION - Badulla district - tags: mountain, hiking, scenic - BUDGET
5. Mirissa Beach - DESTINATION - Matara district - tags: beach, whale watching, surfing - MID_RANGE
6. Temple of the Tooth (Kandy) - DESTINATION - Kandy district - tags: heritage, religious, UNESCO - MID_RANGE
7. Nuwara Eliya Hill Country - DESTINATION - Nuwara Eliya district - tags: tea, mountain, colonial - MID_RANGE
8. Pinnawala Elephant Orphanage - ACTIVITY - Kegalle district - tags: wildlife, elephants, family - BUDGET
9. Trincomalee Beach - DESTINATION - Trincomalee district - tags: beach, diving, whale watching - MID_RANGE
10. Colombo City Tour - DESTINATION - Colombo district - tags: city, food, shopping, nightlife - MID_RANGE
11. Arugam Bay - DESTINATION - Ampara district - tags: surfing, beach, backpacker - BUDGET
12. Dambulla Cave Temple - DESTINATION - Matale district - tags: heritage, religious, UNESCO - BUDGET
13. Horton Plains National Park - ACTIVITY - Nuwara Eliya district - tags: hiking, wildlife, waterfall - MID_RANGE
14. Bentota Beach & Water Sports - DESTINATION - Galle district - tags: beach, water sports, luxury - LUXURY
15. Anuradhapura Ancient City - DESTINATION - Anuradhapura district - tags: heritage, religious, UNESCO - BUDGET

Also seed 5 vehicles (one of each type) if vehicles collection is empty.
Also seed 1 default ADMIN user (email: admin@tsl.lk, password: Admin@123) if users collection is empty.
```

---

## Prompt 3.2 — Backend: Pricing Engine with Multi-Currency
```
Build the complete Pricing Engine in the Spring Boot backend.
This is used by the Finance Manager to set prices, and by customers to see quotes.

MODELS:

1. com.tsl.model.PricingRule:
@Document(collection = "pricing_rules")
Fields:
- String id
- VehicleType vehicleType (unique — one rule per vehicle type)
- BigDecimal basePricePerDayLKR (e.g. 15000.00 for SEDAN)
- BigDecimal pricePerExtraPassengerLKR (added per passenger beyond 1)
- List<ZoneMultiplier> zoneMultipliers:
    ZoneMultiplier { String fromDistrict, String toDistrict, double multiplier }
    e.g. { "Colombo", "Badulla", 1.4 } means Colombo→Ella zone costs 40% more
- double seasonalMultiplier (default 1.0, finance manager adjusts for peak season Dec-Jan)
- boolean isActive
- String lastUpdatedByUserId
- LocalDateTime updatedAt

2. com.tsl.model.ExchangeRate:
@Document(collection = "exchange_rates")
Fields:
- String id (singleton, use id="main")
- String baseCurrency (always "LKR")
- Map<String, BigDecimal> rates:
    Default seed values:
    USD: 0.00329, EUR: 0.00303, GBP: 0.00259, AUD: 0.00508
    JPY: 0.495, INR: 0.274, CAD: 0.00448, SGD: 0.00441
    CNY: 0.0238, AED: 0.0121, CHF: 0.00295, KRW: 4.42
- LocalDateTime lastUpdated
- String updatedByUserId

PRICING SERVICE (com.tsl.service.PricingService):

PriceQuote calculatePrice(String vehicleType, String fromDistrict, String toDistrict, int numberOfDays, int passengers, String preferredCurrency):
  1. Fetch active PricingRule for vehicleType → throw 404 if none
  2. baseCost = basePricePerDayLKR × numberOfDays
  3. passengerExtra = pricePerExtraPassengerLKR × max(0, passengers - 1) × numberOfDays
  4. Find zone multiplier for fromDistrict→toDistrict (check both directions)
  5. zoneMultiplier = found multiplier or 1.0
  6. subtotal = (baseCost + passengerExtra) × zoneMultiplier
  7. totalLKR = subtotal × seasonalMultiplier (round to 2dp)
  8. Fetch ExchangeRate. Convert: totalForeign = totalLKR × rates[preferredCurrency]
  9. Return PriceQuote {
       vehicleType, fromDistrict, toDistrict, numberOfDays, passengers,
       totalLKR, totalForeignCurrency, preferredCurrency, exchangeRateUsed,
       breakdown: { baseCost, passengerExtra, zoneMultiplier, seasonalMultiplier }
     }

ENDPOINTS:

PUBLIC:
GET /api/pricing/quote?vehicleType=SUV&from=Colombo&to=Badulla&days=3&passengers=4&currency=USD
  Returns PriceQuote

GET /api/pricing/currencies
  Returns list of supported currency codes with their display names and symbols:
  [{ code: "USD", name: "US Dollar", symbol: "$" }, ...]

FINANCE MANAGER ONLY (hasRole('FINANCE_MANAGER')):
GET    /api/finance/pricing-rules
PUT    /api/finance/pricing-rules/{id}          ← update base prices, zone multipliers, seasonal
GET    /api/finance/exchange-rates
PUT    /api/finance/exchange-rates              ← manually update all rates at once
GET    /api/finance/revenue-summary?from=2025-01-01&to=2025-12-31
  Returns: { totalRevenueLKR, totalBookings, avgBookingValueLKR,
             revenueByMonth: [{month, revenue}],
             revenueByVehicleType: [{type, revenue, count}],
             topRoutes: [{from, to, count, revenue}] }
GET    /api/finance/bookings?status=APPROVED&page=0&size=20
  Returns paginated booking list with financial columns

DATA SEEDER: Seed default PricingRules for all 5 vehicle types:
  SEDAN:      basePricePerDayLKR=12000, extra/passenger=1500
  SUV:        basePricePerDayLKR=18000, extra/passenger=2000
  VAN:        basePricePerDayLKR=22000, extra/passenger=1800
  MINIBUS:    basePricePerDayLKR=35000, extra/passenger=1500
  LUXURY_SUV: basePricePerDayLKR=30000, extra/passenger=3000

Add 5 common zone multipliers:
  Colombo→Badulla: 1.4, Colombo→Hambantota: 1.3, Colombo→Trincomalee: 1.5
  Colombo→Matale: 1.2, Kandy→Galle: 1.3
```

---

# PHASE 4 — Availability & Booking System

---

## Prompt 4.1 — Backend: Availability Engine
```
Build the availability checking system in Spring Boot backend.

MODELS:

1. com.tsl.model.DriverAvailability:
@Document(collection = "driver_availability")
Fields:
- String id
- String driverId (@Indexed, unique)
- List<LocalDate> blockedDates (manually blocked by driver or admin)

2. com.tsl.model.VehicleUnavailability:
@Document(collection = "vehicle_unavailability")
Fields:
- String id
- String vehicleId (@Indexed, unique)
- List<LocalDate> unavailableDates (maintenance etc.)

AVAILABILITY SERVICE (com.tsl.service.AvailabilityService):

Method 1 — getMonthlyCalendar(int year, int month):
  Returns Map<String, DayAvailability> where key = "2025-08-15"
  DayAvailability { int availableDrivers, int availableVehicles, boolean isAvailable }
  Logic:
  - Get all active DRIVER users
  - For each day in the month:
    - Count drivers NOT in: (a) confirmed/approved Bookings overlapping that day, (b) blockedDates in DriverAvailability
    - Count vehicles NOT in: (a) approved Bookings, (b) VehicleUnavailability
    - isAvailable = availableDrivers > 0 && availableVehicles > 0

Method 2 — checkRangeAvailability(LocalDate from, LocalDate to):
  Returns RangeAvailability { boolean available, int minAvailableDrivers, int minAvailableVehicles, List<LocalDate> blockedDays }
  Finds the minimum availability across all days in range.
  If any day has 0 drivers → available=false, blockedDays lists those dates.

Method 3 — getAvailableDriversForDateRange(LocalDate from, LocalDate to):
  Returns List<DriverInfo> { driverId, driverName, vehicleType, vehicleName }
  Only drivers available for EVERY day in the range.

Method 4 — getAvailableVehiclesForDateRange(LocalDate from, LocalDate to, int minCapacity):
  Returns List<Vehicle> available for every day in range with capacity >= minCapacity

ENDPOINTS:

PUBLIC:
GET /api/availability/calendar?year=2025&month=8
  Returns monthly calendar map

GET /api/availability/check?from=2025-08-10&to=2025-08-13
  Returns RangeAvailability

GET /api/availability/drivers?from=2025-08-10&to=2025-08-13
  Returns available drivers list

GET /api/availability/vehicles?from=2025-08-10&to=2025-08-13&minCapacity=4
  Returns available vehicles list

DRIVER SELF-MANAGEMENT (hasRole('DRIVER')):
GET    /api/driver/availability                         ← get my blocked dates
POST   /api/driver/availability/block                   ← body: { date: "2025-08-15" }
DELETE /api/driver/availability/unblock?date=2025-08-15 ← remove block

ADMIN:
GET    /api/admin/drivers/{driverId}/availability
POST   /api/admin/drivers/{driverId}/availability/block        ← body: { date }
DELETE /api/admin/drivers/{driverId}/availability/unblock?date=
POST   /api/admin/vehicles/{vehicleId}/unavailability/block
DELETE /api/admin/vehicles/{vehicleId}/unavailability/unblock?date=
```

---

## Prompt 4.2 — Backend: Booking System (Core Module)
```
Build the complete Booking system — the most critical module of TSL.

MODEL (com.tsl.model.Booking):
@Document(collection = "bookings")
@Indexed fields: bookingNumber (unique), customerId, status, startDate

Fields:
- String id
- String bookingNumber (format: TSL-V-00, unique, auto-generated)
- String customerId (nullable — null if guest checkout)
- String customerName
- String customerEmail
- String customerWhatsapp (with country code)
- List<String> selectedPlaceIds
- List<String> selectedPlaceNames (denormalized for fast display)
- String fromDistrict
- String toDistrict
- String pickupLocation (full text address)
- String dropLocation (full text address)
- LocalDate startDate
- LocalDate endDate
- int numberOfDays
- int passengerCount
- VehicleType vehicleType
- String vehicleId (nullable — set on approval)
- String vehicleName (nullable — denormalized)
- String assignedDriverId (nullable — set on approval)
- String assignedDriverName (nullable — denormalized)
- String assignedDriverPhone (nullable — denormalized)
- BookingStatus status (enum: PENDING, APPROVED, REJECTED, COMPLETED, CANCELLED)
- String rejectionReason (nullable — required when status=REJECTED)
- BigDecimal totalPriceLKR
- BigDecimal totalPriceForeign
- String preferredCurrency
- BigDecimal exchangeRateUsed
- String pdfUrl (nullable — Cloudinary URL, set async after booking)
- String customerNotes (nullable)
- String reviewedByUserId (nullable)
- String reviewedByName (nullable)
- LocalDateTime reviewedAt
- LocalDateTime createdAt
- LocalDateTime updatedAt

BOOKING ID GENERATOR (com.tsl.util.BookingIdGenerator):
Use MongoDB findAndModify for atomic counter increment on the "counters" collection.
Format: TSL-V-{sequence} where sequence is zero-padded to 2 digits minimum.
TSL-V-00, TSL-V-01, ... TSL-V-09, TSL-V-10, ... TSL-V-99, TSL-V-100, TSL-V-101 ...
Thread-safe — works correctly under concurrent requests.

BOOKING SERVICE (com.tsl.service.BookingService):

1. createBooking(BookingRequest request, String customerId):
   - Validate: startDate must be future, endDate > startDate, passengerCount >= 1
   - Check availability via AvailabilityService.checkRangeAvailability → if not available throw BookingUnavailableException
   - Calculate price via PricingService.calculatePrice
   - Generate bookingNumber via BookingIdGenerator
   - Save booking with status=PENDING
   - Async: call NotificationService.notifyBookingCreated(booking)
   - Return saved booking

2. approveBooking(String bookingId, String vehicleId, String driverId, String approvedByUserId):
   - Fetch booking, must be PENDING
   - Fetch vehicle and driver, denormalize names/phone
   - Set status=APPROVED, assign vehicle+driver, set reviewedBy+reviewedAt
   - Save booking
   - Async: generate PDF, then NotificationService.notifyBookingApproved(booking)

3. rejectBooking(String bookingId, String rejectionReason, String rejectedByUserId):
   - Fetch booking, must be PENDING
   - rejectionReason must not be blank (validate)
   - Set status=REJECTED, set rejectionReason, reviewedBy, reviewedAt
   - Save booking
   - Async: NotificationService.notifyBookingRejected(booking)

4. cancelBooking(String bookingId, String requestedByUserId, String requestedByRole):
   - CUSTOMER can cancel only their own PENDING bookings
   - ADMIN can cancel any booking in any status except COMPLETED
   - Set status=CANCELLED

5. completeBooking(String bookingId, String completedByUserId):
   - ADMIN or DRIVER can mark APPROVED bookings as COMPLETED
   - Set status=COMPLETED

ENDPOINTS:

PUBLIC:
POST /api/bookings
  Request body: { customerName, customerEmail, customerWhatsapp, selectedPlaceIds,
                  fromDistrict, toDistrict, pickupLocation, dropLocation,
                  startDate, endDate, passengerCount, vehicleType, preferredCurrency, customerNotes? }
  Returns: BookingResponse with bookingNumber

GET /api/bookings/number/{bookingNumber}
  Public tracking — returns booking status, assigned driver (name only, no phone), pdf URL

CUSTOMER (authenticated):
GET  /api/bookings/my?status=&page=0&size=10     ← own bookings, paginated
PUT  /api/bookings/{id}/cancel                   ← cancel own pending booking

ADMIN + MANAGER:
GET  /api/admin/bookings?status=PENDING&search=TSL-V&page=0&size=20
GET  /api/admin/bookings/{id}                    ← full details including customer phone
PUT  /api/admin/bookings/{id}/approve            ← body: { vehicleId, driverId }
PUT  /api/admin/bookings/{id}/reject             ← body: { rejectionReason }
PUT  /api/admin/bookings/{id}/complete

DRIVER (authenticated):
GET /api/driver/bookings?page=0&size=20          ← my assigned bookings
GET /api/driver/bookings/today                   ← today's assignments
PUT /api/driver/bookings/{id}/complete           ← mark completed
```

---

## Prompt 4.3 — Backend: PDF Generation + Resend Email + WhatsApp Stub
```
Build the notification system using Resend (email), iText 7 (PDF), and WhatsApp stub.

1. PDF GENERATOR (com.tsl.util.PdfGenerator):
Use iText 7 to generate a professional booking confirmation PDF.

Layout of the PDF (A4):
- Header bar (dark green background): "TSL - Tourism Sri Lanka" text + "Your Adventure Awaits"
- Booking Reference section: "BOOKING CONFIRMED" badge + booking number TSL-V-XX (large, bold)
- QR Code (150x150px using ZXing): encodes URL {app.frontend-url}/track/{bookingNumber}
  Place QR code top-right of the reference section
- Two-column info section:
  Left col: Customer Name, Email, WhatsApp
  Right col: Booking Date, Status
- Trip Details table (full width):
  | Field | Details |
  Pickup Location, Drop Location, From District, To District,
  Start Date, End Date, Duration (X days), Passengers, Vehicle Type
- Selected Places section: numbered list of place names
- Price Breakdown box (highlighted):
  Base Rate, Passenger Adjustment, Zone Factor, Seasonal Adjustment
  TOTAL (LKR): XXX,XXX.XX
  TOTAL (USD/preferred): XXX.XX at rate 1 USD = 304.50 LKR
- Footer: "For support: support@tsl.lk | +94 11 234 5678 | www.tsl.lk"
         "This booking is pending admin confirmation. You'll receive updates via email and WhatsApp."

Method: byte[] generateBookingPdf(Booking booking, List<Place> places)
After generating PDF bytes, upload to Cloudinary using CloudinaryService.uploadPdf()
Save the returned URL to booking.pdfUrl and update the booking in MongoDB.

2. EMAIL SERVICE (com.tsl.service.EmailService):
Use Spring Mail configured with Resend SMTP (smtp.resend.com:465).
Send from: bookings@tsl.lk (configure in Resend dashboard)

Methods:

a) sendBookingReceived(Booking booking):
   Subject: "Booking Received — TSL-V-XX | Tourism Sri Lanka"
   HTML body (inline HTML String or Thymeleaf template):
   - Green header with TSL logo text
   - "Thank you, {customerName}! Your booking has been received."
   - Booking number in large bold text
   - Trip summary table (dates, route, passengers, vehicle, price)
   - "We'll review your booking and confirm within 24 hours."
   - Track booking link: {frontend-url}/track/{bookingNumber}
   - Warm Sri Lanka themed footer
   Attach PDF if pdfUrl is available, else note "PDF will be sent in a follow-up email"

b) sendBookingApproved(Booking booking):
   Subject: "✅ Booking Confirmed — TSL-V-XX | Your Sri Lanka Trip is ON!"
   HTML body:
   - Celebration header
   - Confirmation details
   - Assigned driver name + contact number
   - Pickup location and time details
   - PDF download link (pdfUrl)
   - "Save this email — show it to your driver on pickup day"

c) sendBookingRejected(Booking booking):
   Subject: "Booking Update — TSL-V-XX | Tourism Sri Lanka"
   HTML body:
   - Apologetic but warm tone
   - Rejection reason in a yellow warning box: "{rejectionReason}"
   - "Contact us to reschedule: support@tsl.lk"
   - Alternative dates suggestion prompt

d) sendNewBookingAlertToAdmin(Booking booking):
   Send to all emails in app.admin-emails config list
   Subject: "🔔 New Booking — TSL-V-XX needs review"
   Simple plain-style email with booking summary + link to admin dashboard

e) sendDriverAssignment(Booking booking):
   To: driver's email
   Subject: "New Trip Assignment — TSL-V-XX | {startDate}"
   HTML body:
   - Trip details: pickup location + time, drop location
   - Customer: name + WhatsApp number (clickable wa.me link)
   - Duration, passengers, price (driver's info)

3. WHATSAPP SERVICE (com.tsl.service.WhatsAppService):
Create interface WhatsAppService with methods:
  void sendBookingReceived(String whatsappNumber, Booking booking)
  void sendBookingApproved(String whatsappNumber, Booking booking)
  void sendBookingRejected(String whatsappNumber, Booking booking)

Create WhatsAppServiceStubImpl (default active):
  Log formatted message to console with prefix [WHATSAPP STUB]
  Format messages as they would appear in WhatsApp:
    "*TSL Tourism Sri Lanka*
    ✅ Booking Confirmed!
    Booking #: TSL-V-XX
    Trip: Colombo → Ella
    Dates: Aug 10 - Aug 13 (3 days)
    Passengers: 4
    Total: LKR 54,000 (USD 177.66)
    Driver: {name} | {phone}
    Track: {url}/track/{bookingNumber}"
  Add TODO comment with Twilio WhatsApp API integration instructions.

4. NOTIFICATION ORCHESTRATOR (com.tsl.service.NotificationService):
All methods @Async (enable @EnableAsync on main class):

@Async
void notifyBookingCreated(Booking booking):
  try { emailService.sendBookingReceived(booking) } catch (Exception e) { log error }
  try { emailService.sendNewBookingAlertToAdmin(booking) } catch (Exception e) { log error }
  try { whatsAppService.sendBookingReceived(booking.customerWhatsapp, booking) } catch (Exception e) { log error }
  try { generateAndAttachPdf(booking) } catch (Exception e) { log error }  ← async PDF gen

@Async
void notifyBookingApproved(Booking booking):
  try { emailService.sendBookingApproved(booking) } catch (Exception e) { log error }
  try { emailService.sendDriverAssignment(booking) } catch (Exception e) { log error }
  try { whatsAppService.sendBookingApproved(booking.customerWhatsapp, booking) } catch (Exception e) { log error }
  try { if pdfUrl is null, generateAndAttachPdf(booking) } catch (Exception e) { log error }

@Async
void notifyBookingRejected(Booking booking):
  try { emailService.sendBookingRejected(booking) } catch (Exception e) { log error }
  try { whatsAppService.sendBookingRejected(booking.customerWhatsapp, booking) } catch (Exception e) { log error }

Private helper generateAndAttachPdf(Booking booking):
  - Fetch Place objects for selectedPlaceIds
  - Generate PDF bytes via PdfGenerator
  - Upload to Cloudinary via CloudinaryService
  - Update booking.pdfUrl in MongoDB
  - Send follow-up email with PDF if first email had no PDF

Notification failures MUST NEVER propagate to the booking transaction.
Use try-catch around every notification call.
```

---

# PHASE 5 — Frontend: Trip Planner (Most Important UI)

---

## Prompt 5.1 — Places Explorer Page
```
Build the Trip Planner exploration page at app/(public)/plan/page.tsx.
This is the most important customer-facing page — it must be visually stunning.

DESIGN: Sri Lanka lush tropical theme. Warm golden-green palette.
Colors: deep forest green (#1a3c2e) for headers, warm sand (#f5e6c8) accents, ocean teal (#0d7377) for CTAs.
Typography: use Tailwind's font system — font-serif for headings, font-sans for body.

PAGE LAYOUT:
1. Hero Section:
   - Full-width banner, 280px tall
   - Background: gradient from #1a3c2e to #2d6a4f with a subtle leaf pattern (CSS radial-gradient)
   - Heading: "Discover Sri Lanka" (3xl bold, white)
   - Subheading: "Choose the places you want to visit and we'll plan everything"
   - Search bar centered, 600px max-width: "Search destinations, beaches, temples..."

2. Sticky Filter Bar (stays at top when scrolling, z-50):
   - Category tabs: All | Destinations | Accommodations | Restaurants | Activities (with icons)
   - District dropdown (fetched from /api/places/districts)
   - Price range: Budget | Mid-Range | Luxury (toggle buttons)
   - Tag chips (most popular tags from data, horizontal scroll on mobile)
   - Clear filters button (appears when any filter active)

3. Results count: "Showing 12 of 15 places"

4. Places Grid:
   - 3 columns desktop (lg:grid-cols-3), 2 tablet (md:grid-cols-2), 1 mobile
   - gap-6

PLACE CARD (components/places/PlaceCard.tsx):
Props: place: Place, isSelected: boolean, onToggle: () => void

Structure:
- Image: aspect-video, object-cover, rounded-t-xl, lazy loading
  On hover: scale-105 transform transition on image (overflow-hidden on wrapper)
- Category badge (top-left of image, absolute): color by category
  DESTINATION=green, ACCOMMODATION=blue, RESTAURANT=amber, ACTIVITY=purple
- If isSelected: checkmark overlay on image (semi-transparent green overlay + ✓ icon)
- Card body (white bg, rounded-b-xl, p-4, shadow-sm):
  - District (xs text, muted, uppercase tracking-wide)
  - Place name (lg font-semibold, 2-line clamp)
  - Star rating row: filled stars + "4.7" text + "(128 reviews)" muted
  - Price range: ₹ ₹₹ ₹₹₹ (colored dots)
  - Tags: 2-3 tag chips (truncated)
  - Bottom row: "View Details" link button (left) + "Add to Trip" button (right)
    Add to Trip: when not selected → outline green button
                 when selected → solid green with ✓ "Added"

PLACE DETAIL MODAL (components/places/PlaceDetailModal.tsx):
Triggered by "View Details". Use shadcn Dialog.
Content:
- Image gallery: main image (16:9) + thumbnail row below (scrollable)
- Place name (2xl bold) + district + category badge
- Rating row
- Description (full text, no truncation)
- Highlights: bulleted list with ✓ icons (green)
- Best time to visit: badge
- Tags: chips
- Mini Leaflet map (300px tall) centered on place lat/lng with a single marker
- "Add to Trip" / "Remove from Trip" button (full-width, primary)

TRIP SIDEBAR (components/booking/TripSidebar.tsx):
Desktop: fixed right panel (320px wide, full height, scrollable)
Mobile: floating button showing count → slides up as bottom sheet

Content:
- "Your Trip" heading + "{N} places selected" badge
- Scrollable list of selected places:
  - Small thumbnail + name + district
  - Drag handle icon (for reordering) + × remove button
- Divider
- "Continue to Trip Details →" button (full-width, green, disabled if 0 places)
- "Clear All" link (small, destructive)

ZUSTAND TRIP STORE (store/tripStore.ts):
interface TripStore {
  selectedPlaces: Place[]
  tripConfig: TripConfig | null   ← filled in next step
  priceQuote: PriceQuote | null
  addPlace: (place: Place) => void
  removePlace: (placeId: string) => void
  reorderPlaces: (newOrder: Place[]) => void
  clearTrip: () => void
  setTripConfig: (config: TripConfig) => void
  setPriceQuote: (quote: PriceQuote) => void
}
Persist selectedPlaces and tripConfig to localStorage.

REACT QUERY HOOKS (hooks/usePlaces.ts):
- usePlaces(filters): fetches /api/places with filter params
- useFeaturedPlaces(): fetches /api/places/featured
- usePlace(id): fetches /api/places/{id}
- useDistricts(): fetches /api/places/districts

Show PlaceCardSkeleton (components/common/PlaceCardSkeleton.tsx) while loading.
Show empty state illustration + "No places found. Try different filters." when no results.
Pagination: load more button at bottom (not infinite scroll — easier to implement).
```

---

## Prompt 5.2 — Trip Details, Date Picker & Price Quote Page
```
Build the Trip Details page at app/(public)/plan/details/page.tsx.
This is Step 2 of the booking flow.

At the very top of the page: Booking Progress Stepper component
Steps: [1 Choose Places ✓] → [2 Trip Details ←] → [3 Book Now]
Show step 1 as completed (green check), step 2 as current (blue), step 3 as upcoming (gray).

Guard: if tripStore.selectedPlaces is empty, redirect to /plan.

PAGE LAYOUT — two-column on desktop (lg:grid-cols-2 gap-8), stacked on mobile.

LEFT COLUMN — Trip Configuration Form (React Hook Form + Zod):

Schema (TripDetailsSchema):
  fromDistrict: z.string().min(1, "Select pickup district")
  toDistrict: z.string().min(1, "Select main destination district")
  pickupLocation: z.string().min(5, "Enter your pickup address")
  dropLocation: z.string().min(5, "Enter drop-off address")
  passengerCount: z.number().min(1).max(20)
  vehicleType: z.string().min(1, "Select a vehicle")
  preferredCurrency: z.string().min(1)
  startDate: z.date()
  endDate: z.date()
  customerNotes: z.string().optional()

Form sections (use shadcn Card for each section):

Section 1 — Route:
  "From District" dropdown (fetched from /api/places/districts, pre-filled if selectedPlaces have a common district)
  "To District" dropdown (same options)
  "Pickup Address" text input (placeholder: "Hotel name, street, city...")
  "Drop-off Address" text input

Section 2 — Passengers & Vehicle:
  Passenger counter: [ − ] [4] [ + ] buttons, styled cleanly
  Vehicle selector — card grid (1 col on this layout):
    Each vehicle card: icon (car emoji or Lucide icon by type) + vehicle name + capacity badge + price/day in selected currency
    Highlighted border when selected
    "⚠ Needs {N} seats, this vehicle fits {capacity}" warning if passengers > capacity
    Fetch from /api/vehicles?capacity={passengerCount}

Section 3 — Currency & Notes:
  Currency dropdown with flag emojis:
    🇺🇸 USD, 🇪🇺 EUR, 🇬🇧 GBP, 🇦🇺 AUD, 🇯🇵 JPY, 🇮🇳 INR, 🇨🇦 CAD, 🇸🇬 SGD, 🇨🇳 CNY, 🇦🇪 AED
  Notes textarea (optional, 3 rows)

RIGHT COLUMN — Date Picker & Availability:

Availability Calendar (components/booking/AvailabilityCalendar.tsx):
  - Month/year header with ← → navigation buttons
  - 7-column grid (S M T W T F S headers)
  - Fetch /api/availability/calendar?year={y}&month={m} with React Query
  - While fetching: skeleton grid
  - Each day cell (40x40px):
    - Past dates: gray text, no bg, cursor-not-allowed
    - Available (3+ drivers): white bg, hover: light green bg
    - Limited (1-2 drivers): light yellow bg, small "!" icon
    - Unavailable (0 drivers): light red bg, cursor-not-allowed, strikethrough
    - In selected range: blue bg
    - Selected start/end dates: dark blue bg, white text, rounded
  - Click behavior: first click = startDate, second click after = endDate (must be after startDate)
  - Show month legend: 🟢 Available 🟡 Limited 🔴 Unavailable
  - On month change: refetch calendar data

Below calendar — Availability Check Result:
  When startDate + endDate selected → fetch /api/availability/check?from=&to=
  Show either:
  ✅ "Available for your dates! {N} drivers ready." (green card)
  ⚠ "{N} drivers available, limited slots." (yellow card)
  ❌ "Not available for selected dates. Please choose different dates." (red card)

Price Quote Card (components/booking/PriceQuote.tsx):
  Show only when: fromDistrict, toDistrict, vehicleType, numberOfDays, passengerCount, preferredCurrency all filled.
  Fetch live from /api/pricing/quote with debounce 500ms.
  While fetching: skeleton.

  Card layout:
  "Price Estimate" heading
  Breakdown table:
    Base rate (SEDAN × 3 days)    LKR 36,000
    Passenger adjustment           LKR 4,500
    Zone factor (×1.4)             LKR 14,100
    Seasonal rate (×1.0)           LKR 0
    ─────────────────────────────────────────
    TOTAL                          LKR 54,600
  Divider
  "= USD 179.66" (large, bold, colored)
  "Exchange rate: 1 USD = 304.50 LKR" (small, muted)
  "Prices are estimates and confirmed at booking." (italic, muted, small)

"Continue to Booking →" button (full-width, large, green):
  Disabled until: dates selected, availability confirmed (not red), vehicle selected, no capacity warnings.
  On click: save TripConfig to tripStore, navigate to /plan/booking.
```

---

## Prompt 5.3 — Booking Form, Confirmation & Tracking Pages
```
Build three pages: Booking Form, Confirmation, and Public Tracking.

PAGE 1 — app/(public)/plan/booking/page.tsx:
Guard: redirect to /plan/details if no tripConfig in tripStore.
Show stepper with steps 1 ✓ and 2 ✓ completed, step 3 active.

Layout: two-column desktop (lg:grid-cols-[1fr_420px]), stacked mobile.

LEFT — Booking Form:
Heading: "Almost there! Enter your details"

React Hook Form + Zod schema (BookingFormSchema):
  customerName: z.string().min(2, "Enter your full name")
  customerEmail: z.string().email("Enter a valid email")
  customerWhatsapp: z.string().min(10, "Enter WhatsApp number with country code")
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to continue")

Fields:
  Full Name (shadcn Input + Label)
  Email Address
  WhatsApp Number:
    Inline country code selector: dropdown with flag + code (+94 🇱🇰 default, show top 15 country codes)
    Number input field beside it
    Combined on submit: "{countryCode}{number}"
  Special Requests (Textarea, optional, 4 rows, 500 char limit with counter)
  Terms checkbox:
    "I agree to TSL's Terms of Service and understand this booking is subject to availability confirmation."

Submit button: "Confirm Booking" (full-width, large, green)
  On submit:
    - Disable button immediately (prevent double-click)
    - Show spinner inside button
    - POST /api/bookings with full payload:
      { customerName, customerEmail, customerWhatsapp,
        selectedPlaceIds: tripStore.selectedPlaces.map(p=>p.id),
        fromDistrict, toDistrict, pickupLocation, dropLocation,
        startDate, endDate, numberOfDays, passengerCount,
        vehicleType, preferredCurrency, customerNotes }
    - On success: clear tripStore, navigate to /plan/confirmed?booking={bookingNumber}
    - On error: re-enable button, show toast with error message

RIGHT — Trip Summary Card (sticky):
"Your Trip Summary" heading
Selected places list (small thumbnails + names, max 5 shown + "and {N} more")
Route: "Colombo → Badulla"
Dates: "Aug 10 – Aug 13, 2025 (3 days)"
Vehicle: "SUV · Up to 6 passengers"
Passengers: "4 people"
Divider
Price: large "USD 179.66" + small "≈ LKR 54,600"
"← Edit Trip" link (small, goes back to /plan/details)

---

PAGE 2 — app/(public)/plan/confirmed/page.tsx:
Reads ?booking= from URL params.
Fetch booking via /api/bookings/number/{bookingNumber} on load.

Layout: centered, max-w-2xl, padding top.

Content:
1. Success animation: CSS animated checkmark circle (draw the circle with SVG stroke-dashoffset animation, then show ✓ inside, 1.5s total)
2. Fire canvas-confetti on mount: confetti({ particleCount: 120, spread: 70, colors: ['#1a3c2e','#0d7377','#f5e6c8','#ffd700'] })
3. "Booking Received! 🎉" heading (2xl bold green)
4. "We'll review and confirm your booking within 24 hours." (muted)
5. Booking Reference card:
   "Your Booking Number"
   TSL-V-XX (3xl bold, monospace font, copyable — click to copy with toast "Copied!")
6. Summary: customer name, email, WhatsApp, dates, route, vehicle, price
7. PDF Download button:
   Poll /api/bookings/number/{bookingNumber} every 8 seconds (max 6 attempts, 48 seconds total)
   While polling: "Generating your PDF receipt..." (spinner)
   When pdfUrl available: "⬇ Download Booking PDF" button (opens pdfUrl in new tab)
   After 6 failed attempts: "PDF will be emailed to you shortly" (don't keep polling forever)
8. "Track Your Booking" link → /track/{bookingNumber} (outline button)
9. "Plan Another Trip" link → /plan (ghost button)
10. "Go to My Dashboard" link → /dashboard (if user is logged in, check authStore)

---

PAGE 3 — app/(public)/track/[bookingNumber]/page.tsx (public, no auth):
Fetch /api/bookings/number/{bookingNumber} on load.
Show skeleton while loading. Show 404 message if not found.

Booking Status Progress Bar:
Steps: PENDING → APPROVED → COMPLETED
Show as a horizontal stepper with colored dots + connecting lines.
REJECTED: show as red step branch after PENDING.
CANCELLED: show as gray "Cancelled" label.

Content sections:
- Status badge (large, color-coded)
- If REJECTED: red warning card "Booking not approved" with rejection reason text
- Booking reference + dates + route + vehicle + passengers
- If APPROVED: driver info card (name only — no phone on public page)
- PDF download button if pdfUrl exists
- "Need help? Contact us: support@tsl.lk" footer link

Page title: "Tracking Booking {bookingNumber} | TSL"
```

---

# PHASE 6 — Customer Dashboard

---

## Prompt 6.1 — Customer Dashboard Pages
```
Build the Customer Dashboard at app/(protected)/dashboard/ for CUSTOMER role users.
Require auth — redirect to /login if not authenticated.

LAYOUT (components/layout/DashboardLayout.tsx):
Sidebar (desktop, 240px wide, fixed):
  TSL logo at top
  Navigation items with Lucide icons:
    Home → /dashboard
    My Bookings → /dashboard/bookings
    Plan New Trip → /plan (green CTA button style)
    Profile → /dashboard/profile
    Logout (bottom of sidebar)
  On mobile: hidden sidebar + hamburger topbar that slides sidebar in from left

Topbar:
  "Welcome back, {user.fullName}" (desktop)
  Notification bell (future feature — static for now)
  User avatar circle (initials)

---

PAGE 1 — /dashboard (Overview):

Stats row (grid-cols-2 md:grid-cols-4 gap-4):
  - Total Bookings (blue card, Lucide Calendar icon)
  - Pending (yellow card, Clock icon)
  - Confirmed (green card, CheckCircle icon)
  - Completed (gray card, Archive icon)
  Fetch from /api/bookings/my and compute counts client-side.

Recent Bookings section:
  Heading "Recent Bookings" + "View all →" link
  Last 3 bookings as compact cards:
    - Booking # + status badge
    - Route (From → To)
    - Dates
    - Price
    - "View Details" button

Quick action CTA:
  Full-width card with green background: "Ready for your next adventure?"
  "Plan a New Trip →" button

---

PAGE 2 — /dashboard/bookings (My Bookings):

Filter tabs: All | Pending | Approved | Completed | Rejected | Cancelled
Each tab shows count badge.

Booking cards (not a table — cards are better on mobile):

BookingCard component (components/booking/BookingCard.tsx):
Props: booking: Booking

Card layout:
  Top row: TSL-V-XX (mono font, bold) | Status badge (color-coded)
  Route row: Colombo → Ella (with right-arrow icon)
  Info row: 📅 Aug 10-13 (3 days) | 👥 4 passengers | 🚗 SUV
  Price row: LKR 54,600 | = USD 179.66 (muted)
  
  Conditional sections:
  If APPROVED: 
    Driver info card (light blue bg): "Your Driver: {driverName} | {phone}"
  If REJECTED:
    Rejection reason (light red bg): "Reason: {rejectionReason}"
  
  Bottom action row:
    "Download PDF" button (if pdfUrl — opens new tab) | icon: FileDown
    "Cancel Booking" button (only if PENDING, destructive outline) — opens AlertDialog confirmation
    "View Details" button (ghost, opens detail modal)

Fetch from /api/bookings/my with React Query, refetch every 30s.
Show empty state: "No bookings yet. Ready to explore Sri Lanka?" + Plan Trip button.

---

PAGE 3 — /dashboard/profile (Profile Settings):

Two sections:

Section 1 — Personal Info:
  Form: Full Name, WhatsApp Number, Preferred Currency (dropdown — saves to user profile)
  Profile photo: circle avatar (show current or initials), click to upload new photo
    On photo select: upload to /api/users/profile-image (multipart, POST)
    Backend: upload to Cloudinary, save URL, return updated user
  Save Changes button

Section 2 — Change Password:
  Form: Current Password, New Password, Confirm New Password
  POST /api/auth/change-password
  Show success/error toast

Backend endpoint to add:
PUT /api/users/profile (authenticated) — update fullName, phone, preferredCurrency
POST /api/users/profile-image (authenticated) — upload photo to Cloudinary, update user
POST /api/auth/change-password (authenticated) — verify current password, update
```

---

# PHASE 7 — Admin & Manager Dashboards

---

## Prompt 7.1 — Admin Dashboard
```
Build the Admin Dashboard at app/(protected)/admin/ for ADMIN role only.
Redirect non-ADMIN users to their correct dashboard.

LAYOUT: Same DashboardLayout component but with admin-specific sidebar links.
Admin Sidebar links:
  Dashboard Overview
  Bookings (with PENDING count badge in red if >0)
  Places Management
  Vehicles Management
  Users Management
  Drivers Management

---

PAGE 1 — /admin/dashboard:

Stats cards row (grid-cols-2 lg:grid-cols-4):
  Pending Bookings (red if >0), Today's Bookings, This Month Revenue (LKR), Active Drivers

Pending Bookings Queue (most important widget):
  Heading: "Needs Review" + red badge with count
  Sorted by: waiting time (longest waiting first)
  Each item: booking # | customer name | route | dates | price | "Review →" button
  "Review →" opens BookingReviewPanel (side sheet / Dialog)
  If no pending: "All clear! No pending bookings." (green success state)

Recent Activity Feed:
  Last 15 bookings (any status) with timestamps.
  Format: "{admin name} approved TSL-V-12 · 2 hours ago"

---

PAGE 2 — /admin/bookings:

Data table using shadcn Table:
Columns: Booking # | Customer | Route | Dates | Passengers | Vehicle | Status | Price (LKR) | Submitted | Actions

Filter bar:
  Status dropdown (All/Pending/Approved/Rejected/Completed/Cancelled)
  Date range picker (shadcn DateRangePicker)
  Search input (booking number or customer name — debounced 300ms)

Fetch from /api/admin/bookings with pagination (20 per page).
Show shadcn Pagination at bottom.

Row click OR "Review" button → BookingReviewPanel (shadcn Sheet, right side):

BookingReviewPanel content:
  Full booking details (all fields)
  Customer contact: Email (mailto link) | WhatsApp (wa.me/{number} link — clickable)
  
  If PENDING status:
    "Assign Vehicle" dropdown — fetched from /api/availability/vehicles?from=&to=&minCapacity={n}
      Shows only available vehicles for those dates with enough capacity
    "Assign Driver" dropdown — fetched from /api/availability/drivers?from=&to=
      Shows only available drivers for those dates, shows vehicle name next to driver
    "Approve & Assign" button (green, primary) — requires both vehicle and driver selected
      PUT /api/admin/bookings/{id}/approve with { vehicleId, driverId }
      On success: show toast, close panel, refetch table
    "Reject Booking" button (red, outline)
      Opens AlertDialog with:
        Textarea for rejection reason (required, min 10 chars)
        "Confirm Rejection" button
        PUT /api/admin/bookings/{id}/reject with { rejectionReason }
  
  If APPROVED: Show assigned vehicle + driver info
  If REJECTED: Show rejection reason
  
  "Download PDF" link if pdfUrl exists
  "Mark Complete" button if APPROVED

---

PAGE 3 — /admin/places:
Table: Name | Category | District | Rating | Status (Active/Inactive) | Featured | Actions
"Add Place" button → Dialog with full Place form (all fields + image upload via Cloudinary)
"Edit" per row → same Dialog pre-filled
"Toggle Active" → PUT /api/admin/places/{id} with { isActive: !current }
"Toggle Featured" → PUT /api/admin/places/{id}/feature
"Upload Images" → multi-file input, each uploaded separately to Cloudinary

---

PAGE 4 — /admin/vehicles:
Table: Name | Type | Capacity | Registration | Assigned Driver | Status | Actions
"Add Vehicle" button → Dialog (name, type, capacity, registration, image upload)
"Edit/Delete" per row
"Assign Driver" → dropdown of active DRIVER users

---

PAGE 5 — /admin/users:
Table: Name | Email | Role | Status | Created | Actions
"Create User" button → Dialog:
  Form: Full Name, Email, Temporary Password, Role dropdown (ADMIN/MANAGER/FINANCE_MANAGER/DRIVER), Phone
  For DRIVER role: show additional field "License Number"
  POST /api/admin/users
"Activate/Deactivate" toggle per row
Filter by role tabs at top

---

PAGE 6 — /admin/drivers:
List of DRIVER users with expanded availability view.
Each driver row expands to show:
  - This week's assigned bookings (compact list)
  - Blocked dates list (with "Remove block" per date)
  - "Block a Date" date picker
  - Assigned vehicle name
```

---

## Prompt 7.2 — Manager Dashboard
```
Build the Manager Dashboard at app/(protected)/manager/.
Manager has booking review access but NO user/vehicle/place management.

Middleware: allow ADMIN and MANAGER roles on /manager/** routes.

LAYOUT: Same DashboardLayout, sidebar links:
  Overview
  Booking Queue (pending bookings assigned to manager)
  All Bookings (read + action)
  My Actions Log

---

PAGE 1 — /manager/dashboard:
Stats: Pending Bookings | Approved Today | Rejected This Week | Total Reviewed (by this manager)
Pending queue identical to admin's — same BookingReviewPanel component (reuse it)
"Needs Your Attention" urgency widget

---

PAGE 2 — /manager/bookings:
Same table as admin bookings with same filters.
Same BookingReviewPanel for approve/reject.
Manager sees ALL bookings but can only action PENDING ones.

---

PAGE 3 — /manager/actions:
Table: Date | Booking # | Customer | Action (Approved/Rejected) | Reason (if rejected) | Time
Fetched from /api/admin/bookings?reviewedBy={currentManagerId}
This is the manager's personal accountability log.
Export to CSV button.
```

---

# PHASE 8 — Finance Dashboard

---

## Prompt 8.1 — Finance Manager Dashboard
```
Build the Finance Dashboard at app/(protected)/finance/ for FINANCE_MANAGER role.

LAYOUT: DashboardLayout, sidebar links:
  Overview
  Pricing Rules
  Exchange Rates
  Revenue Reports
  All Bookings (financial view)

---

PAGE 1 — /finance/dashboard (Overview):

KPI Cards row (grid-cols-2 lg:grid-cols-4):
  Total Revenue (LKR) — all time
  This Month (LKR)
  This Week (LKR)
  Avg Booking Value (LKR)
All fetched from /api/finance/revenue-summary?from={12 months ago}&to={today}

Revenue Chart (Recharts LineChart):
  X-axis: months (last 12 months labels)
  Y-axis: revenue in LKR (formatted as "LKR 50K")
  Single line, green color, with dots
  Tooltip: "Month: LKR 54,600"
  Fetch data from revenue-summary API

Two smaller charts side by side:
  Left — Bookings by Vehicle Type (Recharts PieChart / DonutChart):
    Segments colored by vehicle type
    Legend below
  Right — Top 5 Routes by Revenue (Recharts HorizontalBarChart):
    Route "Colombo → Ella" | LKR 180,000

---

PAGE 2 — /finance/pricing:

Pricing Rules Table:
  Columns: Vehicle Type | Base Price/Day (LKR) | Extra/Passenger (LKR) | Seasonal Multiplier | Status | Edit
  "Edit" opens inline editing row (not modal) — click pencil → cells become inputs → Save / Cancel buttons
  PUT /api/finance/pricing-rules/{id} on save

Zone Multipliers section (below main table):
  Table: From District | To District | Multiplier | Delete
  "Add Zone" button → inline new row form
  Multiplier input: number field (min 0.5, max 3.0, step 0.1) + "(×{value} = {percentage}% adjustment)" helper text
  Deletable per row

Seasonal Multiplier card:
  "Current season: Normal (×1.0)"
  Slider: 0.8 to 2.0 (0.1 steps)
  Helper: "×1.0 = standard pricing | ×1.5 = 50% peak season surcharge"
  Apply to All Rules button (updates all pricing rules seasonalMultiplier)

---

PAGE 3 — /finance/rates (Exchange Rates):

Table: Currency | Code | Symbol | Rate (per 1 LKR) | LKR per 1 Unit | Last Updated | Edit
Example row: 🇺🇸 US Dollar | USD | $ | 0.00329 | 304.56 | 2h ago | Edit

"Update All Rates" button → Dialog:
  Table with editable rate fields for each currency
  "Save All" → PUT /api/finance/exchange-rates with full rates map

Preview section: "With current rates, LKR 10,000 equals:"
  Grid showing: $32.90 | €30.30 | £25.90 | ¥4,950 | ₹274 | A$50.80 ...

Last updated timestamp + "Rates are updated manually. Consider checking rates at xe.com" info note.

---

PAGE 4 — /finance/reports:

Date range picker: From date | To date | "Generate Report" button
Fetches /api/finance/revenue-summary?from=&to=

Revenue summary cards + charts (reuse Overview components, filtered by selected dates).

Bookings table (detailed financial view):
  Columns: Booking # | Customer | Route | Dates | Days | Passengers | Vehicle | LKR Total | Currency | Foreign Total | Rate Used | Status
  Sortable columns (client-side sort)
  "Export CSV" button:
    Generate CSV from table data
    Trigger download: new Blob([csvString], { type: 'text/csv' })
    filename: "TSL-Revenue-Report-{from}-{to}.csv"

---

PAGE 5 — /finance/bookings:
Same as admin bookings table but read-only (no approve/reject — Finance only views financial data).
Additional financial columns shown.
Filter by currency, vehicle type, date range.
```

---

# PHASE 9 — Driver Dashboard

---

## Prompt 9.1 — Driver Mobile Dashboard
```
Build the Driver Dashboard at app/(protected)/driver/ for DRIVER role.
CRITICAL: This dashboard is used on mobile phones by drivers.
All touch targets must be minimum 44px. Fonts large and readable. High contrast.

LAYOUT for driver: NOT the standard DashboardLayout.
Use a mobile-first layout with bottom tab navigation:
  Bottom tabs (fixed, 60px tall):
    [🏠 Today] [📅 Schedule] [👤 Profile]
  Top bar: "TSL Driver" logo left + driver name right + online/offline toggle

---

TAB 1 — Today (/driver/dashboard):
Fetch from /api/driver/bookings/today.

If no trips today:
  Full-page empty state: large emoji 🌴 + "No trips today" (large text) + "Enjoy your day!"

If trips exist:
  Date header: "Today · {Day, Month Date}"
  Trip cards (large, touch-friendly, 16px+ all text):

    TripCard component:
    Card with left green border accent. Padding 20px.

    Row 1: "TSL-V-XX" (font-mono, lg bold) | Status badge
    Row 2: Customer name (xl, bold)
    Row 3: WhatsApp button — large, green, full-width:
      "📱 WhatsApp {customerName}" → opens wa.me/{customerWhatsapp}
    Divider
    Row 4: "📍 Pickup" label + pickup address (md, bold)
    "Open in Maps" link → opens https://maps.google.com/?q={pickupLocation} in new tab
    Row 5: "🏁 Drop-off" label + drop address
    "Open in Maps" link
    Divider
    Row 6: info chips in a row:
      📅 {startDate} – {endDate}
      👥 {passengerCount} passengers
      🗓 {numberOfDays} days
    Row 7: Price badge: "LKR {price}" (large, bold, green bg)
    
    If status = APPROVED and today is within trip dates:
      "✅ Mark as Completed" button (full-width, large, green outline)
      → AlertDialog: "Confirm trip completion for TSL-V-XX?"
      → PUT /api/driver/bookings/{id}/complete

---

TAB 2 — Schedule (/driver/schedule):

Week navigation: ← [Aug 4 – Aug 10, 2025] →
Navigate by week (previous/next buttons, large tap targets).

Week grid: 7 columns, each day shows:
  Day name (large: MON, TUE...)
  Date number (2xl, bold)
  If has booking: green badge with count
  If blocked: gray "BLOCKED" label
  If today: blue ring border

Click any day → expand below into day detail:
  If has bookings: show compact trip cards (just booking #, route, customer name)
  If blocked: "You blocked this day" + "Unblock" button (DELETE /api/driver/availability/unblock?date=)
  If available: "Block this day" button (POST /api/driver/availability/block with { date })

My Blocked Dates section (below week view):
  List of all upcoming blocked dates as chips: "Aug 15" [×]
  "Block a Date" button → opens Calendar (react-day-picker single mode) → POST to block

---

TAB 3 — Profile (/driver/profile):

Large avatar circle at top (initials or photo)
Driver name (2xl, bold, centered)
"🟢 Available for trips" / "🔴 Not available" toggle switch
  When toggled OFF: PUT /api/users/profile (isAvailable: false)
  Visible to admin in driver list as unavailable

Info section (read-only):
  Email, Phone, License Number, Assigned Vehicle

"Change Password" button → bottom sheet form (current, new, confirm)

Logout button (full-width, red outline, at bottom)
```

---

# PHASE 10 — Public Pages, Polish & Deployment

---

## Prompt 10.1 — Homepage & Shared Public Components
```
Build the homepage and all shared public-facing components.

NAVBAR (components/layout/Navbar.tsx) — for public pages:

Desktop layout:
  Left: "🌿 TSL" logo text (green, font-serif, lg)
  Center nav links: Home | Destinations | Plan a Trip | Track Booking
  Right: "Login" (outline button) + "Start Planning" (green button)
  If logged in (check authStore): replace buttons with user avatar dropdown:
    Dropdown: My Dashboard | Profile | Logout

Mobile: hamburger menu → slide-in drawer from right (use shadcn Sheet)

Behavior: transparent background on page top → white shadow background on scroll (use useScroll hook or IntersectionObserver).

---

HOMEPAGE (app/(public)/page.tsx):

Section 1 — Hero:
  Full viewport height (100vh)
  Background: CSS gradient mesh (deep greens + ocean teals)
  Overlay: subtle animated particles or floating circles (CSS @keyframes, no heavy library)
  Center content:
    Small badge: "🇱🇰 Discover the Pearl of the Indian Ocean"
    Main headline (4xl-6xl bold): "Your Sri Lanka Adventure Starts Here"
    Subheading: "Plan your perfect trip, choose destinations, we handle drivers, vehicles, and accommodation recommendations."
    Two CTA buttons: "Start Planning" (green, large) → /plan | "Track Booking" (white outline) → /track
    Scroll indicator arrow (animated bounce)

Section 2 — Featured Destinations:
  Heading: "Popular Destinations"
  Subheading: "Handpicked places loved by travelers"
  Fetch from /api/places/featured (React Query)
  Horizontal scroll row on mobile, 4-column grid on desktop
  Use PlaceCard component in "compact" mode (no Add to Trip button — just View Details)

Section 3 — How It Works:
  3-step process cards:
    1. 🗺 "Choose Your Places" — Browse and select Sri Lanka destinations you want to visit
    2. 📅 "Pick Your Dates" — Check real-time availability and get instant price quotes
    3. ✅ "We Handle Everything" — Confirm your booking, get a driver and vehicle assigned
  Clean, minimal card design, numbered steps.

Section 4 — Stats Bar:
  Full-width dark green band:
    500+ Happy Travelers | 25 Destinations | 5 Vehicle Types | 24hr Confirmation
  Animated count-up when section enters viewport (use IntersectionObserver + simple counter animation)

Section 5 — CTA Banner:
  Warm gradient background (golden-green)
  "Ready to experience Sri Lanka?"
  "Start Planning Your Trip →" large button → /plan

Footer:
  TSL logo + tagline
  Links: Home | Plan a Trip | Track Booking | Contact
  "support@tsl.lk | +94 11 234 5678"
  "© 2025 TSL Tourism Sri Lanka. All rights reserved."

---

SHARED COMPONENTS TO BUILD:

1. StatusBadge (components/common/StatusBadge.tsx):
   Props: status: BookingStatus
   PENDING → yellow badge | APPROVED → green | REJECTED → red | COMPLETED → blue | CANCELLED → gray

2. LoadingSpinner (components/common/LoadingSpinner.tsx):
   Centered spinner for page-level loading states.

3. PlaceCardSkeleton (components/common/PlaceCardSkeleton.tsx):
   Skeleton card matching PlaceCard dimensions using Tailwind animate-pulse.

4. BookingCardSkeleton: same pattern.

5. EmptyState (components/common/EmptyState.tsx):
   Props: icon, title, description, actionLabel?, actionHref?

6. app/not-found.tsx:
   "404 — Lost in the Jungle 🌿" page
   Fun Sri Lanka themed message
   Back to Home button

7. app/error.tsx:
   "Something went wrong" fallback page
   "Try again" button (calls error boundary reset)

8. app/loading.tsx:
   Full-page loading state with TSL logo pulsing

9. Booking number search (in Navbar):
   Small input "Track TSL-V-XX" on desktop → on Enter navigate to /track/{bookingNumber}
   On mobile: part of the drawer menu
```

---

## Prompt 10.2 — Security Hardening, Validation & Testing
```
Harden both frontend and backend for production quality.

BACKEND HARDENING:

1. Input validation on ALL request DTOs:
   Add @NotBlank, @Email, @Min, @Max, @Size, @Pattern annotations.
   BookingRequest: startDate must be @Future, endDate must be after startDate (custom validator).
   Custom validator class @ValidDateRange.

2. Global Exception Handler (@RestControllerAdvice GlobalExceptionHandler):
   Handle and return consistent JSON:
   { "error": "VALIDATION_ERROR", "message": "...", "fields": [{field, message}], "timestamp": "..." }
   
   Map these exceptions:
   - MethodArgumentNotValidException → 400 with field errors
   - ConstraintViolationException → 400
   - ResourceNotFoundException (custom) → 404
   - BookingUnavailableException (custom) → 409
   - AccessDeniedException → 403
   - AuthenticationException → 401
   - Exception (catch-all) → 500 with "An unexpected error occurred"

3. Rate limiting using Bucket4j (add dependency: com.github.vladimir-bukhtoyarov:bucket4j-core:8.10.1):
   RateLimitFilter on POST /api/bookings:
   - 5 requests per IP per hour
   - Return 429 Too Many Requests if exceeded: { "error": "RATE_LIMIT_EXCEEDED", "retryAfterSeconds": 3600 }

4. MongoDB indexes (create in DataSeeder if not exists):
   db.bookings: { bookingNumber: 1 } unique
   db.bookings: { customerId: 1, status: 1, createdAt: -1 }
   db.users: { email: 1 } unique
   db.users: { role: 1 }
   db.places: { category: 1, district: 1, isActive: 1 }
   db.driver_availability: { driverId: 1 } unique

5. Add @PreAuthorize to all service methods (defense in depth):
   @PreAuthorize("hasRole('ADMIN')") on all admin-only service methods
   @PreAuthorize("hasAnyRole('ADMIN','MANAGER')") on booking approval methods
   @PreAuthorize("hasRole('FINANCE_MANAGER')") on pricing methods
   @PreAuthorize("hasRole('DRIVER')") on driver methods

6. Request/Response logging filter (implements OncePerRequestFilter):
   Log: [METHOD] /path → HTTP_STATUS (duration ms) [userId if authenticated]
   Log at INFO level. Never log passwords or tokens.

7. Sanitize free-text inputs in service layer:
   Strip HTML tags from: pickupLocation, dropLocation, customerNotes, rejectionReason, place descriptions
   Use Apache Commons Text StringEscapeUtils or simple regex.

FRONTEND HARDENING:

1. Axios error interceptor in lib/api.ts:
   Map HTTP status codes to user-friendly messages:
   400 → show field-level validation errors from response body
   401 → "Session expired. Please log in again." → redirect to /login
   403 → "You don't have permission to do this."
   404 → "The requested resource was not found."
   409 → "These dates are no longer available. Please choose different dates."
   429 → "Too many requests. Please wait a moment and try again."
   500 → "Something went wrong on our end. Please try again."

2. Form protection — disable submit button immediately on click:
   All forms: set isSubmitting state to true on first submit → prevent duplicate submissions.

3. next.config.js security headers:
   headers() async function returning:
   X-Frame-Options: DENY
   X-Content-Type-Options: nosniff
   Referrer-Policy: strict-origin-when-cross-origin
   Permissions-Policy: camera=(), microphone=(), geolocation=()

4. Image domains in next.config.js:
   images.remotePatterns: [{ hostname: 'res.cloudinary.com' }, { hostname: 'picsum.photos' }]

UNIT TESTS (backend — JUnit 5 + Mockito):

Write tests for these 4 critical classes:

1. BookingIdGeneratorTest:
   Test sequential generation: first call = TSL-V-00, second = TSL-V-01
   Test format: TSL-V-09 → TSL-V-10 (not TSL-V-010)
   Test TSL-V-99 → TSL-V-100

2. PricingServiceTest:
   Test basic calculation: SEDAN, 3 days, 2 passengers, no zone, no seasonal = expected LKR total
   Test zone multiplier applied correctly
   Test seasonal multiplier stacks with zone
   Test currency conversion
   Test missing PricingRule → ResourceNotFoundException

3. AvailabilityServiceTest (mock repositories):
   Test: driver with overlapping approved booking is NOT available
   Test: driver with blocked date is NOT available
   Test: driver with no conflicts IS available
   Test: range check returns false when any day has 0 drivers

4. JwtUtilTest:
   Test: generateAccessToken → validateToken returns true
   Test: expired token → validateToken returns false
   Test: tampered token → validateToken returns false
   Test: extractUserId matches the user's actual ID

Run: mvn test → confirm all tests pass.
```

---

## Prompt 10.3 — Deployment: Vercel + Render + MongoDB Atlas + Cloudflare
```
Prepare the complete deployment configuration using the exact free-tier stack.

--- FRONTEND → VERCEL ---

1. Create frontend/vercel.json:
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}

2. frontend/.env.production.example (commit this, not actual values):
# Copy to .env.production.local and fill in values
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
NEXT_PUBLIC_APP_URL=https://your-domain.pages.dev

3. next.config.js final version:
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    }]
  },
}
module.exports = nextConfig

4. Vercel deployment steps (add to DEPLOYMENT.md):
   a. Push code to GitHub
   b. Go to vercel.com → New Project → Import from GitHub → select tsl-platform
   c. Set Root Directory: frontend
   d. Add Environment Variables:
      NEXT_PUBLIC_API_URL = https://your-backend.onrender.com/api
      NEXT_PUBLIC_APP_URL = https://your-vercel-url.vercel.app
   e. Deploy

--- BACKEND → RENDER ---

1. Create backend/Dockerfile:
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]

2. Create backend/.dockerignore:
target/
*.md
.git/

3. Create render.yaml at project root:
services:
  - type: web
    name: tsl-backend
    runtime: docker
    dockerfilePath: ./backend/Dockerfile
    buildCommand: cd backend && mvn clean package -DskipTests
    healthCheckPath: /api/health
    envVars:
      - key: SPRING_PROFILES_ACTIVE
        value: prod
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: RESEND_API_KEY
        sync: false
      - key: CLOUDINARY_CLOUD_NAME
        sync: false
      - key: CLOUDINARY_API_KEY
        sync: false
      - key: CLOUDINARY_API_SECRET
        sync: false
      - key: FRONTEND_URL
        sync: false

4. backend/src/main/resources/application-prod.yml:
logging:
  level:
    root: WARN
    com.tsl: INFO
spring:
  data:
    mongodb:
      uri: ${MONGODB_URI}
      auto-index-creation: true
server:
  port: 8080
  shutdown: graceful

5. Render deployment steps (add to DEPLOYMENT.md):
   a. Go to render.com → New Web Service
   b. Connect GitHub repo
   c. Root directory: (leave blank — uses render.yaml)
   d. Add all environment variables in Render dashboard
   e. Deploy (first deploy takes ~10 minutes — free tier)
   f. Note: Render free tier spins down after 15min inactivity → first request takes ~30s to cold start
      Add a note in DEPLOYMENT.md about this limitation

--- MONGODB ATLAS → M0 FREE TIER ---

Step-by-step in DEPLOYMENT.md:
  1. Go to cloud.mongodb.com → Create Free Account
  2. Create Project: "TSL Platform"
  3. Create Cluster: M0 Sandbox (free), region: AWS ap-southeast-1 (Singapore — closest to Sri Lanka)
  4. Database User: username=tsl_app, strong password → role: readWrite on tsldb
  5. Network Access: Add IP 0.0.0.0/0 (allow all — needed for Render's dynamic IPs)
  6. Get connection string: mongodb+srv://tsl_app:{password}@cluster.mongodb.net/tsldb
  7. Add this as MONGODB_URI in Render environment variables
  8. Also set in local .env for development: MONGODB_URI=mongodb+srv://...

--- CLOUDFLARE → FREE CDN + SSL ---

DEPLOYMENT.md steps:
  1. Register domain at any registrar (Namecheap, GoDaddy etc.)
  2. Add site to Cloudflare free plan
  3. Update nameservers at registrar to Cloudflare's nameservers
  4. Add DNS records:
     CNAME  www    →  your-project.vercel.app (Proxied, orange cloud)
     CNAME  api    →  tsl-backend.onrender.com (Proxied)
  5. SSL/TLS: Set mode to "Full (strict)"
  6. In Vercel: add custom domain → www.yourdomain.com
  7. Update NEXT_PUBLIC_APP_URL and FRONTEND_URL to https://www.yourdomain.com

--- GITHUB ACTIONS CI/CD ---

Update .github/workflows/frontend.yml to also run type-check:
  - run: npm run build
  Vercel auto-deploys on push to main via Vercel GitHub integration (no extra config needed).

Update .github/workflows/backend.yml to run tests:
  - run: mvn clean package  (includes tests — remove -DskipTests for CI)
  Add: MONGODB_URI: mongodb://localhost:27017/tsldb_test as env for tests (use flapdoodle embedded MongoDB)
  Add dependency for tests: de.flapdoodle.embed:de.flapdoodle.embed.mongo.spring30x:4.12.0

--- FINAL DEPLOYMENT.md ---
Create a complete DEPLOYMENT.md at project root covering all steps above in order:
1. MongoDB Atlas setup
2. Cloudinary account setup (free tier, create upload presets: places_images, vehicle_images, pdf_documents)
3. Resend account setup (verify sending domain or use onboarding@resend.dev for testing)
4. Backend deployment to Render
5. Frontend deployment to Vercel  
6. Cloudflare domain setup
7. Post-deployment smoke tests checklist:
   □ GET https://api.yourdomain.com/api/health returns { status: UP }
   □ Can register a new customer account
   □ Can login and reach dashboard
   □ Can browse places on /plan
   □ Can create a test booking
   □ Admin receives email notification
   □ Admin can approve booking
   □ Customer receives confirmation email
   □ PDF download works
```

---

# QUICK REFERENCE — FULL PROMPT ORDER

| # | Phase | Prompt | Builds |
|---|-------|--------|--------|
| 1 | Setup | 1.1 | Next.js 14 + Tailwind + shadcn monorepo |
| 2 | Setup | 1.2 | Spring Boot 3 Java backend scaffold |
| 3 | Setup | 1.3 | Git + GitHub Actions CI/CD + Docker Compose |
| 4 | Auth | 2.1 | Spring Security + JWT backend auth system |
| 5 | Auth | 2.2 | Login/Register pages + Zustand store + route protection |
| 6 | Data | 3.1 | Places & Vehicles API + Cloudinary + 15-place seed data |
| 7 | Data | 3.2 | Pricing engine + multi-currency (12 currencies) |
| 8 | Avail | 4.1 | Availability calendar engine + driver/vehicle tracking |
| 9 | Book | 4.2 | Booking CRUD + TSL-V-XX ID generator (core module) |
| 10 | Book | 4.3 | PDF (iText 7 + ZXing QR) + Resend email + WhatsApp stub |
| 11 | UI | 5.1 | Places explorer (main customer UI — trip planner) |
| 12 | UI | 5.2 | Trip details + availability calendar + price quote |
| 13 | UI | 5.3 | Booking form + confetti confirmation + public tracking |
| 14 | Dash | 6.1 | Customer dashboard + bookings + profile |
| 15 | Dash | 7.1 | Admin dashboard + booking review + places/vehicles/users |
| 16 | Dash | 7.2 | Manager dashboard + booking queue + actions log |
| 17 | Dash | 8.1 | Finance dashboard + Recharts + pricing + exchange rates |
| 18 | Dash | 9.1 | Driver mobile dashboard + schedule + availability |
| 19 | Polish | 10.1 | Homepage + navbar + shared components + 404/error pages |
| 20 | Polish | 10.2 | Security hardening + JUnit tests + rate limiting |
| 21 | Deploy | 10.3 | Vercel + Render + MongoDB Atlas + Cloudflare setup |

---

# CURSOR AGENT TIPS

1. **Always use Agent mode** — press Ctrl+I (Windows/Linux) or Cmd+I (Mac). Never use inline mode for these prompts.
2. **One prompt at a time** — wait for completion, run the app, fix any errors before the next prompt.
3. **Critical test gates:**
   - After Prompt 5: Run `mvn test` → must pass. Run backend → `GET /api/health` must return 200.
   - After Prompt 7 (auth pages): Full login/register cycle must work. Roles must redirect correctly.
   - After Prompt 11 (booking): Create a full booking end-to-end. Check MongoDB for the document.
   - After Prompt 12 (notifications): Verify email arrives in inbox using a real Resend test key.
4. **If Cursor times out on a long prompt:** Split it — do the Model first, then Service, then Controller.
5. **Re-orient Cursor** when starting a new session by pasting this context block first:
   > "We are building TSL (Tourism Sri Lanka). Stack: Next.js 14 App Router + TypeScript + Tailwind + shadcn/ui on Vercel. Backend: Spring Boot 3 Java + Spring Security JWT + MongoDB Atlas on Render. File storage: Cloudinary. Email: Resend (smtp.resend.com). Booking IDs format: TSL-V-00. 5 roles: CUSTOMER, ADMIN, MANAGER, FINANCE_MANAGER, DRIVER."
6. **MongoDB is running locally** via Docker Compose during development (`docker-compose up -d`).
7. **Free tier cold starts:** Render free tier sleeps after 15min inactivity. First request after sleep takes ~30s. This is normal — upgrade to paid tier ($7/mo) for production.
