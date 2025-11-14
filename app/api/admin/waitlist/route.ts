import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseClient";

export async function GET(request: Request) {
  try {
    const supabase = createSupabaseAdminClient();

    // Fetch all demand waitlist entries, ordered by creation date
    const { data: entries, error } = await supabase
      .from("demand_waitlist")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Failed to fetch entries" }, { status: 500 });
    }

    return NextResponse.json({ entries });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
