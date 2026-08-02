# Phase 10.5 — Layout Consistency + Contact Form Verification

**Date:** 2026-05-19
**Status:** Complete

---

## 1. Goal

Audit the Phase 10 deliverables, repair any gap between documentation and reality, and bring auth + dashboard pages into visual parity with the public site. Preserve all existing functionality.

---

## 2. Audit findings

| Claimed in Phase 10 docs | Actually shipped? | Notes |
|--------------------------|--------------------|-------|
| `Inquiry` Prisma model | ❌ No | Schema had no `Inquiry` model. |
| `modules/contact/*` | ❌ No | Directory did not exist. |
| `submitInquiry` server action | ❌ No | File did not exist. |
| Contact form on `/contact` | ❌ Disabled | Page rendered a non-interactive "coming soon" block. |
| `featuredOrder` field on `Driver` | ✅ Yes | Real, in schema. |
| Featured drivers admin page | ✅ Yes | `app/(admin)/admin/featured/page.tsx`. |
| `FeaturedDriversSection` on homepage | ✅ Yes | Auto-hides when empty. |
| Profile completeness service + card | ✅ Yes | Real and used by dashboard + admin. |
| Onboarding callouts | ✅ Yes | Real and state-aware. |
| Legal pages | ✅ Yes | Privacy + Terms (draft), Driver Guidelines (final). |

Bottom line: Phase 10's contact-form section was aspirational; everything else was real.

---

## 3. Decision on contact form

**Option A — Enable now.** Backend did not exist, but the cost of building it correctly was low and the user explicitly preferred this option. Built end-to-end. The action gracefully degrades if the DB migration hasn't been applied yet (returns a friendly "email us" message rather than crashing).

---

## 4. Changed files

### Contact form (new)
- `prisma/schema.prisma` (+ `Inquiry`, + `InquiryStatus`)
- `modules/contact/validations/inquiry.schema.ts`
- `modules/contact/repositories/inquiry.repository.ts`
- `modules/contact/services/inquiry.service.ts`
- `modules/contact/actions/submit-inquiry.ts`
- `components/public/contact-form.tsx`
- `app/(public)/contact/page.tsx` (replaced disabled block)

### Auth (visual parity)
- `components/auth/auth-card.tsx` (new shared shell)
- `components/auth/login-form.tsx`
- `components/auth/register-form.tsx`
- `app/(auth)/forgot-password/page.tsx`
- `app/(auth)/reset-password/page.tsx`
- `app/(auth)/check-email/page.tsx`

### Dashboard (visual parity + shell)
- `components/dashboard/dashboard-header.tsx` (new)
- `app/(dashboard)/layout.tsx` (promoted from pass-through to real shell with auth check, header, footer)
- `app/(dashboard)/dashboard/page.tsx` (removed duplicate header band + logout button)
- `app/(dashboard)/dashboard/profile/page.tsx` (slimmed header)

### Docs
- `docs/CHANGELOG.md` (Phase 10.5 entry prepended)
- `docs/ARCHITECTURE.md` (route-group layouts updated)
- `docs/DESIGN_SYSTEM.md` (auth + dashboard shell patterns)
- `docs/PHASE_REPORTS/PHASE_10_5_LAYOUT_CONSISTENCY.md` (this file)

---

## 5. Auth layout improvements

- All five auth pages now share `AuthCard` — single visual language, no oversized navy gradient headers.
- Inter-page navigation is consistent:
  - `/login` → "New to Movely? Create an account" + "Forgot password?"
  - `/register` → "Already have an account? Sign in" + Terms / Privacy disclosure
  - `/forgot-password` → "Remember it? Back to sign in" + success state with prominent confirmation
  - `/reset-password` → contextual "Request a new reset link" when token expired/invalid
  - `/check-email` → "Didn't receive it? Try registering again" + "Return to sign in"
- Auth layout (`app/(auth)/layout.tsx`) keeps a sticky top bar (logo + "Browse drivers") and a footer with Privacy / Terms / Contact links. Mobile-friendly, no fixed-footer overlap.
- All form validation and server actions are untouched.

---

## 6. Dashboard / profile layout improvements

- `DashboardHeader` is now the single source of truth for: brand, in-app nav (Overview / Profile / Browse drivers), account dropdown (email + edit profile + sign out + optional admin entry), and mobile drawer.
- Dashboard pages dropped their per-page logout buttons and big white header bands — the shell carries that load.
- Footer in the dashboard shell links to Support, Driver Guidelines, Privacy, Terms.
- Onboarding callouts, profile completeness card, metrics, profile/account cards, and quick actions are byte-identical to Phase 10 — only the surrounding chrome changed.
- Profile page got the same treatment: compact "Back to overview" link + tight heading, then the existing `ProfileClient` untouched.

---

## 7. Mobile review

- Auth pages: AuthCard is full-width on small screens with 6/8 px padding rhythm; no horizontal overflow.
- Dashboard header has a hamburger drawer on `< md` with the same nav + sign-out actions. Logo collapses ("Dashboard" eyebrow hides on small screens).
- Dashboard footer wraps to two lines on small screens.
- Contact form stacks name/email vertically on mobile, message textarea remains comfortable height.
- All forms keep input `font-size: text-sm` (>= 14px) to avoid iOS zoom-on-focus.

---

## 8. Build / lint result

```
npx tsc --noEmit   → clean (no output)
npm run lint       → clean (no warnings)
npm run build      → success (18 routes generated)
```

---

## 9. Remaining known issues

- The `inquiries` table still needs to be pushed to the live Supabase DB. The action gracefully shows a fallback email message until then.
- Inquiry submissions are not yet emailed to the team; we just persist them. Email notifications and an admin review UI are deliberately deferred.
- Privacy and Terms pages still display a "Draft — informational only" banner. Final versions need legal review.

---

## 10. Out of scope (intentionally not touched)

- Featured drivers behavior (still works exactly as in Phase 10).
- Admin functionality (no changes).
- Public marketing pages other than `/contact`.
- Profile completeness scoring rules.
- Auth business logic (login / register / forgot / reset / update password actions).
