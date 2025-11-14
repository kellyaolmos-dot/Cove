import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabaseClient";

const painPointSchema = z.object({
  name: z.string().min(2),
  story: z.string().min(10),
  can_reach_out: z.boolean(),
  contact_method: z.enum(["email", "phone", "none"]).optional(),
  contact_info: z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : undefined)),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = painPointSchema.parse(body);

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("pain_points")
      .insert([
        {
          name: parsed.name,
          story: parsed.story,
          can_reach_out: parsed.can_reach_out,
          contact_method: parsed.contact_method ?? "none",
          contact_info: parsed.contact_info,
        },
      ])
      .select("id")
      .single();

    if (error) {
      console.error("Failed to save pain point:", error);
      return NextResponse.json({ error: "Failed to save submission." }, { status: 500 });
    }

    // Log event
    await supabase.from("waitlist_events").insert({
      event_type: "pain_point_submitted",
      payload: {
        pain_point_id: data.id,
        can_reach_out: parsed.can_reach_out,
      },
    });

    return NextResponse.json({ ok: true, id: data.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
