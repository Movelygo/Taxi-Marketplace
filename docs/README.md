# TaxiLink - Documentation

**Last Updated:** 2026-03-29  
**Phase:** 0 - Setup Complete  
**Author:** Development Team

## What is TaxiLink?

TaxiLink is a lead generation platform connecting clients with independent taxi drivers in the Maryland/Baltimore/DC area. It is **NOT** a ride-hailing app like Uber.

**Key Differences:**
- No automatic ride matching
- No in-app payments
- No real-time tracking
- Focus: Driver visibility + lead generation

## Objective

Enable taxi drivers to:
1. Create professional profiles
2. Get discovered by local customers
3. Receive contact leads (WhatsApp/calls)
4. Track their performance

Enable customers to:
1. Find trusted local taxi drivers
2. Contact drivers directly in <2 clicks

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| UI | TailwindCSS + shadcn/ui |
| Error Tracking | Sentry |
| Analytics | PostHog |
| Email | Resend |

## Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)
- npm or pnpm

## Installation

### 1. Clone and Install

```bash
cd "Taxi Marketplace"
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in the required values:

```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
```

### 3. Database Setup

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Seed database
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |

## Project Structure

```
/taxi-marketplace
├── /app                    # Next.js App Router
│   ├── (public)           # Public routes
│   ├── (dashboard)        # Driver dashboard
│   ├── (admin)            # Admin panel
│   └── /api               # API routes & webhooks
├── /modules               # Business logic by domain
│   ├── /drivers
│   ├── /leads
│   ├── /auth
│   └── /admin
├── /components            # React components
│   ├── /ui               # shadcn/ui components
│   └── /shared           # Shared components
├── /lib                   # Utilities & configuration
│   ├── /db               # Prisma client
│   ├── /supabase         # Supabase clients
│   ├── /utils            # Utility functions
│   └── /constants        # App constants
├── /prisma               # Database schema & migrations
├── /docs                 # Documentation (you are here)
└── /public               # Static assets
```

## Key Concepts

### User Roles

- **DRIVER**: Taxi drivers who create profiles
- **ADMIN**: Platform administrators

### Driver Status Workflow

1. **PENDING**: Driver registered, awaiting admin approval
2. **APPROVED**: Visible on public directory
3. **REJECTED**: Not approved by admin
4. **SUSPENDED**: Temporarily hidden

### Lead Sources

- **WHATSAPP**: Customer clicked WhatsApp button
- **CALL**: Customer clicked call button

## Target Market

**Primary:** Maryland/Baltimore/DC Metro Area

**Cities:**
- Baltimore
- BWI (Airport area)
- Washington DC
- Towson
- Essex
- Glen Burnie
- Annapolis
- Dundalk

## Support

For technical issues, see:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Database structure
- [USER_FLOWS.md](./USER_FLOWS.md) - User journeys
- [INTEGRATIONS.md](./INTEGRATIONS.md) - Third-party integrations
- [ADMIN_OPERATIONS.md](./ADMIN_OPERATIONS.md) - Admin guide
- [CHANGELOG.md](./CHANGELOG.md) - Change history
