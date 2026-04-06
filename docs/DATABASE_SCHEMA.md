# Movely - Database Schema

**Last Updated:** 2026-04-02  
**Phase:** 2 - Driver Profile Management Complete  

## Entity Relationship Diagram

```
┌─────────────────┐
│     users       │
│─────────────────│
│ id (PK) ◄───────┼─────┐
│ email           │     │
│ role            │     │
│ created_at      │     │
│ updated_at      │     │
└─────────────────┘     │
                        │ 1:1
                   ┌────▼──────────────┐
                   │     drivers       │
                   │───────────────────│
                   │ id (PK)           │
                   │ user_id (FK) ◄────┤
                   │ slug (UNIQUE)     │
                   │ display_name      │
                   │ phone             │
                   │ whatsapp_number   │
                   │ city              │
                   │ service_area_text │
                   │ vehicle_type      │
                   │ languages[]       │
                   │ bio               │
                   │ profile_image_url │
                   │ status            │
                   │ availability      │
                   │ is_featured       │
                   │ view_count        │◄──── Incremented on profile view
                   │ created_at        │
                   │ updated_at        │
                   └───────┬───────────┘
                           │
                ┌──────────┴────────────┐
                │ 1:N                   │ 1:N
       ┌────────▼──────────┐   ┌────────▼──────────┐
       │  profile_views    │   │      leads        │
       │───────────────────│   │───────────────────│
       │ id (PK)           │   │ id (PK)           │
       │ driver_id (FK)    │   │ driver_id (FK)    │
       │ ip_hash           │   │ source (enum)     │
       │ user_agent        │   │ ip_hash           │
       │ referrer          │   │ user_agent        │
       │ created_at        │   │ referrer          │
       └───────────────────┘   │ created_at        │
                               └───────────────────┘

┌─────────────────┐
│      ads        │
│─────────────────│
│ id (PK)         │
│ title           │
│ image_url       │
│ link            │
│ is_active       │
│ created_at      │
│ updated_at      │
└─────────────────┘
```

## Tables

### `users`

Syncs with Supabase `auth.users` table. **CRITICAL:** `id` must match Supabase auth user UUID.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | **MUST be same as Supabase auth.users.id** |
| email | VARCHAR | UNIQUE, NOT NULL | User email |
| role | ENUM | NOT NULL, DEFAULT 'DRIVER' | User role (DRIVER, ADMIN) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() | Account creation |
| updated_at | TIMESTAMP | NOT NULL, AUTO UPDATE | Last update |

**Relationships:**
- `1:1` with `drivers` (optional - admins won't have driver profiles)

**Indexes:**
- Primary key on `id`
- Unique index on `email`

**Business Rules:**
- ID is NOT auto-generated - comes from Supabase Auth
- Created via database trigger when Supabase auth user is created
- Email must be validated by Supabase Auth before user record is created

---

### `drivers`

Driver profiles visible in public directory after approval.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid() | Driver profile ID |
| user_id | UUID | FK users(id), UNIQUE, NOT NULL | Owner user |
| slug | VARCHAR | UNIQUE, NOT NULL | URL-friendly identifier |
| display_name | VARCHAR | NOT NULL | Public display name |
| phone | VARCHAR | NOT NULL | Contact phone |
| whatsapp_number | VARCHAR | NOT NULL | WhatsApp number |
| city | VARCHAR | NOT NULL | Primary city |
| service_area_text | TEXT | NOT NULL | Service area description |
| vehicle_type | VARCHAR | NOT NULL | Type of vehicle |
| languages | VARCHAR[] | NOT NULL | Languages spoken |
| bio | TEXT | NULL | Driver bio/description |
| profile_image_url | VARCHAR | NULL | Profile image URL (Supabase Storage) |
| status | ENUM | NOT NULL, DEFAULT 'PENDING' | Approval status |
| availability_status | ENUM | NOT NULL, DEFAULT 'AVAILABLE' | Current availability |
| is_featured | BOOLEAN | NOT NULL, DEFAULT false | Featured in directory |
| view_count | INTEGER | NOT NULL, DEFAULT 0 | Total profile views |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() | Profile creation |
| updated_at | TIMESTAMP | NOT NULL, AUTO UPDATE | Last update |

**Enums:**

```typescript
enum DriverStatus {
  PENDING    // Awaiting admin approval
  APPROVED   // Visible on public directory
  REJECTED   // Denied by admin
  SUSPENDED  // Temporarily hidden
}

enum AvailabilityStatus {
  AVAILABLE  // Accepting customers
  BUSY       // Currently occupied
  OFFLINE    // Not working
}
```

**Relationships:**
- `N:1` with `users` via `user_id`
- `1:N` with `profile_views`
- `1:N` with `leads`

**Indexes:**
- Primary key on `id`
- Unique index on `user_id`
- Unique index on `slug`
- Composite index on `(city, status, is_featured)` - for directory queries
- Index on `user_id` - for foreign key

**Business Rules:**
- Slug must be unique across all drivers
- Only `APPROVED` drivers visible in public directory
- `is_featured=true` drivers appear first in listings
- `view_count` increments on profile view (with deduplication)
- Phone and WhatsApp can be different numbers

---

### `profile_views`

Tracks views of driver profiles for analytics. Includes deduplication logic.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid() | View record ID |
| driver_id | UUID | FK drivers(id), NOT NULL | Viewed driver |
| ip_hash | VARCHAR | NOT NULL | SHA-256 hash of visitor IP |
| user_agent | TEXT | NOT NULL | Browser user agent |
| referrer | VARCHAR | NULL | Referrer URL |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() | View timestamp |

**Relationships:**
- `N:1` with `drivers` via `driver_id`

**Indexes:**
- Primary key on `id`
- Composite index on `(driver_id, created_at)` - for driver analytics
- Composite index on `(ip_hash, driver_id, created_at)` - for deduplication

**Business Rules:**
- **Deduplication:** Don't create new view if same `ip_hash` + `driver_id` exists within last 30 minutes
- IP is hashed for privacy (SHA-256)
- When view is created, increment `drivers.view_count`
- User agent stored for fraud detection
- Referrer helps understand traffic sources

**Deduplication Query Example:**
```typescript
const recentView = await prisma.profileView.findFirst({
  where: {
    driverId,
    ipHash,
    createdAt: { gte: new Date(Date.now() - 30 * 60 * 1000) }
  }
})

if (!recentView) {
  // Create new view + increment driver.view_count
}
```

---

### `leads`

Tracks customer contact attempts (WhatsApp clicks, phone calls).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid() | Lead ID |
| driver_id | UUID | FK drivers(id), NOT NULL | Contacted driver |
| source | ENUM | NOT NULL | Contact method |
| ip_hash | VARCHAR | NOT NULL | SHA-256 hash of visitor IP |
| user_agent | TEXT | NOT NULL | Browser user agent |
| referrer | VARCHAR | NULL | Referrer URL |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() | Contact timestamp |

**Enums:**

```typescript
enum LeadSource {
  WHATSAPP  // Clicked WhatsApp button
  CALL      // Clicked call button
}
```

**Relationships:**
- `N:1` with `drivers` via `driver_id`

**Indexes:**
- Primary key on `id`
- Composite index on `(driver_id, created_at)` - for driver analytics
- Composite index on `(ip_hash, driver_id, created_at)` - for fraud detection

**Business Rules:**
- Lead created on CTA click (before redirect to WhatsApp/phone)
- IP hashed for privacy
- Metadata helps identify spam/fraud
- No deduplication on leads (multiple clicks = multiple leads)
- Used for driver dashboard metrics

---

### `ads`

Basic banner ad system for monetization.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid() | Ad ID |
| title | VARCHAR | NOT NULL | Ad title (internal) |
| image_url | VARCHAR | NOT NULL | Ad image URL |
| link | VARCHAR | NOT NULL | Click destination URL |
| is_active | BOOLEAN | NOT NULL, DEFAULT false | Currently showing |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() | Ad creation |
| updated_at | TIMESTAMP | NOT NULL, AUTO UPDATE | Last update |

**Indexes:**
- Primary key on `id`

**Business Rules:**
- Only one ad should be active at a time (enforced in application layer)
- Shown on driver profile pages
- Future: Premium drivers can hide ads

---

## Database Triggers (Supabase)

### User Sync Trigger

**Purpose:** Auto-create `users` record when Supabase auth user is created

**Trigger:** `on_auth_user_created`

**Implementation (Phase 1):**
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    'DRIVER',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**Critical:** This ensures `users.id` === `auth.users.id`

---

## Migration Strategy

### Phase 0 (Current)
- Use `prisma db push` for rapid iteration
- No formal migrations yet

### Phase 1+
- Switch to `prisma migrate dev`
- Track migrations in version control
- Never modify existing migrations

---

## Data Integrity Rules

1. **User-Driver Relationship**
   - Every driver MUST have a user
   - Not every user has a driver (admins)
   - CASCADE delete: user deleted → driver deleted

2. **Profile Views & Leads**
   - CASCADE delete: driver deleted → views/leads deleted
   - Maintains referential integrity

3. **Slug Uniqueness**
   - Generate with random suffix if duplicate
   - Check before insert

4. **IP Privacy**
   - Always hash before storing
   - Use SHA-256
   - No raw IPs in database

---

## Query Patterns

### Get Public Driver Directory
```typescript
prisma.driver.findMany({
  where: {
    status: 'APPROVED',
    city: 'Baltimore' // optional filter
  },
  orderBy: [
    { isFeatured: 'desc' },
    { createdAt: 'desc' }
  ]
})
```

### Get Driver with Analytics
```typescript
prisma.driver.findUnique({
  where: { slug },
  include: {
    _count: {
      select: {
        leads: true,
        profileViews: true
      }
    }
  }
})
```

### Track Lead
```typescript
await prisma.lead.create({
  data: {
    driverId,
    source: 'WHATSAPP',
    ipHash: hashIP(ip),
    userAgent,
    referrer
  }
})
```

---

## Backup & Recovery

- **Supabase:** Automatic daily backups
- **Point-in-time recovery:** Available for paid plans
- **Manual exports:** Via Prisma Studio or pg_dump

---

## Future Considerations

### Not in MVP (but schema-ready)
- Subscriptions table for premium features
- Reviews/ratings system
- Booking history
- Driver certifications/documents
