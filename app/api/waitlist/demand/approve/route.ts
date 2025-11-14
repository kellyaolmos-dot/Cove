import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabaseClient";
import { sendApprovalEmail } from "@/lib/email";

const approveSchema = z.object({
  waitlist_id: z.string().uuid(),
  admin_key: z.string(), // Simple admin authentication
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = approveSchema.parse(body);

    // Verify admin key (you should set this in your environment variables)
    if (parsed.admin_key !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createSupabaseAdminClient();

    // Get the waitlist entry
    const { data: waitlistEntry, error: fetchError } = await supabase
      .from("demand_waitlist")
      .select("*")
      .eq("id", parsed.waitlist_id)
      .single();

    if (fetchError || !waitlistEntry) {
      return NextResponse.json({ error: "Waitlist entry not found" }, { status: 404 });
    }

    if (waitlistEntry.approval_status === "approved") {
      return NextResponse.json({ error: "Already approved" }, { status: 400 });
    }

    // Update approval status
    const { error: updateError } = await supabase
      .from("demand_waitlist")
      .update({ approval_status: "approved", approved_at: new Date().toISOString() })
      .eq("id", parsed.waitlist_id);

    if (updateError) {
      console.error(updateError);
      return NextResponse.json({ error: "Failed to approve" }, { status: 500 });
    }

    // Generate referral link
    const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL}/waitlist/demand?r=${parsed.waitlist_id}`;

    // Send approval email with referral link
    await sendApprovalEmail({
      email: waitlistEntry.email,
      name: waitlistEntry.name,
      referralLink,
      cities: waitlistEntry.target_cities,
    });

    // Log event
    await supabase.from("waitlist_events").insert({
      event_type: "demand_approved",
      payload: {
        waitlist_id: parsed.waitlist_id,
      },
    });

    return NextResponse.json({
      ok: true,
      referralLink,
      message: "Approval email sent with referral link"
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
