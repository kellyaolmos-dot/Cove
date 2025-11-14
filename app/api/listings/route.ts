import { NextRequest, NextResponse } from "next/server";
import { mockListings } from "@/lib/listings-data";

export async function GET(request: NextRequest) {
  try {
    // For now, return mock data
    // In the future, fetch from Supabase:
    // const supabase = createSupabaseAdminClient();
    // const { data, error } = await supabase.from("listings").select("*");

    return NextResponse.json({
      success: true,
      listings: mockListings,
      count: mockListings.length,
    });
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}
