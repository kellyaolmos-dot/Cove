import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabaseClient";
import { sendWaitlistConfirmationEmail } from "@/lib/email";

const demandPayloadSchema = z.object({
  name: z
    .string()
    .max(120)
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : undefined)),
  email: z.string().email(),
  phone: z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : undefined)),
  college: z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : undefined)),
  grad_year: z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : undefined)),
  linkedin: z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : undefined)),
  instagram: z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : undefined)),
  twitter: z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : undefined)),
  status: z.enum(["confirmed", "recruiting", "exploring"]),
  target_cities: z.array(z.string()).min(1),
  move_in_month: z.string().min(1),
  company: z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : undefined)),
  sector: z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : undefined)),
  housing_search_type: z.enum(["solo", "with_roommates"]),
  roommate_preferences: z.array(z.string()).optional(),
  other_roommate_preference: z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : undefined)),
  budget: z.string().min(1),
  concerns: z.array(z.string()).min(1),
  other_concern: z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : undefined)),
  contact_pref: z.array(z.enum(["email", "text"])).min(1),
  referrer_id: z
    .string()
    .uuid()
    .optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = demandPayloadSchema.parse(body);

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("demand_waitlist")
      .insert([
        {
          name: parsed.name,
          email: parsed.email,
          phone: parsed.phone,
          college: parsed.college,
          grad_year: parsed.grad_year,
          linkedin: parsed.linkedin,
          instagram: parsed.instagram,
          twitter: parsed.twitter,
          status: parsed.status,
          target_cities: parsed.target_cities,
          move_in_month: parsed.move_in_month,
          company: parsed.company,
          sector: parsed.sector,
          housing_search_type: parsed.housing_search_type,
          roommate_preferences: parsed.roommate_preferences ?? null,
          other_roommate_preference: parsed.other_roommate_preference,
          budget: parsed.budget,
          concerns: parsed.concerns,
          other_concern: parsed.other_concern,
          contact_pref: parsed.contact_pref,
          referrer_id: parsed.referrer_id ?? null,
          approval_status: "pending", // New submissions start as pending
        },
      ])
      .select("id")
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Failed to save submission." }, { status: 500 });
    }

    await supabase.from("waitlist_events").insert({
      event_type: "demand_submission",
      payload: {
        waitlist_id: data.id,
        cities: parsed.target_cities,
        status: parsed.status,
      },
    });

    // Send initial confirmation email (not approval yet)
    await sendWaitlistConfirmationEmail({
      type: "demand",
      email: parsed.email,
      cities: parsed.target_cities,
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
