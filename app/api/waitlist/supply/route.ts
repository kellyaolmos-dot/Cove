import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { Buffer } from "buffer";
import { createSupabaseAdminClient } from "@/lib/supabaseClient";
import { sendWaitlistConfirmationEmail } from "@/lib/email";

const storageBucket = process.env.SUPABASE_STORAGE_BUCKET ?? "listing_uploads";

const supplyPayloadSchema = z.object({
  // Personal info
  name: z
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

  // Listing info
  email: z.string().email(),
  address: z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : undefined)),
  city: z.string().min(1),
  rent: z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : undefined)),
  rooms: z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : undefined)),
  listing_link: z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : undefined)),
  listing_photos: z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : undefined)),

  // Concerns
  concerns: z.array(z.string()).min(1),
  other_concern: z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : undefined)),

  // Contact
  contact_pref: z.array(z.enum(["email", "text"])).min(1),
  phone: z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : undefined)),
  willing_to_verify: z.boolean(),
});

type SupplyPayload = z.infer<typeof supplyPayloadSchema>;

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let body: any = {};
    let attachmentFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      attachmentFile = formData.get("attachment") as File | null;
      body = {
        email: (formData.get("email") as string) ?? "",
        address: formData.get("address") as string | undefined,
        city: (formData.get("city") as string) ?? "",
        rent: formData.get("rent") as string | undefined,
        rooms: formData.get("rooms") as string | undefined,
        listing_link: formData.get("listing_link") as string | undefined,
        willing_to_verify: formData.get("willing_to_verify") === "true",
      };
    } else {
      const json = await request.json();
      body = {
        ...json,
        willing_to_verify: Boolean(json.willing_to_verify),
      };
    }

    let attachmentUrl: string | undefined;
    if (attachmentFile && attachmentFile.size > 0) {
      const supabase = createSupabaseAdminClient();
      const arrayBuffer = await attachmentFile.arrayBuffer();
      const filePath = `supply/${randomUUID()}-${attachmentFile.name}`;
      const { error: uploadError } = await supabase.storage.from(storageBucket).upload(
        filePath,
        Buffer.from(arrayBuffer),
        {
          contentType: attachmentFile.type,
          upsert: true,
        }
      );

      if (uploadError) {
        console.error(uploadError);
      } else {
        attachmentUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${storageBucket}/${filePath}`;
      }

      // Reuse Supabase client for inserts
      const parsed = supplyPayloadSchema.parse({
        ...body,
        attachment_url: attachmentUrl,
      });

      return await saveSupplySubmission(parsed);
    }

    const parsed = supplyPayloadSchema.parse({
      ...body,
      attachment_url: attachmentUrl,
    });

    return await saveSupplySubmission(parsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}

async function saveSupplySubmission(parsed: SupplyPayload) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("supply_waitlist")
    .insert([
      {
        name: parsed.name,
        college: parsed.college,
        grad_year: parsed.grad_year,
        linkedin: parsed.linkedin,
        instagram: parsed.instagram,
        twitter: parsed.twitter,
        email: parsed.email,
        address: parsed.address,
        city: parsed.city,
        rent: parsed.rent,
        rooms: parsed.rooms,
        listing_link: parsed.listing_link,
        listing_photos: parsed.listing_photos,
        concerns: parsed.concerns,
        other_concern: parsed.other_concern,
        contact_pref: parsed.contact_pref,
        phone: parsed.phone,
        willing_to_verify: parsed.willing_to_verify,
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
    event_type: "supply_submission",
    payload: {
      waitlist_id: data.id,
      willing_to_verify: parsed.willing_to_verify,
      city: parsed.city,
    },
  });

  // Send initial confirmation email (not approval yet)
  await sendWaitlistConfirmationEmail({
    type: "supply",
    email: parsed.email,
  });

  return NextResponse.json({ ok: true, id: data.id });
}
