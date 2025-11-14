# Pain Points Collection Feature

## Summary

Added a "horror stories" collection section to the landing page that gathers real experiences and pain points from both tenants (demand) and landlords (supply). This helps understand user challenges and validate product direction.

## What Changed

### Frontend Component ([components/PainPoints.tsx](components/PainPoints.tsx))

**New Form Fields:**
- **Name** - Who is sharing the story
- **Role** - Tenant (looking for housing) or Landlord (have housing to offer)
- **Story** - Their horror story / pain point / challenge (minimum 10 characters)
- **Can we reach out?** - Checkbox asking if we can follow up
- **Contact method** - Email or Phone (conditional, only if they said yes)
- **Contact info** - Email address or phone number (conditional)

**User Flow:**
1. User sees "What are your biggest pain points?" section on homepage
2. Fills out their name and selects their role (tenant/landlord)
3. Shares their housing horror story in a text area
4. Optionally opts in to being contacted for follow-up
5. If opted in, provides contact method and contact info
6. Submits form
7. Sees thank you message with option to share another story

**Design Features:**
- Clean, minimal design matching existing Cove aesthetic
- Radio buttons for role selection with visual feedback
- Large textarea for story (5 rows)
- Conditional contact fields (only show if they opt in)
- Form validation with clear error messages
- Success state with thank you message
- Can submit multiple stories

### Backend API ([app/api/pain-points/route.ts](app/api/pain-points/route.ts))

**Schema Validation:**
- Name: minimum 2 characters
- Role: enum of "tenant" or "landlord"
- Story: minimum 10 characters
- Can reach out: boolean
- Contact method: optional enum ("email", "phone", "none")
- Contact info: optional string (trimmed)

**Database Insert:**
Saves to `pain_points` table with all fields

**Event Tracking:**
Logs `pain_point_submitted` event with role and opt-in status

### Landing Page Update ([app/page.tsx](app/page.tsx))

Added `PainPoints` component between `Stories` and `HowItWorks` sections.

**Page Order:**
1. Hero
2. Stories (social proof)
3. **Pain Points** (NEW - collect horror stories)
4. How It Works
5. Waitlist
6. Footer

## Database Schema Required

Run this SQL in Supabase to create the `pain_points` table:

```sql
CREATE TABLE IF NOT EXISTS pain_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('tenant', 'landlord')),
  story TEXT NOT NULL,
  can_reach_out BOOLEAN NOT NULL DEFAULT false,
  contact_method TEXT CHECK (contact_method IN ('email', 'phone', 'none')),
  contact_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for filtering by role
CREATE INDEX idx_pain_points_role ON pain_points(role);

-- Add index for filtering by those who want to be contacted
CREATE INDEX idx_pain_points_can_reach_out ON pain_points(can_reach_out) WHERE can_reach_out = true;

-- Add index for created_at for sorting
CREATE INDEX idx_pain_points_created_at ON pain_points(created_at DESC);
```

## Why This Feature?

### Customer Discovery
- **Validate pain points** - See if the problems we're solving actually exist
- **Understand priorities** - Learn which challenges matter most to users
- **Gather insights** - Real stories reveal nuances that surveys miss
- **Build empathy** - Understand emotional impact of housing challenges

### Marketing & Product
- **Content for marketing** - Use quotes (with permission) in marketing materials
- **Feature prioritization** - Build what actually solves real problems
- **Case studies** - Follow up with users for deeper stories
- **Social proof** - Show others that their problems are shared

### User Research Pipeline
- **Recruit interview subjects** - Contact people who opted in
- **Segment by pain point** - Different features for different problems
- **Track trends** - See which pain points are most common
- **Iterate quickly** - Collect feedback before building features

## Example Stories You Might Collect

**From Tenants:**
- "I've been scammed 3 times on Craigslist. Lost $1,500 in fake deposits before finding out the 'landlord' didn't even own the property."
- "Applied to 40 apartments in Boston. Only heard back from 5. By the time I responded, all were taken."
- "My roommate found on Facebook turned out to have 6 months of unpaid rent and trashed our apartment."

**From Landlords:**
- "Tenant stopped paying rent after 2 months. Took 6 months to evict and cost me $12,000 in legal fees."
- "Listed my apartment on Craigslist and got 200 messages. 90% were scams or people who never showed up."
- "College student's parents guaranteed the lease but disappeared when he stopped paying. Never got my money back."

## Viewing Pain Points

### In Database
```sql
-- View all pain points
SELECT * FROM pain_points ORDER BY created_at DESC;

-- View by role
SELECT * FROM pain_points WHERE role = 'tenant' ORDER BY created_at DESC;
SELECT * FROM pain_points WHERE role = 'landlord' ORDER BY created_at DESC;

-- View those who want to be contacted
SELECT name, role, story, contact_method, contact_info
FROM pain_points
WHERE can_reach_out = true
ORDER BY created_at DESC;

-- Count by role
SELECT role, COUNT(*) as count
FROM pain_points
GROUP BY role;
```

### Future Admin Panel (Optional)

You could create `/admin/pain-points` to:
- View all submitted stories
- Filter by role (tenant/landlord)
- Filter by those willing to be contacted
- Export to CSV for analysis
- Mark stories as "contacted" or "featured"

## Testing

1. **Visit homepage**
   - Go to `/`
   - Scroll down to "What are your biggest pain points?" section

2. **Test form validation**
   - Try submitting empty form → should see validation errors
   - Try submitting with just name → should see role error
   - Try submitting without story → should see story error

3. **Test role selection**
   - Click "Looking for housing (Tenant)" → should highlight
   - Click "Have housing to offer (Landlord)" → should switch highlight

4. **Test conditional contact fields**
   - Leave "can reach out" unchecked → contact fields hidden
   - Check "can reach out" → contact fields appear
   - Select email → placeholder changes to "Email address"
   - Select phone → placeholder changes to "Phone number"

5. **Test successful submission**
   - Fill out all required fields
   - Submit form
   - Should see thank you message
   - Click "Share another story" → form resets

6. **Check database**
   ```sql
   SELECT * FROM pain_points ORDER BY created_at DESC LIMIT 5;
   ```

7. **Check events log**
   ```sql
   SELECT * FROM waitlist_events
   WHERE event_type = 'pain_point_submitted'
   ORDER BY created_at DESC LIMIT 5;
   ```

## Files Created

- ✅ [components/PainPoints.tsx](components/PainPoints.tsx) - Main pain points form component
- ✅ [app/api/pain-points/route.ts](app/api/pain-points/route.ts) - API endpoint to save submissions
- ✅ This documentation file

## Files Modified

- ✅ [app/page.tsx](app/page.tsx) - Added PainPoints component to landing page

## Build Status

Ready to build and deploy after running the database migration!
