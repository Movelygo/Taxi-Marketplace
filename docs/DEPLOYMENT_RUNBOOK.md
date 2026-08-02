# Movely — Production Deployment Runbook

Step-by-step guide for deploying Movely to **Vercel** (hosting) + **Supabase** (DB / Auth / Storage).

**Goal of this phase:** get `movelygo.com` live with a public **Coming Soon** page, while the real app is developed and tested on a **staging** environment. At launch we flip one env var and the full app appears on the public domain.

---

## 0. Environment strategy

| Environment | Vercel env | Branch | Domain | `NEXT_PUBLIC_SITE_STATUS` | What shows |
|---|---|---|---|---|---|
| **Production** | Production | `main` | `movelygo.com` / `www.movelygo.com` | `coming_soon` | Coming Soon page |
| **Staging** | Preview | `develop` | `staging.movelygo.com` ( + auto preview URLs) | _(unset)_ | Full real app |
| **Local** | (`.env.local`) | — | `localhost:3000` | _(unset)_ | Full real app |

The same code deploys to both Vercel environments. The gate in `middleware.ts` reads `NEXT_PUBLIC_SITE_STATUS`, so the **only** difference between the public Coming Soon site and the staging app is that one env var (set only in the Vercel Production environment).

> **Shared database caveat:** there is a single Supabase Postgres project, so staging and production share one database. While the public site is in Coming Soon this is fine (no real users yet). **Before launch**, clean up any test data (test drivers, test leads, test inquiries) so it doesn't appear in the public directory the moment we go live.

---

## 1. Prerequisites

- [ ] Vercel account with access to the Movely team/personal account.
- [ ] Supabase project (already exists) — keep the dashboard credentials handy.
- [ ] Domain `movelygo.com` registered, with access to DNS management (registrar or DNS provider).
- [ ] Vercel CLI installed: `npm i -g vercel` (or use `npx vercel`).
- [ ] Local `.env.local` has the real Supabase keys (these are the values you'll copy into Vercel).

---

## 2. Database sync (do this first)

The live Supabase DB is missing three additive schema pieces. Push them now:

```bash
npx prisma db push
```

This creates:
- `inquiries` table (Phase 10.5 — contact form persistence)
- `drivers.featured_order` column (Phase 10 — featured ordering)
- `waitlist_entries` table (Phase 11 — Coming Soon email capture)

Verify:
```bash
npx prisma studio
```
Open the `waitlist_entries`, `inquiries`, and `drivers` tables to confirm they exist. Close studio when done.

> `prisma db push` is the project's normal workflow — there is **no migrations directory** and `prisma migrate dev` times out against Supabase. The push is additive and does not delete existing data.

---

## 3. Vercel — link the project

```bash
npx vercel login        # complete auth in the browser (one time)
npx vercel link         # link this folder to a Vercel project (create new if prompted)
```

When linking, choose:
- **Scope:** your Movely Vercel team/account.
- **Project name:** `movely` (or `taxi-marketplace`).

---

## 4. Vercel — environment variables

Set env vars **per environment**. The critical difference is `NEXT_PUBLIC_SITE_STATUS` and `NEXT_PUBLIC_APP_URL`.

### 4.1 Production environment (applies to `main` branch deploys → `movelygo.com`)

```bash
# Required
vercel env add DATABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add NEXT_PUBLIC_APP_URL production              # value: https://www.movelygo.com
vercel env add NEXT_PUBLIC_SITE_STATUS production          # value: coming_soon

# Optional (observability — no-op if unset, but recommended for prod)
vercel env add NEXT_PUBLIC_SENTRY_DSN production
vercel env add SENTRY_DSN production
vercel env add NEXT_PUBLIC_POSTHOG_KEY production
vercel env add NEXT_PUBLIC_POSTHOG_HOST production         # value: https://app.posthog.com
```

> `SUPABASE_SERVICE_ROLE_KEY` is listed in `.env.example` but is **not currently used** by app code. You can skip it for now (set it only if a future admin/server-side operation needs it).

### 4.2 Preview environment (applies to `develop` + all non-`main` branch deploys → staging)

```bash
vercel env add DATABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
vercel env add NEXT_PUBLIC_APP_URL preview                 # value: https://staging.movelygo.com
# Do NOT add NEXT_PUBLIC_SITE_STATUS to preview — leave it unset so the full app shows.

vercel env add NEXT_PUBLIC_SENTRY_DSN preview
vercel env add SENTRY_DSN preview
vercel env add NEXT_PUBLIC_POSTHOG_KEY preview
vercel env add NEXT_PUBLIC_POSTHOG_HOST preview
```

> Each `vercel env add` prompts for the value and which environments (Production / Preview / Development) it applies to. Repeat the var for each environment it should exist in. The Supabase URL/keys/DB URL are the **same values** in both environments (single Supabase project); only `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_SITE_STATUS` differ.

After adding all env vars, pull them locally to confirm:
```bash
vercel env ls
```

---

## 5. Vercel — first production deploy

```bash
git checkout main
npx vercel --prod
```

This builds `main` with the Production environment and deploys to the production URL. Because `NEXT_PUBLIC_SITE_STATUS=coming_soon` is set in Production, the deployed site shows the Coming Soon page at `/`.

Open the production URL Vercel prints — you should see the Coming Soon page with the email capture form. Submit a test email and confirm it appears in `waitlist_entries` (check via `npx prisma studio`).

---

## 6. Vercel — connect the domains

In the Vercel dashboard (Project → Settings → Domains), or via CLI:

```bash
# Production domain → main branch (Coming Soon)
vercel domains add movelygo.com
vercel domains add www.movelygo.com
```

Then in **Settings → Domains**:
- Assign `movelygo.com` and `www.movelygo.com` to the **Production** branch (`main`).
- Add `staging.movelygo.com` and assign it to the **`develop`** branch (Preview).

DNS: Vercel will show you the DNS records to add at your registrar/DNS provider:
- `movelygo.com` → A record pointing to `76.76.21.21` (or add Vercel nameservers).
- `www.movelygo.com` → CNAME to `cname.vercel-dns.com`.
- `staging.movelygo.com` → CNAME to `cname.vercel-dns.com`.

Wait for DNS to propagate (usually minutes to a few hours). Vercel provisions SSL automatically once DNS resolves.

---

## 7. Vercel — first staging deploy

```bash
git checkout develop
npx vercel              # preview deploy (no --prod) → builds with Preview env
```

This builds `develop` with the Preview environment (no `NEXT_PUBLIC_SITE_STATUS`), so the full real app is served. Once `staging.movelygo.com` DNS resolves and is assigned to `develop`, that domain shows the full app.

---

## 8. Supabase — production configuration (dashboard)

### 8.1 Auth redirect URLs
**Authentication → URL Configuration:**
- **Site URL:** `https://staging.movelygo.com` (while in Coming Soon, auth flows are tested on staging).
- **Redirect URLs** (add all of these):
  - `http://localhost:3000/auth/callback`
  - `https://staging.movelygo.com/auth/callback`
  - `https://<your-vercel-preview-url>.vercel.app/auth/callback`
  - _(at launch, add)_ `https://www.movelygo.com/auth/callback`

> During Coming Soon, do **not** set the public domain as Site URL — the Coming Soon gate would intercept the callback. Auth is exercised on staging until launch.

### 8.2 Email confirmation
**Authentication → Sign In / Up → Email:**
- Enable **"Confirm email"** (double opt-in on signup). Required for production.

### 8.3 Custom SMTP (REQUIRED for production)
**Authentication → Email Templates → SMTP Settings:**
The built-in Supabase email service is rate-limited to ~3–4 emails/hour — **not viable for production**. Configure custom SMTP (Resend or AWS SES):
- **Resend SMTP** (recommended): host `smtp.resend.com`, port `465`, user `resend`, password = your Resend API key, sender `Movely <hello@movelygo.com>`.
- Verify the sender domain `movelygo.com` in Resend first (add the DNS records Resend gives you).
- Send a test email from the Supabase SMTP settings to confirm it works.

### 8.4 User-sync trigger verification
User sync from `auth.users` → Prisma `User` is handled by a **database trigger** (not a webhook — the `/api/webhooks/supabase` route is a placeholder). Verify the trigger exists:

**SQL Editor → run:**
```sql
SELECT tgname FROM pg_trigger WHERE tgname = 'handle_new_user';
```
If it returns a row, the trigger is in place and new signups auto-create a `users` row with the same UUID. If not, the trigger SQL needs to be (re)applied — check with whoever set up the Supabase project.

> No webhook URL configuration is needed in Supabase.

---

## 9. Smoke test on staging

Run this full pass on `https://staging.movelygo.com` before considering the environment ready:

1. **Register** a test driver → confirm email arrives (verifies SMTP) → click the confirm link → lands on `/auth/callback` → redirected to dashboard.
2. **Create profile** (name, phone, WhatsApp, city, vehicle, bio, photo) → save → status PENDING.
3. **Admin:** log in as ADMIN → review pending driver → approve.
4. **Public:** visit `/drivers` → approved driver appears → open profile → tap WhatsApp + Call → leads tracked.
5. **Contact form** (`/contact`) → submit → appears in `inquiries` table.
6. **Auth recovery:** forgot-password → email arrives → reset link works → password updated.
7. **Observability:** trigger a test Sentry error; confirm it appears in Sentry. Browse pages; confirm PostHog receives events.

> After testing, **delete test data** (test drivers, leads, inquiries) from the shared DB before launch so it doesn't appear publicly.

---

## 10. Launch (flip the switch)

When the app is fully built and verified on staging:

1. **Vercel:** set `NEXT_PUBLIC_SITE_STATUS` in the **Production** environment to empty/live (or remove it), and set `NEXT_PUBLIC_APP_URL` to `https://www.movelygo.com`.
   ```bash
   vercel env rm NEXT_PUBLIC_SITE_STATUS production
   # (or edit it to an empty value)
   ```
2. **Redeploy production:**
   ```bash
   git checkout main
   # merge develop into main first: git merge develop
   npx vercel --prod
   ```
3. **Supabase:** update auth redirect URLs — set **Site URL** to `https://www.movelygo.com` and ensure `https://www.movelygo.com/auth/callback` is in the Redirect URLs list (keep the staging + localhost ones too).
4. **Verify** on `movelygo.com`: full app loads, register/login work, email links point to the production domain.

`movelygo.com` now shows the real app. Done. 🚀

---

## Quick reference — env var summary

| Variable | Required | Production value | Preview value |
|---|---|---|---|
| `DATABASE_URL` | yes | Supabase pooler/connection string | (same) |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | `https://<project>.supabase.co` | (same) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | anon key | (same) |
| `NEXT_PUBLIC_APP_URL` | yes | `https://www.movelygo.com` | `https://staging.movelygo.com` |
| `NEXT_PUBLIC_SITE_STATUS` | yes (prod) | `coming_soon` | _(do not set)_ |
| `NEXT_PUBLIC_SENTRY_DSN` | optional | Sentry DSN | Sentry DSN |
| `SENTRY_DSN` | optional | Sentry DSN | Sentry DSN |
| `NEXT_PUBLIC_POSTHOG_KEY` | optional | PostHog key | PostHog key |
| `NEXT_PUBLIC_POSTHOG_HOST` | optional | `https://app.posthog.com` | `https://app.posthog.com` |
| `SUPABASE_SERVICE_ROLE_KEY` | no (unused) | — | — |
