import { Resend } from "resend";
import nodemailer from "nodemailer";

const resendKey = process.env.RESEND_API_KEY;
const resendClient = resendKey ? new Resend(resendKey) : null;

const gmailUser = process.env.GMAIL_USER;
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
const defaultFromAddress = process.env.EMAIL_FROM ?? process.env.GMAIL_FROM ?? "Cove Team <onboarding@resend.dev>";

const gmailTransport =
  !resendClient && gmailUser && gmailAppPassword
    ? nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: gmailUser,
          pass: gmailAppPassword,
        },
      })
    : null;

type EmailDeliveryPayload = {
  email: string;
  subject: string;
  html: string;
  from?: string;
};

async function deliverEmail({ email, subject, html, from }: EmailDeliveryPayload) {
  if (resendClient) {
    await resendClient.emails.send({
      from: from ?? defaultFromAddress,
      to: email,
      subject,
      html,
    });
    return;
  }

  if (gmailTransport) {
    await gmailTransport.sendMail({
      from: from ?? defaultFromAddress,
      to: email,
      subject,
      html,
    });
    return;
  }

  console.warn("No email provider configured. Set RESEND_API_KEY or Gmail credentials to send emails.");
}

type WaitlistEmailPayload = {
  type: "demand" | "supply";
  email: string;
  cities?: string[];
  referralLink?: string;
};

type ApprovalEmailPayload = {
  email: string;
  name?: string;
  referralLink: string;
  cities?: string[];
  type?: "demand" | "supply";
};

/**
 * Sends a lightweight confirmation email via Resend once someone joins a waitlist.
 * Silently no-ops if RESEND_API_KEY is not configured so the prototype still works.
 */
export async function sendWaitlistConfirmationEmail(payload: WaitlistEmailPayload) {
  const { type, email, cities = [], referralLink } = payload;
  const cityList = cities.length ? cities.join(", ") : "your target cities";

  const intro =
    type === "demand"
      ? "Thanks for your interest in Cove! Your application is pending review. We'll be in touch soon."
      : "Thanks for offering your space to the Cove community—we'll reach out when we have qualified matches.";

  const referralCopy = referralLink
    ? `<p style="margin:16px 0;">Share your invite link to boost priority:<br/><a href="${referralLink}">${referralLink}</a></p>`
    : "";
  await deliverEmail({
    email,
    subject: type === "demand" ? "Application received - Cove Waitlist" : "You're on the Cove early-access list!",
    html: `
      <div style="font-family: 'Encode Sans', Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif; line-height:1.5;">
        <p>Hey there,</p>
        <p>${intro}</p>
        ${
          type === "demand"
            ? `<p>We're reviewing applications for <strong>${cityList}</strong>. Once approved, you'll receive your exclusive referral link.</p>`
            : `<p>Your submission is in review. We'll confirm once we verify your listing details.</p>`
        }
        ${referralCopy}
        <p>Talk soon,<br/>The Cove Team</p>
      </div>
    `,
  });
}

/**
 * Sends approval email with referral link to approved waitlist members
 */
export async function sendApprovalEmail(payload: ApprovalEmailPayload) {
  const { email, name, referralLink, cities = [], type = "demand" } = payload;
  const cityList = cities.length ? cities.join(", ") : "your target cities";
  const greeting = name ? `Hey ${name}` : "Hey there";

  const bodyContent = type === "demand"
    ? `<p>We're gathering verified rooms and pre-vetted roommates so you can move to <strong>${cityList}</strong> with confidence.</p>`
    : `<p>Your listing has been verified! We'll connect you with qualified tenants and keep you updated on interest.</p>`;

  const closingContent = type === "demand"
    ? `<p>We'll keep you posted as verified options open up in your target cities.</p>`
    : `<p>We'll reach out when we have qualified matches for your listing.</p>`;

  await deliverEmail({
    email,
    subject: "Welcome to Cove! Your exclusive invite link inside",
    html: `
      <div style="font-family: 'Encode Sans', Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif; line-height:1.5;">
        <p>${greeting},</p>
        <p><strong>You're in!</strong> Welcome to the Cove community.</p>
        ${bodyContent}

        <div style="margin: 24px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
          <p style="margin: 0 0 12px 0; font-weight: 600;">Your exclusive referral link:</p>
          <a href="${referralLink}" style="color: #111827; word-break: break-all;">${referralLink}</a>
          <p style="margin: 12px 0 0 0; font-size: 14px; color: #6b7280;">Share this with friends to help them skip the waitlist and boost your priority.</p>
        </div>

        ${closingContent}
        <p>Talk soon,<br/>The Cove Team</p>
      </div>
    `,
  });
}
