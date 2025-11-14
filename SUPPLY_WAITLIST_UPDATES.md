# Supply Waitlist Updates - Complete

## Summary

Updated the supply-side waitlist form to match the demand-side with comprehensive personal information, listing details, concerns, and the same approval/verification workflow.

## What Changed

### Frontend Form ([app/waitlist/supply/page.tsx](app/waitlist/supply/page.tsx))

**New 4-Step Form Structure:**

1. **Step 1: Tell us about you**
   - Name (required)
   - College/University
   - Graduation year
   - LinkedIn
   - Instagram
   - X (Twitter)

2. **Step 2: Listing info**
   - Address/building (required)
   - City (required)
   - Monthly rent
   - Number of bedrooms
   - Listing link (if posted elsewhere)
   - Photo links (Google Drive, Imgur, Dropbox, etc.)

3. **Step 3: Concerns & preferences**
   - What concerns do you have? (multiple choice, required)
     - Finding qualified tenants
     - Lease agreement concerns
     - Property management
     - Payment security
     - Background checks
     - Maintenance responsibilities
     - Other (with text field)

4. **Step 4: Contact & verification**
   - How should we reach out? (email/text, required)
   - Email (required)
   - Phone
   - Verification consent checkbox

### Backend API ([app/api/waitlist/supply/route.ts](app/api/waitlist/supply/route.ts))

**Updated Schema:**
- Added all personal info fields (name, college, grad_year, linkedin, instagram, twitter)
- Added concerns and other_concern fields
- Added contact_pref and phone fields
- Added listing_photos field for photo links
- Added `approval_status: "pending"` to all new submissions
- Removed attachment upload (replaced with photo links)

**Workflow:**
1. User submits form → saves with `approval_status: "pending"`
2. User receives initial "application received" email
3. Admin reviews in admin panel (to be created for supply)
4. Admin approves → user receives approval email with referral link

## Database Schema Required

Run this SQL in Supabase to add the new columns to `supply_waitlist`:

```sql
ALTER TABLE supply_waitlist
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS college TEXT,
ADD COLUMN IF NOT EXISTS grad_year TEXT,
ADD COLUMN IF NOT EXISTS linkedin TEXT,
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS twitter TEXT,
ADD COLUMN IF NOT EXISTS listing_photos TEXT,
ADD COLUMN IF NOT EXISTS concerns TEXT[],
ADD COLUMN IF NOT EXISTS other_concern TEXT,
ADD COLUMN IF NOT EXISTS contact_pref TEXT[],
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;

-- Remove old attachment_url column if it exists
ALTER TABLE supply_waitlist
DROP COLUMN IF EXISTS attachment_url;
```

## Next Steps (Optional)

### Create Supply Admin Panel

You can create an admin panel for supply listings similar to the demand one:

1. **Create** `/app/admin/supply-waitlist/page.tsx`
2. **Create approval endpoint** `/app/api/waitlist/supply/approve/route.ts`
3. **Update email template** to send approval emails with referral links for supply side

### Or Use Shared Admin Panel

Alternatively, extend the existing admin panel to show both demand and supply in tabs.

## Testing

1. **Test the form:**
   - Go to `/waitlist/supply`
   - Fill out all 4 steps
   - Submit

2. **Check email:**
   - Look for "Application received - Cove Waitlist" email

3. **Check database:**
   ```sql
   SELECT * FROM supply_waitlist ORDER BY created_at DESC LIMIT 5;
   ```

4. **Verify pending status:**
   - All new entries should have `approval_status = 'pending'`

## Files Modified

- ✅ [app/waitlist/supply/page.tsx](app/waitlist/supply/page.tsx) - Complete form redesign
- ✅ [app/api/waitlist/supply/route.ts](app/api/waitlist/supply/route.ts) - Updated schema and logic
- ✅ Removed file upload, replaced with photo links

## Consistency with Demand Side

Both demand and supply waitlists now have:
- ✅ Same personal info fields
- ✅ Same contact preferences
- ✅ Same concerns pattern (customized for each side)
- ✅ Same approval workflow (`approval_status: "pending"`)
- ✅ Same email verification flow
- ✅ Same referral link system (to be implemented for supply)
