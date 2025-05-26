// app/api/subscriptions/route.js
import { createServerClient } from "@/utils/supabase/server";
import { getSession } from "@/utils/lib";
import { NextResponse } from "next/server";

export async function POST(req) {
  const supabase = createServerClient();
  const session = await getSession();

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { plan, price, status, end_date } = await req.json();

  const { data, error } = await supabase
    .from("subscriptions")
    .insert([
      {
        user_id: session.user.id,
        plan,
        price,
        status: status || "active",
        start_date: new Date().toISOString(),
        end_date,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json({ message: "Failed to create subscription." }, { status: 500 });
  }

  return NextResponse.json({ subscription: data }, { status: 201 });
}
