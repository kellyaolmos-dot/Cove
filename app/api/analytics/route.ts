import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabaseClient";

const analyticsSchema = z.object({
  event_type: z.string(),
  payload: z.record(z.string(), z.any()).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = analyticsSchema.parse(body);

    const supabase = createSupabaseAdminClient();
    await supabase.from("waitlist_events").insert({
      event_type: parsed.event_type,
      payload: parsed.payload ?? {},
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to store analytics event." }, { status: 500 });
  }
}
