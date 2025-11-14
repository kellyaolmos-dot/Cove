# Email Troubleshooting Guide

## Issue: Approval Emails Not Sending

If you're approving users in the admin panel but they're not receiving emails, follow these debugging steps.

## Step 1: Check Your Environment Variables

### Local Development (.env.local)

You need **either** Resend **or** Gmail configured:

**Option A: Using Resend (Recommended)**
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM="Cove Team <hello@cove.house>"
```

**Option B: Using Gmail (if no custom domain)**
```env
GMAIL_USER=youremail@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
EMAIL_FROM="Cove Team <youremail@gmail.com>"
```

**Required for Both:**
```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
ADMIN_KEY=cove_admin_2024
```

### Production (Vercel Environment Variables)

Make sure these are set in Vercel → Project → Settings → Environment Variables:
- `RESEND_API_KEY` (or `GMAIL_USER` + `GMAIL_APP_PASSWORD`)
- `EMAIL_FROM`
- `NEXT_PUBLIC_BASE_URL=https://cove-alpha.vercel.app`
- `ADMIN_KEY`

## Step 2: Check Console Logs

After clicking "Approve" in the admin panel, check your terminal/console for these logs:

### Success Indicators:
```
✅ Approval email sent to user@email.com
📧 Sending email via Resend to user@email.com
✅ Email sent successfully via Resend: { id: 'xxx' }
```

Or for Gmail:
```
✅ Approval email sent to user@email.com
📧 Sending email via Gmail to user@email.com
✅ Email sent successfully via Gmail: { accepted: [...] }
```

### Warning Signs:
```
⚠️ No email provider configured. Set RESEND_API_KEY or Gmail credentials to send emails.
```
**Fix:** Add email credentials to `.env.local` and restart dev server

```
❌ Failed to send approval email: [error details]
```
**Fix:** Check the specific error message for details

```
❌ Resend error: Domain not verified
```
**Fix:** Either verify your domain in Resend dashboard, or use `onboarding@resend.dev` as the FROM address for testing

```
❌ Gmail error: Invalid credentials
```
**Fix:** Regenerate Gmail App Password and update `.env.local`

## Step 3: Test Email Delivery Manually

### Test Confirmation Email (runs when user submits form)

1. Go to `/waitlist/demand` or `/waitlist/supply`
2. Fill out and submit the form
3. Check console logs for email sending

### Test Approval Email (runs when admin approves)

1. Go to `/admin/waitlist`
2. Enter admin key: `cove_admin_2024`
3. Click on a pending entry
4. Click "Approve & Send Email with Referral Link"
5. Check console logs

## Step 4: Check Email Provider Status

### For Resend:
1. Log into https://resend.com/dashboard
2. Check "Recent Emails" to see if emails were sent
3. Check "API Keys" to ensure key is valid
4. Check "Domains" to ensure domain is verified (or use `onboarding@resend.dev`)

### For Gmail:
1. Check your Gmail "Sent" folder
2. Verify 2-Step Verification is enabled
3. Verify App Password is still valid (doesn't expire but can be revoked)

## Step 5: Common Issues & Fixes

### Issue: "No email provider configured" warning
**Cause:** Missing `RESEND_API_KEY` and Gmail credentials
**Fix:** Add email credentials to `.env.local` and restart server
```bash
# Stop the dev server (Ctrl+C)
# Add credentials to .env.local
npm run dev
```

### Issue: Emails going to spam
**Cause:** New sender address not recognized
**Fix:**
- For Resend: Verify domain and add SPF/DKIM records
- For Gmail: Recipients should mark as "Not Spam"
- For testing: Use `onboarding@resend.dev` (pre-verified)

### Issue: "Domain not verified" error
**Cause:** Using custom domain in FROM address without verification
**Fix:** Either:
1. Verify domain in Resend dashboard with DNS records
2. Use `onboarding@resend.dev` for testing

### Issue: Approval succeeds but no email
**Cause:** Email function silently failing
**Fix:** Check console logs for specific error, wrapped in try-catch now

### Issue: Local works, production doesn't
**Cause:** Environment variables not set in Vercel
**Fix:**
1. Go to Vercel → Project → Settings → Environment Variables
2. Add all required variables for Production AND Preview
3. Redeploy

## Step 6: Verify Database Updates

Even if emails fail, approvals should still work in the database:

```sql
-- Check if approval status updated
SELECT id, name, email, approval_status, approved_at
FROM demand_waitlist
WHERE approval_status = 'approved'
ORDER BY approved_at DESC;

-- Check events log
SELECT * FROM waitlist_events
WHERE event_type = 'demand_approved'
ORDER BY created_at DESC LIMIT 10;
```

## Step 7: Force Retry

If you approved someone but email failed, you can:

1. Manually set their status back to pending:
```sql
UPDATE demand_waitlist
SET approval_status = 'pending', approved_at = NULL
WHERE id = 'uuid-here';
```

2. Approve again in admin panel (will trigger email retry)

## Testing Checklist

- [ ] Environment variables set correctly
- [ ] Dev server restarted after adding env vars
- [ ] Console shows email sending logs
- [ ] Email provider dashboard shows sent emails
- [ ] Test email received in inbox (check spam)
- [ ] Approval email with referral link received
- [ ] Referral link works when clicked

## Need More Help?

1. Check the full console output when approving
2. Check your email provider dashboard for delivery logs
3. Verify all environment variables are spelled correctly
4. Try using the Gmail fallback if Resend isn't working
5. Check the `TEST_EMAIL.md` file for email setup instructions
