import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseClient";

export async function GET(request: Request) {
  const supabase = createSupabaseAdminClient();
  const { data: entries, error } = await supabase
    .from("supply_waitlist")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch supply waitlist:", error);
    return NextResponse.json({ error: "Failed to fetch entries" }, { status: 500 });
  }

  return NextResponse.json({ entries });
}
