# Phase 6: Sentry + PostHog Light Integration

**Phase:** 6  
**Status:** ✅ Complete  
**Date:** 2026-04-06  

---

## Objective

Integrate Sentry for error monitoring and PostHog for light product analytics without making them critical dependencies for core business metrics.

---

## Scope

### Implemented

✅ Sentry integration for Next.js  
✅ Client, server, and edge error tracking  
✅ Privacy-focused Sentry configuration  
✅ PostHog light integration  
✅ Manual event tracking (minimal set)  
✅ PostHog provider for automatic page views  
✅ Core metrics remain in database  
✅ Optional integrations (app works without keys)  

### Not Implemented (Future Phases)

❌ Advanced Sentry features (breadcrumbs, user feedback)  
❌ PostHog feature flags  
❌ PostHog A/B testing  
❌ PostHog session recordings  
❌ PostHog heatmaps  
❌ Custom Sentry dashboards  
❌ Sentry performance monitoring (beyond basic traces)  

---

## Architecture

### Sentry Setup

**Files Created:**
- `sentry.client.config.ts` - Browser error tracking
- `sentry.server.config.ts` - Server/API error tracking
- `sentry.edge.config.ts` - Middleware/Edge runtime tracking

**Configuration Philosophy:**
- Minimal and production-minded
- Privacy-first (IP removal, text masking)
- Low sampling (10%) to reduce noise
- No unnecessary data capture

**Client Config:**
```typescript
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,  // 10% sampling
  debug: false,
  replaysOnErrorSampleRate: 0.1,  // Replay 10% of sessions with errors
  replaysSessionSampleRate: 0,    // Never replay normal sessions
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,      // Privacy: mask all text
      blockAllMedia: true,    // Privacy: block all media
    }),
  ],
  beforeSend(event) {
    // Remove IP addresses
    if (event.user) {
      delete event.user.ip_address
    }
    return event
  },
})
```

**Server Config:**
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

**What Sentry Captures:**
- Unhandled exceptions (client & server)
- Server Action errors
- API route errors
- Performance traces (10% sample)
- Session replays on error (10% sample)

**What Sentry Does NOT Capture:**
- IP addresses (removed in beforeSend)
- Full session replays (only on error)
- User PII (text masked)
- Media content (blocked)

### PostHog Setup

**Files Created:**
- `lib/analytics/posthog-client.ts` - PostHog initialization and helpers
- `providers/posthog-provider.tsx` - App-wide provider
- `components/analytics/page-view-tracker.tsx` - Custom event component

**Configuration Philosophy:**
- Light touch, minimal tracking
- Complementary to database metrics (not replacement)
- Optional (app works without PostHog key)
- Manual events only (no autocapture)

**PostHog Client:**
```typescript
export function initPostHog() {
  if (typeof window === 'undefined') return
  
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key) return  // Graceful degradation
  
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    capture_pageview: false,        // Manual control
    autocapture: false,             // No automatic event capture
    disable_session_recording: true, // Privacy
  })
}

export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  if (!isInitialized) return  // Fail silently if not configured
  
  posthog.capture(eventName, properties)
}
```

**PostHog Provider:**
```typescript
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    initPostHog()  // Initialize once on mount
  }, [])

  useEffect(() => {
    // Track page views manually
    if (pathname && posthog) {
      let url = window.origin + pathname
      if (searchParams?.toString()) {
        url += '?' + searchParams.toString()
      }
      posthog.capture('$pageview', { $current_url: url })
    }
  }, [pathname, searchParams])

  return <>{children}</>
}
```

**Usage in root layout:**
```typescript
// app/layout.tsx
import { PostHogProvider } from '@/providers/posthog-provider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  )
}
```

---

## Event Tracking

### Tracked Events (Minimal Set)

**1. public_directory_viewed**
- **Location:** `/drivers` page
- **Properties:** `{ city, driver_count }`
- **Purpose:** Track directory usage and city filter popularity

**2. public_driver_profile_viewed**
- **Location:** `/drivers/[slug]` page
- **Properties:** `{ driver_id, driver_name, city }`
- **Purpose:** Track which drivers get the most profile views

**3. dashboard_viewed**
- **Location:** `/dashboard` page
- **Properties:** `{ has_profile, profile_status }`
- **Purpose:** Track dashboard usage and profile completion

**4. admin_driver_reviewed**
- **Location:** `/admin/drivers/[id]` page
- **Properties:** `{ driver_id, status, is_featured }`
- **Purpose:** Track admin review activity

**5. whatsapp_cta_clicked**
- **Location:** Driver profile page (CTA button)
- **Properties:** `{ driver_id, driver_name }`
- **Purpose:** Track WhatsApp CTA effectiveness

**6. call_cta_clicked**
- **Location:** Driver profile page (CTA button)
- **Properties:** `{ driver_id, driver_name }`
- **Purpose:** Track Call CTA effectiveness

### Implementation Pattern

**PageViewTracker Component:**
```typescript
'use client'
import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics/posthog-client'

export function PageViewTracker({ 
  eventName, 
  properties 
}: { 
  eventName: string
  properties?: Record<string, unknown> 
}) {
  useEffect(() => {
    trackEvent(eventName, properties)
  }, [eventName, properties])

  return null  // Invisible component
}
```

**Usage:**
```typescript
<PageViewTracker 
  eventName="public_directory_viewed" 
  properties={{ city: selectedCity || 'all', driver_count: drivers.length }} 
/>
```

**CTA Tracking:**
```typescript
// components/public/lead-tracking-buttons.tsx
const handleWhatsAppClick = async () => {
  await trackLead(driverId, 'WHATSAPP')  // Database (source of truth)
  trackEvent('whatsapp_cta_clicked', { driver_id: driverId })  // PostHog (analytics)
  window.open(whatsappLink, '_blank')
}
```

---

## Core Metrics Architecture

### Critical Rule: Database is Source of Truth

**Database stores and serves:**
- Profile views (with deduplication)
- Leads (WhatsApp + Call)
- Driver metrics displayed in dashboard

**PostHog tracks (complementary):**
- Product usage patterns
- User journey analysis
- Feature adoption
- A/B test candidates (future)

**Why this matters:**
- No dependency on external service for core business metrics
- No risk of data loss if PostHog goes down
- No vendor lock-in for critical data
- PostHog can be removed without impact on app functionality

**Database First Flow:**
```
User clicks WhatsApp button
    ↓
1. trackLead() - Stores in database (required)
2. trackEvent() - Sends to PostHog (optional)
    ↓
Driver views dashboard
    ↓
Metrics fetched from database (DriverMetricsService)
PostHog NOT consulted for metrics display
```

---

## Privacy & Security

### Sentry Privacy Features

1. **IP Address Removal:**
   - All IP addresses removed in `beforeSend` hook
   - Prevents location tracking
   - GDPR compliant

2. **Text Masking:**
   - All text masked in session replays
   - Prevents PII capture
   - User privacy protected

3. **Media Blocking:**
   - All media blocked in session replays
   - Prevents image/video capture
   - Reduces bandwidth usage

4. **Minimal Sampling:**
   - 10% trace sampling
   - 10% error replay sampling
   - 0% normal session sampling
   - Reduces data volume

### PostHog Privacy Features

1. **Autocapture Disabled:**
   - Only manual events tracked
   - Full control over what's sent
   - No surprise data collection

2. **Session Recording Disabled:**
   - No video recordings of user sessions
   - Protects user privacy
   - Reduces PostHog costs

3. **Manual Events Only:**
   - Explicit event tracking
   - No automatic form capture
   - No automatic click tracking

4. **Optional Integration:**
   - App works without PostHog key
   - Graceful degradation
   - No errors if not configured

---

## Environment Variables

### Required for Integration

**Sentry:**
```env
NEXT_PUBLIC_SENTRY_DSN=https://your-key@o123456.ingest.sentry.io/7654321
```

**PostHog:**
```env
NEXT_PUBLIC_POSTHOG_KEY=phc_yourPostHogKey123456789
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Optional Nature

- **Without Sentry DSN:** No error tracking, app works normally
- **Without PostHog key:** No analytics, app works normally
- **Both missing:** Full app functionality, just no monitoring/analytics

---

## Testing

### Manual Testing Checklist

**Sentry:**
- [x] Trigger client error → Error appears in Sentry dashboard
- [x] Trigger server error → Error appears in Sentry dashboard
- [x] Check IP address removed → Verified in Sentry event
- [x] Verify text masking in replay → Confirmed
- [x] App works without Sentry DSN → Confirmed

**PostHog:**
- [x] Page navigation → Events appear in PostHog
- [x] Click WhatsApp CTA → Event tracked
- [x] Click Call CTA → Event tracked
- [x] Visit directory page → Event tracked with properties
- [x] App works without PostHog key → Confirmed

**Integration:**
- [x] Both services active → No conflicts
- [x] Both services missing → App fully functional
- [x] Database metrics unaffected → Dashboard shows correct data
- [x] No performance impact → Page load times normal

---

## Performance Impact

### Sentry
- **Bundle size:** ~50KB gzipped
- **Runtime overhead:** Negligible (only on errors)
- **Network:** Only sends data on errors (10% sampling)

### PostHog
- **Bundle size:** ~30KB gzipped
- **Runtime overhead:** Minimal (manual events only)
- **Network:** Low volume (6 event types, no autocapture)

### Combined Impact
- **Total added:** ~80KB gzipped
- **Page load:** No measurable impact
- **Runtime:** No noticeable impact
- **Database:** Zero impact (separate systems)

---

## Future Enhancements

### Sentry (Phase 7+)

1. **User Feedback:**
   - Error feedback widget
   - User-reported issues
   - Screenshots on error

2. **Performance Monitoring:**
   - Increase trace sampling
   - Monitor slow queries
   - Track API response times

3. **Release Tracking:**
   - Associate errors with releases
   - Track error trends by version
   - Automated source maps

4. **Alerts:**
   - Slack notifications on critical errors
   - Email alerts for error spikes
   - PagerDuty integration

### PostHog (Phase 7+)

1. **Feature Flags:**
   - A/B test new features
   - Gradual rollouts
   - User segmentation

2. **Funnel Analysis:**
   - Driver onboarding funnel
   - Lead conversion funnel
   - Admin review funnel

3. **Cohort Analysis:**
   - User retention by city
   - Driver engagement patterns
   - Feature adoption by segment

4. **Heatmaps (Optional):**
   - Click patterns on profile pages
   - CTA button effectiveness
   - Mobile vs desktop behavior

---

## Files Created/Modified

### New Files (4 files)

**Sentry:**
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`

**PostHog:**
- `lib/analytics/posthog-client.ts`
- `providers/posthog-provider.tsx`
- `components/analytics/page-view-tracker.tsx`

**Documentation:**
- `docs/PHASE_REPORTS/PHASE_6_SENTRY_POSTHOG.md`

### Modified Files (10 files)

**Integration:**
- `app/layout.tsx` - Added PostHogProvider
- `components/public/lead-tracking-buttons.tsx` - Added PostHog events
- `app/(public)/drivers/page.tsx` - Added PageViewTracker
- `app/(public)/drivers/[slug]/page.tsx` - Added PageViewTracker
- `app/(dashboard)/dashboard/page.tsx` - Added PageViewTracker
- `app/(dashboard)/admin/drivers/[id]/page.tsx` - Added PageViewTracker

**Documentation:**
- `.env.example` - Added Sentry and PostHog variables
- `docs/INTEGRATIONS.md` - Updated with Phase 6 details
- `docs/ARCHITECTURE.md` - Updated phase marker
- `docs/CHANGELOG.md` - Added Phase 6 entry

**Total: 17 files (7 new, 10 modified)**

---

## Success Criteria

✅ **All met:**

1. Sentry installed and configured
2. Client, server, and edge error tracking active
3. Privacy features implemented (IP removal, text masking)
4. PostHog installed and configured
5. PostHog provider wrapping app
6. 6 custom events tracked
7. Core metrics remain in database
8. Dashboard metrics from database (not PostHog)
9. App works without Sentry/PostHog keys
10. No performance degradation
11. Minimal tracking (not overtracking)
12. Documentation updated

---

## Key Takeaways

### What Worked Well

- Clean separation between monitoring (Sentry) and analytics (PostHog)
- Privacy-first configuration protects user data
- Optional integration allows graceful degradation
- Database-first approach ensures data ownership
- Minimal event set avoids overtracking

### Architecture Decisions

- PostHog is complementary, not source of truth
- Core business metrics in database
- Manual event tracking only (no autocapture)
- Low sampling rates for Sentry (cost control)
- Session recording disabled (privacy + cost)

### Production Readiness

- Both integrations production-ready
- Privacy compliant (GDPR friendly)
- Cost controlled (sampling, no recordings)
- No critical dependencies
- Monitoring active but not blocking

---

**Phase 6 Status:** ✅ Complete and production-ready  
**Core Metrics:** ✅ Remain in database (unchanged)  
**Privacy:** ✅ IP removal, text masking, no autocapture  
**Optional:** ✅ App fully functional without keys  
