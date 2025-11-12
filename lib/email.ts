import { Resend } from "resend";

const resendKey = process.env.RESEND_API_KEY;
const resendClient = resendKey ? new Resend(resendKey) : null;

type WaitlistEmailPayload = {
  type: "demand" | "supply";
  email: string;
  cities?: string[];
  referralLink?: string;
};

/**
 * Sends a lightweight confirmation email via Resend once someone joins a waitlist.
 * Silently no-ops if RESEND_API_KEY is not configured so the prototype still works.
 */
export async function sendWaitlistConfirmationEmail(payload: WaitlistEmailPayload) {
  if (!resendClient) {
    console.warn("RESEND_API_KEY not set; skipping confirmation email.");
    return;
  }

  const { type, email, cities = [], referralLink } = payload;
  const cityList = cities.length ? cities.join(", ") : "your target cities";

  const intro =
    type === "demand"
      ? "We’re gathering verified rooms and pre-vetted roommates so you can move with confidence."
      : "Thanks for offering your space to the Cove community—we’ll reach out when we have qualified matches.";

  const referralCopy = referralLink
    ? `<p style="margin:16px 0;">Share your invite link to boost priority:<br/><a href="${referralLink}">${referralLink}</a></p>`
    : "";

  await resendClient.emails.send({
    from: "Cove Team <hello@cove.house>",
    to: email,
    subject: "You’re on the Cove early-access list!",
    html: `
      <div style="font-family: 'Encode Sans', Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif; line-height:1.5;">
        <p>Hey there,</p>
        <p>${intro}</p>
        ${
          type === "demand"
            ? `<p>We noted that you're focused on <strong>${cityList}</strong>. We’ll keep you posted as soon as verified options open up.</p>`
            : `<p>Your submission is in review. We'll confirm once we verify your listing details.</p>`
        }
        ${referralCopy}
        <p>Talk soon,<br/>The Cove Team</p>
      </div>
    `,
  });
}
