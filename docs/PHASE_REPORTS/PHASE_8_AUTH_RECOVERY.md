# Phase 8 — Auth Recovery + Account Reliability Audit

**Date:** 2026-05-17  
**Status:** ✅ Complete  
**Scope:** Audit and harden existing auth recovery flow — no new features added  

---

## Objective

Audit and harden the complete authentication recovery system to ensure it works reliably and safely for real users and admins. Scope was limited to:

- Reviewing all auth-related files
- Fixing issues found
- Verifying redirects, UX messages, and security properties
- Writing a manual QA checklist

---

## Files Audited

| File | Status |
|---|---|
| `app/auth/callback/route.ts` | ✅ Correct — handles PKCE, OTP, recovery, `next` param |
| `app/(auth)/login/page.tsx` | ✅ Correct |
| `app/(auth)/register/page.tsx` | ✅ Correct |
| `app/(auth)/check-email/page.tsx` | ⚠️ Fixed — old shadcn UI |
| `app/(auth)/forgot-password/page.tsx` | ✅ Correct |
| `app/(auth)/reset-password/page.tsx` | ⚠️ Fixed — minLength + expired link UX |
| `components/auth/login-form.tsx` | ✅ Correct |
| `components/auth/register-form.tsx` | ✅ Correct |
| `modules/auth/actions/login.ts` | 🔴 Fixed — open redirect vulnerability |
| `modules/auth/actions/register.ts` | ✅ Correct |
| `modules/auth/actions/logout.ts` | ✅ Correct |
| `modules/auth/actions/get-current-user.ts` | ✅ Correct |
| `modules/auth/actions/forgot-password.ts` | ✅ Correct |
| `modules/auth/actions/update-password.ts` | ⚠️ Fixed — min length + error mapping |
| `modules/auth/validations/auth.schema.ts` | ✅ Correct (min 8, email validation) |
| `middleware.ts` | ✅ Correct |
| `lib/supabase/server.ts` | ✅ Correct |
| `lib/supabase/client.ts` | ✅ Correct |

---

## Issues Found & Fixed

### 🔴 Issue 1 — Open Redirect Vulnerability (High)

**File:** `modules/auth/actions/login.ts`

**Problem:**
```ts
const redirectTo = formData.get('redirectTo') as string | null
redirect(redirectTo || '/dashboard')
```
An attacker could craft `/login?redirect=https://evil.com`. After login, the user would be redirected to the external URL. This is a classic open redirect attack.

**Fix:**
```ts
const rawRedirect = formData.get('redirectTo') as string | null
const redirectTo = rawRedirect?.startsWith('/') ? rawRedirect : null
redirect(redirectTo || '/dashboard')
```
Only paths beginning with `/` are accepted. Absolute URLs are discarded.

---

### ⚠️ Issue 2 — Password Minimum Length Inconsistency (Medium)

**Files:** `modules/auth/actions/update-password.ts`, `app/(auth)/reset-password/page.tsx`

**Problem:** `registerSchema` enforces min 8 chars. `update-password.ts` only enforced 6. The reset-password form had `minLength={6}`. This meant a user could set a weaker password via reset than they could during registration.

**Fix:** Changed all references to 8 chars:
- `update-password.ts`: validation and error message
- `reset-password/page.tsx`: both input `minLength` attributes

---

### ⚠️ Issue 3 — Raw Supabase Error on Invalid/Expired Session (Medium)

**File:** `modules/auth/actions/update-password.ts`

**Problem:** If a user visits `/reset-password` without a valid recovery session (link expired, already used, or direct navigation), `supabase.auth.updateUser()` throws `"Auth session missing!"` — a technical internal message shown raw to the user.

**Fix:**
```ts
if (error) {
  const msg = error.message.toLowerCase()
  if (msg.includes('session') || msg.includes('token') || msg.includes('expired') || msg.includes('invalid')) {
    return { error: 'This reset link is invalid or has expired. Please request a new one.' }
  }
  return { error: error.message }
}
```

---

### ⚠️ Issue 4 — check-email Page Used Old shadcn Components (Medium)

**File:** `app/(auth)/check-email/page.tsx`

**Problem:** All other auth pages use the navy/white card design. `check-email` still used `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription`, and `Button` from shadcn — visually inconsistent and relying on old component API.

**Fix:** Rebuilt using the same pattern as login, register, forgot-password, and reset-password pages.

---

### ℹ️ Issue 5 — No Min Length Hint on Reset Form (Low)

**File:** `app/(auth)/reset-password/page.tsx`

**Problem:** User sees no feedback about password requirements until they hit submit.

**Fix:** Added `<p className="text-xs text-gray-500">Minimum 8 characters</p>` below the password input.

---

### ℹ️ Issue 6 — No Expired Link Guidance on Reset Form (Low)

**File:** `app/(auth)/reset-password/page.tsx`

**Problem:** If the link was expired, the user saw a red error box with no path forward.

**Fix:** When the error message contains "expired" or "invalid", a "Request a new reset link" link to `/forgot-password` appears inline in the error box.

---

## Verified — No Issues

| Check | Result |
|---|---|
| Unauthenticated `/dashboard` → `/login?redirect=/dashboard` | ✅ |
| Unauthenticated `/admin` → `/login?redirect=/admin` | ✅ |
| Authenticated user visiting `/login` → `/dashboard` | ✅ |
| Authenticated user visiting `/register` → `/dashboard` | ✅ |
| `/reset-password` accessible for recovery sessions | ✅ (not blocked by middleware) |
| `forgotPassword` always shows generic success (no email enumeration) | ✅ |
| No passwords or tokens logged in any action | ✅ |
| Auth callback handles PKCE, OTP, and `recovery` type | ✅ |
| `redirectTo` in login form passed via hidden input | ✅ |
| Login param name: `?redirect=` (middleware) → prop `redirectTo` → hidden field `redirectTo` | ✅ consistent |

---

## Password Reset Flow (End to End)

```
1. User clicks "Forgot password?" on login page
   → /forgot-password

2. User enters email → forgotPassword() server action
   → supabase.auth.resetPasswordForEmail(email, { redirectTo: NEXT_PUBLIC_APP_URL/auth/callback?next=/reset-password })
   → Shows "Check your email" success state regardless of whether email exists

3. User clicks link in email
   → Supabase sends to: /auth/callback?code=<PKCE_CODE>&next=/reset-password
   → Callback exchanges code for session → redirects to /reset-password

4. User enters new password (min 8 chars) + confirm
   → updatePassword() server action
   → supabase.auth.updateUser({ password })
   → On success: redirect to /login?message=password_updated

5. Login page shows green "Password updated!" banner
   → User signs in with new password
```

---

## Manual QA Checklist

### ✅ Test 1 — Forgot Password Request
1. Go to `/login`
2. Verify "Forgot password?" link appears next to the Password label
3. Click it → should land on `/forgot-password`
4. Enter a valid registered email
5. Click "Send Reset Link"
6. **Expected:** Page changes to "Check your email" success state
7. Check email inbox for reset link

### ✅ Test 2 — Reset Password Success
1. Click the reset link from the email
2. **Expected:** Land on `/reset-password` (not home page, not login page)
3. Enter a new password (8+ chars) and confirm
4. Click "Set New Password"
5. **Expected:** Redirect to `/login?message=password_updated` with green banner
6. Log in with the new password
7. **Expected:** Redirect to `/dashboard`

### ✅ Test 3 — Invalid / Expired Link
1. Copy a previously used or expired reset link (or manually visit `/reset-password` without clicking a reset email)
2. Enter a password and submit
3. **Expected:** Red error box: "This reset link is invalid or has expired. Please request a new one."
4. **Expected:** "Request a new reset link" link appears in the error box pointing to `/forgot-password`

### ✅ Test 4 — Wrong Email on Forgot Password
1. Go to `/forgot-password`
2. Enter a non-existent email address
3. **Expected:** Same "Check your email" success state — does NOT reveal whether the email exists

### ✅ Test 5 — Login After Reset
1. Complete Test 2 above
2. Sign in with the new password
3. **Expected:** Successful login, redirect to `/dashboard`
4. Try the old password
5. **Expected:** "Invalid login credentials" error

### ✅ Test 6 — Protected Route Redirects
1. Log out, then go to `http://localhost:3000/dashboard`
2. **Expected:** Redirect to `/login?redirect=/dashboard`
3. Log in
4. **Expected:** Redirect back to `/dashboard`
5. Go to `http://localhost:3000/admin`
6. **Expected (if not admin):** Redirect to `/login?redirect=/admin` or access denied page

### ✅ Test 7 — Auth Page Guard
1. Log in as any user
2. Navigate to `/login`
3. **Expected:** Immediate redirect to `/dashboard`
4. Navigate to `/register`
5. **Expected:** Immediate redirect to `/dashboard`

### ✅ Test 8 — Admin Recovery Scenario
1. Delete admin user from Supabase dashboard (Authentication → Users)
2. Create new user with same email via Supabase dashboard
3. Log in with new credentials
4. OR: Use forgot-password flow to reset without deleting

### ✅ Test 9 — Check-Email Page Style
1. Register a new account with an email that requires confirmation
2. **Expected:** Redirect to `/check-email` — page should show navy blue gradient header, white card, "Return to Sign In" button

### ✅ Test 10 — Password Strength Enforcement
1. On `/reset-password`, try submitting a 5-character password
2. **Expected:** Browser blocks submission (HTML `minLength={8}`)
3. Try "12345678" (8 chars)
4. **Expected:** Accepted by form, may succeed if session is valid

---

## Remaining Known Risks

| Risk | Notes |
|---|---|
| Supabase free tier auto-pauses | Project pauses after inactivity. Fix: resume from supabase.com. No code change possible. |
| Reset email delay | Supabase sends reset emails via their SMTP relay. Delivery time varies. Not controllable from code. |
| No rate limiting on `/forgot-password` | An attacker could spam reset emails to any address. Mitigated by Supabase's own rate limits. Future: add server-side rate limiting. |
| Recovery session duration | Supabase recovery tokens expire (default ~1 hour). After that, `/reset-password` shows expired error — handled correctly. |
| Production URL not yet in Supabase | Add `https://www.movelygo.com/auth/callback` to Redirect URLs before deploying. |
