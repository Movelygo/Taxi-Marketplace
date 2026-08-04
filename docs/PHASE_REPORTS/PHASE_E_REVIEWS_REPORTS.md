# Phase E — Reviews & Reports (Trust Layer)

**Date:** 2026-08-03
**Status:** Complete

---

## 1. Goal

Build the trust layer for Movely: a customer review system with anti-fraud, driver appeals, and admin moderation; a profile report system for safety concerns; and rating integration into the directory.

---

## 2. What was built

### E1 — Reviews with verification badge

**Data model:**
- `Review` model: `rating (1-5)`, `text`, `reviewerName`, `reviewerEmail`, `ipHash`, `isVerifiedContact`, `status (PENDING/APPROVED/REJECTED)`, `driverResponse`, `isFlaggedByDriver`, `flagReason`, `flagStatus`
- Anti-fraud: 1 review per driver per IP per 24h
- Verified-contact badge: if reviewer's IP has a lead-click for this driver, `isVerifiedContact = true`

**Public profile:**
- Reviews section with rating summary (average + histogram distribution)
- Threshold: numeric rating only shown when 3+ reviews (per research guidelines)
- 1-2 reviews: "New" badge
- 0 reviews: "Not yet rated" prompt
- Review form: star rating selector, text, name, email
- Each review card shows: reviewer name, verified badge, date, stars, text, and driver response (if any)

**Driver dashboard:**
- `/dashboard/reviews` page with rating summary, distribution histogram
- List of approved reviews with respond and flag actions
- Pending/rejected count indicators
- Driver can respond publicly (1 response per review)
- Driver can flag a review as unfair (appeal to admin)

### E2 — Profile reports

**Data model:**
- `Report` model: `reason (enum)`, `details`, `reporterEmail?`, `ipHash`, `status (NEW/REVIEWED/DISMISSED/ACTION_TAKEN)`, `adminNotes`
- Rate limit: max 3 reports per driver per IP per 24h

**Public profile:**
- "Report this profile" button in the Trust & Safety sidebar section
- Modal form with reason selector (5 options), details textarea, optional email
- Success state with confirmation

### E3 — Admin moderation queues

**Reviews queue (`/admin/reviews`):**
- Table with reviewer, driver, rating, status, date
- Filter tabs: All / Pending / Approved / Rejected / Flagged appeals
- Detail page with full review text, driver info, flag reason (if appealed)
- Approve/Reject buttons
- Flag resolution: Dismiss (keep review) or Remove (reject review)

**Reports queue (`/admin/reports`):**
- Table with reason, driver, status, date
- Filter tabs: All / New / Reviewed / Dismissed / Action taken
- Detail page with report details, driver link, priority indicator
- Status actions: Mark reviewed / Dismiss / Action taken + admin notes

**Admin sidebar:**
- Added "Reviews" and "Reports" nav items

### Email notifications

All emails use the branded template system from Phase A:

| Event | Recipient | Template |
|---|---|---|
| Review submitted | Admin | `review-pending-admin` |
| Review approved | Driver | `review-approved` |
| Report submitted | Admin | `report-admin` |

### Rating in directory

- `DriverSearchResultItem` now includes `rating` and `reviewCount`
- Rating shown in driver cards: stars + score + count (only when 3+ reviews)
- "New" badge when 1-2 reviews
- Sort option: "Top rated" added to directory filters
- Repository query includes approved review ratings, computes average, applies threshold

---

## 3. Design decisions (from research)

Based on marketplace review system research (Airbnb, Uber/Lyft, Yelp, Google, Amazon):

| Decision | Choice | Rationale |
|---|---|---|
| Verification | "Contacted this driver" badge (lead-click correlation) | No transactions to verify; lead-click is closest signal |
| Moderation | Post-moderation (PENDING → APPROVED) | Doesn't block legitimate reviews; admin reviews after |
| Rating threshold | 3 reviews minimum for numeric display | Protects new drivers from misleading single-review scores |
| Display | Always show count with rating | `4.7 (23)` is more trustworthy than `4.7` alone |
| Distribution | Histogram on profile | Shows full picture, not just average |
| Driver response | 1 public response per review | Gives driver voice without removing review |
| Driver appeal | Flag → admin queue | Driver can report unfair reviews; admin decides |
| No removal for negativity | Only policy violations removed | Per Yelp/Google principle: "We don't take sides in factual disputes" |

---

## 4. Moderation guidelines

Full reference document at `docs/REVIEW_MODERATION_GUIDELINES.md` covering:
- Grounds for review removal (8 categories)
- Grounds for approval
- Driver appeal handling
- Report handling workflow with priority levels
- Automatic suspension thresholds (future: warning at <3.0 avg with 5+ reviews)
- Email notification matrix
- Rating display rules

---

## 5. Changed files

### New files
- `docs/REVIEW_MODERATION_GUIDELINES.md` — admin reference guide
- `lib/utils/ip-hash.ts` — shared IP hashing helper
- `lib/email/templates/review-report-emails.ts` — 3 new email templates
- `modules/reviews/` — complete module (validations, repository, service, 3 actions)
- `modules/reports/` — complete module (validations, repository, service, 2 actions)
- `components/public/review-form.tsx` — star rating + form
- `components/public/reviews-section.tsx` — rating summary + review list
- `components/public/report-form.tsx` — report submission form
- `components/public/report-button.tsx` — modal trigger
- `components/admin/review-actions.tsx` — approve/reject/resolve buttons
- `components/admin/report-actions.tsx` — status update form
- `components/dashboard/driver-reviews-list.tsx` — respond + flag UI
- `app/(admin)/admin/reviews/page.tsx` — reviews queue
- `app/(admin)/admin/reviews/[id]/page.tsx` — review detail
- `app/(admin)/admin/reports/page.tsx` — reports queue
- `app/(admin)/admin/reports/[id]/page.tsx` — report detail
- `app/(dashboard)/dashboard/reviews/page.tsx` — driver reviews page

### Modified files
- `prisma/schema.prisma` — added Review, Report models + 4 enums
- `components/ui/icons.tsx` — added Flag icon
- `components/admin/admin-sidebar.tsx` — added Reviews + Reports nav
- `components/dashboard/dashboard-header.tsx` — added Reviews nav
- `components/public/driver-card.tsx` — rating display in card header
- `components/public/directory-filters.tsx` — rating sort option
- `components/public/directory-client.tsx` — rating sort dropdown
- `modules/drivers/types/search.ts` — rating + reviewCount fields, rating sort
- `modules/drivers/repositories/driver.repository.ts` — review aggregation in search
- `modules/drivers/validations/driver-search.schema.ts` — rating sort validation
- `app/(public)/drivers/[slug]/page.tsx` — reviews section + report button
- `app/dev/emails/page.tsx` — 3 new email previews

---

## 6. Verification

- `npx tsc --noEmit` — clean
- `npx prisma db push` — schema synced
- Email previews available at `/dev/emails`
