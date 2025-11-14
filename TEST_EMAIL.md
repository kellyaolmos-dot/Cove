# Email Testing Checklist

## ✅ Pre-flight Checks

- [x] RESEND_API_KEY is set in `.env.local`
- [ ] Domain verified in Resend (if using custom domain)
- [ ] Dev server is running

## 📧 Test 1: Confirmation Email

1. Navigate to: http://localhost:3000/waitlist/demand
2. Fill out form with test data (use your real email)
3. Submit form
4. Check for email: "Application received - Cove Waitlist"
5. **Check spam folder if not in inbox**

### Expected Email Content:
- Subject: "Application received - Cove Waitlist"
- From: "Cove Team <hello@cove.house>"
- Message: Application pending review
- No referral link yet

## 🔐 Test 2: Admin Approval

1. Navigate to: http://localhost:3000/admin/waitlist
2. Enter admin key: `cove_admin_2024`
3. View pending applications
4. Click on test application
5. Click "Approve & Send Email with Referral Link"

## 📨 Test 3: Approval Email

1. Check email for: "Welcome to Cove! Your exclusive invite link inside"
2. Verify referral link is present
3. Verify referral link format: `http://localhost:3000/waitlist/demand?r={uuid}`

### Expected Email Content:
- Subject: "Welcome to Cove! Your exclusive invite link inside"
- From: "Cove Team <hello@cove.house>"
- Contains: Exclusive referral link in styled box
- Message: Welcome to community + referral instructions

## 🔗 Test 4: Referral Link

1. Copy referral link from approval email
2. Open in new browser window
3. Fill out form again (different email)
4. Submit
5. Verify in database that `referrer_id` is set

## 🐛 Troubleshooting

### Emails not sending?

1. **Check server console for errors:**
   - Look for "RESEND_API_KEY not set" warning
   - Look for any API errors from Resend

2. **Verify Resend domain:**
   - Go to https://resend.com/domains
   - Check if `cove.house` is verified
   - If not, you may need to use `onboarding@resend.dev` temporarily

3. **Check Resend dashboard:**
   - Go to https://resend.com/emails
   - View sent/failed emails
   - Check delivery status

4. **Temporary fix for testing:**
   - Use `onboarding@resend.dev` as sender (no domain verification needed)
   - Update `lib/email.ts` temporarily:
     ```typescript
     from: "Cove Team <onboarding@resend.dev>"
     ```

### Common Issues:

- **"Domain not verified"**: Use `onboarding@resend.dev` for testing
- **Emails in spam**: Normal for new domains, ask recipients to mark as "Not Spam"
- **API key invalid**: Regenerate in Resend dashboard
- **Rate limits**: Resend free tier has limits (check dashboard)

## ☕ Gmail SMTP Fallback (No Domain Yet)

If you do not own a custom domain yet, you can send real emails by routing through Gmail instead of Resend.

1. **Create an App Password** (only once)
   - Log into https://myaccount.google.com/security
   - Turn on 2-Step Verification if it is off
   - Click **App passwords** → choose `Mail` + `Other (Custom name)` → copy the 16-character password
2. **Add local env vars** in `.env.local` (and later in Vercel → Project → Settings → Environment Variables):

   ```env
   # Leave RESEND_API_KEY unset to force the fallback
   GMAIL_USER=youremail@gmail.com
   GMAIL_APP_PASSWORD=the-16-char-app-password
   EMAIL_FROM="Cove Team <youremail@gmail.com>"
   ```

3. **Restart `npm run dev`** so the API route picks up the new env vars.
4. **Submit the waitlist form** again. Because `RESEND_API_KEY` is missing, the backend now uses Nodemailer + Gmail SMTP.
5. **Deploying to Vercel?** Add the exact same `GMAIL_*` vars (and optionally `EMAIL_FROM`) under both Preview and Production environments, redeploy, and you can approve entries from the hosted admin panel.

> Later, when you buy a domain and verify it with Resend, just restore `RESEND_API_KEY` (and optionally remove the Gmail vars) to switch back without any code changes.

## 📊 Verify in Database

After testing, check your Supabase database:

```sql
-- View all demand waitlist entries
SELECT id, name, email, approval_status, created_at
FROM demand_waitlist
ORDER BY created_at DESC
LIMIT 10;

-- View referral tracking
SELECT id, name, email, referrer_id, approval_status
FROM demand_waitlist
WHERE referrer_id IS NOT NULL;
```

## 🎯 Success Criteria

- [ ] Confirmation email received after form submission
- [ ] Entry shows as "pending" in admin panel
- [ ] Approval email received after admin approval
- [ ] Referral link in email is correct format
- [ ] Using referral link tracks referrer_id in database
- [ ] Both emails have proper formatting and branding
