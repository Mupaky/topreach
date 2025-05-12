// app/api/formulas/update-status/route.js
import { NextResponse } from "next/server";
import { getSession } from "@/utils/lib";
import { createServerClient } from "@/utils/supabase/server";

export async function PUT(req) {
  const supabase = createServerClient();
  const session = await getSession();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ message: "Not authorized." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { orderId, newStatus } = body;

    if (!orderId || !newStatus) {
      return NextResponse.json({ message: "Missing orderId or newStatus." }, { status: 400 });
    }

    const { error } = await supabase
      .from("formulaorders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      console.error("Error updating status:", error.message);
      return NextResponse.json({ message: "Failed to update status." }, { status: 500 });
    }

    return NextResponse.json({ message: "Status updated successfully." });
  } catch (err) {
    console.error("Unhandled error in PUT /api/formulas/update-status:", err);
    return NextResponse.json({ message: "Server error.", error: err.message }, { status: 500 });
  }
}
