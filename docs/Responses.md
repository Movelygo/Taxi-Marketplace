

# Phase 1: Authentication & User Sync - Implementation Plan

**Status:** ⏸️ Awaiting Your Approval

Before writing any code, here's the complete approach for your review:

---

## 1. SQL Trigger for auth.users → users Sync

### The Trigger (To Run in Supabase SQL Editor)

```sql
-- Function: Create user record when Supabase Auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    'DRIVER',  -- Default role for new registrations
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- Trigger: Fire after user is inserted into auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Optional: Update user email if changed in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_user_email_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.email IS DISTINCT FROM NEW.email THEN
    UPDATE public.users
    SET email = NEW.email, updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_email_update();
```

### What This Does

✅ **Automatic sync**: When user registers via Supabase Auth, trigger creates matching record in `public.users`  
✅ **Same UUID**: `users.id` === `auth.users.id` (guaranteed)  
✅ **Email sync**: If email changes in auth, updates local users table  
✅ **Default role**: All new users start as DRIVER (admins upgraded manually)  
✅ **No manual intervention**: Developers never manually create user records  

### When to Run This

**After** you:
1. Create Supabase project
2. Add credentials to `.env.local`
3. Run `npm run db:push` (creates tables)

**Then** run this SQL in Supabase Dashboard → SQL Editor

---

## 2. Files to Create/Modify

### Files to CREATE (15 new files)

#### Authentication Module (`/modules/auth/`)

```
modules/auth/
├── actions/
│   ├── register.ts          # Server Action: Register new user
│   ├── login.ts             # Server Action: Login user
│   ├── logout.ts            # Server Action: Logout user
│   └── get-current-user.ts  # Server Action: Get current user
├── services/
│   └── auth.service.ts      # Business logic: Auth operations
├── validations/
│   └── auth.schema.ts       # Zod schemas: Register/login validation
└── types.ts                 # Already exists
```

#### Authentication Pages (`/app/(auth)/`)

```
app/(auth)/
├── layout.tsx               # Auth layout (centered, no header)
├── register/
│   └── page.tsx            # Registration page
└── login/
    └── page.tsx            # Login page
```

#### Shared Components (`/components/`)

```
components/
├── auth/
│   ├── register-form.tsx    # Registration form component
│   ├── login-form.tsx       # Login form component
│   └── auth-error.tsx       # Error display component
└── ui/
    ├── button.tsx           # shadcn button (will install)
    ├── input.tsx            # shadcn input (will install)
    ├── label.tsx            # shadcn label (will install)
    └── card.tsx             # shadcn card (will install)
```

#### Error Handling

```
app/
├── error.tsx                # Error boundary
└── loading.tsx              # Loading state
```

### Files to MODIFY (4 existing files)

1. **[middleware.ts](cci:7://file:///Users/juanortega/Documents/Taxi%20Marketplace/middleware.ts:0:0-0:0)**
   - Add route protection logic
   - Redirect unauthenticated users trying to access `/dashboard`
   - Redirect authenticated users away from `/login`, `/register`

2. **[app/layout.tsx](cci:7://file:///Users/juanortega/Documents/Taxi%20Marketplace/app/layout.tsx:0:0-0:0)**
   - Wrap with error boundary provider
   - Add global error handling

3. **`app/(dashboard)/dashboard/page.tsx`**
   - Add auth check
   - Display current user info
   - Add logout button

4. **`app/(public)/page.tsx`**
   - Add "Login" and "Register" links
   - Update placeholder content

### Configuration Changes

1. **Install shadcn/ui components**
   ```bash
   npx shadcn-ui@latest add button input label card
   ```

2. **Add `components.json`** (shadcn config)

---

## 3. Exact Auth Flow Implementation

### Flow A: User Registration

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. Navigate to /register
       ▼
┌─────────────────────────────────┐
│  /app/(auth)/register/page.tsx  │
│  - Renders RegisterForm         │
└──────┬──────────────────────────┘
       │
       │ 2. User fills form:
       │    - Email
       │    - Password
       │    - Confirm Password
       ▼
┌─────────────────────────────────┐
│  RegisterForm component         │
│  - Client-side validation       │
│  - Shows errors inline          │
└──────┬──────────────────────────┘
       │
       │ 3. Submit form
       ▼
┌─────────────────────────────────┐
│  modules/auth/actions/          │
│  register.ts (Server Action)    │
│                                  │
│  1. Validate with Zod           │
│  2. Check email format          │
│  3. Check password strength     │
└──────┬──────────────────────────┘
       │
       │ 4. Call Supabase Auth
       ▼
┌─────────────────────────────────┐
│  Supabase Auth API              │
│  - Creates user in auth.users   │
│  - Sends confirmation email     │
│  - Returns session              │
└──────┬──────────────────────────┘
       │
       │ 5. Database trigger fires
       ▼
┌─────────────────────────────────┐
│  handle_new_user() trigger      │
│  - Creates record in users      │
│  - users.id = auth.users.id     │
│  - role = 'DRIVER'              │
└──────┬──────────────────────────┘
       │
       │ 6. Session cookie set
       ▼
┌─────────────────────────────────┐
│  Redirect to /dashboard         │
│  - User is now authenticated    │
│  - Session persisted in cookie  │
└─────────────────────────────────┘
```

**Key Points:**
- ✅ Email confirmation optional (can disable in Supabase)
- ✅ Password min 8 chars (Supabase default)
- ✅ users table record created automatically via trigger
- ✅ No manual user creation needed

---

### Flow B: User Login

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. Navigate to /login
       ▼
┌─────────────────────────────────┐
│  /app/(auth)/login/page.tsx     │
│  - Renders LoginForm            │
└──────┬──────────────────────────┘
       │
       │ 2. User enters:
       │    - Email
       │    - Password
       ▼
┌─────────────────────────────────┐
│  LoginForm component            │
│  - Client-side validation       │
└──────┬──────────────────────────┘
       │
       │ 3. Submit form
       ▼
┌─────────────────────────────────┐
│  modules/auth/actions/          │
│  login.ts (Server Action)       │
│                                  │
│  1. Validate input              │
│  2. Call Supabase Auth          │
└──────┬──────────────────────────┘
       │
       │ 4. Authenticate
       ▼
┌─────────────────────────────────┐
│  Supabase Auth API              │
│  - Verifies credentials         │
│  - Returns session if valid     │
│  - Returns error if invalid     │
└──────┬──────────────────────────┘
       │
       │ 5. If success
       ▼
┌─────────────────────────────────┐
│  Set session cookie             │
│  Redirect to /dashboard         │
└─────────────────────────────────┘
       │
       │ 6. If failure
       ▼
┌─────────────────────────────────┐
│  Show error message             │
│  "Invalid email or password"    │
└─────────────────────────────────┘
```

**Key Points:**
- ✅ No database query needed (Supabase handles auth)
- ✅ Session stored in HTTP-only cookie
- ✅ Middleware validates session on protected routes

---

### Flow C: User Logout

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. Click "Logout" button
       ▼
┌─────────────────────────────────┐
│  modules/auth/actions/          │
│  logout.ts (Server Action)      │
│                                  │
│  1. Call Supabase signOut()     │
│  2. Clear session cookie        │
└──────┬──────────────────────────┘
       │
       │ 2. Redirect to homepage
       ▼
┌─────────────────────────────────┐
│  Redirect to /                  │
│  - Session cleared              │
│  - User unauthenticated         │
└─────────────────────────────────┘
```

---

### Flow D: Protected Route Access

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. Navigate to /dashboard
       ▼
┌─────────────────────────────────┐
│  middleware.ts                  │
│  - Runs on every request        │
│  - Checks session               │
└──────┬──────────────────────────┘
       │
       │ 2. Call Supabase Auth
       ▼
┌─────────────────────────────────┐
│  supabase.auth.getUser()        │
│  - Validates session cookie     │
│  - Returns user if valid        │
│  - Returns null if invalid      │
└──────┬──────────────────────────┘
       │
       ├─── If authenticated
       │    ▼
       │  ┌───────────────────────┐
       │  │ Continue to page      │
       │  └───────────────────────┘
       │
       └─── If NOT authenticated
            ▼
          ┌───────────────────────┐
          │ Redirect to /login    │
          │ with ?redirect param  │
          └───────────────────────┘
```

**Key Points:**
- ✅ Middleware checks auth before page loads
- ✅ Preserves intended destination in redirect param
- ✅ After login, redirects back to intended page

---

### Flow E: Get Current User (in Server Components)

```typescript
// In any Server Component or Server Action
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'

const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  redirect('/login')
}

// Get full user record from our database
const dbUser = await prisma.user.findUnique({
  where: { id: user.id }  // Same UUID
})

// Now you have:
// - user.email (from Supabase Auth)
// - dbUser.role (from our database)
```

**Why This Works:**
- ✅ `user.id` from Supabase Auth === `dbUser.id` from our database
- ✅ Single source of truth (Supabase) for authentication
- ✅ Our database adds application-specific fields (role, etc.)

---

## 4. Implementation Code Examples

### Example 1: Register Server Action

```typescript
// modules/auth/actions/register.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { registerSchema } from '../validations/auth.schema'

export async function register(formData: FormData) {
  // 1. Extract and validate
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword')
  }
  
  const validated = registerSchema.safeParse(rawData)
  
  if (!validated.success) {
    return { 
      error: validated.error.flatten().fieldErrors 
    }
  }
  
  // 2. Create user in Supabase Auth
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password
  })
  
  if (error) {
    return { error: error.message }
  }
  
  // 3. Trigger automatically created user record
  // No manual database insert needed!
  
  // 4. Redirect to dashboard
  redirect('/dashboard')
}
```

### Example 2: Validation Schema

```typescript
// modules/auth/validations/auth.schema.ts
import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})
```

### Example 3: Protected Middleware

```typescript
// middleware.ts (updated)
export async function middleware(request: NextRequest) {
  // ... existing Supabase client setup ...
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${request.nextUrl.pathname}`, request.url)
      )
    }
  }
  
  // Redirect authenticated users away from auth pages
  if (request.nextUrl.pathname.startsWith('/login') || 
      request.nextUrl.pathname.startsWith('/register')) {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }
  
  return supabaseResponse
}
```

---

## 5. What This Phase Will NOT Include

❌ **Driver profile creation** - Deferred to Phase 2  
❌ **Password reset flow** - Deferred to Phase 1.5 (optional)  
❌ **Email verification** - Optional, can enable in Supabase settings  
❌ **OAuth providers** (Google, etc.) - Deferred to later  
❌ **Admin-specific features** - Deferred to Phase 8  
❌ **User profile editing** - Deferred to Phase 2  
❌ **Role management UI** - Manual SQL for now  

---

## 6. Testing Strategy

### Manual Tests to Perform

1. ✅ Register new user → Check users table has matching record
2. ✅ Login with registered user → Redirects to dashboard
3. ✅ Try to access /dashboard logged out → Redirects to /login
4. ✅ Try to access /login logged in → Redirects to /dashboard
5. ✅ Logout → Session cleared, redirected to homepage
6. ✅ Register with invalid email → Shows error
7. ✅ Register with weak password → Shows error
8. ✅ Login with wrong password → Shows error
9. ✅ Verify users.id === auth.users.id in database

---

## 7. Dependencies to Install

```bash
# shadcn/ui components
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input label card

# Already installed (Phase 0):
# - @supabase/ssr
# - @supabase/supabase-js
# - zod
```

---

## Summary for Approval

**Approach:**
- Supabase Auth as single source of truth ✅
- Database trigger syncs auth.users → users automatically ✅
- No separate auth system ✅
- Simple email/password auth only ✅

**Scope:**
- 15 new files (auth module + pages + components)
- 4 modified files (middleware, layouts, placeholders)
- SQL trigger to run in Supabase
- shadcn/ui components installation

**Time Estimate:** 4-6 hours

**Deliverables:**
- Working register/login/logout
- Protected dashboard route
- User sync verified
- Form validation
- Error handling

---

## Your Approval Needed

Please confirm:

1. ✅ SQL trigger approach is acceptable
2. ✅ File structure makes sense
3. ✅ Auth flows are clear
4. ✅ Scope is limited to auth only (no driver profiles yet)

Once approved, I'll implement Phase 1 and create the phase report.

**Ready to proceed?**