# TaxiLink Testing Notes

**Last Updated:** 2026-04-06  

---

## Supabase Auth Configuration for Testing

### Email Confirmation Settings

**Important:** Supabase provides different auth flows depending on your settings.

#### Development/Testing Mode

For local development and testing without real email verification:

1. **Supabase Dashboard → Authentication → Providers → Email**
   - ✅ Enable Email provider
   - ❌ **Disable "Confirm email"** - allows signup without email verification
   
2. **Supabase Dashboard → Authentication → Settings**
   - "Allow new users to sign up" can be ON or OFF depending on testing needs

#### Production Mode

For production with real email verification:

1. **Supabase Dashboard → Authentication → Providers → Email**
   - ✅ Enable Email provider
   - ✅ **Enable "Confirm email"** - requires email verification
   - Configure custom SMTP provider (Supabase built-in email has low rate limits)

2. **Supabase Dashboard → Authentication → Settings**
   - ✅ "Allow new users to sign up" should be ON
   - Configure email templates if needed

### Auth Callback Flows

The app supports **two Supabase auth callback flows**:

1. **PKCE Flow (code parameter)**
   - Modern, more secure flow
   - Callback: `/auth/callback?code=...`
   - Handled by: `exchangeCodeForSession(code)`

2. **Magic Link Flow (token_hash + type)**
   - Traditional email link flow
   - Callback: `/auth/callback?token_hash=...&type=...`
   - Handled by: `verifyOtp({ type, token_hash })`

Both flows redirect to `/dashboard` on success.

### Rate Limits

**Supabase Built-in Email Provider:**
- Very low rate limits (3-4 emails per hour)
- Only suitable for light testing
- **Do NOT use in production**

**Production Recommendation:**
- Use custom SMTP provider (SendGrid, AWS SES, etc.)
- Configure in Supabase Dashboard → Project Settings → Auth → SMTP Settings

---

## Image Upload Testing

### File Size Limits

- **Client validation:** 5MB max
- **Server config:** 6MB body size limit (configured in `next.config.js`)
- **Validation:** Client-side check prevents oversized files from being submitted

### Accepted File Types

- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

### Testing Scenarios

✅ **Valid upload (< 5MB):**
- Shows preview immediately
- Upload completes successfully
- Success message displayed

❌ **Oversized file (> 5MB):**
- Client blocks submission immediately
- Error message: "File size must be less than 5MB. Your file is X.XMB."
- No server request made

❌ **Invalid file type:**
- Client blocks submission immediately
- Error message: "Only JPEG, PNG, and WebP images are allowed."
- No server request made

---

## Loading State Behavior

### Profile Save and Image Upload Mutual Exclusion

The profile form and image upload controls are **mutually exclusive** to prevent conflicting operations:

**When profile save is in progress:**
- Image upload controls are disabled
- Shows: "Image upload in progress..."
- Upload button shows: "Please wait..."

**When image upload is in progress:**
- Profile save button is disabled
- Shows: "Profile save in progress..."
- Save button shows: "Please wait..."

**Benefits:**
- Prevents user confusion
- Avoids conflicting loading states
- Clear visual feedback on which operation is active
- Both controls re-enable after success or failure

### Loading State Guarantees

All loading states are guaranteed to resolve:

1. **Profile Image Upload:**
   - Uses `try/finally` to ensure `setUploading(false)` always runs
   - Catch block handles unexpected errors
   - Parent component notified of state changes

2. **Profile Form Save:**
   - Uses React's `useFormStatus()` which auto-resets
   - Parent component receives pending state updates via callback

**Result:** No infinite "Uploading..." or "Saving..." states possible.

---

## Known Testing Quirks

### Email Confirmation with "Confirm Email" OFF

When "Confirm email" is disabled in Supabase:
- User can sign in immediately after registration
- Email is still sent (if SMTP configured)
- Clicking email link works but is not required
- Users are automatically verified

### First Registration After Fresh Install

- May require email confirmation even if disabled (Supabase quirk)
- Subsequent registrations work as expected
- Workaround: Manually verify user in Supabase dashboard if needed

---

## Troubleshooting

### "Confirmation failed" error after email click

**Cause:** Auth callback not handling the flow correctly

**Solution:** Already fixed - callback now handles both PKCE and magic link flows

### Image upload stays in "Uploading..."

**Cause:** File exceeded 1MB default Server Action limit

**Solution:** Already fixed - body size limit increased to 6MB in `next.config.js`

### Image upload shows 413 error

**Possible causes:**
1. File > 6MB (exceeds configured limit)
2. Client validation bypassed somehow

**Solution:** Client now validates before submission, should never reach server with oversized file

---

## Testing Checklist

### Auth Flow
- [ ] Register new user
- [ ] Check email (if confirmation enabled)
- [ ] Click confirmation link (should redirect to dashboard)
- [ ] Login with existing user
- [ ] Logout

### Profile Creation
- [ ] Create driver profile
- [ ] Verify slug generation
- [ ] Check profile appears on dashboard
- [ ] Verify status is PENDING

### Profile Editing
- [ ] Update profile fields
- [ ] Save changes
- [ ] Verify changes persist after reload
- [ ] Check success message appears

### Image Upload
- [ ] Upload valid image (< 5MB)
- [ ] Verify preview shows
- [ ] Confirm upload succeeds
- [ ] Check image displays on dashboard
- [ ] Try oversized image (> 5MB) - should block with clear error
- [ ] Try invalid file type - should block with clear error

### Public Directory
- [ ] Visit `/drivers` without login
- [ ] Verify only APPROVED drivers shown
- [ ] Test city filter
- [ ] Click on driver card
- [ ] Verify profile loads
- [ ] Test WhatsApp button
- [ ] Test Call button

### Mutual Exclusion
- [ ] Start profile save → verify image upload disabled
- [ ] Start image upload → verify profile save disabled
- [ ] Complete operation → verify both controls re-enabled
- [ ] Test error scenario → verify controls re-enable

---

## Database Setup for Testing

### Create Test Driver (APPROVED)

```sql
-- After creating user via registration
UPDATE drivers 
SET status = 'APPROVED', is_featured = true
WHERE user_id = '<your-user-id>';
```

### Reset Driver Status

```sql
UPDATE drivers 
SET status = 'PENDING'
WHERE user_id = '<your-user-id>';
```

---
