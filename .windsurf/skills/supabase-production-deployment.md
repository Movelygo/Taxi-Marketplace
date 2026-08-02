---
description: Configure Supabase production redirect URLs and environment variables for Movely
---

# Supabase Production Deployment Checklist

Run this checklist when deploying the Movely app to production.

## 1. Supabase redirect URLs

In the Supabase dashboard:

1. Go to **Authentication → URL Configuration → Redirect URLs**
2. Add:
   - `https://www.movelygo.com/auth/callback`
3. Ensure localhost redirect URLs are present for development (if not already configured):
   - `http://localhost:3000/auth/callback`

## 2. Production environment variables

Update the production environment variables:

```
NEXT_PUBLIC_APP_URL=https://www.movelygo.com
```

## 3. Verification

- [ ] Password reset emails redirect to `/reset-password` correctly
- [ ] Magic links sign users in and redirect via the `next` param
- [ ] Signup confirmation links return users to `/auth/callback` and then to the intended page
- [ ] Local development still works with localhost redirect URLs

## Notes

- This is required for password reset emails and magic links to work correctly in production.
- Do not remove localhost URLs when adding production URLs; both are needed.
