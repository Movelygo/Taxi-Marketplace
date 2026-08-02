# Movely (TaxiLink) — Complete Project Handoff Document

**Created:** 2026-08-01
**Purpose:** Full-context handoff for any AI system or developer (e.g., Devin Desktop) taking over this project.
**Audience:** AI coding agents and human developers with zero prior context.
**Language note:** The project owner communicates in Spanish; the codebase, docs, and UI copy are in English.

---

## Table of Contents

1. [Vision & Mission](#1-vision--mission)
2. [Current State Snapshot](#2-current-state-snapshot)
3. [Technical Architecture](#3-technical-architecture)
4. [Full System Audit](#4-full-system-audit)
5. [Completed Milestones](#5-completed-milestones)
6. [Remaining Milestones to Functional MVP](#6-remaining-milestones-to-functional-mvp)
7. [Future Improvement Milestones (Post-MVP)](#7-future-improvement-milestones-post-mvp)
8. [Market Research & Business Strategy](#8-market-research--business-strategy)
9. [Operating Rules for AI Agents (Guardrails)](#9-operating-rules-for-ai-agents-guardrails)
10. [Quickstart & Key Commands](#10-quickstart--key-commands)

---

## 1. Vision & Mission

### What is this project?

**Movely** (internal code name: **TaxiLink**; npm package name: `taxilink`; public brand: **Movely**, domain **movelygo.com**, contact **hello@movelygo.com**) is a **lead-generation directory platform** that connects customers with **independent taxi drivers** in the **Maryland / Baltimore / Washington DC metro area**.

### What it is NOT

This is deliberately **not Uber**. There is:

- **No** automatic ride matching
- **No** in-app payments
- **No** real-time GPS tracking
- **No** commissions taken from rides

### The core value exchange

- **Drivers** create professional public profiles, get discovered by local customers, and receive direct contact leads (WhatsApp clicks / phone calls). They see analytics on views and leads.
- **Customers** find trusted local taxi drivers and contact them directly in **fewer than 2 clicks** — no account required, no middleman.
- **The platform** owns discovery + trust + the analytics layer, which is the future monetization surface (featured placement, subscriptions, per-lead pricing — see Section 8).

### Guiding philosophy (enforced by project guardrails)

- Simplicity > complexity. MVP > complete system. Monolith, no microservices.
- **Zero fake data policy**: no fake reviews, fake trust badges, fake metrics, or misleading UI anywhere. This has been strictly enforced through all phases.
- Mobile-first UI. Main CTA reachable in ≤ 2 clicks.
- Documentation-first: every phase updates `/docs` (CHANGELOG, phase reports).

### Target market (initial)

Cities served (see `lib/constants/cities.ts`): Baltimore, BWI (airport area), Washington DC, Towson, Essex, Glen Burnie, Annapolis, Dundalk.

---

## 2. Current State Snapshot

**As of 2026-08-01 (last development session: 2026-05-19, Phase 10.5).**

| Item | Status |
|---|---|
| Development phase | **Phase 10.5 complete** (of a ~12-phase MVP roadmap) |
| Build | ✅ `npm run build` passes — 18 routes generated |
| Type check | ✅ `npx tsc --noEmit` clean |
| Lint | ✅ `eslint .` clean, 0 warnings |
| Automated tests | ❌ **None exist** (no test framework installed) |
| Production deployment | ❌ **Not deployed** (no Vercel/hosting config in repo; runs locally only) |
| Live database | ⚠️ Supabase Postgres exists, but **2 schema changes are NOT yet pushed** (see Audit §4.2) |
| Git state | 🔴 **CRITICAL: 87 files uncommitted.** Last commit = end of Phase 5. Phases 6→10.5 exist only in the working tree (see Audit §4.1) |
| Email notifications | ❌ Not integrated (Resend planned, never added) |
| Payments/monetization | ❌ Not built (intentionally post-MVP) |

### What a user can do today (working end-to-end locally)

1. **Driver**: register → confirm email → log in → create profile (name, phone, WhatsApp, city, service area, vehicle type, languages, bio, photo upload) → see PENDING status → once approved, appear in public directory → view metrics (profile views, WhatsApp leads, call leads) → see profile-completeness score with actionable checklist → recover password.
2. **Customer** (no account needed): browse `/drivers` directory with city filter → view driver public profile → tap WhatsApp or Call (tracked as leads with IP-hash deduplication) → read marketing pages (`/how-it-works`, `/for-drivers`) → submit contact form on `/contact`.
3. **Admin**: log in (ADMIN role) → review pending drivers → approve / reject / suspend with status history → manage featured drivers with manual ordering (up/down) → see per-driver completeness in admin list and detail views.

---

## 3. Technical Architecture

### Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router, RSC, Server Actions) | 15.1.6 |
| Language | TypeScript (strict) | 5.x |
| UI runtime | React | 19 |
| Styling | TailwindCSS + shadcn/ui-style primitives | 3.4.x |
| Database | PostgreSQL (Supabase-hosted) | — |
| ORM | Prisma | 5.22 |
| Auth | Supabase Auth (SSR cookies, PKCE + magic-link callback flows) | @supabase/ssr 0.5.2 |
| Storage | Supabase Storage (profile images, 5MB client limit / 6MB server) | — |
| Validation | Zod | 3.24 |
| Analytics | PostHog (light integration, page-view + event tracking) | posthog-js 1.x |
| Error tracking | Sentry (client + edge + server configs present) | @sentry/nextjs 8.55 |
| Icons | Lucide React | — |

### Route map (18 routes, 4 route groups)

```
(public)   — Navbar + Footer shell
  /                      Homepage: hero + featured drivers section (auto-hides if empty)
  /drivers               Directory: 3-col responsive grid, city filter, APPROVED only
  /drivers/[slug]        Public driver profile: navy hero, WhatsApp/Call CTAs (lead-tracked)
  /how-it-works          Marketing: customer flow, driver flow, transparency block
  /for-drivers           Driver landing page: benefits, FAQ, signup CTA
  /contact               Real contact form → Inquiry table (Zod validated)
  /privacy, /terms       Legal pages (marked "Draft — informational only")
  /driver-guidelines     Community standards (final, no draft banner)

(auth)     — Compact top bar + AuthCard shell
  /login, /register, /forgot-password, /reset-password, /check-email

(dashboard) — Authenticated shell (DashboardHeader + footer); layout-level auth check
  /dashboard             State-aware overview: onboarding callouts, completeness card, metrics
  /dashboard/profile     Create/edit profile + image upload

(admin)    — Sidebar shell; ADMIN role enforced in layout
  /admin                 Overview
  /admin/drivers         Driver list w/ filters + completeness column
  /admin/drivers/[id]    Detail: status actions + completeness card
  /admin/featured        Featured drivers manager (order up/down, add/remove)

API
  /api/webhooks/supabase Supabase → Prisma user sync webhook
  /auth/callback         Auth callback (PKCE code + magic-link token_hash flows)
```

### Module layer (business logic — `modules/`)

Every module follows the same pattern: `actions/` (server actions) → `services/` (logic) → `repositories/` (Prisma) → `validations/` (Zod) → `types.ts`.

| Module | Responsibilities |
|---|---|
| `auth` | register, login, logout, forgot/update password, get-current-user |
| `drivers` | create/update profile, image upload, driver service, metrics service, **profile-completeness service** (10 weighted fields) |
| `leads` | track WhatsApp/call leads w/ IP-hash + dedup |
| `profile-views` | track profile views, 30-min IP dedup |
| `admin` | update driver status, toggle featured, **reorder featured**, admin queries |
| `contact` | submit inquiry (public contact form) |

### Database schema (Prisma — `prisma/schema.prisma`)

| Model | Purpose | Notes |
|---|---|---|
| `User` | Syncs 1:1 with Supabase `auth.users` (same UUID — **critical invariant**) | roles: DRIVER, ADMIN |
| `Driver` | Profile + approval workflow | status: PENDING/APPROVED/REJECTED/SUSPENDED; availability: AVAILABLE/BUSY/OFFLINE; `isFeatured` + `featuredOrder` |
| `ProfileView` | View tracking | ipHash dedup indexes |
| `Lead` | Contact tracking | source: WHATSAPP/CALL |
| `Inquiry` | Contact form submissions | status: NEW/IN_REVIEW/RESOLVED/ARCHIVED — **table not yet pushed to live DB** |
| `Ad` | Basic banner ads system | Schema only; no UI built (dormant) |

### Key invariants an agent MUST preserve

1. `User.id` **must equal** Supabase `auth.users.id` (enforced via webhook/trigger; never generate User UUIDs).
2. Only `APPROVED` drivers appear publicly, ordered by `featuredOrder ASC`.
3. Middleware protects `/dashboard` and `/admin` without DB queries; **admin role check happens in `app/(admin)/layout.tsx`** via Prisma.
4. Lead/view tracking dedups by hashed IP — never store raw IPs.
5. Homepage featured section shows max 6 drivers and auto-hides when empty.
6. No fake data anywhere: no fabricated reviews, verification badges, or metrics.

---

## 4. Full System Audit

### 4.1 🔴 CRITICAL — Version control state

- HEAD is at commit `2eb2115` — *"Phase 5 complete - stable checkpoint"*.
- **All work from Phases 6 → 10.5 (87 modified/new files, ~10 weeks of work) is uncommitted** in the working tree. 48 files are untracked.
- There are two local branches (`main`, `master`); `main` tracks `origin/main`.
- **If this working tree is lost during the editor migration, Phases 6–10.5 are lost.**
- **Action required before anything else:** `git add -A && git commit` (and push). This is the single highest-priority action in the entire project.

### 4.2 ⚠️ HIGH — Database drift

- The live Supabase database is missing two additive schema changes from Phases 10/10.5:
  1. `drivers.featured_order` column (Int, default 0)
  2. `inquiries` table (contact form persistence)
- The Prisma **client** was regenerated locally so the app compiles, but writes to these will fail against the live DB until `npx prisma db push` is run (a previous `prisma migrate dev` attempt timed out against Supabase; `db push` is the project's normal workflow — there is **no migrations directory**).
- Mitigation already in place: the contact form server action degrades gracefully (shows a friendly "email us at hello@movelygo.com" message on persistence failure).

### 4.3 ⚠️ Deployment & environment

- No production deployment exists. No `vercel.json`/hosting config in the repo (Vercel needs none, but there is no evidence of a linked project).
- `.env` / `.env.local` exist locally with Supabase credentials — **these are NOT in git** (correct) but must be migrated to the new machine/editor carefully.
- Supabase production auth checklist (from `docs/TESTING_NOTES.md`): enable "Confirm email", configure custom SMTP (built-in Supabase email is limited to ~3-4 emails/hour — **not production viable**).

### 4.4 Functional gaps (known, documented)

| Gap | Impact | Where documented |
|---|---|---|
| No email notifications (Resend never integrated) | Inquiries and driver approvals are silent; admin must poll DB | CHANGELOG Phase 10/10.5 notes |
| No admin inbox for inquiries | Contact submissions only visible via SQL/Prisma Studio | Phase 10.5 report |
| Legal pages are drafts | Privacy/Terms show "Draft" banner; need legal review before launch | Phase 10 notes |
| `Ad` model dormant | Schema exists; zero UI/logic | Phase 0 schema |
| No automated tests | All QA is manual (checklist in `docs/TESTING_NOTES.md`) | — |
| Brand inconsistency | `package.json` = "taxilink"; docs README says "TaxiLink"; UI says "Movely"; domain movelygo.com | README vs UI |
| Old design docs stale | `docs/Responses.md` references an abandoned blue palette (`#0011A8`); current brand is navy `#0B1F3D` + amber `#FFC107` | DESIGN_SYSTEM.md is current |

### 4.5 Code quality assessment

**Strengths:**
- Clean module architecture (action → service → repository → validation) applied consistently across all 6 modules.
- Strict TypeScript passes with zero errors; lint clean.
- Zod validation on every user input; try/catch on critical operations; no raw IP storage (hashed).
- Loading states are guaranteed to resolve (documented mutual-exclusion pattern for profile save vs image upload).
- Auth handles both PKCE and magic-link callback flows; a security vulnerability in recovery flow was found and fixed in Phase 8.
- Layout shells per route group eliminate duplication (Phase 10.5).
- Docs discipline is excellent: 11 phase reports + changelog + architecture + design system all current.

**Weaknesses:**
- Zero test coverage; regressions only caught by manual checklists.
- Some server actions could share more error-handling boilerplate.
- `viewCount` on Driver is denormalized alongside `ProfileView` rows (two sources of truth; minor).
- Sentry DSN/PostHog keys are optional envs — observability will silently no-op if unset in production.

### 4.6 Security posture

- Route protection: middleware (session) + layout-level role checks. ✅
- Secrets in env files, not committed. ✅
- Service-role Supabase key used server-side only. ✅
- Input validation everywhere via Zod. ✅
- No rate limiting on public endpoints (contact form, lead tracking) — spam risk at scale. ⚠️
- No CAPTCHA on contact form — acceptable for MVP, revisit if spam appears. ⚠️

---

## 5. Completed Milestones

Chronological, from `docs/CHANGELOG.md` and `docs/PHASE_REPORTS/`.

| # | Phase | Date | What was delivered |
|---|---|---|---|
| 1 | **Phase 0 — Setup** | 2026-03-29 | Next.js 15 + TS strict scaffold, complete Prisma schema (users, drivers, profile_views, leads, ads), Supabase clients, module skeleton, full initial documentation set. |
| 2 | **Phase 1 — Authentication & User Sync** | 2026-04-01 | Supabase Auth (register/login/logout), webhook syncing `auth.users` → Prisma `User` with same UUID, middleware route protection, auth callback route. |
| 3 | **Phase 2 — Driver Profile Management** | 2026-04-02 | Profile CRUD (server actions + Zod), unique slug generation, profile image upload to Supabase Storage (5MB validation), dashboard profile editor. |
| 4 | **Phase 3 — Public Directory & Profiles** | 2026-04-02 | `/drivers` public directory (APPROVED only) with city filter, `/drivers/[slug]` public profile, WhatsApp/Call contact buttons, mobile-first cards. |
| 5 | **Phase 4 — Admin Driver Review** | 2026-04-06 | Admin panel with role enforcement, driver list + filters, approve/reject/suspend actions, status badges, driver detail view. |
| 6 | **Phase 5 — Lead & View Tracking + Metrics** | 2026-04-06 | Lead tracking (WhatsApp/Call) and profile-view tracking with IP-hash dedup (30-min window), driver metrics dashboard (views, total/WhatsApp/call leads). ⚠️ **Last committed checkpoint in git.** |
| 7 | **Phase 6 — Sentry + PostHog** | 2026-04-06 | Error tracking (client/edge/server configs) and product analytics (page-view tracker component, event capture), both optional-env gated. |
| 8 | **Phase 7 series (7, 7B–7F) — Design iterations** | 2026-04-06 → 04-08 | Multiple UI overhauls converging on the current visual language; grid-based directory; primitive components (Button/Card/Badge) standardized. Superseded iterations are documented in the changelog. |
| 9 | **Phase 7.5 — Visual Consolidation** | 2026-05-01 | Settled final brand palette (navy `#0B1F3D` + amber `#FFC107`), contained all mock data, fixed build issues, reusable primitives (`StatusPill`, `EmptyState`, `SectionHeader`). |
| 10 | **Phase 8 — Auth Recovery & Reliability Audit** | 2026-05-17 | Full password-recovery flow (forgot/reset/check-email), **fixed a security vulnerability** in the recovery session handling, enforced consistent password rules (min 8), hardened expired/invalid token errors. |
| 11 | **Phase 9 — Marketing Pages & Conversion** | 2026-05-18 | `/for-drivers`, `/how-it-works`, `/contact` (form disabled at that point), global footer, mobile hamburger menu, SEO metadata (title/description/OG) on all public pages, homepage refinement with dual CTAs. No fake claims added. |
| 12 | **Phase 10 — Trust, Polish & Onboarding** | 2026-05-19 | Profile-completeness scoring service + card (10 weighted fields), state-aware dashboard with onboarding callouts (6 states: no-profile/pending/rejected/approved variants), featured-drivers homepage section + admin ordering UI, legal pages (Privacy/Terms drafts + Driver Guidelines), public profile hero redesign. |
| 13 | **Phase 10.5 — Layout Consistency + Contact Form** | 2026-05-19 | **Audit revealed Phase 10's contact-form backend was never actually built** — corrected: real `Inquiry` model + `modules/contact/` + working form. Shared `AuthCard` across all 5 auth pages; new authenticated dashboard shell (`DashboardHeader` + layout-level auth); docs updated. Build/lint/type-check all clean. |

---

## 6. Remaining Milestones to Functional MVP

Ordered by dependency. M1–M3 are **launch blockers in the most literal sense** (data-loss risk / broken features).

### M1 — Repository rescue & hygiene 🔴 (do first, ~30 min)
- Commit all 87 pending files (Phases 6–10.5) with a clear message; push to `origin/main`.
- Delete or merge the stale `master` branch.
- Verify `.env*` files are gitignored (they are) and back them up separately before the editor migration.
- **Why:** the working tree is currently the only copy of ~10 weeks of work.

### M2 — Database sync (~15 min + verification)
- Run `npx prisma db push` against the live Supabase DB to create `inquiries` and `drivers.featured_order`.
- Verify with `npx prisma studio`: submit a test contact form, toggle a featured driver.
- **Why:** contact form and featured ordering write paths fail against live DB today.

### M3 — Production deployment (~half day)
- Deploy to Vercel (or equivalent); connect `movelygo.com`; set all env vars (`DATABASE_URL`, Supabase keys, `NEXT_PUBLIC_APP_URL`, Sentry DSN, PostHog key).
- Supabase production config: enable email confirmation, configure custom SMTP (Resend SMTP or AWS SES — built-in Supabase email allows only ~3-4/hour), set auth redirect URLs to production domain.
- Point Supabase user-sync webhook to production URL.
- Smoke-test the full driver journey in production.

### M4 — Transactional email (Resend) (~1 day)
- Integrate Resend: (a) inquiry-received notification to hello@movelygo.com, (b) driver approved/rejected notifications, (c) optional welcome email.
- **Why:** without this, admin never knows an inquiry arrived and drivers never know they were approved — the core loop stalls silently.

### M5 — Admin inquiry inbox (~half day)
- `/admin/inquiries`: list with status filter (NEW/IN_REVIEW/RESOLVED/ARCHIVED), detail view, status transitions. Repository/service pattern already exists in `modules/contact/`.

### M6 — Legal finalization (~external dependency)
- Legal review of Privacy Policy and Terms; remove "Draft" banners (`components/public/legal-page.tsx` supports this via a prop).

### M7 — SEO & discoverability baseline (~1 day)
- `sitemap.xml` + `robots.txt` (Next.js metadata routes).
- JSON-LD: `LocalBusiness`/`TaxiService` schema on driver profiles, `FAQPage` on marketing pages.
- Per-city landing pages (`/taxis/[city]`) using existing city constants — this is the programmatic-SEO seed (see §8.4).
- Google Business Profile + Google Search Console setup (operational, not code).

### M8 — Supply seeding (operational, continuous)
- Manually recruit the first **20–50 real drivers** in Baltimore/BWI (in-person at airport taxi lines, driver Facebook/WhatsApp groups, laundromats/gas stations near taxi hubs).
- White-glove onboarding: photograph drivers, fill profiles for them if needed. An empty directory converts no one; directory literature suggests critical mass (~100+ listings) before monetizing (§8.3).

### M9 — Production QA & observability (~half day)
- Execute the full manual checklist in `docs/TESTING_NOTES.md` against production.
- Verify Sentry receives a test error; verify PostHog receives events; set up a basic uptime check.

### M10 — Launch 🚀
- Definition of done for MVP: a real customer finds a real driver via Google/direct visit and contacts them; the driver sees the lead in their dashboard; the admin can manage everything without touching the database directly.

**Estimated total dev effort for M1–M9: roughly 4–6 focused working days, plus ongoing driver recruitment (M8).**

---

## 7. Future Improvement Milestones (Post-MVP)

Grouped by horizon. None of these should be built before MVP launch (guardrails: no speculative features).

### Horizon 1 — Strengthen the loop (first 1–3 months post-launch)
| Milestone | Description | Rationale |
|---|---|---|
| **F1 — Reviews & ratings** | Customer reviews with moderation queue; display on profiles | #1 trust lever for directories; review density directly correlates with conversion and with what businesses will pay (§8.3) |
| **F2 — Quote/booking request form** | Structured lead capture ("From / To / When") emailed+dashboarded to driver, not just click-tracking | Converts anonymous clicks into rich, measurable leads — the asset later sold in per-lead pricing |
| **F3 — SMS notifications (Twilio)** | Alert drivers instantly on new leads | Speed-to-answer is the single biggest local advantage vs apps (§8.5) |
| **F4 — Spanish i18n** | Full ES translation of public + dashboard | Large share of independent drivers in the target market are Spanish-speaking |
| **F5 — Rate limiting + spam protection** | On contact form and lead endpoints | Known gap (§4.6) |
| **F6 — Playwright E2E suite** | Cover the golden paths (register→profile→approve→lead) | Zero tests today |

### Horizon 2 — Monetization (months 3–9, gated on ≥100 drivers & meaningful traffic)
| Milestone | Description | Model reference (§8.3) |
|---|---|---|
| **F7 — Featured placement (paid)** | Stripe checkout for time-boxed featured slots (7/30-day), max 3 per city page | Featured-slot pricing formula: ≈ monthly category pageviews × 0.03 × niche CPC |
| **F8 — Driver subscription tiers** | Free / Pro (~$29–49/mo: analytics+, badge, priority placement) / Premium (~$79–99/mo: top placement, review tools) | Local directory benchmarks: $29–99/mo tiers |
| **F9 — Pay-per-lead (exclusive)** | Charge for qualified quote-form leads ($5–15/lead initially; taxi jobs are lower-ticket than home services' $25–75) | Angi/Thumbtack model, but **exclusive leads** (1 lead → 1 driver) as differentiator |
| **F10 — Admin revenue dashboard** | MRR, churn, lead volumes per city | Operate the business |

### Horizon 3 — Expansion (months 9+)
| Milestone | Description |
|---|---|
| **F11 — Multi-city playbook** | Replicate Baltimore model city-by-city (programmatic city+service pages, local driver recruitment). Architecture already city-based |
| **F12 — Airport transfer vertical** | Dedicated BWI/DCA/IAD landing pages + flat-rate listings; airport runs are the highest-intent, highest-value taxi searches |
| **F13 — NEMT / medical transport vertical** | Non-Emergency Medical Transportation: $12–13B US market growing ~8%/yr, extremely fragmented; dialysis patients alone need 156 trips/year. Drivers can register NEMT capability; platform connects to facilities/brokers (§8.2) |
| **F14 — Corporate & standing accounts** | Hotels, assisted-living, schools needing recurring rides; sold as monthly accounts |
| **F15 — Driver PWA / mobile app** | Push notifications, availability toggle on the go |
| **F16 — Data products** | Aggregate anonymized demand data (searches by corridor/time); directories monetize clean structured data at very high margin |

---

## 8. Market Research & Business Strategy

Research performed 2026-08-01 from public web sources. All figures cited.

### 8.1 Market size & structure — the opportunity is fragmentation

- The **US Taxi & Limousine Services industry is ~$74.2B (2026)** and has grown at double-digit CAGR since 2021 (IBISWorld, [ibisworld.com/united-states/industry/taxi-limousine-services/1951](https://www.ibisworld.com/united-states/industry/taxi-limousine-services/1951/)).
- There are **~1.5 million businesses** in the category (IBISWorld 2025), and Kentley Insights counts **~965,000 companies with average revenue of only ~$100K/company** ([kentleyinsights.com](https://www.kentleyinsights.com/taxi-and-limousine-service-industry-market-research-report/)).
- **Translation: this industry is overwhelmingly one-person/one-vehicle operators** — exactly Movely's supply side. They have no marketing departments, weak-to-no web presence, and depend on street hails, airport queues, and word of mouth.
- The structural pain: customers search Google ("taxi near me", "BWI airport taxi") and find either national apps or nothing local and trustworthy. Independent drivers are invisible at the exact moment of highest intent.
- **Movely's thesis is validated by this structure**: aggregate invisible fragmented supply → capture high-intent local search demand → sell the connection.

### 8.2 Adjacent high-value demand: NEMT (medical transport)

- US Non-Emergency Medical Transportation market: **~$12.5B (2025), growing 6.4–8.2% CAGR to ~$19B by 2031** (Mordor Intelligence, [mordorintelligence.com](https://www.mordorintelligence.com/industry-reports/non-emergency-medical-transportation-market); NEMT Platform, [nemtplatform.com](https://nemtplatform.com/blogs/starting-an-nemt-business-in-2026-where-the-real-profit-comes-from)).
- **No single company controls more than 5%** of the market; brokers (ModivCare, MTM) contract with independent providers — i.e., drivers like Movely's.
- Highest-margin niches for independent drivers: same-day hospital discharge ($150–300+/trip, direct facility billing), long-distance out-of-county runs ($200–600+/trip), assisted-living concierge ($80–200/trip cash-pay), dialysis standing orders (**156 predictable trips/year per patient**).
- Maryland relevance: dense hospital corridor (Johns Hopkins, University of Maryland Medical System) + aging population.
- **Strategic implication:** post-MVP, a "medical transport capable" driver attribute + facility-facing landing pages opens a B2B revenue line far more valuable per lead than consumer rides.

### 8.3 Proven monetization models for directories/lead-gen (what to copy, what to avoid)

**Benchmark economics from the giants:**
- **Angi**: sells each homeowner lead to 3–8 contractors at **$15–85/lead** (specialty $100+); Leads segment gross margin ~65%; also Pro subscriptions $200+/mo (Angi 10-K, summarized at [askbaily.com/why-not-shared-leads](https://askbaily.com/why-not-shared-leads)).
- **Thumbtack**: pay-per-contact **$10–150+**, dynamically repriced weekly; $3.2B valuation (2021).
- **Key market insight:** the shared-lead model is losing pricing power and generating contractor resentment (leads sold 8 times; ~$1,400 blended cost per booked customer). The **FTC has flagged shared-lead pass-through costs** as a consumer-transparency concern. → **Movely should differentiate with exclusive leads (1 lead → 1 driver) and transparent pricing.**

**Directory monetization benchmarks (small/local scale):**
- Local directory tiers: Basic free / Enhanced **$29–39/mo** / Featured **$79–99/mo** / Premium **$199–299/mo** ([turnkeydirectories.com](https://turnkeydirectories.com/monetize-local-business-directory-tactics/)).
- Featured-slot pricing formula: **slot price ≈ monthly category pageviews × 0.03 × niche avg CPC**; never sell more than 3 featured slots per page; time-boxed (7/30-day) slots convert better than permanent upgrades ([directory-launch.com](https://directory-launch.com/blog/monetizing-a-directory)).
- Pay-per-lead at local scale: exclusive leads **$45–150** in high-value verticals, shared $15–30; subscription lead access $199–499/mo.
- **Staging discipline (critical):** monetize only after critical mass. Guidance: ~100–150 active listings + 1,000+ monthly local visitors before charging; 0–500 visitors/mo → paid submissions only; 5k–20k/mo → featured slots; 20k+ → sponsorships ([socialanimal.dev](https://socialanimal.dev/blog/how-to-monetize-directory-website-revenue-models/), directory-launch.com). A well-run niche directory with ~100 paying subscribers at $79/mo ≈ **$7,900 MRR**.
- Directory traffic is high-intent: CPMs run 2–4× general web in service categories; data licensing of clean structured business data is a high-margin sleeper model ([jasminedirectory.com](https://www.jasminedirectory.com/blog/how-business-directories-generate-revenue-models-explained/)).

**Recommended Movely revenue roadmap (synthesis):**

| Stage | Trigger | Revenue stream | Realistic monthly revenue |
|---|---|---|---|
| 0. Now → launch | — | Nothing. Free everything; build supply + traffic | $0 (by design) |
| 1. Traction | ~100 drivers, ~2–5k visits/mo | Featured placement slots (3/city, $50–150/mo each, time-boxed) | $500–1,500 |
| 2. Recurring | ~150+ drivers, proven lead flow | Driver Pro subscription $29–49/mo (analytics, badge, priority) | $2–5k |
| 3. Performance | Quote-form leads flowing (F2) | Exclusive pay-per-lead $5–15 (taxi) / $25–75 (airport, NEMT) | scales with traffic |
| 4. B2B | NEMT/corporate verticals live | Facility accounts, corporate monthly retainers $200–500/account | highest LTV |

### 8.4 Customer acquisition: local SEO is the whole game

- **42% of all searchers click Google Map Pack results; 46% of Google searches have local intent** ([imrans.uk GBP guide](https://www.imrans.uk/google-my-business-seo-for-uk-taxi-companies/)).
- The winning playbook for taxi-adjacent local SEO ([yowinternet.com](https://yowinternet.com/how-to-do-local-seo-for-multi-location-uk-taxi-companies/), [taxi-point.co.uk](https://www.taxi-point.co.uk/post/inside-taxisolutions-approach-how-local-operators-are-competing-and-growing-using-seo-social-medi)):
  1. **Dedicated landing pages per location AND per hub** — "Taxi in Towson", "BWI Airport Taxi", "Johns Hopkins Hospital taxi" — never one generic page. High-value transit hubs (airports, train stations, hospitals) deserve their own pages.
  2. **JSON-LD structured data** (`TaxiService`, `LocalBusiness`, `FAQPage`) on every page.
  3. **Google Business Profile** fully optimized; reviews are the public referral engine — automate review requests, respond to all.
  4. **Programmatic SEO**: template "Best taxi in [city]" / "[hub] to [destination] taxi" pages from structured data — this is Movely's unfair advantage because the driver database IS the structured data ([seogap.com](https://seogap.com/programmatic-seo-for-local-business-directories/)).
  5. Mobile speed is conversion: 76% of "near me" searchers act within 24 hours.
- **Movely already has the foundations**: SEO metadata on all public pages (Phase 9), clean URLs, city constants. M7 (sitemap, JSON-LD, city pages) is the highest-ROI next step.

### 8.5 Positioning: how a directory beats the apps locally

- Apps' structural weakness: surge pricing, no human, driver churn. The most loyal future taxi customer is an **app-fatigued user** looking for a reliable local number ([transportbpo.com](https://transportbpo.com/us/blog/taxi-companies-compete-ride-hailing-answer-speed/)).
- Segments that prefer direct contact: older passengers, parents booking for teens, early-morning airport travelers who can't risk a surge cancellation, recurring commuters, medical appointments.
- **Movely's promise maps perfectly**: a real local driver, a real phone number, WhatsApp in 2 clicks, no surge, no middleman fee.
- Reviews reduce price sensitivity — people pay more for confidence. (Reinforces F1 as top post-MVP priority.)

### 8.6 Honest risk assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Cold-start (empty directory) | High | M8 manual supply seeding; white-glove onboarding; don't launch marketing before ~30 drivers |
| Disintermediation (customer saves driver's number) | Medium | That's fine at directory stage — the platform sells *new* customer flow, not repeat rides. Subscriptions/featured placement (not per-ride fees) are disintermediation-proof |
| SEO takes months to compound | Medium | Start M7 immediately; complement with GBP, local Facebook groups, airport/hotel partnerships |
| Solo-founder bandwidth | High | Keep guardrails: no speculative features; M1–M10 only, then Horizon 1 |
| Regulatory (taxi licensing varies by county) | Low-Med | Movely is a directory, not a transportation provider; still, verify driver licensing claims before any "verified" badge ships (no fake trust — guardrail) |

---

## 9. Operating Rules for AI Agents (Guardrails)

These are condensed from `.windsurf` project rules — **binding for any AI working on this repo**:

1. **Follow the MVP scope strictly.** No unsolicited features, no "just in case" code, no speculative tables/endpoints.
2. **Architecture is fixed**: Next.js monolith (App Router), TypeScript strict, Prisma, Supabase. No microservices, no extra layers.
3. **Module pattern is mandatory**: `modules/<domain>/{actions,services,repositories,validations,types}`.
4. **Never delete existing code without justification; never restructure the project wholesale.**
5. **Every change updates `/docs`**: `CHANGELOG.md` + affected module docs (what/why/how).
6. **Mobile-first, shadcn-style UI, CTA in ≤2 clicks.** Current brand: navy `#0B1F3D`, amber `#FFC107` accents, gray-50 backgrounds.
7. **Validate all inputs (Zod), try/catch critical ops, no exposed keys, no raw IPs.**
8. **ZERO fake data**: no fake reviews, badges, metrics, testimonials, or misleading UI. Ever.
9. Refactors only if they improve clarity AND break nothing.
10. Read `docs/DESIGN_SYSTEM.md` and `docs/ARCHITECTURE.md` before touching UI or adding modules.

---

## 10. Quickstart & Key Commands

```bash
# Setup
npm install
cp .env.example .env.local     # fill in Supabase + DATABASE_URL (get values from owner)
npm run db:generate            # prisma generate
npm run db:push                # ⚠️ REQUIRED: pushes pending inquiries table + featured_order column
npm run dev                    # http://localhost:3000

# Quality gates (all currently pass)
npx tsc --noEmit
npm run lint
npm run build

# Database
npm run db:studio              # Prisma Studio GUI
npm run db:seed                # seed script (prisma/seed.ts)
```

**Make a user admin:** `UPDATE users SET role = 'ADMIN' WHERE email = '...';`
**Approve a test driver:** `UPDATE drivers SET status = 'APPROVED' WHERE user_id = '...';`

### Key documents map

| Doc | Content |
|---|---|
| `docs/ARCHITECTURE.md` | Full system architecture, auth flows, layout shells |
| `docs/DATABASE_SCHEMA.md` | Schema reference |
| `docs/DESIGN_SYSTEM.md` | Tokens, components, current UI patterns (Phase 10.5 patterns at the end) |
| `docs/CHANGELOG.md` | Complete phase-by-phase history (source of truth for what shipped) |
| `docs/PHASE_REPORTS/` | Deep report per phase |
| `docs/TESTING_NOTES.md` | Manual QA checklists + Supabase auth config for dev/prod |
| `docs/USER_FLOWS.md` | User journeys |
| `docs/ADMIN_OPERATIONS.md` | Admin procedures |
| `docs/INTEGRATIONS.md` | Third-party service setup |

### First actions for the next AI/developer (in order)

1. **Commit and push the working tree** (M1 — data-loss risk).
2. Run `npx prisma db push` against Supabase (M2).
3. Read `docs/CHANGELOG.md` top entry + this document.
4. Proceed with M3 (deployment) unless the owner redirects priorities.

---

*End of handoff document. Questions the owner can answer: Supabase project credentials, domain/DNS access for movelygo.com, driver recruitment contacts in Baltimore, legal review timeline.*
