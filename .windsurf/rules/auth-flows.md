---
trigger: always_on
---

# Authentication Flow Completeness

When building any authentication-related functionality, always implement the **full flow together** — never partial auth features.

## Required flows

### Login
- Forgot password link on the login form
- `/forgot-password` page to request a reset
- Reset email action that sends a Supabase magic/recovery link
- `/reset-password` page to set the new password
- Password updated confirmation state/page

### Register
- Email confirmation handling
- `/check-email` page after signup
- `/auth/callback` handling for `signup` confirmation

### Auth callback (`/auth/callback`)
Must handle **all** callback types:
- `recovery` (password reset)
- `signup` (email confirmation)
- `magiclink` (magic link sign-in)
- `next` query parameter for post-auth redirects

## Before starting new auth features

If implementing a new auth feature (e.g. social login, 2FA, invite links, enterprise SSO), flag the full required flow to the user **before** starting, so nothing is left half-built.

## Supabase URL configuration

Always remind the user to add redirect URLs in the Supabase dashboard under **Authentication → URL Configuration → Redirect URLs** for:
- Localhost (development)
- Production domain
