// app/api/admin/formula-orders/[orderId]/notes/route.js
import { NextResponse } from "next/server";
import { createServerClient } from "@/utils/supabase/server";
import { getSession } from "@/utils/lib";

export async function PUT(req, { params }) { 
  const customSession = await getSession();
  if (
    !customSession ||
    !customSession.user ||
    customSession.user.role !== "admin"
  ) {
    console.warn("API /notes PUT: Admin check failed via custom session.");
    return NextResponse.json(
      { message: "Forbidden: Admin privileges required." },
      { status: 403 }
    );
  }

  const orderId = params.orderId;

  if (!orderId) {
    console.error(
      "API /notes PUT: Order ID missing from route parameters. `params` object:",
      params
    );
    return NextResponse.json(
      { message: "Order ID is required from route parameters." },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  try {
    const { admin_notes } = await req.json();

    if (admin_notes === undefined) {
      console.warn(
        `API /notes PUT: admin_notes field missing in body for order ${orderId}.`
      );
      return NextResponse.json(
        { message: "admin_notes field is required in request body." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("formulaorders")
      .update({ admin_notes })
      .eq("id", orderId)
      .select("id, admin_notes")
      .single();

    if (error) {
      console.error(
        `API /notes PUT: Supabase error updating admin_notes for order ${orderId}:`,
        JSON.stringify(error, null, 2)
      );

      if (error.code === "PGRST116") {
        return NextResponse.json(
          {
            message: `Order ${orderId} not found or RLS access denied for update.`,
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { message: `Database error: ${error.message}`, details: error.details },
        { status: 500 }
      );
    }

    if (!data) {
      console.warn(
        `API /notes PUT: Order ${orderId} not found after update attempt (no data returned, though no direct Supabase error).`
      );
      return NextResponse.json(
        { message: `Order ${orderId} not found after update attempt.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Admin notes updated successfully.",
      updatedOrder: data,
    });

  } catch (error) {
    console.error(`API /notes PUT: Catch block error for order ${orderId}:`, error);

    if (error instanceof SyntaxError) { 
      return NextResponse.json(
        { message: "Invalid JSON in request body." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Server error during notes update.", error: error.message },
      { status: 500 }
    );
  }
}