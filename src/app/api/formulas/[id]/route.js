import { NextResponse } from "next/server";
import { createClient } from "@/utils/client";

const supabase = createClient();

export async function DELETE(_, { params }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ message: "Missing formula ID" }, { status: 400 });
  }

  const { error } = await supabase.from("priceFormulas").delete().eq("id", id);

  if (error) {
    console.error("Supabase Delete Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function PUT(req, { params }) {
  const { id } = params;
  const body = await req.json();

  if (!id || !body) {
    return NextResponse.json({ message: "Missing ID or body" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("priceFormulas")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Supabase Update Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, formula: data });
}
