# Movely - System Architecture

**Last Updated:** 2026-04-06  
**Phase:** 5 - Lead Tracking & Metrics Complete  

## Overview

Movely follows a **monolithic architecture** organized by **business domains** (modules). This design prioritizes simplicity, clarity, and progressive scalability over premature optimization.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                               │
│                    (Browser / Mobile)                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      NEXT.JS APP                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  APP ROUTER                                           │  │
│  │  ├── (public)    - Public pages                       │  │
│  │  ├── (dashboard) - Driver dashboard                   │  │
│  │  ├── (admin)     - Admin panel                        │  │
│  │  └── /api        - API routes & webhooks              │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                   │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  SERVER ACTIONS (Primary Interface)                   │  │
│  │  - createDriver()                                      │  │
│  │  - trackLead()                                         │  │
│  │  - approveDriver()                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                   │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  MODULES (Business Logic Layer)                       │  │
│  │  ├── /drivers    - Driver management                  │  │
│  │  ├── /leads      - Lead tracking                      │  │
│  │  ├── /auth       - Authentication                     │  │
│  │  └── /admin      - Admin operations                   │  │
│  │                                                         │  │
│  │  Each module has:                                      │  │
│  │  ├── services/    - Business logic                    │  │
│  │  ├── repositories/ - Data access                      │  │
│  │  ├── actions/     - Server Actions                    │  │
│  │  ├── validations/ - Input validation                  │  │
│  │  └── types.ts     - Type definitions                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                   │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  LIB (Shared Utilities)                               │  │
│  │  ├── /db         - Prisma client                      │  │
│  │  ├── /supabase   - Supabase clients                   │  │
│  │  ├── /utils      - Helper functions                   │  │
│  │  └── /constants  - App constants                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │   Supabase   │  │   Supabase   │      │
│  │  (via Prisma)│  │     Auth     │  │   Storage    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Key Architectural Decisions

### 1. Monolith over Microservices

**Decision:** Single Next.js application

**Rationale:**
- Simpler deployment and maintenance
- Faster development for MVP
- No network overhead between services
- Easier debugging and testing
- Can be split later if needed

### 2. Module-Based Organization

**Decision:** Organize code by business domain (`/modules`)

**Rationale:**
- Clear separation of concerns
- Easy to understand and navigate
- Scales better than technical layers (controllers, models, etc.)
- Each module is self-contained
- New developers can focus on one module

### 3. Server Actions as Primary Interface

**Decision:** Use Next.js Server Actions instead of API Routes

**Rationale:**
- Better developer experience
- Type-safe end-to-end
- Automatic serialization
- No need to create REST endpoints
- Simpler codebase
- API Routes only for webhooks

### 4. Repository Pattern

**Decision:** Separate data access (repositories) from business logic (services)

**Rationale:**
- Database queries isolated in repositories
- Business logic stays clean
- Easy to mock for testing
- Can swap DB layer if needed

### 5. Prisma ORM

**Decision:** Prisma as the database interface

**Rationale:**
- Type-safe database queries
- Great TypeScript support
- Excellent migration system
- Clear schema definition
- Good performance

## Data Flow

### Standard Flow

```
User Action
    ↓
React Component
    ↓
Server Action (actions/)
    ↓
Service Layer (services/)
    ↓
Repository Layer (repositories/)
    ↓
Prisma Client
    ↓
PostgreSQL
```

### Example: Creating a Driver Profile

```typescript
// 1. User submits form in React component
<form action={createDriverProfile}>
  ...
</form>

// 2. Server Action receives data
// modules/drivers/actions/create-driver.ts
export async function createDriverProfile(formData: FormData) {
  const validated = validateDriverInput(formData)
  return await DriverService.create(validated)
}

// 3. Service layer applies business logic
// modules/drivers/services/driver.service.ts
class DriverService {
  async create(data: CreateDriverInput) {
    const slug = await this.generateUniqueSlug(data.displayName)
    return await DriverRepository.create({ ...data, slug })
  }
}

// 4. Repository executes database operation
// modules/drivers/repositories/driver.repository.ts
class DriverRepository {
  async create(data) {
    return await prisma.driver.create({ data })
  }
}
```

## Authentication Flow (Phase 1 - Implemented)

### Registration Flow

```
1. User submits registration form (/register)
   ↓
2. Client component: RegisterForm validates input
   ↓
3. Server Action: register() validates with Zod
   ↓
4. Supabase Auth: signUp() creates user in auth.users
   ↓
5. Database Trigger: handle_new_user() creates record in public.users
   ↓
6. User.id === auth.users.id (same UUID) ✓
   ↓
7. IF session exists: Redirect to /dashboard
   IF no session: Redirect to /check-email (email confirmation required)
```

### Login Flow

```
1. User submits login form (/login)
   ↓
2. Client component: LoginForm validates input
   ↓
3. Server Action: login() validates with Zod
   ↓
4. Supabase Auth: signInWithPassword() validates credentials
   ↓
5. Session created in HTTP-only cookie
   ↓
6. Redirect to /dashboard (or preserved redirect URL)
```

### Middleware Protection

```
1. Every request hits middleware.ts
   ↓
2. Supabase SSR client validates session
   ↓
3. IF route is /dashboard or /admin AND no user:
     → Redirect to /login?redirect=<path>
   ↓
4. IF route is /login or /register AND user exists:
     → Redirect to /dashboard
   ↓
5. Continue to requested page
```

**Key Points:**
- No database queries in middleware (performance optimized)
- Admin role check happens in `app/(admin)/layout.tsx` (server-side Prisma query)
- Session stored in HTTP-only cookies (secure)
- `User.id` in database **MUST** match `auth.users.id` in Supabase (enforced by trigger)

## Driver Profile Management Flow (Phase 2 - Implemented)

### Create Profile Flow

```
1. User navigates to /dashboard/profile
   ↓
2. ProfileForm component renders with empty state
   ↓
3. User fills profile fields (displayName, phone, city, etc.)
   ↓
4. Server Action: createProfile() validates with Zod
   ↓
5. Service Layer: DriverService.createProfile()
   - Generates unique slug from displayName
   - Parses comma-separated languages
   ↓
6. Repository Layer: DriverRepository.create()
   ↓
7. Prisma creates Driver record linked to User
   ↓
8. Redirect to /dashboard with profile displayed
```

### Update Profile Flow

```
1. User clicks "Edit Profile" on dashboard
   ↓
2. ProfileForm renders with existing profile data
   ↓
3. User modifies fields
   ↓
4. Server Action: updateProfile() validates changes
   ↓
5. Service Layer: DriverService.updateProfile()
   ↓
6. Repository Layer: DriverRepository.update()
   ↓
7. Page revalidates, shows updated data + success message
```

### Profile Image Upload Flow

```
1. User selects image file
   ↓
2. Client preview displays selected image
   ↓
3. User submits form
   ↓
4. Server Action: uploadProfileImage()
   - Validates file size (max 5MB)
   - Validates file type (JPEG, PNG, WebP)
   ↓
5. Upload to Supabase Storage bucket 'driver-images'
   ↓
6. Get public URL from Supabase
   ↓
7. Update Driver.profileImageUrl via DriverService
   ↓
8. Revalidate page, show new image
```

### Slug Generation

```
1. Extract displayName (e.g., "John Smith")
   ↓
2. Convert to lowercase, remove special chars
   ↓
3. Replace spaces with hyphens (e.g., "john-smith")
   ↓
4. Check if slug exists in database
   ↓
5. If exists, append counter (e.g., "john-smith-2")
   ↓
6. Return unique slug
```

**Key Points:**
- One profile per user (enforced by unique userId constraint)
- Slug must be unique across all drivers
- Profile status defaults to PENDING (admin approval needed)
- Languages stored as array, input as comma-separated string
- Image upload uses Supabase Storage (not filesystem)

## Public Directory & Profile Pages (Phase 3 - Implemented)

### Public Driver Directory Flow

```
1. User visits /drivers
   ↓
2. Server fetches approved drivers via DriverService.getPublicDrivers()
   ↓
3. Repository queries: WHERE status = 'APPROVED'
   ↓
4. Optional city filter applied (?city=Baltimore)
   ↓
5. Results ordered by: isFeatured DESC, createdAt DESC
   ↓
6. Display driver cards with:
   - Profile image (if exists)
   - Display name
   - City
   - Vehicle type
   - Languages
   - Availability status
   ↓
7. User clicks driver card → navigate to /drivers/{slug}
```

### Public Driver Profile View Flow

```
1. User visits /drivers/{slug}
   ↓
2. Server calls DriverService.getPublicProfile(slug)
   ↓
3. Repository queries: WHERE slug = {slug} AND status = 'APPROVED'
   ↓
4. If not found or not approved → 404 (notFound())
   ↓
5. If found → display full profile:
   - Profile image
   - Display name, city
   - Availability status
   - Vehicle type, languages
   - Service area description
   - Bio (if exists)
   - CTA buttons (WhatsApp, Call)
   ↓
6. SEO metadata generated:
   - Dynamic title: "{Name} - {City} Driver | Movely"
   - Description with service details
   - OpenGraph image if profile image exists
```

### CTA Interaction Flow

```
1. User clicks "WhatsApp" button
   ↓
2. Link generated via getWhatsAppLink(whatsappNumber, message)
   ↓
3. Opens: https://wa.me/{number}?text={encodedMessage}
   ↓
4. User redirected to WhatsApp app/web

OR

1. User clicks "Call Now" button
   ↓
2. Link generated via getPhoneCallLink(phone)
   ↓
3. Opens: tel:+{number}
   ↓
4. Device initiates phone call
```

**Key Points:**
- Only APPROVED drivers visible publicly
- Slug-based URLs for SEO (`/drivers/john-smith`)
- City filter preserves featured/recent ordering
- CTA buttons use utility functions from `lib/utils/phone.ts`
- Dynamic metadata for social sharing
- 404 page for unapproved/non-existent drivers

## Admin Driver Review Flow

**Use Case:** Admin reviews and manages driver profiles

```
┌──────────────┐
│  Admin User  │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ GET /admin/drivers?status=PENDING       │
│ (Admin Driver List Page)                 │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ AdminService.getAllDrivers(status)       │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ AdminRepository.findAllDrivers(status)   │
│ - Prisma query with status filter        │
│ - Orders by createdAt DESC               │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Render driver list with:                 │
│ - Display name, city, vehicle            │
│ - Status badge (color-coded)             │
│ - Created date                           │
│ - Featured indicator (★)                 │
│ - Status filter tabs with counts         │
└──────┬──────────────────────────────────┘
       │
       │ Click "Review" button
       ▼
┌─────────────────────────────────────────┐
│ GET /admin/drivers/[id]                  │
│ (Admin Driver Detail Page)               │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ AdminService.getDriverById(id)           │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Display full driver profile:             │
│ - All contact info and details           │
│ - Profile image if available             │
│ - Status management controls             │
│ - Featured toggle                        │
│ - Link to public profile (if APPROVED)   │
└──────┬──────────────────────────────────┘
       │
       │ Admin clicks "Approve"
       ▼
┌─────────────────────────────────────────┐
│ updateDriverStatus(driverId, 'APPROVED') │
│ (Server Action)                          │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Check user is ADMIN                      │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ AdminService.updateDriverStatus()        │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ AdminRepository.updateDriverStatus()     │
│ - Prisma update with new status          │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Revalidate paths:                        │
│ - /admin/drivers                         │
│ - /admin/drivers/[id]                    │
│ - /drivers (public directory)            │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Driver now appears in public directory   │
│ (only APPROVED drivers visible)          │
└─────────────────────────────────────────┘
```

**Status Management:**
- **PENDING** → Initial status for new driver profiles
- **APPROVED** → Driver appears publicly in `/drivers`
- **REJECTED** → Driver does not appear publicly
- **SUSPENDED** → Previously approved driver removed from public view

**Featured Toggle:**
- Admin can mark/unmark drivers as featured
- Featured drivers can be prioritized in future phases

---

## Lead Tracking Flow

**Use Case:** Track customer contact attempts (WhatsApp/Call)

```
┌──────────────┐
│ Public User  │
└──────┬───────┘
       │
       │ Visits /drivers/john-smith
       ▼
┌─────────────────────────────────────────┐
│ Driver Profile Page Loads                │
│ - TrackProfileView component mounts      │
│ - Calls trackProfileView(driverId)      │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ ProfileViewService.trackView()           │
│ - Hash IP address                        │
│ - Check deduplication (30-min window)   │
│ - If not duplicate: create ProfileView  │
│ - Increment driver.viewCount             │
└──────┬──────────────────────────────────┘
       │
       │ User clicks WhatsApp button
       ▼
┌─────────────────────────────────────────┐
│ LeadTrackingButtons component            │
│ - Calls trackLead(driverId, 'WHATSAPP') │
│ - Opens WhatsApp in new tab              │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ LeadService.trackLead()                  │
│ - Hash IP address                        │
│ - Extract user agent, referrer           │
│ - Create Lead record                     │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Lead stored in database with:            │
│ - driverId                               │
│ - source (WHATSAPP/CALL)                 │
│ - ipHash (SHA-256)                       │
│ - userAgent                              │
│ - referrer                               │
│ - createdAt                              │
└─────────────────────────────────────────┘
```

**Profile View Deduplication:**
- 30-minute window per IP + driver combination
- Prevents view count inflation
- Increments `driver.viewCount` only on unique views

**Lead Tracking:**
- No deduplication (all clicks tracked)
- Separate records for WhatsApp vs Call
- Used for driver metrics and future analytics

---

## Driver Metrics Flow

**Use Case:** Driver views their performance metrics

```
┌──────────────┐
│    Driver    │
└──────┬───────┘
       │
       │ Visits /dashboard
       ▼
┌─────────────────────────────────────────┐
│ Dashboard Page                           │
│ - Fetches profile                        │
│ - Calls DriverMetricsService.getMetrics()│
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ DriverMetricsService.getMetrics()        │
│ - ProfileViewService.getViewCountByDriver│
│ - LeadService.getLeadCountByDriver       │
│ - LeadService.getLeadCountBySource       │
│   (WHATSAPP and CALL)                    │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Display metrics cards:                   │
│ - Profile Views (total unique views)    │
│ - Total Leads (WhatsApp + Call)         │
│ - WhatsApp Leads (green)                 │
│ - Call Leads (blue)                      │
└─────────────────────────────────────────┘
```

**Metrics Calculated:**
- Profile Views: Count from `profile_views` table
- Total Leads: Count from `leads` table
- WhatsApp Leads: Filtered by `source = 'WHATSAPP'`
- Call Leads: Filtered by `source = 'CALL'`

---

## File Upload Flow

```
1. User selects image
   ↓
2. Client uploads to Server Action
   ↓
3. Server validates file (type, size)
   ↓
4. Server uploads to Supabase Storage
   ↓
5. Server saves public URL to database
   ↓
6. Client displays image
```

## Lead Tracking Flow

```
1. Client visits driver profile
   ↓
2. Server Action tracks ProfileView
   - Checks 30-min deduplication window
   - Hashes IP address
   - Increments driver.viewCount
   ↓
3. Client clicks WhatsApp/Call button
   ↓
4. Server Action tracks Lead
   - Records source (WHATSAPP/CALL)
   - Stores metadata (IP hash, user agent, referrer)
   ↓
5. Client redirected to WhatsApp/phone app
```

## Middleware Responsibilities (Phase 1 - Implemented)

- ✅ Session refresh (Supabase Auth automatic)
- ✅ Route protection for `/dashboard` and `/admin`
- ✅ Redirect unauthenticated users to `/login`
- ✅ Redirect authenticated users away from auth pages
- ✅ Preserve intended destination with `?redirect=` parameter
- ⏸️ Request logging (future phases)

## Error Handling Strategy

1. **Validation Errors:** Caught at Server Action level, returned to client
2. **Business Logic Errors:** Thrown from services, caught by Server Actions
3. **Database Errors:** Caught by repositories, logged to Sentry
4. **Unhandled Errors:** Global error boundary + Sentry

## Performance Considerations

### Phase 0 (Current)
- No caching yet
- Direct database queries
- ISR (Incremental Static Regeneration) for public pages

### Future Optimizations
- Redis caching for driver listings
- CDN for static assets
- Database query optimization
- Image optimization via Next.js Image

## Security Architecture

### Authentication
- Supabase Auth handles session management
- HttpOnly cookies for tokens
- Middleware validates on server

### Authorization
- Role-based (DRIVER, ADMIN)
- Server-side checks in Server Actions
- Row Level Security in Supabase (future)

### Data Protection
- IP addresses hashed (SHA-256)
- User agent stored for fraud detection
- No PII in logs

## Scalability Path

### Current (MVP)
- Single Next.js app
- Vercel serverless deployment
- Supabase managed PostgreSQL

### Future Growth
1. Add Redis cache layer
2. Separate read replicas for analytics
3. CDN for static assets
4. Background job queue (Bull/BullMQ)
5. Consider splitting admin panel if needed

## Technology Choices

| Component | Technology | Why |
|-----------|-----------|-----|
| Framework | Next.js 15 | Best React framework, great DX |
| Language | TypeScript | Type safety, better tooling |
| Database | PostgreSQL | Robust, reliable, great for relational data |
| ORM | Prisma | Type-safe, great migrations |
| Auth | Supabase Auth | Managed, reliable, good DX |
| Storage | Supabase Storage | Integrated with auth, CDN included |
| UI | TailwindCSS | Utility-first, fast development |
| Components | shadcn/ui | Accessible, customizable |
| Error Tracking | Sentry | Industry standard |
| Analytics | PostHog | Open source, privacy-friendly |

## What We're NOT Doing (and Why)

- ❌ **Microservices:** Too complex for MVP
- ❌ **GraphQL:** REST/Server Actions sufficient
- ❌ **Redux:** React Server Components reduce need
- ❌ **Separate API:** Server Actions are simpler
- ❌ **Kubernetes:** Vercel handles scaling
- ❌ **Custom Auth:** Supabase is battle-tested

## Evolution Path

```
Phase 0 → Basic structure
Phase 1 → Auth + Driver CRUD
Phase 2 → Public directory
Phase 3 → Lead tracking
Phase 4 → Admin panel
...
```

Each phase adds features without changing core architecture.
