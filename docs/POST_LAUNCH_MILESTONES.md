# Post-Launch Milestones — Backlog

**Status:** Planning — items to implement AFTER MVP launch
**Last updated:** 2026-08-03

> **Note:** Pre-MVP items (admin driver management, service area selects, vehicle selects, amenity/payment management, homepage city display, admin link to site) have been moved into their appropriate phases in `ROADMAP_MILESTONES.md` (Fase B and Fase G). This file only contains truly post-launch items.

---

## PL-1 — Review System Enhancements

**Goal:** Complete the review system with advanced features after launch.

### Items
- [ ] Automatic suspension thresholds: warning email at <3.0 avg with 5+ reviews, auto-suspend at <2.5
- [ ] Bayesian average rating (weighted by review volume + platform average)
- [ ] Review photos: allow customers to attach photos to reviews
- [ ] Email editing panel: admin can edit text content of all transactional emails
- [ ] Review helpfulness voting: "Was this review helpful?" (future engagement feature)

---

## PL-2 — Trip Intent Filter (pickup/destination)

**Goal:** Let customers input pickup/destination as FILTERS without becoming a booking platform.

### Research findings

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

## PL-3 — Homepage Strategy (hybrid search + landing)

**Goal:** Make the search bar the hero element while keeping landing page context for new visitors.

### Research findings

The key insight: **Homepages and search pages serve different audiences.**

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

**Navbar cleanup (can be done pre-launch):**
The current navbar shows "For Drivers" and "How It Works" on ALL pages including `/drivers`. These should be context-aware:
- On `/drivers` and driver profile pages: hide "For Drivers" and "How It Works" (visitor is already in the directory)
- On homepage: show all links
- Or simpler: move "For Drivers" and "How It Works" to the footer, keep navbar minimal (Home, Drivers, Contact)

---

## PL-4 — Test Data Seeding

**Goal:** Populate test reviews and drivers to verify functionality without touching production Supabase.

### Research findings

The project already has a `prisma/seed.ts` script that seeds cities, config, and profile attributes. We can **extend this script** to optionally seed test drivers + reviews.

**Approach: Environment-gated seed script**

1. **Extend `prisma/seed.ts`** with a `--with-test-data` flag (or check `NODE_ENV !== 'production'`)
2. **Create test drivers** (8-10 fake drivers across different cities):
   - Use `prisma.user.create` with fake emails (test1@movely.test, etc.)
   - Create driver profiles with realistic data (vehicles, amenities, photos)
   - Mark with `.test` email domain for cleanup
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
