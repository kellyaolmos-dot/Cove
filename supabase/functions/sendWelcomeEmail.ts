import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.1.0";

const resendKey = Deno.env.get("RESEND_API_KEY");
const resendClient = resendKey ? new Resend(resendKey) : null;

serve(async (req) => {
  if (!resendClient) {
    return new Response(JSON.stringify({ error: "RESEND_API_KEY is not configured." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { email, type = "demand", cities = [] } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const cityList = Array.isArray(cities) && cities.length ? cities.join(", ") : "your city list";
    const intro =
      type === "supply"
        ? "We’re reviewing your listing details now. Expect a note as soon as we have a match."
        : `We flagged your interest in ${cityList}. We’ll nudge you once verified rooms are open.`;

    await resendClient.emails.send({
      from: "Cove Team <hello@cove.house>",
      to: email,
      subject: "You’re on the Cove early-access list!",
      html: `
        <div style="font-family: 'Encode Sans', Inter, sans-serif; line-height:1.5;">
          <p>Hey there,</p>
          <p>${intro}</p>
          <p>Talk soon,<br/>The Cove Team</p>
        </div>
      `,
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
