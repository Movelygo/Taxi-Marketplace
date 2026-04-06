# Movely - User Flows

**Last Updated:** 2026-04-02  
**Phase:** 3 - Public Directory Complete  

## Overview

This document describes the complete user journeys through the Movely platform for each user type.

---

## Driver Flows

### Flow 1: Driver Registration

**Status:** ✅ Implemented in Phase 1

```
1. Visit homepage (/)
2. Click "Get Started" button
3. Navigate to /register
4. Fill registration form
   - Email
   - Password
   - Confirm Password
5. Submit form (validates with Zod schema)
6. Server Action: register() calls Supabase Auth signUp()
7. Database trigger creates User record in public.users
8. IF email confirmation disabled:
   → Session created immediately → Redirect to /dashboard
9. IF email confirmation enabled:
   → No session → Redirect to /check-email
   → User checks email
   → Clicks confirmation link
   → Redirected to /auth/callback
   → Token verified
   → Redirect to /login?message=confirmed
   → User logs in
   → Redirect to /dashboard
```

**Files Involved:**
- ✅ `app/(auth)/register/page.tsx`
- ✅ `components/auth/register-form.tsx`
- ✅ `modules/auth/actions/register.ts`
- ✅ `modules/auth/validations/auth.schema.ts`
- ✅ Database trigger: `handle_new_user()`
- ✅ Database: `users` table

---

### Flow 1b: User Login

**Status:** ✅ Implemented in Phase 1

```
1. Visit /login (or redirected from protected route)
2. Fill login form
   - Email
   - Password
3. Submit form (validates with Zod schema)
4. Server Action: login() calls Supabase Auth signInWithPassword()
5. IF credentials valid:
   → Session created
   → Redirect to /dashboard (or preserved redirect URL)
6. IF credentials invalid:
   → Display error message
   → Remain on /login
```

**Files Involved:**
- ✅ `app/(auth)/login/page.tsx`
- ✅ `components/auth/login-form.tsx`
- ✅ `modules/auth/actions/login.ts`

---

### Flow 1c: User Logout

**Status:** ✅ Implemented in Phase 1

```
1. User on /dashboard
2. Click "Sign out" button
3. Server Action: logout() calls Supabase Auth signOut()
4. Session cleared
5. Redirect to / (homepage)
6. Protected routes now redirect to /login
```

**Files Involved:**
- ✅ `modules/auth/actions/logout.ts`
- ✅ `middleware.ts` (enforces auth on next request)

---

### Flow 2: Create Driver Profile

**Status:** To be implemented in Phase 2-3

```
1. Login to dashboard
2. Navigate to "Create Profile"
3. Fill profile form
   - Display name
   - Phone number
   - WhatsApp number
   - City
   - Service area description
   - Vehicle type
   - Languages
   - Bio
   - Profile image
4. Submit form
5. Server validates input
6. Generate unique slug
7. Create driver record (status: PENDING)
8. Show "Awaiting Approval" message
```

**Files Involved:**
- TBD: `/app/(dashboard)/profile/create/page.tsx`
- TBD: `/modules/drivers/actions/create-driver.ts`
- TBD: `/modules/drivers/services/driver.service.ts`
- TBD: `/modules/drivers/repositories/driver.repository.ts`
- Database: `drivers` table

**Business Rules:**
- Slug must be unique
- Profile image max 5MB
- All fields validated with Zod
- Initial status: PENDING
- Not visible publicly until APPROVED

---

### Flow 3: Edit Driver Profile

**Status:** To be implemented in Phase 3

```
1. Login to dashboard
2. Navigate to "Edit Profile"
3. Modify fields
4. Submit changes
5. Server validates
6. Update driver record
7. Show success message
```

**Files Involved:**
- TBD

---

### Flow 4: View Dashboard Metrics

**Status:** To be implemented in Phase 7

```
1. Login to dashboard
2. View metrics:
   - Total profile views (from driver.viewCount)
   - Total leads
   - Leads by source (WhatsApp vs Call)
   - Recent leads list
3. See simple chart/graph
```

**Files Involved:**
- TBD: `/app/(dashboard)/dashboard/page.tsx`
- TBD: `/modules/drivers/services/driver-dashboard.service.ts`
- Database: `drivers`, `leads`, `profile_views` tables

---

## Customer Flows

### Flow 3: Browse Driver Directory (Phase 3)

**Actor:** Public user (no login required)

**Entry Point:** Homepage → "Browse Drivers" or direct `/drivers`

**Steps:**
1. User visits homepage or navigates to `/drivers`
2. System fetches all APPROVED drivers from database
3. System displays city filter buttons (dynamically generated from approved drivers)
4. User sees grid of driver cards showing:
   - Profile image (if available)
   - Display name
   - City
   - Vehicle type
   - Languages
   - Availability status badge
5. User optionally filters by city (URL: `/drivers?city=Baltimore`)
6. System re-queries with city filter
7. User clicks on a driver card
8. System navigates to `/drivers/{slug}`

**Key Files:**
- ✅ `app/(public)/drivers/page.tsx`
- ✅ `modules/drivers/services/driver.service.ts` (getPublicDrivers, getAvailableCities)
- ✅ `modules/drivers/repositories/driver.repository.ts` (findAllApproved, getUniqueCities)

**Business Rules:**
- Only APPROVED drivers shown
- Featured drivers appear first (isFeatured = true)
- Then sorted by creation date (newest first)
- City filter preserves ordering

**Result:** User can browse and filter available drivers

---

### Flow 4: View Driver Profile & Contact (Phase 3)

**Actor:** Public user (no login required)

**Entry Point:** Driver directory → Click driver card

**Steps:**
1. User clicks driver card from directory
2. System navigates to `/drivers/{slug}`
3. System fetches driver by slug WHERE status = 'APPROVED'
4. If driver not found or not approved → 404 page
5. If found, display full profile:
   - Profile image (large, centered)
   - Display name and city
   - Availability status
   - Vehicle type
   - Languages spoken
   - Service area description
   - Bio (if provided)
6. User sees two CTA buttons:
   - "WhatsApp" (green)
   - "Call Now" (blue)
7. User clicks WhatsApp button:
   - Link opens: `https://wa.me/{number}?text=Hi {name}, I found you on Movely...`
   - Redirects to WhatsApp app/web
8. OR user clicks Call button:
   - Link opens: `tel:+{number}`
   - Device initiates phone call

**Key Files:**
- ✅ `app/(public)/drivers/[slug]/page.tsx`
- ✅ `app/(public)/drivers/[slug]/not-found.tsx`
- ✅ `lib/utils/phone.ts` (getWhatsAppLink, getPhoneCallLink)
- ✅ `modules/drivers/services/driver.service.ts` (getPublicProfile)

**SEO/Metadata:**
- Dynamic page title: "{Name} - {City} Driver | Movely"
- Meta description with service details
- OpenGraph image if profile image exists

**Result:** User can view full driver profile and contact driver via WhatsApp or phone

---

### Flow 5: Find a Driver (Legacy - Replaced by Flow 3)

**Status:** Implemented in Phase 3 (see Flow 3 above)

```
1. Visit homepage
2. See directory of drivers
3. (Optional) Filter by city
4. Browse driver cards
   - Name
   - City
   - Vehicle type
   - Image
5. Click driver to view full profile
```

**Files Involved:**
- TBD: `/app/(public)/page.tsx`
- TBD: `/modules/drivers/actions/get-drivers-list.ts`
- Database: `drivers` (where status = APPROVED)

**Business Rules:**
- Only APPROVED drivers shown
- Featured drivers (is_featured = true) appear first
- Ordered by: featured DESC, created_at DESC

---

### Flow 6: View Driver Profile

**Status:** To be implemented in Phase 5

```
1. Click on driver from directory
2. Navigate to /taxi/[city]/[slug]
3. Page loads driver info:
   - Name
   - Photo
   - Vehicle type
   - Service area
   - Languages
   - Bio
   - CTAs (WhatsApp & Call)
4. Server tracks ProfileView
   - Check deduplication (30 min window)
   - If unique, create record
   - Increment driver.viewCount
```

**Files Involved:**
- TBD: `/app/(public)/taxi/[city]/[slug]/page.tsx`
- TBD: `/modules/drivers/actions/track-profile-view.ts`
- Database: `profile_views`, `drivers` tables

**Tracking Logic:**
```typescript
const ipHash = hashIP(getClientIP(request))
const recentView = await checkRecentView(driverId, ipHash)

if (!recentView) {
  await createProfileView({
    driverId,
    ipHash,
    userAgent: request.headers.get('user-agent'),
    referrer: request.headers.get('referer')
  })
  await incrementViewCount(driverId)
}
```

**SEO Requirements:**
- Dynamic metadata
- JSON-LD schema (LocalBusiness)
- Social media tags (Open Graph)

---

### Flow 7: Contact Driver (WhatsApp)

**Status:** To be implemented in Phase 6

```
1. On driver profile page
2. Click "Contact on WhatsApp" button
3. Server Action executes:
   - Track lead
   - Hash IP
   - Store metadata
4. Redirect to WhatsApp with pre-filled message
```

**Files Involved:**
- TBD: `/modules/leads/actions/track-lead.ts`
- Database: `leads` table

**Implementation:**
```typescript
// Client-side button
<form action={trackLead}>
  <input type="hidden" name="driverId" value={driver.id} />
  <input type="hidden" name="source" value="WHATSAPP" />
  <button>Contact on WhatsApp</button>
</form>

// Server Action
async function trackLead(formData) {
  const lead = await createLead({
    driverId: formData.get('driverId'),
    source: 'WHATSAPP',
    ipHash: hashIP(getClientIP(request)),
    userAgent: request.headers.get('user-agent'),
    referrer: request.headers.get('referer')
  })
  
  redirect(getWhatsAppLink(driver.whatsappNumber))
}
```

---

### Flow 8: Contact Driver (Phone Call)

**Status:** To be implemented in Phase 6

Same as Flow 7, but:
- Source: `CALL`
- Redirect to: `tel:+${driver.phone}`

---

## Admin Flows

### Flow 9: Admin Login

**Status:** To be implemented in Phase 1

```
1. Visit /admin
2. Login with admin credentials
3. Middleware validates role
4. If role !== ADMIN, redirect to /
5. If ADMIN, show admin panel
```

**Files Involved:**
- TBD: `/app/(admin)/layout.tsx` (middleware check)
- Database: `users` table (role check)

---

### Flow 10: Review Pending Drivers

**Status:** To be implemented in Phase 8

```
1. Login as admin
2. Navigate to /admin/drivers
3. See list of drivers filtered by status: PENDING
4. Click on driver to review
5. View full profile
6. Decision: Approve or Reject
```

**Files Involved:**
- TBD: `/app/(admin)/admin/drivers/page.tsx`
- TBD: `/modules/admin/actions/get-pending-drivers.ts`

---

### Flow 11: Approve Driver

**Status:** To be implemented in Phase 8

```
1. On driver review page
2. Click "Approve"
3. Server Action:
   - Update driver.status = APPROVED
   - (Optional) Send approval email
4. Driver now visible on public directory
```

**Files Involved:**
- TBD: `/modules/admin/actions/approve-driver.ts`
- Database: `drivers` table

---

### Flow 12: Reject Driver

**Status:** To be implemented in Phase 8

```
1. On driver review page
2. Click "Reject"
3. (Optional) Add rejection reason
4. Server Action:
   - Update driver.status = REJECTED
   - (Optional) Send rejection email
5. Driver remains hidden from directory
```

---

### Flow 13: View Leads Dashboard

**Status:** To be implemented in Phase 8

```
1. Login as admin
2. Navigate to /admin/leads
3. View aggregated lead data:
   - Total leads
   - Leads by driver
   - Leads by source
   - Recent leads list
4. Filter/sort as needed
```

**Files Involved:**
- TBD: `/app/(admin)/admin/leads/page.tsx`
- TBD: `/modules/admin/services/admin-analytics.service.ts`

---

### Flow 14: Manage Ads

**Status:** To be implemented in Phase 9

```
1. Login as admin
2. Navigate to /admin/ads
3. See list of ads
4. Create new ad:
   - Upload image
   - Add title
   - Add link URL
5. Activate/deactivate ads
6. Only one ad active at a time
```

**Files Involved:**
- TBD: `/app/(admin)/admin/ads/page.tsx`
- Database: `ads` table

---

## Error Flows

### Profile View Deduplication

```
If same IP viewed same driver < 30 min ago:
  - Don't create new ProfileView record
  - Don't increment viewCount
  - Continue showing page normally
```

### Invalid Driver Slug

```
If slug doesn't exist:
  - Show 404 page
  - Suggest similar drivers
  - Link back to directory
```

### Unapproved Driver Direct Access

```
If someone tries to access /taxi/city/slug of PENDING driver:
  - Show "Profile under review" message
  - Don't track view
  - Don't show CTAs
```

---

## Sequence Diagrams

### Driver Registration & Approval

```
Driver          App              Supabase Auth    Database         Admin
  │              │                     │              │              │
  │─Register────►│                     │              │              │
  │              │─Create User────────►│              │              │
  │              │                     │─Trigger─────►│              │
  │              │                     │              │(create user) │
  │◄─Redirect────│                     │              │              │
  │              │                     │              │              │
  │─Create Profile►                    │              │              │
  │              │────────Save Driver─────────────────►│              │
  │              │                                  (status=PENDING)  │
  │◄─"Awaiting Approval"─              │              │              │
  │              │                     │              │              │
  │              │                     │              │◄─Review──────│
  │              │                     │              │              │
  │              │                     │              │─Approve─────►│
  │              │                     │              │(status=APPROVED)
  │              │                     │              │              │
  │─View Directory►                    │              │              │
  │◄─Profile visible─                  │              │              │
```

---

## Critical Path

**Minimal viable flow for MVP:**

1. Driver registers ✓
2. Driver creates profile ✓
3. Admin approves ✓
4. Customer finds driver ✓
5. Customer contacts driver ✓
6. Lead is tracked ✓

Everything else is enhancement.
