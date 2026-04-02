# TaxiLink - System Architecture

**Last Updated:** 2026-03-29  
**Phase:** 0 - Initial Setup  

## Overview

TaxiLink follows a **monolithic architecture** organized by **business domains** (modules). This design prioritizes simplicity, clarity, and progressive scalability over premature optimization.

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

## Authentication Flow

```
1. User registers/logs in
   ↓
2. Supabase Auth creates user in auth.users
   ↓
3. Database trigger creates record in our users table
   ↓
4. User.id === auth.users.id (same UUID)
   ↓
5. Middleware validates session on each request
```

**Critical:** `User.id` in our database **MUST** match `auth.users.id` in Supabase. No parallel IDs.

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

## Middleware Responsibilities

- Session refresh (Supabase Auth)
- Route protection (future phases)
- Request logging (future phases)

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
