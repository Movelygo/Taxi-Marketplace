---
description: Configure Supabase production redirect URLs, email confirmation, and SMTP for Movely
---

# Supabase Production Configuration Checklist

Run this checklist to configure Supabase Auth for the Movely staging/production environments.

**Verified 2026-08-02:** The user-sync trigger (`on_auth_user_created` → `handle_new_user`) is present and correct. It copies `auth.users.id` (UUID), `email`, sets role `DRIVER`, and is idempotent (`ON CONFLICT DO NOTHING`). **No action needed on the trigger.**

## 1. Auth redirect URLs

In the Supabase dashboard → **Authentication → URL Configuration**:

### Site URL
Set to the primary auth domain. While in Coming Soon on the public domain, use staging:
- **Now (Coming Soon phase):** `https://staging.movelygo.com`
- **At launch:** change to `https://www.movelygo.com`

### Redirect URLs (add ALL of these)
- `http://localhost:3000/auth/callback` _(local development)_
- `https://staging.movelygo.com/auth/callback` _(staging — current)_
- `https://www.movelygo.com/auth/callback` _(add at launch)_

> Do NOT remove localhost or staging URLs when adding the production one — all three are needed (dev + staging + prod).

## 2. Email confirmation

In **Authentication → Sign In / Up → Email**:

- [ ] Enable **"Confirm email"** (double opt-in on signup). This is required for production — without it, anyone can register with any email without verifying ownership.

## 3. Custom SMTP (REQUIRED for production)

In **Authentication → Email Templates → SMTP Settings**:

The built-in Supabase email service is rate-limited to **~3–4 emails/hour** — not viable for production (signup confirmations + password resets will silently fail under any load).

### Option A — Resend (recommended)
1. Create a Resend account at resend.com.
2. Verify the sender domain `movelygo.com` in Resend (add the DNS records Resend gives you — since your DNS is on Vercel now, add them in the Vercel dashboard → Domains → movelygo.com → DNS records).
3. In Supabase SMTP Settings, configure:
   - **Host:** `smtp.resend.com`
   - **Port:** `465`
   - **Username:** `resend`
   - **Password:** _(your Resend API key)_
   - **Sender email:** `hello@movelygo.com`
   - **Sender name:** `Movely`
   - **Minimum interval:** `0` (or `30s` to be safe)
4. Click **Save** and **Send test email** to confirm it works.

### Option B — AWS SES
Similar SMTP flow; use your SES SMTP credentials and a verified domain.

### Email templates to review (Authentication → Email Templates)
- **Confirm signup** — confirm the action URL and branding look right.
- **Reset password** — confirm the action URL points to the redirect flow (the app handles `/auth/callback?next=/reset-password`).
- **Magic link** — confirm (if used).

## 4. User-sync trigger (ALREADY VERIFIED — no action)

The trigger `on_auth_user_created` → function `handle_new_user` is installed and working. It runs `INSERT INTO public.users (id, email, role, created_at, updated_at) VALUES (NEW.id, NEW.email, 'DRIVER', NOW(), NOW()) ON CONFLICT (id) DO NOTHING`.

No webhook is needed — the `/api/webhooks/supabase` route in the app is a placeholder and is not used.

## 5. Pre-launch cleanup (do this BEFORE flipping the Coming Soon gate)

The shared Supabase database currently has **6 test users** (and associated test drivers/leads/inquiries) from development. Before going public:

- [ ] Delete test users from Supabase (Authentication → Users) — deleting from `auth.users` cascades to `public.users` via the trigger's `ON DELETE CASCADE`? **No** — the trigger only handles INSERT. You must delete from **both** `auth.users` (Supabase dashboard) AND `public.users` (Prisma Studio / SQL).
- [ ] Clean test data in `drivers`, `leads`, `profile_views`, `inquiries`, `waitlist_entries`.
- [ ] Confirm the directory is empty (no test drivers showing as APPROVED) right before launch.

SQL to clean test data (run in Supabase SQL Editor — **destroys all data, use only before launch**):
```sql
-- Delete all app data (test data cleanup before launch)
DELETE FROM waitlist_entries;
DELETE FROM inquiries;
DELETE FROM leads;
DELETE FROM profile_views;
DELETE FROM drivers;
DELETE FROM users;
-- auth.users must be deleted via Supabase dashboard (Auth → Users)
```

## 6. Verification checklist (after config)

On `https://staging.movelygo.com`:
- [ ] Register a new driver → confirmation email arrives → click link → lands on `/auth/callback` → redirected to `/dashboard`
- [ ] Forgot password → email arrives → click link → lands on `/reset-password` → set new password → login works
- [ ] New user appears in `public.users` table (trigger worked) with role `DRIVER`
- [ ] Local development still works with localhost redirect URLs
