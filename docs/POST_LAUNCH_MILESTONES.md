# Post-Launch Milestones — Backlog

**Status:** Planning — items to implement after MVP launch
**Last updated:** 2026-08-03

---

## PL-1 — Admin Driver Management

**Goal:** Full CRUD control over driver profiles from the admin panel.

### Items
- [ ] Admin can edit all driver profile fields (name, phone, WhatsApp, city, vehicle info, bio, etc.)
- [ ] Admin can upload/replace/delete driver profile images and gallery photos
- [ ] Admin can change driver status (already exists) + edit featured status
- [ ] Admin can view driver's reviews and reports from the driver detail page
- [ ] Admin can reset a driver's password or resend confirmation email

### Notes
- The admin driver detail page already exists at `/admin/drivers/[id]` — extend it with edit forms
- Use the same validation schemas as the driver-facing profile form
- All changes should be logged (audit trail) for accountability

---

## PL-2 — Service Area City Select (Searchable)

**Goal:** Replace comma-separated text with a searchable multi-select for service areas.

### Items
- [ ] Replace `serviceAreaText` free-text with structured `ServiceArea` relation (driverId, cityId)
- [ ] Searchable select component showing cities from the same state as the driver's home city first
- [ ] Then show nearby/recommended cities in the same state
- [ ] Then show the rest of the state's cities
- [ ] Driver can select multiple cities (multi-select with chips/tags)
- [ ] Admin can also edit service areas from PL-1

### Data model
```prisma
model ServiceArea {
  id        String @id @default(uuid())
  driverId  String @map("driver_id")
  driver    Driver @relation(fields: [driverId], references: [id], onDelete: Cascade)
  cityId    String @map("city_id")
  city      City   @relation(fields: [cityId], references: [id])
  createdAt DateTime @default(now()) @map("created_at")

  @@unique([driverId, cityId])
  @@map("service_areas")
}
```

### Migration
- Keep `serviceAreaText` as fallback during migration
- Parse existing text into ServiceArea records where possible
- Eventually deprecate `serviceAreaText`

---

## PL-3 — Vehicle Make/Model/Year Selects

**Goal:** Reduce user errors by using structured selects for vehicle info.

### Items
- [ ] Vehicle make select (Toyota, Honda, Ford, Chevrolet, etc.) — searchable
- [ ] Vehicle model select — filtered by selected make
- [ ] Vehicle year select — dropdown with reasonable range (2000-current year)
- [ ] Admin can manage the make/model catalog from the admin panel
- [ ] Fallback: "Other" option with free text for unusual vehicles

### Data model
```prisma
model VehicleMake {
  id    String @id @default(uuid())
  name  String @unique
  models VehicleModel[]
}

model VehicleModel {
  id      String @id @default(uuid())
  makeId  String @map("make_id")
  make    VehicleMake @relation(fields: [makeId], references: [id])
  name    String
  @@unique([makeId, name])
}
```

### Notes
- Seed with common makes/models for the US market
- Can use a third-party API (e.g., NHTSA API) for comprehensive data
- Keep `vehicleType` enum (Sedan, SUV, Van, Luxury) as-is — it's the category, not the make

---

## PL-4 — Admin Amenity Management

**Goal:** Full control over available amenities from the admin panel.

### Items
- [ ] Admin page at `/admin/amenities` to create/edit/deactivate amenities
- [ ] Each amenity has: key, label, icon (from lucide-react set), category, sort order, active status
- [ ] Changes reflect immediately in driver profile forms and directory filters
- [ ] Deactivating an amenity hides it from new profiles but keeps it on existing profiles

### Notes
- `ProfileAttribute` model already exists with `AMENITY` category
- The admin page just needs CRUD UI built on top of existing repository
- Icon picker: show available lucide icons in a grid, admin selects one per amenity

---

## PL-5 — Admin Payment Method Management

**Goal:** Full control over available payment methods from the admin panel.

### Items
- [ ] Admin page at `/admin/payment-methods` (or combine with amenities as `/admin/attributes`)
- [ ] Each payment method has: key, label, icon, active status, sort order
- [ ] Changes reflect immediately in driver profile forms and directory filters

### Notes
- `ProfileAttribute` model already exists with `PAYMENT_METHOD` category
- Can share the same admin page as amenities with a tab switcher

---

## PL-6 — Admin Link to Main Site

**Goal:** Easy navigation from admin panel to the public Movely site.

### Items
- [ ] Add "View site" link in admin sidebar (opens in new tab)
- [ ] Add "View public profile" link on admin driver detail page
- [ ] Add "View directory" link in admin sidebar

### Notes
- Simple but important for admin UX — currently no way to navigate to the public site from admin

---

## PL-7 — Homepage City Display Management

**Goal:** Admin control over which cities appear in the homepage "Service Areas" section.

### Items
- [ ] New field on `City` model: `showOnHomepage Boolean @default(false)`
- [ ] Admin can toggle which cities appear on the homepage
- [ ] Homepage section shows only cities with `showOnHomepage = true` AND at least 1 active driver
- [ ] Admin page at `/admin/cities` (already exists) — add toggle column
- [ ] Default behavior: auto-show cities with 3+ drivers (can be overridden by admin)

### Notes
- Currently all active cities appear on homepage — this gives admin granular control
- During early stage with few drivers, admin can manually curate which cities to highlight
- As the platform grows, the auto-show rule takes over

---

## PL-8 — Review System Enhancements (from Phase E pending)

**Goal:** Complete the review system with advanced features.

### Items
- [ ] Automatic suspension thresholds: warning email at <3.0 avg with 5+ reviews, auto-suspend at <2.5
- [ ] Bayesian average rating (weighted by review volume + platform average)
- [ ] Review photos: allow customers to attach photos to reviews
- [ ] Email editing panel: admin can edit text content of all transactional emails
- [ ] Review helpfulness voting: "Was this review helpful?" (future engagement feature)

---

## PL-9 — Research Items (Pending Investigation)

### PL-9a — Pickup/Destination Input
**Question:** How can we let customers input pickup/destination addresses without becoming a booking platform?

**Research findings:**

The core tension: Uber/Lyft use pickup+destination as the entry point because they ARE a booking platform. Movely is a **discovery directory** — our value is helping customers find the right driver, not booking the ride.

**Options analyzed:**

1. **"Trip intent" filter (Recommended — Phase 1)**
   - Add optional pickup/destination fields to the search bar
   - Use them as **filters**, not booking inputs: "Show me drivers who serve BWI → downtown Baltimore"
   - Match against driver's `serviceAreaText` / future `ServiceArea` records
   - Customer still contacts driver directly — no booking, no price quote
   - Low effort, high value: helps customers narrow down relevant drivers
   - **This preserves Movely's core identity as a directory, not a broker**

2. **"Get a quote" lead form (Phase 2 — future)**
   - Customer fills: pickup, destination, date, passenger count
   - Form generates a lead that goes to 3-5 matching drivers
   - Drivers respond directly to customer with quotes
   - Movely doesn't process the booking — just facilitates the introduction
   - This is the Thumbtack/Angi model: lead generation, not booking
   - Higher effort, requires lead routing logic + driver notification system

3. **Map-based discovery (Phase 3 — future)**
   - Show a map with driver locations / service areas
   - Customer clicks a region or draws a route
   - Filter drivers by who serves that area
   - Visual and intuitive, but requires geocoding + map integration

**Recommendation:** Start with Option 1 (trip intent filter). It's the simplest way to add pickup/destination without changing Movely's identity. The directory already has `serviceAreaText` — we just need to match it against user input. Option 2 can come later if drivers want lead routing.

**What NOT to do:** Don't become a booking platform. The brand rules are clear: Movely is a connection platform, not a broker. Adding booking would require payment processing, dispute resolution, and insurance — completely different business.

---

### PL-9b — Homepage Strategy
**Question:** Should the homepage be a driver search interface (like Uber) or keep the current landing page?

**Research findings:**

The key insight from research: **Homepages and search pages serve different audiences.**

- **Homepage** = orientation + trust building (for new visitors who don't know what Movely is)
- **Search/directory page** = conversion (for visitors who know what they want)

Airbnb's evolution is instructive:
- Old Airbnb: pure search bar (location, dates, guests)
- New Airbnb (2022): category browsing + search bar — because users didn't always know what they wanted
- Result: mixed reception but better for discovery

For Movely specifically:
- **Uber/Lyft** can use search-first because everyone knows what a ride app does
- **Movely is new** — visitors don't know if it's a booking app, a directory, or something else
- A pure search-first homepage would confuse: "Am I booking a ride? Where's the price? Why do I see driver profiles?"

**Recommendation: Hybrid approach (best of both)**

Keep the landing page but make the search bar the **hero element**:
1. **Hero section**: Value prop + prominent search bar ("Find drivers in your area") — not buried
2. **Below the fold**: How it works, trust signals, featured drivers, cities
3. The search bar should be the first thing visitors see and interact with
4. CTA: "Search drivers" as primary action, "How it works" as secondary

This way:
- New visitors get context (what is Movely?) from the landing content
- Returning visitors can search immediately (search bar is prominent)
- We don't force everyone through a landing page when they just want to search

**Navbar cleanup (immediate fix):**
The current navbar shows "For Drivers" and "How It Works" on ALL pages including `/drivers`. These should be context-aware:
- On `/drivers` and driver profile pages: hide "For Drivers" and "How It Works" (visitor is already in the directory)
- On homepage: show all links
- Or simpler: move "For Drivers" and "How It Works" to the footer, keep navbar minimal (Home, Drivers, Contact)

---

### PL-9c — Test Data Seeding
**Question:** How to populate test reviews and drivers to verify functionality without touching production Supabase?

**Research findings:**

The project already has a `prisma/seed.ts` script that seeds cities, config, and profile attributes. We can **extend this script** to optionally seed test drivers + reviews.

**Approach: Environment-gated seed script**

1. **Extend `prisma/seed.ts`** with a `--with-test-data` flag (or check `NODE_ENV !== 'production'`)
2. **Create test drivers** (8-10 fake drivers across different cities):
   - Use `prisma.user.create` with fake emails (test1@movely.test, etc.)
   - Create driver profiles with realistic data (vehicles, amenities, photos)
   - Mark with a `isTestSeed: true` flag in a metadata field (or just use the `.test` email domain for cleanup)
3. **Create test reviews** (3-7 reviews per driver, varied ratings):
   - Mix of APPROVED, PENDING, REJECTED statuses
   - Some with verified-contact badges
   - Some with driver responses
   - Some flagged by drivers
4. **Create test reports** (2-3 reports for testing the admin queue)
5. **Cleanup command**: `npx prisma db seed -- --cleanup-test-data` removes only test records

**Why this works without a separate database:**
- The seed script uses the same `DATABASE_URL` as the app
- Test data is clearly marked (`.test` email domain) so it can be filtered out of production queries
- We can add a `where: { email: { not: { endsWith: '.test' } } }` filter to production queries as a safety net
- Or simpler: only run `--with-test-data` against a local/staging database, never production

**Alternative: Supabase database branching**
- Supabase supports database branching (create a branch from production, seed it, test, delete)
- This is the cleanest approach but requires Supabase CLI setup
- Good for staging testing, overkill for local dev

**Recommendation:** Extend the existing seed script with test data generation. It's the fastest path, uses existing infrastructure, and doesn't require Supabase changes. Add a clear `--with-test-data` flag so it's never run accidentally against production.

**Implementation estimate:**
- ~150 lines added to `prisma/seed.ts`
- Creates: 8 test drivers, ~40 reviews, 3 reports
- All test data uses `@movely.test` email domain for easy identification/cleanup
