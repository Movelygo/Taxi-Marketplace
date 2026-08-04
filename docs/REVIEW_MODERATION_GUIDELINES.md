# Review & Report Moderation Guidelines

**Purpose:** Reference guide for admin moderators reviewing driver reviews and profile reports. Defines what can be removed, what stays, and when to escalate.

---

## 1. Review moderation

### Grounds for removal (REJECTED)

A review MUST be rejected if it meets ANY of these criteria:

| Category | Example | Action |
|---|---|---|
| **Profanity / hate speech** | Slurs, threats, demeaning language about protected classes | Reject immediately |
| **Personal information** | Phone numbers, addresses, license plates, full names of third parties | Reject |
| **Spam / fake** | Automated content, copy-pasted text across multiple drivers, marketing links | Reject |
| **Conflict of interest** | Reviewer is a competitor, former employee, or family member (requires evidence) | Reject |
| **Extortion** | Review offered in exchange for a discount, refund, or favor | Reject + flag reviewer IP |
| **Retaliation** | Review posted as revenge for a dispute (requires evidence from driver appeal) | Reject after review |
| **Irrelevant** | Complaint about things outside the driver's service (weather, traffic, app bugs) | Reject |
| **Never a customer** | Reviewer has no lead-click history and review contains no service-specific details | Reject if clearly fake |

### Grounds for approval (APPROVED)

A review should be approved if:
- It describes a genuine customer experience (positive or negative)
- The language is respectful even if critical
- It contains service-specific details (pickup location, vehicle condition, punctuality, etc.)
- The reviewer has a "Contacted this driver" badge (isVerifiedContact = true) — higher trust weight
- The reviewer has no verified contact but the review is detailed and specific — approve with lower trust weight

### Critical principle

> **We do NOT remove reviews simply because they are negative or because the driver disagrees with them.** Yelp and Google both follow this principle: "We don't take sides in factual disputes." A negative but honest review stays. Only policy violations are removed.

---

## 2. Driver appeals (flagged reviews)

When a driver flags a review as unfair:

1. **Review enters flag queue** with the driver's stated reason
2. **Admin reviews the flag** alongside the original review
3. **Decision options:**
   - `DISMISSED` — the flag is rejected, the review stays (most common for "I disagree")
   - `REMOVED` — the review is removed (only if it violates policy, not because the driver asked)
4. **Notify the driver** of the decision via email

### When to remove a flagged review
- The flag reveals evidence of a policy violation not caught initially
- The reviewer admits to never having used the service
- Coordinated review bombing is detected (multiple reviews from related IPs in a short window)

### When to dismiss a flag
- The driver simply disagrees with the rating
- The driver claims the facts are wrong but provides no evidence
- The review is critical but respectful and specific

---

## 3. Driver responses

Drivers can respond publicly to any approved review (once per review).

### Response guidelines for drivers
- Must be professional and respectful
- Must not include personal information about the reviewer
- Must not accuse the reviewer of lying without evidence
- Should address the specific concerns raised
- Should be constructive — future customers read these

### When to remove a driver response
- Contains profanity or personal attacks
- Doxxes the reviewer
- Is used for marketing/promotional content

---

## 4. Report handling

### Report reasons (enum)

| Reason | Description | Priority |
|---|---|---|
| `NOT_A_REAL_DRIVER` | Profile appears fake, stock photos, or misleading | High |
| `SAFETY_CONCERN` | Unsafe vehicle, dangerous driving, harassment | Critical |
| `MISLEADING_PROFILE` | Vehicle info, capacity, or services don't match reality | Medium |
| `INAPPROPRIATE_CONDUCT` | Unprofessional behavior, discrimination, threats | Critical |
| `OTHER` | Anything else | Low |

### Report workflow

1. Report enters as `NEW`
2. Admin reviews → `REVIEWED`
3. Decision:
   - `DISMISSED` — no action needed (report was unfounded or unverifiable)
   - `ACTION_TAKEN` — admin takes action (warning, suspension, or profile edit)

### Safety concern escalation
- Reports with reason `SAFETY_CONCERN` or `INAPPROPRIATE_CONDUCT` should be reviewed within 24 hours
- If credible, suspend the driver immediately pending investigation
- Document the decision in the report's admin notes

---

## 5. Automatic suspension thresholds

### Rating-based

| Condition | Action |
|---|---|
| 5+ approved reviews AND average < 3.0 | Warning email to driver |
| 5+ approved reviews AND average < 2.5 | Auto-suspend pending admin review |
| 3+ approved reports with `ACTION_TAKEN` | Auto-suspend pending admin review |

### Warning before suspension
- Always send a warning email before suspending (unless safety concern is critical)
- Give the driver 7 days to respond or improve
- Admin can override automatic suspension if reviews were confirmed unfair

### Reinstatement
- Driver can appeal suspension by replying to the notification email
- Admin reviews the appeal, considering: overall review history, response quality, report validity
- If reinstated, driver is placed on a 30-day probation period

---

## 6. Email notifications

| Event | Recipient | Template |
|---|---|---|
| New review approved | Driver | `review-notification` |
| New review pending | Admin | `review-pending-admin` |
| Driver flagged a review | Admin | `review-flagged-admin` |
| Flag decision made | Driver | `review-flag-decision` |
| New report submitted | Admin | `report-admin-notification` |
| Report action taken | Reporter (if email provided) | `report-action-taken` |
| Rating warning triggered | Driver | `rating-warning` |
| Driver suspended (rating) | Driver | `rating-suspension` |

---

## 7. Rating display rules

| Condition | Display |
|---|---|
| 0 reviews | "Not yet rated" (no stars) |
| 1-2 reviews | "New" badge + stars + count |
| 3+ reviews | Full star rating + count + histogram on profile |
| Below 3.0 avg with 5+ reviews | Still displayed (transparency) but admin is alerted |

### Bayesian average (future enhancement)
For MVP we use simple average. The data model supports weighted calculation:
- Formula: `(v / (v + m)) × R + (m / (v + m)) × C`
- v = driver review count, m = 10 (platform threshold), R = driver average, C = platform average
- This prevents new drivers with 1 five-star review from outranking established drivers
