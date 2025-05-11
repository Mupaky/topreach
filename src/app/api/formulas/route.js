// app/api/formulas/route.js
import { NextResponse } from "next/server";
import { createClient } from "@/utils/client";

const supabase = createClient();

export async function POST(req) {
	try {
		const body = await req.json();

		if (!body || !body.name || !body.fields) {
			return NextResponse.json(
				{ message: "Missing required formula data." },
				{ status: 400 }
			);
		}

		const { data, error } = await supabase
			.from("priceFormulas")
			.insert([body])
			.select()
			.single();

		if (error) {
			console.error("Supabase Insert Error:", error);
			return NextResponse.json(
				{ message: error.message || "Failed to save the formula." },
				{ status: 500 }
			);
		}

		return NextResponse.json(
			{ success: true, formula: data },
			{ status: 201 }
		);
	} catch (err) {
		console.error("Unhandled error:", err);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 }
		);
	}
}