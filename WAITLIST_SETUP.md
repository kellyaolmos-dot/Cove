# Demand Waitlist - Setup & Usage Guide

## Overview

The demand waitlist has been updated with comprehensive form fields, an approval workflow, and email verification system to create an exclusive, invite-only experience.

## New Form Fields

The demand waitlist now collects:

### Personal Information
- Name
- College/University
- Graduation year
- LinkedIn profile
- Instagram handle
- X (Twitter) handle

### Destination & Work
- Where they're headed (cities)
- Move-in timeline
- Company/employer (current or anticipated)
- Industry sector

### Housing Preferences
- Housing search type (solo vs. with roommates)
- Budget range
- Concerns about moving/housing (multiple choice)

### Contact Preferences
- How to reach them (email or text)
- Email address (required)
- Phone number (optional)

## Approval Workflow

### 1. User Submits Application
- User fills out the comprehensive waitlist form
- Form data is saved to database with `approval_status: "pending"`
- User receives initial confirmation email letting them know their application is under review
- User is redirected to a thank you page explaining the approval process

### 2. Admin Reviews & Approves
- Admin accesses the admin panel at `/admin/waitlist`
- Admin can view all pending and approved applications
- Admin clicks on an entry to see full details
- Admin approves the entry

### 3. Approval Email Sent
- Upon approval, the system:
  - Updates `approval_status` to "approved"
  - Generates a unique referral link: `/waitlist/demand?r={user_id}`
  - Sends approval email with the referral link
  - Logs the approval event

### 4. User Receives Invite
- User gets email titled "Welcome to Cove! Your exclusive invite link inside"
- Email contains their personal referral link
- User can share this link to invite others

## Database Schema Requirements

Make sure your `demand_waitlist` table has these columns:

```sql
-- Add new columns to demand_waitlist table
ALTER TABLE demand_waitlist
ADD COLUMN instagram TEXT,
ADD COLUMN twitter TEXT,
ADD COLUMN sector TEXT,
ADD COLUMN housing_search_type TEXT,
ADD COLUMN budget TEXT,
ADD COLUMN concerns TEXT[],
ADD COLUMN other_concern TEXT,
ADD COLUMN approval_status TEXT DEFAULT 'pending',
ADD COLUMN approved_at TIMESTAMP;

-- Remove old column if it exists
ALTER TABLE demand_waitlist
DROP COLUMN IF EXISTS roommate_pref;
```

## Environment Variables

Add this to your `.env.local`:

```env
# Admin key for approving waitlist entries
ADMIN_KEY=your_secure_admin_key_here

# Base URL for generating referral links
NEXT_PUBLIC_BASE_URL=http://localhost:3000
# or in production:
# NEXT_PUBLIC_BASE_URL=https://cove.house

# Resend API key (already configured)
RESEND_API_KEY=your_resend_api_key
```

## Using the Admin Panel

### Access the Panel
1. Navigate to `/admin/waitlist`
2. Enter your admin key (set in `ADMIN_KEY` environment variable)
3. Click "Access Admin Panel"

### Approve Entries
1. View all pending applications (shown with yellow "pending" badge)
2. Click on any entry to see full details
3. Review the applicant's information
4. Click "Approve & Send Email with Referral Link"
5. Confirm the approval
6. The system will automatically send the approval email with the referral link

### Monitor Approved Entries
- Approved entries show a green badge and green background
- You can click on approved entries to view their details
- Approved entries cannot be re-approved

## API Endpoints

### POST `/api/waitlist/demand`
Submit a new demand waitlist application
- Creates entry with `approval_status: "pending"`
- Sends initial confirmation email
- Returns the entry ID

### POST `/api/waitlist/demand/approve`
Approve a waitlist entry (admin only)

Request body:
```json
{
  "waitlist_id": "uuid",
  "admin_key": "your_admin_key"
}
```

Response:
```json
{
  "ok": true,
  "referralLink": "https://cove.house/waitlist/demand?r=uuid",
  "message": "Approval email sent with referral link"
}
```

### GET `/api/admin/waitlist`
Fetch all waitlist entries (no auth required - add auth if needed)

## Email Templates

### Initial Confirmation Email
- Subject: "Application received - Cove Waitlist"
- Explains application is pending review
- Sets expectation for approval email

### Approval Email
- Subject: "Welcome to Cove! Your exclusive invite link inside"
- Welcomes user to the community
- Displays referral link prominently
- Explains how sharing helps boost priority

## Testing the Flow

1. **Submit an application**: Go to `/waitlist/demand` and fill out the form
2. **Check confirmation**: Verify the "application received" email was sent
3. **Access admin panel**: Go to `/admin/waitlist` with your admin key
4. **Approve the entry**: Click on the pending entry and approve it
5. **Check approval email**: Verify the approval email with referral link was sent
6. **Test referral link**: Click the referral link to verify it works

## Security Considerations

1. **Admin Key**: Store `ADMIN_KEY` securely and never commit it to version control
2. **Admin Panel**: Consider adding more robust authentication (OAuth, etc.)
3. **Email Verification**: The current system doesn't verify email addresses - consider adding email verification if needed
4. **Rate Limiting**: Consider adding rate limiting to prevent spam submissions

## Next Steps

1. Set up your environment variables
2. Run database migrations to add new columns
3. Test the full flow end-to-end
4. Set up your `ADMIN_KEY` for production
5. Configure your email domain in Resend
