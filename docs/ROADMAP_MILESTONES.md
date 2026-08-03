# Movely — Roadmap & Milestones (v2)

**Created:** 2026-08-02
**Supersedes:** `PROJECT_HANDOFF.md` §6 (Remaining Milestones) and §7 (Future Improvements)
**Inputs:** Full codebase audit (2026-08-02) · Original vision document ("Plan inicial de Implementación y Servicios para Plataforma Web de Taxistas Independientes") · Previous milestone list (handoff M1–M10, F1–F16) · Directory-profile UX research

---

## 1. Where we are

### Infrastructure (all verified working, 2026-08-02)

- `movelygo.com` live with public Coming Soon page + waitlist capture
- `staging.movelygo.com` live with the full app (develop branch, auto-deploy)
- Supabase auth end-to-end: signup confirmation + password reset emails delivered via Resend (`hello@mail.movelygo.com`, domain verified)
- Vercel Analytics + PostHog + Sentry wired
- DB in sync (waitlist_entries, inquiries, featured_order all present)

### Product (what a user can do today)

- Driver: register → confirm email → create profile (single photo) → get approved → appear in directory → see views/leads metrics
- Customer (no account): browse `/drivers` with an exact-match city text filter → view profile → tap WhatsApp/Call (tracked)
- Admin: approve/reject/suspend drivers, manage featured ordering, see completeness

### Status of the previous milestone list (handoff M1–M10)

| Old | Status |
|---|---|
| M1 Repo rescue | ✅ Done |
| M2 DB sync | ✅ Done |
| M3 Production deployment | ✅ Done (Coming Soon strategy) |
| M4 Transactional email (in-app) | ❌ Pending → **A1** |
| M5 Admin inquiry inbox | ❌ Pending → **A2** |
| M6 Legal finalization | ❌ Pending → **A3** |
| M7 SEO baseline | ❌ Pending → **H1/H2** |
| M8 Supply seeding (recruit drivers) | 🔄 Operational, ongoing |
| M9 Production QA | 🔄 Partial (automated smoke test passed) |
| M10 Launch | ⏳ Gated on phases below |

---

## 2. Vision deltas — what changed from the original plan

The original vision document remains the north star (freemium directory, driver-as-customer, local SEO as acquisition engine). These items have **changed or been consciously deferred**:

| Original vision item | Decision now | Why |
|---|---|---|
| "Sello de Verificación" (admin-granted verified badge) | **Deferred.** Reviews are the trust mechanism | Current brand identity explicitly positions Movely as NOT a verification service. Revisit post-launch when a real document-check process can exist |
| Google Maps API (interactive service-area maps) | **Deferred** | Costs money at scale; text service area + city structure covers MVP. Premium feature later |
| Agenda de mantenimiento (oil-change reminders) | **Cut from MVP** | Out of the discovery-directory core loop; revisit as a Pro retention feature |
| QR code generator (printable profile QR) | **Post-launch** | Great upsell/retention tool but needs live public profiles first |
| WhatsApp Business API | **Deferred** | Simple `wa.me` deep links work today and are free |
| Ads system (local ads on free profiles) | **Post-revenue** | Requires advertiser demand which requires traffic. `Ad` model stays dormant |
| GMB creation service ($199) | **Post-launch operational** | It's a manual service, not code; needs live profiles to link to |
| Agenda de reservas (scheduled rides) | **Post-MVP** (original doc already marked it future) | |
| In-platform chat | **Never planned** — direct contact model | |

Everything else in the original document (search filters, galleries, reviews with verification, customer profiles with favorites, reports, city management, admin super-panel, freemium tiers, JSON-LD/SEO) **is still the plan** and is scheduled below.

---

## 3. Gap analysis — audit highlights

Full audit in the session record; the gaps that drive this roadmap:

**Visitor experience (the user's stated top priority)**
- No text search anywhere; the only filter is an exact-match free-text city input
- No pagination, sorting, results count, or filter facets in the directory
- Driver profile is informative but visually poor: two "Coming soon" placeholders (gallery, reviews), unstructured info split between a bio blob and a sidebar, no amenities/hours/payment/vehicle details, no sticky CTA
- Homepage has honest-but-empty spaces (featured section hides, no social proof)

**Data foundation**
- Cities hardcoded (8 constants, used in 2 files); `Driver.city` is free text → data quality risk and no city management
- `vehicleType` free text; no make/model/year/color; no amenities; no payment methods; no hours
- Single profile photo; no gallery model

**Trust**
- No reviews, no ratings, no reports — the #1 conversion lever for directories is absent

**Visitor accounts**
- No customer role, no favorites, no saved anything

**Admin**
- No inquiries inbox (contact form submissions only visible in DB)
- Admin search UI exists but is disabled; no bulk actions, no export, no analytics, no city/category management, no user management

---

## 4. UX research summary — what a high-converting profile looks like

Sources: directory-conversion guides (connorfinlayson.com, direct.directory, special.directory, jasminedirectory TACTS framework) + Airbnb-style listing anatomy. Applied to Movely:

1. **Media first.** A gallery hero (or photo strip) creates the first impression. Profiles with real vehicle photos massively outperform avatar-only ones.
2. **Answer the qualifying question in 3 seconds.** "Is this driver right for me?" → a quick-facts strip right under the name: vehicle (make/model/year), capacity, city, languages, availability.
3. **Scannable modular sections** in trust-building order: photos → quick facts → amenities/services → service area → reviews → about/bio → FAQs. No narrative walls.
4. **Persistent CTA.** Sticky WhatsApp/Call bar on mobile (thumb-reachable) and a sticky sidebar card on desktop. The CTA must survive scrolling.
5. **Social proof near the top.** Star rating + review count next to the name, full reviews section below. Verified-interaction badges on reviews ("Contacted this driver") multiply credibility.
6. **Trust strip (TACTS: Transparency, Authority, Consistency, Timeliness, Specificity).** Member-since date, response indicator, completeness-driven quality — all honest signals we can show without claiming verification.
7. **Specificity beats slogans.** "BWI airport runs, 6 AM–8 PM, 4 passengers, card/Zelle accepted" converts better than "great service."

These principles shape milestones B2, C1–C2, and D1.

---

## 5. The Roadmap

Phases are ordered by dependency. Each milestone lists purpose, scope, and rough effort (focused dev-days). Sequence inside a phase is flexible; phases mostly are not.

> **Guardrails apply to every milestone:** zero fake data, mobile-first, CTA ≤ 2 clicks, module pattern (actions → services → repositories → validations), docs updated per change.

---

### FASE A — Cerrar el MVP operativo (leftovers del plan anterior)

**Purpose:** finish the loop that already exists before adding surface area. Everything here is small and unblocks daily operations.

#### A1 — Transactional emails in-app (Resend SDK) — ~1 day
- Install `resend` SDK; `lib/email/` sender util reading `RESEND_API_KEY` (already set in Vercel + local)
- **Inquiry received** → notify `hello@movelygo.com`
- **Driver approved / rejected** → notify the driver (the core loop currently stalls silently here)
- Optional: welcome email on signup
- *Why:* without this, the admin never knows an inquiry arrived and drivers never know they were approved.

#### A2 — Admin inquiries inbox — ~0.5 day
- `/admin/inquiries`: list w/ status filter (NEW / IN_REVIEW / RESOLVED / ARCHIVED), detail view, status transitions
- `modules/contact/` already has the repository/service pattern; add admin queries + actions
- *Why:* contact form submissions are currently invisible without SQL.

#### A3 — Legal finalization — external dependency, ~0.5 day dev
- Review Privacy/Terms drafts, add the self-declaration + disclaimer language from the original vision (driver certifies license/insurance; passenger verifies)
- Remove "Draft" banners (`legal-page.tsx` supports via prop)
- *Why:* launch blocker; also required wording for the reports/reviews features coming later.

**Fase A total: ~2 days**

---

### FASE B — Fundación de datos estructurados

**Purpose:** convert free-text profile data into structured, filterable, admin-manageable data. This is the prerequisite for real search (C), the profile redesign (D), and per-city SEO (H). Do this before UX work so we only redesign once.

#### B1 — Cities as data + admin management — ~1.5 days
- `City` model: `id, name, slug, state, isActive, sortOrder` (keep it minimal — no speculative fields)
- Seed from current 8 constants; migrate `Driver.city` values to FK (data is clean: only ~4 drivers)
- Admin `/admin/cities`: add / activate / deactivate / reorder
- Replace free-text city inputs with a select (driver profile form + directory filter); homepage pills read from DB
- *Why:* you asked for city administration; it also fixes data quality (free-text city breaks filtering) and enables city landing pages (H2).

#### B2 — Structured driver attributes — ~2.5 days
Directly from the original vision's "Búsqueda de Guante Blanco" (§9), kept MVP-lean:
- **Vehicle:** `vehicleMake`, `vehicleModel`, `vehicleYear`, `vehicleColor`, `passengerCapacity` (replaces reliance on free-text `vehicleType`; keep `vehicleType` as category: Sedan / SUV-Minivan / Van / Luxury)
- **Amenities** (multi-select checkboxes): A/C, Wi-Fi, phone charger, child seat, pet-friendly, wheelchair accessible, large trunk, non-smoker, night service, airport specialist, long-distance/interstate
- **Payment methods** (multi-select): cash, card, Zelle, CashApp, Venmo, Apple/Google Pay
- **Operating hours:** simple text field per original vision ("Mon–Fri, 6 AM–8 PM") — not a structured scheduler
- Amenity + payment options defined as a DB-backed `ProfileAttribute` catalog manageable from admin (original vision: "Gestor de Categorías: añadir un nuevo filtro sin tocar el código")
- Update: profile form (grouped sections), completeness scoring, admin detail view
- *Why:* this is the substance of search filters, profile redesign, and SEO specificity. Free-text can't power any of it.

#### B3 — Vehicle photo gallery — ~2 days
- `DriverPhoto` model: `id, driverId, url, sortOrder, createdAt`
- Multi-upload to Supabase Storage (reuse existing 5MB validation), reorder + delete in dashboard
- **Limit: 2 photos free** (per original vision's free tier; the limit constant lives in one place so the future Pro tier just raises it to 7)
- Gallery viewer on public profile (lightbox, swipe on mobile)
- *Why:* the #1 visual gap. "Galería de Vehículo" was a free-tier feature in the original vision and the profile audit marks it as the biggest missing trust element.

**Fase B total: ~6 days**

---

### FASE C — Descubrimiento: búsqueda y directorio

**Purpose:** make finding the right driver fast — the core customer promise ("darle la mejor opción y fácil acceso a un taxista lo más rápido posible").

#### C1 — Real search + filters + pagination — ~3 days
- **Text search** on name, vehicle make/model, service area (Postgres `ILIKE`/`unaccent` first; `tsvector` only if needed later — no external search service)
- **Filter facets:** city (dropdown from B1), vehicle category, passenger capacity, amenities, payment methods, languages, availability
- **Sort:** featured (default), newest, [rating — activates in Fase E]
- **Pagination** (page-based, 12/page) + results count ("Showing 12 of 47 drivers")
- URL-driven state (`/drivers?city=baltimore&amenities=pet-friendly&q=bwi`) — shareable + SEO-crawlable
- Empty-state UX: no results → suggest clearing filters, nearby cities
- *Why:* the audit found the search input in admin is literally `disabled` and the public directory has an exact-match text field. This is the weakest part of the visitor experience today.

#### C2 — Directory & card redesign — ~1.5 days
- Richer driver cards: photo (from gallery), name, vehicle make/model + category chip, city, capacity, top-3 amenity pills, availability dot, [rating stars once E ships]
- Mobile-first filter sheet (bottom drawer) + desktop sidebar facets
- Skeleton loading states
- *Why:* cards are the product's shelf — they must answer the qualifying question before the click.

**Fase C total: ~4.5 days**

---

### FASE D — Rediseño del perfil del driver

**Purpose:** turn the profile from an information page into a conversion page, applying §4 research. This is deliberately AFTER B (so all the structured data exists to display) and alongside C (shared components).

#### D1 — Profile page overhaul — ~3 days
New structure (mobile-first):
1. **Gallery hero** — photo strip/carousel (from B3); tasteful fallback when no photos
2. **Identity block** — name, [rating + review count → E], vehicle make/model/year/color, city, availability status, member-since
3. **Quick-facts strip** — capacity, languages, hours, response expectations
4. **Sticky contact bar** (mobile bottom bar; desktop sticky sidebar card): WhatsApp + Call, lead-tracked as today
5. **Amenities & services grid** — icon pills from B2
6. **Payment methods row**
7. **Service area section** — city + area text (map deferred per §2)
8. **[Reviews section → E]** — placeholder-free; section simply absent until reviews exist (zero fake data)
9. **About/bio**
10. **Report link (discreet) → E2**
- JSON-LD (`LocalBusiness`/`TaxiService`) injected here — pulled forward from SEO phase because it belongs to this template
- *Why:* "la información está un poco all over the place" — this fixes hierarchy, adds the missing trust signals, and keeps the CTA permanently reachable.

**Fase D total: ~3 days**

---

### FASE E — Confianza: reviews y reports

**Purpose:** social proof is the single strongest conversion lever for directories, and per the original vision it is also the future monetization backbone (verified-review management is a Pro feature).

#### E1 — Reviews with basic verification — ~3.5 days
- `Review` model: `id, driverId, rating (1–5), text, reviewerName, reviewerEmail, ipHash, isVerifiedContact, status (PENDING/APPROVED/REJECTED), createdAt`
- **No account required** (per original vision free tier: "Reseñas básicas"), but:
  - **Verified-contact marker:** if the reviewer's browser previously fired a lead-click for that driver (localStorage token + ipHash correlation), mark `isVerifiedContact = true` → "Contacted this driver" badge (original vision §12 anti-fraud, basic level)
  - **Anti-fraud:** 1 review per driver per IP per 24h; email format validation; all reviews enter `PENDING`
- Public: star breakdown + review list on profile (D1 section), rating shown on cards/sort (C)
- Driver dashboard: sees own reviews (read-only in free tier)
- *Why:* "20 reseñas de 5 estrellas = el cliente se siente seguro." Also unlocks rating sort and honest homepage social proof.

#### E2 — Driver reports — ~1 day
- `Report` model: `id, driverId, reason (enum: NOT_A_REAL_DRIVER / SAFETY_CONCERN / MISLEADING_PROFILE / INAPPROPRIATE_CONDUCT / OTHER), details, reporterEmail?, ipHash, status (NEW/REVIEWED/DISMISSED/ACTION_TAKEN), createdAt`
- Discreet "Report this profile" on driver profile → modal form, rate-limited by ipHash
- *Why:* original vision §4 requirement; essential safety valve once traffic is real.

#### E3 — Admin moderation queues — ~1.5 days
- `/admin/reviews`: pending queue, approve/reject, verified-contact indicator, per-driver history ("Cola de Reseñas Pendientes" from vision §6)
- `/admin/reports`: list, driver context, status transitions, direct link to suspend driver
- Email notification to admin on new review/report (uses A1 infrastructure)

**Fase E total: ~6 days**

---

### FASE F — Cuentas de visitantes

**Purpose:** retention layer for the demand side — favorites requires identity; identity also strengthens future review verification.

#### F1 — Customer accounts + favorites — ~3 days
- Extend `UserRole` with `CUSTOMER`; same Supabase auth flow, separate lightweight onboarding (name only)
- `Favorite` model: `userId + driverId` unique pair
- Heart/save button on cards + profiles (prompts signup if anonymous — this is the acquisition hook)
- `/account` page: favorites list, own reviews, account settings
- Registration flow picks role: "I need rides" vs "I'm a driver"
- Logged-in customers: reviews auto-fill identity, and their reviews link to their account (higher trust weight)
- *Why:* you asked for visitor profiles; favorites is the retention feature that brings customers back without notifications spend. Deliberately AFTER reviews so accounts have something to do on day one.

**Fase F total: ~3 days**

---

### FASE G — Administración completa

**Purpose:** run the whole business from the panel, never from Prisma Studio.

#### G1 — Admin operational tooling — ~2 days
- **Enable the disabled search** (name/email/phone/city) in `/admin/drivers`
- Pagination in admin tables; bulk status actions; CSV export of drivers/leads/inquiries
- User management view (drivers + customers): reset-password trigger, deactivate account

#### G2 — Admin analytics dashboard — ~2 days
- Platform metrics: drivers by status/city, signups over time, views + leads over time (7/30/90d), top drivers, review/report volumes, waitlist count
- Simple charts (recharts or CSS bars — no heavy BI); reuse PostHog for deep dives
- *Why:* "que sea fácil para mí administrarlo" — this is the daily-operations cockpit. Also feeds the weekly driver stats emails later (original vision: "Envío de estadísticas semanales").

**Fase G total: ~4 days**

---

### FASE H — SEO y lanzamiento público

**Purpose:** be findable the moment the gate opens; then open it.

#### H1 — SEO baseline — ~1.5 days
- `sitemap.xml` (dynamic: drivers + cities) + `robots.txt` via Next metadata routes
- JSON-LD: `FAQPage` on marketing pages (driver profile JSON-LD shipped in D1)
- Metadata audit across all public pages; OG images
- Google Search Console + Business Profile setup (operational)

#### H2 — City landing pages — ~1.5 days
- `/taxis/[city]` per active city (from B1): intro copy, driver grid filtered to city, city FAQ, cross-links
- This is the programmatic-SEO seed ("Taxi en Baltimore" queries) from both the original vision and handoff §8.4

#### H3 — Launch — ~1 day + ops
- Clean all dev/test data (runbook §5 SQL already written)
- Full manual QA sweep of every flow on staging (checklist in TESTING_NOTES.md + new features)
- Flip `NEXT_PUBLIC_SITE_STATUS` → live, update Supabase Site URL to production domain, add production redirect URL
- Email the waitlist (via Resend broadcast)
- **Definition of done:** a real customer finds a real driver via Google/direct, contacts them; the driver sees the lead; you manage everything from `/admin`

**Fase H total: ~4 days**

---

### FASE I — Monetización (post-launch, gated on supply)

**Purpose:** revenue. Gated on **real usage** — the original vision and market research both say monetize after critical mass (guideline: ~50–100 active drivers and steady lead flow), because drivers pay for leads they can see, not promises.

#### I1 — Freemium tier infrastructure — ~4 days
- `subscriptionTier` on Driver (FREE / PRO) + Stripe Checkout + customer portal + webhook
- Free vs Pro ($29–49/mo, price test): gallery 2 → 7 photos · priority placement in search · review management (respond/flag) · weekly stats email · Pro badge
- Feature gates read tier from one service (no scattered conditionals)

#### I2 — Featured placement (paid) — ~1.5 days
- Time-boxed featured slots (7/30 days) per city page, max 3 — converts the existing manual featured system into revenue
- Admin grants/revokes; Stripe payment link first (no self-serve UI needed initially)

#### I3 — Operational upsells — ops, no code
- GMB profile creation service ($199, includes 3 months Pro — original vision §7)
- QR kit for vehicles (generator can ship as a small Pro feature, ~1 day)

#### I4 — Admin revenue view — ~1 day
- MRR, active subscriptions, churn, featured bookings

**Fase I total: ~6.5 days of dev + ops**

---

### FASE J — Performance & UX polish (continuous, priority items)

**Purpose:** make every interaction feel instant. Users on mobile with weak signal should never wait for a dropdown to populate or a list to render. This is not a single sprint — it's a set of patterns to apply opportunistically and as user feedback arrives.

#### J1 — Typeahead city selector (driver profile + admin) — ~1 day
- Replace the city `<select>` dropdown with a combobox/typeahead that fetches cities in batches as the user types
- Show ~10 results at a time, debounced (150ms), filtered server-side by name prefix
- Use the local JSON data (already shipped in B1) — no network round-trip needed for filtering
- **Geolocation pre-selection:** on driver profile creation, use `navigator.geolocation` to pre-select the nearest city (opt-in, graceful fallback to manual)
- *Why:* a `<select>` with 355 Maryland cities is unusable on mobile. Typeahead + geo pre-selection = 2 taps instead of scrolling a giant list.
- *Applies to:* driver profile form, admin city manager (already has search but could be smarter), future customer search

#### J2 — Directory search & filtering optimization — ~1.5 days
- Server-side filtering with debounced search (city, name, vehicle type, amenities)
- Pagination or infinite scroll (show 12 at a time, load more on scroll)
- Filter state in URL (`/drivers?city=baltimore&vehicle=Sedan`) for shareable/bookmarkable searches
- Skeleton loaders instead of blank screens during fetch
- *Why:* the current `/drivers` page loads all approved drivers at once. With 100+ drivers this will degrade. Build the pattern now while the dataset is small.

#### J3 — Image optimization audit — ~0.5 day
- Audit Next.js Image config: ensure all driver photos use proper `sizes` attributes
- Generate responsive `srcset` for gallery images (avoid loading 4K photos on mobile)
- Consider Supabase image transforms (resize on upload or on-the-fly) to reduce payload
- *Why:* vehicle gallery photos can be 3-5MB each from a phone camera. Mobile users on 4G will bounce if the directory loads slowly.

#### J4 — Database query audit — ~0.5 day
- Add Prisma `select` projections to all repository queries (avoid `SELECT *` patterns)
- Add indexes for common filter combinations (city + status, status + createdAt)
- Review N+1 patterns in admin lists (drivers with their city, photos, amenities)
- *Why:* as data grows, unbounded queries become the #1 performance killer.

#### J5 — Caching strategy — ~1 day
- Cache city list (rarely changes) with `unstable_cache` or ISR
- Cache active amenities/payment methods catalog
- Consider edge caching for public driver profiles (ISR with on-demand revalidation on profile update)
- *Why:* the city dropdown and filter options are loaded on every page view but change maybe once a month.

**Fase J total: ~4.5 days (but can be interleaved with other phases)**

---

## 6. Sequence summary & effort

| Fase | Theme | Effort | Cumulative |
|---|---|---|---|
| A | Close operational MVP | ~2d | 2d |
| B | Structured data foundation | ~6d | 8d |
| C | Search & directory | ~4.5d | 12.5d |
| D | Profile redesign | ~3d | 15.5d |
| E | Reviews & reports | ~6d | 21.5d |
| F | Customer accounts & favorites | ~3d | 24.5d |
| G | Full admin | ~4d | 28.5d |
| H | SEO & LAUNCH 🚀 | ~4d | 32.5d |
| I | Monetization (post-launch) | ~6.5d | 39d |
| J | Performance & UX polish (interleaved) | ~4.5d | as-needed |

**Notes on sequencing:**
- A can start immediately; it's independent of everything.
- B must precede C and D (structured data before the UI that displays/filters it).
- E before F (reviews give accounts a reason to exist); but F can swap earlier if driver recruitment conversations demand favorites sooner.
- G can interleave anywhere after A (admin tooling has no public dependencies).
- **Launch (H3) does not wait for F or G to be perfect** — the honest minimum for launch is A + B + C + D + E1/E3 + H. Favorites (F) and admin polish (G) can ship in the weeks right after launch. Decide when we get there.
- Driver recruitment (old M8) runs in parallel throughout — an empty directory converts no one, and Fase I is gated on supply, not code.

## 7. Standing rules for every milestone

1. Update `docs/CHANGELOG.md` + phase report per phase (existing discipline).
2. `npm run build` + `tsc --noEmit` + `eslint` clean before merge to develop; staging smoke after deploy.
3. Zero fake data — sections without real content are absent, not faked.
4. Mobile-first; contact CTA always ≤ 2 taps.
5. Schema changes: additive `prisma db push`, tested on staging DB first (it's shared — coordinate).
6. Every new module follows `actions/ → services/ → repositories/ → validations/ → types.ts`.
