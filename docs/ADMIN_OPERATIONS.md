# TaxiLink - Admin Operations Guide

**Last Updated:** 2026-03-29  
**Phase:** 0 - Placeholder Created  

## Overview

This guide explains how to perform administrative tasks in TaxiLink. As the system grows, this document will be updated with detailed procedures.

---

## Getting Admin Access

### Creating the First Admin User

**Phase 1 Implementation:**

1. Register a normal user account via Supabase Auth
2. Note the user's UUID from Supabase Dashboard
3. Connect to database and update role:

```sql
-- Via Supabase SQL Editor or psql
UPDATE users 
SET role = 'ADMIN' 
WHERE email = 'admin@yourcompany.com';
```

4. Logout and login again
5. Navigate to `/admin` - you should now have access

### Creating Additional Admins

**Via Admin Panel (Future):**
- Navigate to `/admin/users`
- Find user by email
- Click "Promote to Admin"

**Via Database:**
```sql
UPDATE users SET role = 'ADMIN' WHERE id = 'user-uuid-here';
```

---

## Driver Management

### Reviewing Pending Drivers

**Status:** To be implemented in Phase 8

**Process:**
1. Login to admin panel
2. Navigate to `/admin/drivers?status=pending`
3. See list of pending drivers with:
   - Name
   - City
   - Vehicle type
   - Registration date
4. Click driver to view full profile

### Approving a Driver

**Status:** To be implemented in Phase 8

**Steps:**
1. Review driver profile completely
2. Verify information is accurate
3. Check profile image is appropriate
4. Click "Approve" button
5. Driver status changes to `APPROVED`
6. Driver immediately visible on public directory
7. (Optional) Send approval email notification

**SQL Fallback:**
```sql
UPDATE drivers 
SET status = 'APPROVED', updated_at = NOW() 
WHERE id = 'driver-uuid-here';
```

### Rejecting a Driver

**Status:** To be implemented in Phase 8

**Steps:**
1. Review driver profile
2. Determine rejection reason
3. Click "Reject" button
4. (Optional) Add rejection note
5. Driver status changes to `REJECTED`
6. Driver remains hidden from directory
7. (Optional) Send rejection email with reason

**Common Rejection Reasons:**
- Incomplete information
- Inappropriate profile image
- Suspected fraud
- Service area outside target region
- Duplicate account

### Suspending a Driver

**Status:** To be implemented in Phase 8

**When to Suspend:**
- Customer complaints
- Suspected fraud
- TOS violations
- Temporary investigation needed

**Steps:**
1. Navigate to driver profile
2. Click "Suspend" button
3. Add suspension reason
4. Driver status changes to `SUSPENDED`
5. Driver hidden from public directory
6. Driver can still login but profile not visible

**To Unsuspend:**
```sql
UPDATE drivers 
SET status = 'APPROVED', updated_at = NOW() 
WHERE id = 'driver-uuid-here';
```

### Featuring a Driver

**Status:** To be implemented in Phase 8

**Purpose:** Promote quality drivers to top of listings

**Steps:**
1. Navigate to driver profile in admin panel
2. Click "Feature Driver" toggle
3. Driver appears first in directory listings
4. Review featured drivers periodically

**Manual SQL:**
```sql
UPDATE drivers 
SET is_featured = true, updated_at = NOW() 
WHERE id = 'driver-uuid-here';
```

**Best Practices:**
- Limit featured drivers (e.g., max 10 per city)
- Rotate featured drivers monthly
- Feature based on:
  - High lead conversion
  - Good customer feedback
  - Complete profiles
  - Active availability

---

## Lead Management

### Viewing Lead Analytics

**Status:** To be implemented in Phase 8

**Available Metrics:**
- Total leads platform-wide
- Leads per driver
- Leads by source (WhatsApp vs Call)
- Leads by city
- Lead trends over time

**Access:**
`/admin/leads`

### Identifying Spam Leads

**Red Flags:**
- Multiple leads from same IP in short time
- Leads from suspicious user agents
- Abnormal lead patterns for a driver

**Investigation:**
```sql
-- Find leads from same IP hash
SELECT 
  driver_id, 
  COUNT(*) as lead_count,
  ip_hash,
  MIN(created_at) as first_lead,
  MAX(created_at) as last_lead
FROM leads
GROUP BY driver_id, ip_hash
HAVING COUNT(*) > 10
ORDER BY lead_count DESC;
```

**Action:**
- Review driver profile
- Contact driver to verify leads
- Consider suspension if fraud detected

### Exporting Lead Data

**Via Prisma Studio:**
1. Run `npm run db:studio`
2. Navigate to `leads` table
3. Apply filters as needed
4. Export to CSV

**Via SQL:**
```sql
COPY (
  SELECT 
    l.id,
    d.display_name,
    d.city,
    l.source,
    l.created_at
  FROM leads l
  JOIN drivers d ON l.driver_id = d.id
  WHERE l.created_at >= '2026-01-01'
) TO '/path/to/export.csv' CSV HEADER;
```

---

## Ad Management

### Creating an Ad

**Status:** To be implemented in Phase 9

**Steps:**
1. Navigate to `/admin/ads`
2. Click "Create Ad"
3. Fill form:
   - Title (internal reference)
   - Upload image (recommended: 1200x400px)
   - Destination URL
4. Save (starts as inactive)

### Activating an Ad

**Important:** Only one ad should be active at a time

**Steps:**
1. Deactivate currently active ad (if any)
2. Click "Activate" on desired ad
3. Ad now shows on driver profiles

**SQL:**
```sql
-- Deactivate all ads
UPDATE ads SET is_active = false;

-- Activate specific ad
UPDATE ads SET is_active = true WHERE id = 'ad-uuid-here';
```

### Ad Performance Tracking

**Future Enhancement:**
- Track ad impressions
- Track ad clicks
- Calculate CTR
- A/B testing capability

---

## Database Operations

### Backup Strategy

**Supabase:**
- Automatic daily backups
- Point-in-time recovery available
- Manual backups via dashboard

**Manual Export:**
```bash
# Export entire database
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Export specific tables
pg_dump $DATABASE_URL -t drivers -t users > backup-critical.sql
```

### Restoring Data

**Single Record Recovery:**
```sql
-- Restore soft-deleted driver (if we add soft delete)
UPDATE drivers 
SET status = 'APPROVED', updated_at = NOW() 
WHERE id = 'driver-uuid-here';
```

**Full Database Restore:**
Via Supabase Dashboard → Database → Backups → Restore

### Running Maintenance Queries

**Clean up orphaned records:**
```sql
-- Find drivers without users (should never happen)
SELECT d.* 
FROM drivers d 
LEFT JOIN users u ON d.user_id = u.id 
WHERE u.id IS NULL;

-- Find profile views older than 1 year (for archival)
SELECT COUNT(*) 
FROM profile_views 
WHERE created_at < NOW() - INTERVAL '1 year';
```

---

## Monitoring & Alerts

### Key Metrics to Watch

**Daily:**
- New driver registrations
- Pending driver reviews
- Total leads generated
- Error rate (Sentry)

**Weekly:**
- Active drivers by city
- Lead conversion trends
- Top performing drivers
- System performance metrics

**Monthly:**
- Platform growth rate
- Retention metrics
- Revenue (future)

### Setting Up Alerts

**Recommended Alerts:**

1. **Pending Drivers > 10**
   - Email admin team
   - Review queue backlog

2. **Error Rate > 5%**
   - Check Sentry dashboard
   - Investigate immediately

3. **Zero Leads for 24 Hours**
   - System health check
   - Verify lead tracking working

---

## Troubleshooting Common Issues

### Driver Can't See Their Profile

**Possible Causes:**
1. Profile not approved
2. Status = REJECTED or SUSPENDED
3. User logged into wrong account

**Resolution:**
```sql
-- Check driver status
SELECT d.status, u.email 
FROM drivers d 
JOIN users u ON d.user_id = u.id 
WHERE d.slug = 'driver-slug-here';

-- If should be approved
UPDATE drivers 
SET status = 'APPROVED' 
WHERE slug = 'driver-slug-here';
```

### Leads Not Being Tracked

**Check:**
1. Server Actions working?
2. Database connection healthy?
3. Lead tracking code deployed?
4. Browser blocking requests?

**Debug Query:**
```sql
-- Check recent leads
SELECT * FROM leads 
ORDER BY created_at DESC 
LIMIT 10;

-- If empty, tracking likely broken
```

### Driver Image Not Showing

**Possible Causes:**
1. Upload failed
2. Invalid URL in database
3. Supabase Storage bucket not public
4. CORS issue

**Resolution:**
1. Check `profile_image_url` in database
2. Verify URL loads in browser
3. Check Supabase Storage bucket settings
4. Re-upload if needed

---

## User Support Procedures

### Handling Driver Support Requests

**Common Requests:**

1. **"My profile isn't visible"**
   - Check approval status
   - Approve if appropriate
   - Explain review process

2. **"I need to change my phone number"**
   - Verify identity
   - Update in admin panel or direct SQL
   - Confirm change with driver

3. **"I'm not getting leads"**
   - Check profile quality
   - Review service area
   - Suggest profile improvements
   - Verify tracking working

4. **"Delete my account"**
   - Verify identity
   - Export data if requested (GDPR)
   - Delete driver profile
   - Delete user account
   - Confirm deletion

### Deleting a Driver Account

**GDPR Compliance:**

```sql
-- Export driver data first
SELECT * FROM drivers WHERE id = 'driver-uuid-here';
SELECT * FROM leads WHERE driver_id = 'driver-uuid-here';
SELECT * FROM profile_views WHERE driver_id = 'driver-uuid-here';

-- Delete driver (cascades to leads and views)
DELETE FROM drivers WHERE id = 'driver-uuid-here';

-- Delete user
DELETE FROM users WHERE id = 'user-uuid-here';
```

**Note:** This is permanent. Confirm with user first.

---

## Emergency Procedures

### Site Down

1. Check Vercel deployment status
2. Check Supabase status page
3. Review Sentry for errors
4. Check database connection
5. Rollback deployment if needed

### Database Connection Lost

1. Check DATABASE_URL is correct
2. Verify Supabase project not paused
3. Check connection limits
4. Restart server if needed

### Mass Spam Attack

1. Identify spam pattern (IP, user agent, etc.)
2. Block IP ranges if possible
3. Implement rate limiting
4. Clean up spam leads:
```sql
DELETE FROM leads 
WHERE ip_hash = 'spam-ip-hash' 
AND created_at > NOW() - INTERVAL '24 hours';
```

---

## Access Control

### Admin Panel Routes

Protected routes (admin only):
- `/admin/*`
- All subdirectories

**Middleware Check:**
```typescript
// In middleware or layout
const { data: { user } } = await supabase.auth.getUser()
const dbUser = await prisma.user.findUnique({ where: { id: user.id } })

if (dbUser.role !== 'ADMIN') {
  redirect('/')
}
```

### API Endpoints (Future)

Admin-only endpoints should verify role:
```typescript
const user = await getCurrentUser()
if (user.role !== 'ADMIN') {
  return new Response('Unauthorized', { status: 403 })
}
```

---

## Future Enhancements

- [ ] Bulk driver approval
- [ ] Email templates for notifications
- [ ] Advanced analytics dashboard
- [ ] Automated spam detection
- [ ] Driver performance scores
- [ ] Customer review moderation
- [ ] Subscription management
- [ ] Payout tracking (if applicable)
