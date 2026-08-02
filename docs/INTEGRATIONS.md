# Movely - Third-Party Integrations

**Last Updated:** 2026-05-17  
**Phase:** 8 - Auth Recovery Audit Complete  

## Overview

This document explains how TaxiLink integrates with external services and how to configure them.

---

## Supabase Auth

**Purpose:** User authentication and session management

### Configuration

**Environment Variables:**
```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### Setup Steps

1. Create Supabase project at [supabase.com](https://supabase.com)
2. Copy project URL and anon key from Settings > API
3. Copy service role key (used for server-side operations)
4. Add to `.env.local`

### Client Implementation

**Browser Client:** `@/lib/supabase/client.ts`
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Server Client:** `@/lib/supabase/server.ts`
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) { /* ... */ }
      }
    }
  )
}
```

### Database Trigger Setup

**Critical:** Create trigger to sync `auth.users` with our `users` table

**SQL to run in Supabase SQL Editor (Phase 1):**
```sql
-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    'DRIVER',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**Why This Matters:**
- Ensures `users.id` === `auth.users.id` (same UUID)
- No parallel ID systems
- Automatic sync when user registers

### Auth Implementation (Phases 1 + 8 — Complete)

**Full Auth Flow:**
- Email/password registration via Server Actions
- Email confirmation flow with callback handler
- Password recovery flow (forgot password → reset email → set new password)
- Session-based authentication with HTTP-only cookies
- Middleware protection for protected routes
- Open redirect protection on login (only relative paths allowed)

**Server Actions:**
- `modules/auth/actions/register.ts` - User registration
- `modules/auth/actions/login.ts` - Login with open redirect protection
- `modules/auth/actions/logout.ts` - Logout
- `modules/auth/actions/get-current-user.ts` - Fetch current user + role
- `modules/auth/actions/forgot-password.ts` - Send password reset email
- `modules/auth/actions/update-password.ts` - Set new password (min 8 chars)

**Auth Pages:**
- `/login` — Sign in form with forgot password link
- `/register` — Registration form
- `/check-email` — Post-registration email confirmation notice
- `/forgot-password` — Email entry to request reset link
- `/reset-password` — New password form (accessed via email link)

**Auth Callback (`/auth/callback`):**
- Handles PKCE flow (`code` param) — used by password reset emails
- Handles OTP flow (`token_hash` + `type` params) — used by magic links / email confirmation
- Reads `next` param for custom post-auth redirects
- Recovery type redirects to `/reset-password` automatically

**Middleware Protection:**
- `middleware.ts` checks authentication for `/dashboard` and `/admin`
- No database queries in middleware (performance optimized)
- Redirects unauthenticated users to `/login?redirect=<path>`
- Redirects authenticated users away from `/login` and `/register`
- `/forgot-password` and `/reset-password` intentionally NOT blocked for authenticated users (recovery sessions need access)

**Admin Access Control:**
- Role check performed in `app/(admin)/layout.tsx` (server-side)
- Uses Prisma to query user role from database
- Non-ADMIN users redirected to dashboard with error

**Email Confirmation:**
- Callback handler at `/auth/callback`
- Uses `EmailOtpType` from `@supabase/supabase-js`
- Redirects to `/login?message=confirmed` on success
- `/check-email` page displays instructions

### ⚠️ Required Supabase Dashboard Configuration

For password reset emails and magic links to work, the callback URL **must** be whitelisted:

1. Supabase Dashboard → **Authentication → URL Configuration**
2. Add to **Redirect URLs**:
   - `http://localhost:3000/auth/callback` (local dev)
   - `https://www.movelygo.com/auth/callback` (production — add when deploying)
3. Set **Site URL** to your primary domain

Without this, Supabase blocks the redirect and magic links silently drop to the home page.

### Session Management

**Middleware:** `@/middleware.ts`
- Runs on every request
- Refreshes session if expired
- Makes user available in Server Components

**Usage in Server Components:**
```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()

if (!user) redirect('/login')
```

### Row Level Security (Future)

Supabase supports RLS policies. Not implemented in MVP but recommended for production:

```sql
-- Example: Users can only read their own driver profile
CREATE POLICY "Users can view own profile"
ON drivers FOR SELECT
USING (auth.uid() = user_id);
```

---

## Supabase Storage

**Purpose:** File storage (driver profile images)

### Configuration

Uses same credentials as Supabase Auth.

### Storage Buckets

**Create in Supabase Dashboard:**

1. Navigate to Storage
2. Create bucket: `driver-images`
3. Set public access: YES (profile images are public)

### Upload Policy

**File Validation:**
- Max size: 5MB
- Allowed types: `.jpg`, `.jpeg`, `.png`, `.webp`
- Validated server-side

**Upload Flow (Phase 2-3):**
```typescript
import { createClient } from '@/lib/supabase/server'

async function uploadDriverImage(file: File) {
  const supabase = await createClient()
  
  // Validate file
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File too large')
  }
  
  // Generate unique filename
  const filename = `${Date.now()}-${file.name}`
  
  // Upload
  const { data, error } = await supabase.storage
    .from('driver-images')
    .upload(filename, file)
  
  if (error) throw error
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('driver-images')
    .getPublicUrl(filename)
  
  return publicUrl
}
```

### Security Considerations

- Sanitize filenames (remove special characters)
- Scan for malware (future: integrate with cloud antivirus)
- Rate limit uploads
- Delete orphaned files (cron job)

---

## Prisma ORM

**Purpose:** Type-safe database access

### Configuration

**Environment Variable:**
```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

### Prisma Client

**Singleton Instance:** `@/lib/db/prisma.ts`
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

**Why Singleton:**
- Prevents multiple connections in development
- Hot reload doesn't create new clients
- Best practice for Next.js

### Commands

| Command | Purpose |
|---------|---------|
| `npm run db:generate` | Generate Prisma Client from schema |
| `npm run db:push` | Push schema changes to DB (dev) |
| `npm run db:studio` | Open Prisma Studio GUI |
| `prisma migrate dev` | Create migration (Phase 1+) |

### Schema Location

`@/prisma/schema.prisma`

**Key Configuration:**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Using Prisma

```typescript
import { prisma } from '@/lib/db/prisma'

// Type-safe queries
const drivers = await prisma.driver.findMany({
  where: { status: 'APPROVED' },
  include: { user: true }
})
```

---

## Sentry (Error Tracking)

**Purpose:** Monitor and debug production errors

**Status:** ✅ Implemented in Phase 6

### Configuration

**Environment Variables:**
```env
NEXT_PUBLIC_SENTRY_DSN="https://your-key@sentry.io/project-id"
```

### Implementation (Phase 6)

**Files:**
- `sentry.client.config.ts` - Browser error tracking
- `sentry.server.config.ts` - Server error tracking
- `sentry.edge.config.ts` - Edge runtime errors

**Client Configuration:**
```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
  replaysOnErrorSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  beforeSend(event) {
    // Remove IP addresses for privacy
    if (event.user) {
      delete event.user.ip_address
    }
    return event
  },
})
```

**Server Configuration:**
```typescript
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
  beforeSend(event) {
    if (event.user) {
      delete event.user.ip_address
    }
    return event
  },
})
```

### What Gets Tracked

- Unhandled exceptions (client & server)
- Server Action errors
- API route errors
- Client-side errors
- Performance traces (10% sampling)
- Session replays on error (10% sampling)

### Privacy Features

- IP addresses removed from all events
- All text masked in session replays
- All media blocked in session replays
- Minimal sampling (10%) for traces and replays

### Usage

Sentry is automatically configured and will capture errors. Manual capture:
```typescript
import * as Sentry from '@sentry/nextjs'

try {
  // risky operation
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: 'driver_profile' },
    extra: { driverId: id }
  })
}
```

---

## PostHog (Analytics)

**Purpose:** Product analytics (complementary to core DB metrics)

**Status:** ✅ Implemented in Phase 6

### Configuration

**Environment Variables:**
```env
NEXT_PUBLIC_POSTHOG_KEY="phc_your_key"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

### Implementation (Phase 6)

**PostHog Client:** `@/lib/analytics/posthog-client.ts`
```typescript
import posthog from 'posthog-js'

export function initPostHog() {
  if (typeof window === 'undefined') return
  
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key) return
  
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    capture_pageview: false,
    autocapture: false,
    disable_session_recording: true,
  })
}

export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  posthog.capture(eventName, properties)
}
```

**Provider:** `@/providers/posthog-provider.tsx`
- Wraps entire app in root layout
- Handles automatic page view tracking
- Initializes PostHog on mount

### Tracked Events (Phase 6)

**Page Views (Automatic):**
- All page navigation tracked via PostHogProvider

**Custom Events:**
- `public_directory_viewed` - Driver directory page with city filter
- `public_driver_profile_viewed` - Individual driver profile views
- `dashboard_viewed` - Driver dashboard access
- `admin_driver_reviewed` - Admin reviewing driver profile
- `whatsapp_cta_clicked` - WhatsApp button clicks
- `call_cta_clicked` - Call button clicks

### Important: PostHog vs Database Metrics

**PostHog is complementary, NOT the source of truth:**
- Core business metrics (profile views, leads) stored in database
- Driver dashboard reads from database, not PostHog
- PostHog provides additional product insights and user journey analysis
- PostHog is optional - app works without it

**Database stores:**
- Profile views with deduplication
- Leads (WhatsApp/Call)
- Driver metrics

**PostHog tracks:**
- Product usage patterns
- User journeys
- Feature adoption
- A/B test potential

### Privacy Features

- Autocapture disabled (manual events only)
- Session recording disabled
- No PII in event properties
- Optional integration (app works without PostHog key)

### Usage

**Tracking custom events:**
```typescript
import { trackEvent } from '@/lib/analytics/posthog-client'

trackEvent('driver_profile_updated', {
  driver_id: id,
  fields_changed: ['city', 'bio']
})
```

**Page view tracking component:**
```typescript
import { PageViewTracker } from '@/components/analytics/page-view-tracker'

<PageViewTracker 
  eventName="custom_page_viewed" 
  properties={{ page_type: 'special' }} 
/>
```

---

## Resend (Email - Future)

**Purpose:** Transactional emails

### Use Cases
- Driver approval notifications
- Lead notifications
- Password resets (via Supabase)

### Configuration (Phase 1+)

```env
RESEND_API_KEY="re_your_key"
```

**Not implemented in Phase 0**

---

## Integration Checklist

### Phase 0
- [x] Supabase project created
- [x] Supabase client configured
- [x] Prisma connected to database
- [ ] Database trigger created (Phase 1)
- [ ] Sentry configured (optional)
- [ ] PostHog configured (optional)

### Phase 1
- [ ] Database trigger for user sync
- [ ] Supabase Auth flows (register, login)
- [ ] Error tracking active

### Future Phases
- [ ] Resend email integration
- [ ] Supabase Storage in use
- [ ] PostHog event tracking
- [ ] Feature flags via PostHog

---

## Troubleshooting

### Supabase Connection Issues

**Problem:** "Connection refused" or timeout

**Solutions:**
1. Check DATABASE_URL format
2. Verify Supabase project is not paused
3. Check IP whitelist (Supabase allows all by default)
4. Test connection: `psql $DATABASE_URL`

### Prisma Client Not Found

**Problem:** "Cannot find module '@prisma/client'"

**Solution:**
```bash
npm run db:generate
```

### Session Not Persisting

**Problem:** User logged in but session lost on refresh

**Solutions:**
1. Check middleware is running
2. Verify cookie settings in Supabase client
3. Check NEXT_PUBLIC_SUPABASE_URL is set
4. Clear browser cookies and retry

---

## Security Best Practices

1. **Never expose service role key in client code**
2. **Use anon key for client-side operations**
3. **Validate all inputs server-side**
4. **Enable RLS policies in production**
5. **Rotate API keys regularly**
6. **Monitor Sentry for suspicious errors**
7. **Rate limit sensitive operations**

---

## Monitoring & Alerts

### Recommended Alerts (Production)

- Error rate > 5% (Sentry)
- Database connection failures
- Failed auth attempts > 100/hour
- Storage uploads failing
- Lead tracking errors

### Health Checks

Create `/api/health` endpoint:
```typescript
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    supabase: await checkSupabase(),
    storage: await checkStorage()
  }
  
  return Response.json(checks)
}
```
