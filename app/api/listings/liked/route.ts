import { NextRequest, NextResponse } from "next/server";
// import { createSupabaseAdminClient } from "@/lib/supabaseClient";

// GET - Fetch liked listings
export async function GET(request: NextRequest) {
  try {
    // For now, this endpoint expects the client to manage likes in localStorage
    // In the future, when users have accounts:
    // const supabase = createSupabaseAdminClient();
    // const userId = request.headers.get("user-id"); // or get from session
    // const { data, error } = await supabase
    //   .from("liked_listings")
    //   .select("listing_id, listings(*)")
    //   .eq("user_id", userId);

    return NextResponse.json({
      success: true,
      message: "Client-side localStorage is being used for likes",
    });
  } catch (error) {
    console.error("Error fetching liked listings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch liked listings" },
      { status: 500 }
    );
  }
}

// POST - Add a liked listing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listingId, userId } = body;

    // Validate input
    if (!listingId) {
      return NextResponse.json(
        { success: false, error: "Listing ID is required" },
        { status: 400 }
      );
    }

    // For now, return success
    // In the future, save to database:
    // const supabase = createSupabaseAdminClient();
    // const { data, error } = await supabase
    //   .from("liked_listings")
    //   .insert({
    //     listing_id: listingId,
    //     user_id: userId || null, // null if no user session
    //   });

    return NextResponse.json({
      success: true,
      message: "Like saved (client-side for now)",
      listingId,
    });
  } catch (error) {
    console.error("Error saving liked listing:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save liked listing" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a liked listing
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get("listingId");

    if (!listingId) {
      return NextResponse.json(
        { success: false, error: "Listing ID is required" },
        { status: 400 }
      );
    }

    // For now, return success
    // In the future, delete from database:
    // const supabase = createSupabaseAdminClient();
    // const userId = request.headers.get("user-id"); // or get from session
    // const { error } = await supabase
    //   .from("liked_listings")
    //   .delete()
    //   .eq("listing_id", listingId)
    //   .eq("user_id", userId);

    return NextResponse.json({
      success: true,
      message: "Like removed (client-side for now)",
      listingId,
    });
  } catch (error) {
    console.error("Error removing liked listing:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove liked listing" },
      { status: 500 }
    );
  }
}
