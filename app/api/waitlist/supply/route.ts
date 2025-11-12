import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { Buffer } from "buffer";
import { createSupabaseAdminClient } from "@/lib/supabaseClient";
import { sendWaitlistConfirmationEmail } from "@/lib/email";

const storageBucket = process.env.SUPABASE_STORAGE_BUCKET ?? "listing_uploads";

const supplyPayloadSchema = z.object({
  email: z.string().email(),
  address: z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : undefined)),
  city: z.string().min(1),
  rent: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => {
      if (val === undefined || val === null || val === "") return undefined;
      const num = typeof val === "number" ? val : Number(val);
      return Number.isFinite(num) && num > 0 ? num : undefined;
    }),
  rooms: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => {
      if (val === undefined || val === null || val === "") return undefined;
      const num = typeof val === "number" ? val : Number(val);
      return Number.isFinite(num) && num > 0 ? Math.floor(num) : undefined;
    }),
  listing_link: z
    .string()
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : undefined)),
  willing_to_verify: z.boolean(),
  attachment_url: z
    .string()
    .optional(),
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
        email: parsed.email,
        address: parsed.address,
        city: parsed.city,
        rent: parsed.rent,
        rooms: parsed.rooms,
        listing_link: parsed.listing_link,
        willing_to_verify: parsed.willing_to_verify,
        attachment_url: parsed.attachment_url,
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

  await sendWaitlistConfirmationEmail({
    type: "supply",
    email: parsed.email,
  });

  return NextResponse.json({ ok: true, id: data.id });
}
