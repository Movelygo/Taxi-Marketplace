# TaxiLink - Third-Party Integrations

**Last Updated:** 2026-03-29  
**Phase:** 0 - Configuration Complete  

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

### Configuration

**Environment Variables:**
```env
SENTRY_DSN="https://your-key@sentry.io/project-id"
NEXT_PUBLIC_SENTRY_DSN="https://your-key@sentry.io/project-id"
```

### Setup (Basic - Optional for Phase 0)

**Files:**
- `sentry.client.config.ts` - Browser error tracking
- `sentry.server.config.ts` - Server error tracking
- `sentry.edge.config.ts` - Edge runtime errors

**Configuration:**
```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
})
```

### What Gets Tracked

- Unhandled exceptions
- Server Action errors
- API route errors
- Client-side errors
- Performance metrics

### Error Context

Always include context:
```typescript
Sentry.setContext('driver', { id, slug })
Sentry.captureException(error)
```

---

## PostHog (Analytics)

**Purpose:** Product analytics and feature flags

### Configuration

**Environment Variables:**
```env
NEXT_PUBLIC_POSTHOG_KEY="phc_your_key"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

### Setup (Basic - Optional for Phase 0)

**Provider:** `@/lib/posthog/provider.tsx`
```typescript
'use client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

if (typeof window !== 'undefined') {
  posthog.init(
    process.env.NEXT_PUBLIC_POSTHOG_KEY!,
    {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST
    }
  )
}

export function PHProvider({ children }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
```

### Tracked Events

**Automatic:**
- Page views
- Session duration
- User paths

**Custom:**
```typescript
import { usePostHog } from 'posthog-js/react'

const posthog = usePostHog()

posthog.capture('driver_profile_created', {
  driver_id: driver.id,
  city: driver.city
})
```

### Privacy Considerations

- Anonymize IP addresses
- Respect Do Not Track
- GDPR compliant settings

**Note for MVP:** PostHog is configured but not required for Phase 0 completion.

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
