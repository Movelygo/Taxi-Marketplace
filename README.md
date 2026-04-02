# TaxiLink

> Lead generation platform connecting customers with independent taxi drivers in Maryland/Baltimore/DC area.

**Status:** Phase 0 - Setup Complete ✅

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Generate Prisma Client
npm run db:generate

# Push database schema
npm run db:push

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## What is TaxiLink?

TaxiLink is **NOT** Uber. It's a directory platform where:

- 🚕 **Taxi drivers** create profiles and get discovered
- 👥 **Customers** find drivers and contact them directly
- 📊 **Platform** tracks leads and provides analytics

**No ride matching. No payments. No real-time tracking.**

Just simple lead generation.

## Project Status

### ✅ Phase 0 Complete (2026-03-29)

- Next.js 15 + TypeScript setup
- Complete Prisma database schema
- Supabase integration configured
- Full documentation in `/docs`
- Module structure ready
- Maryland/Baltimore area focus

### 🚧 Next: Phase 1 - Authentication

See `/docs/CHANGELOG.md` for full details.

## Documentation

Comprehensive documentation available in `/docs`:

| Document | Purpose |
|----------|---------|
| [README.md](./docs/README.md) | Getting started guide |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System architecture & design |
| [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) | Complete database schema |
| [USER_FLOWS.md](./docs/USER_FLOWS.md) | User journeys & workflows |
| [INTEGRATIONS.md](./docs/INTEGRATIONS.md) | Third-party services setup |
| [ADMIN_OPERATIONS.md](./docs/ADMIN_OPERATIONS.md) | Admin procedures |
| [CHANGELOG.md](./docs/CHANGELOG.md) | Version history |

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict mode)
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **UI:** TailwindCSS + shadcn/ui
- **Icons:** Lucide React
- **Analytics:** PostHog (optional)
- **Error Tracking:** Sentry (optional)

## Key Features (MVP)

1. **Driver Registration & Profiles**
   - Create detailed profiles
   - Upload profile images
   - Admin approval workflow

2. **Public Directory**
   - Search drivers by city
   - Featured driver support
   - Mobile-first design

3. **Lead Tracking**
   - WhatsApp click tracking
   - Phone call tracking
   - IP-based deduplication

4. **Analytics Dashboard**
   - Profile view counts
   - Lead statistics
   - Performance metrics

5. **Admin Panel**
   - Approve/reject drivers
   - Manage leads
   - Basic ads system

## Database Schema Highlights

- **users** - Syncs with Supabase Auth (same UUID)
- **drivers** - Driver profiles with approval workflow
- **profile_views** - View tracking with 30-min deduplication
- **leads** - Contact tracking with metadata
- **ads** - Simple banner ad system

See [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) for complete details.

## Environment Variables

Required:
```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
```

Optional (Phase 0):
```env
SENTRY_DSN="..."
NEXT_PUBLIC_POSTHOG_KEY="..."
```

See `.env.example` for full list.

## Project Structure

```
/taxi-marketplace
├── /app                    # Next.js App Router
│   ├── (public)           # Public-facing pages
│   ├── (dashboard)        # Driver dashboard
│   ├── (admin)            # Admin panel
│   └── /api               # API routes & webhooks
├── /modules               # Business logic by domain
│   ├── /drivers           # Driver management
│   ├── /leads             # Lead tracking
│   ├── /auth              # Authentication
│   └── /admin             # Admin operations
├── /lib                   # Utilities & clients
├── /components            # React components
├── /prisma                # Database schema
├── /docs                  # Documentation
└── /public                # Static assets
```

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Push schema to DB |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed database |

## Architecture Philosophy

- **Monolith > Microservices** - Simplicity first
- **Server Actions > API Routes** - Better DX
- **Module-based organization** - Clear boundaries
- **Repository pattern** - Separation of concerns
- **Documentation-first** - Complete from day 1

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for details.

## Target Market

**Maryland/Baltimore/DC Metro Area**

Cities: Baltimore, BWI, Washington DC, Towson, Essex, Glen Burnie, Annapolis, Dundalk

## Contributing

This is a private project. See `/docs` for implementation guidelines.

## License

Proprietary

---

**Phase 0 Complete** - Ready for Phase 1: Authentication & User Management

For detailed roadmap, see [CHANGELOG.md](./docs/CHANGELOG.md)
