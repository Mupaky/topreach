import { NextResponse } from "next/server";
import { createClient } from "@/utils/client";

const supabase = createClient();

export async function GET(request) {
    try {
      const { searchParams } = new URL(request.url);
      const date = searchParams.get("date");
  
      console.log("date: ", date);
  
      const { data, error } = await supabase
        .from("recordings")
        .select()
        .eq("date", date);
  
      if (error) {
        return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 });
      }
  
      return NextResponse.json(
        {
          message: "Bookings fetched successfully",
          bookings: data,
        },
        { status: 200 }
      );
    } catch (err) {
      return NextResponse.json({ message: `Server Error: ${err.message}` }, { status: 500 });
    }
  }
  