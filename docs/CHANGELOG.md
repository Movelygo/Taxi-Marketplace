# TaxiLink - Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Phase 0] - 2026-03-29

### Initial Setup Complete

**Summary:** Complete project initialization with Next.js, TypeScript, Prisma, Supabase, and full documentation.

### Added

#### Project Structure
- Next.js 15 project with App Router
- TypeScript strict mode configuration
- TailwindCSS + PostCSS setup
- Comprehensive folder structure:
  - `/app` - Next.js routes with route groups
  - `/modules` - Business logic by domain
  - `/lib` - Shared utilities and clients
  - `/components` - React components
  - `/prisma` - Database schema
  - `/docs` - Complete documentation

#### Database Schema (Prisma)
- **users** table
  - Syncs with Supabase auth.users
  - **CRITICAL:** `id` must match Supabase auth UUID (no auto-generation)
  - Supports DRIVER and ADMIN roles
- **drivers** table
  - Complete driver profile with approval workflow
  - Added `viewCount` field for tracking profile views
  - Status: PENDING, APPROVED, REJECTED, SUSPENDED
  - Availability: AVAILABLE, BUSY, OFFLINE
  - Featured driver support
- **profile_views** table (NEW)
  - Tracks individual profile views
  - IP hash for privacy
  - User agent and referrer for analytics
  - Supports 30-minute deduplication window
- **leads** table
  - Enhanced with metadata fields:
    - `ipHash` (SHA-256)
    - `userAgent`
    - `referrer` (nullable)
  - Source: WHATSAPP, CALL only (FORM removed)
- **ads** table
  - Basic banner ad system

#### Supabase Integration
- Browser client (`/lib/supabase/client.ts`)
- Server client (`/lib/supabase/server.ts`)
- Middleware for session management
- Documentation for database trigger setup (Phase 1)

#### Utility Functions
- **hash.ts** - IP hashing (SHA-256) and IP extraction
- **slug.ts** - Slug generation with uniqueness support
- **phone.ts** - Phone formatting, validation, WhatsApp/call links
- **dates.ts** - Date formatting with date-fns

#### Constants
- **cities.ts** - Maryland/Baltimore area cities:
  - Baltimore, BWI, Washington DC, Towson, Essex, Glen Burnie, Annapolis, Dundalk
- **vehicle-types.ts** - Vehicle type options
- **languages.ts** - Language options

#### Module Structure
- `/modules/drivers` - Driver management types
- `/modules/leads` - Lead tracking types
- `/modules/auth` - Authentication types
- `/modules/admin` - Admin operation types

#### App Routes (Placeholders)
- `(public)` route group - Public pages
- `(dashboard)` route group - Driver dashboard
- `(admin)` route group - Admin panel
- `/api/webhooks/supabase` - Webhook handler placeholder

#### Documentation (`/docs`)
- **README.md** - Project overview, installation, commands
- **ARCHITECTURE.md** - System architecture, data flow, design decisions
- **DATABASE_SCHEMA.md** - Complete schema documentation with ER diagram
- **USER_FLOWS.md** - Detailed user journeys (placeholders for future phases)
- **INTEGRATIONS.md** - Third-party service setup guides
- **ADMIN_OPERATIONS.md** - Admin procedures and troubleshooting
- **CHANGELOG.md** - This file

#### Configuration Files
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript strict configuration
- `next.config.js` - Next.js configuration
- `tailwind.config.ts` - TailwindCSS with shadcn/ui theme
- `postcss.config.js` - PostCSS configuration
- `.env.example` - Environment variable template
- `.gitignore` - Git ignore rules

### Changed

#### Schema Adjustments (Per User Request)
- User ID generation: **Removed @default(uuid())** - must match Supabase
- Driver media: **Eliminated `driver_media` table** - using `profileImageUrl` only
- Lead source: **Removed FORM enum** - only WHATSAPP and CALL
- Profile tracking: **Added dedicated `profile_views` table** with deduplication
- View counter: **Added `viewCount` field** to drivers table
- Lead metadata: **Added IP hash, user agent, referrer** to leads table

#### Target Market
- Updated from generic cities to **Maryland/Baltimore/DC metro area**
- Primary markets: Baltimore, BWI, Washington DC, Towson, Essex, Glen Burnie, Annapolis, Dundalk

### Technical Decisions

1. **Monolithic Architecture** - Single Next.js app for simplicity
2. **Server Actions Primary** - Prefer over API Routes for type safety
3. **Repository Pattern** - Separate data access from business logic
4. **Prisma ORM** - Type-safe database access
5. **Module-Based Organization** - Code organized by business domain
6. **No PostHog Dependency** - Configured but not required for Phase 0
7. **Deduplication Strategy** - 30-minute window for profile views

### Security

- IP addresses hashed with SHA-256 before storage
- User agents stored for fraud detection
- Strict TypeScript mode enabled
- Input validation prepared (Zod)
- Environment variables documented

### Documentation Philosophy

- **Complete from day one** - All docs created in Phase 0
- **Living documents** - Will be updated with each phase
- **Pragmatic detail** - Technical enough for developers, clear enough for stakeholders
- **Mandatory updates** - Docs are part of deliverables, not optional

### Dependencies

**Production:**
- next@15.1.6
- react@19.0.0
- @prisma/client@5.22.0
- @supabase/ssr@0.5.2
- @supabase/supabase-js@2.47.10
- zod@3.24.1
- date-fns@4.1.0
- lucide-react@0.468.0
- posthog-js@1.179.3
- posthog-node@4.3.1
- clsx, tailwind-merge, tailwindcss-animate

**Development:**
- typescript@5
- @sentry/nextjs@8.47.0
- prisma@5.22.0
- tsx@4.19.2
- tailwindcss@3.4.1

### Known Issues

- TypeScript errors in Prisma imports (resolved after `npm run db:generate`)
- Supabase middleware type warnings (acceptable, will work correctly)
- TailwindCSS warnings in IDE (expected, CSS processor understands)

### Next Steps (Phase 1)

- [ ] Implement Supabase Auth flows (register, login, logout)
- [ ] Create database trigger for user sync
- [ ] Build authentication module
- [ ] Protect routes with middleware
- [ ] Add session management
- [ ] Update documentation with auth flows

---

## Future Phases

### Phase 1: Database & Authentication
- Supabase Auth integration
- User registration/login
- Session management
- Protected routes

### Phase 2: Drivers Module - Backend
- Driver CRUD operations
- Profile image upload
- Slug generation
- Validation layer

### Phase 3: Drivers Module - Frontend
- Driver dashboard
- Profile creation/editing forms
- Image upload UI
- Status management

### Phase 4: Public Directory
- Driver listing page
- City filtering
- Search functionality
- SEO optimization

### Phase 5: Driver Profile Pages
- Public profile view
- CTA buttons (WhatsApp, Call)
- Profile view tracking
- JSON-LD schema

### Phase 6: Lead Tracking
- Lead capture on CTA clicks
- Deduplication logic
- Metadata storage
- Analytics preparation

### Phase 7: Driver Dashboard Metrics
- View count display
- Lead statistics
- Basic charts
- Recent activity

### Phase 8: Admin Panel
- Driver approval workflow
- Lead management
- User management
- System monitoring

### Phase 9: Ads System
- Ad management UI
- Ad display logic
- Performance tracking

### Phase 10: Testing & Launch
- End-to-end testing
- Performance optimization
- SEO validation
- Production deployment

---

## Maintenance Notes

### Updating This Changelog

**When to update:**
- At the end of each implementation phase
- When making significant architectural changes
- When adding/removing major features
- When changing database schema

**What to include:**
- Date and phase number
- Summary of changes
- Files created/modified
- Database migrations
- Breaking changes
- Dependencies added/updated

**Format:**
```markdown
## [Phase X] - YYYY-MM-DD

### Summary

### Added
- Feature/file descriptions

### Changed
- Modifications to existing features

### Fixed
- Bug fixes

### Removed
- Deprecated features

### Security
- Security improvements
```

---

## Project Milestones

- [x] **2026-03-29** - Phase 0 Complete: Project setup and documentation
- [ ] Phase 1: Authentication
- [ ] Phase 2-3: Driver management
- [ ] Phase 4-5: Public directory
- [ ] Phase 6: Lead tracking
- [ ] Phase 7: Driver analytics
- [ ] Phase 8: Admin panel
- [ ] MVP Launch

---

## Version History

| Version | Date | Phase | Description |
|---------|------|-------|-------------|
| 0.1.0 | 2026-03-29 | 0 | Initial setup complete |

---

**Note:** This is a living document. It will be updated continuously as the project evolves.
