import { NextResponse } from "next/server";
import { getTotalActivePoints } from "@/utils/getActivePoints";
import { createServerClient } from "@/utils/supabase/server";

export async function GET(req) {
	const supabase = createServerClient();
	const { searchParams } = new URL(req.url);
	const userId = searchParams.get("userId");
	const type = searchParams.get("type");

	console.log(`[API activePoints Route] Request for userId: ${userId}, type: ${type}`);

	if (!userId || !type) {
		return NextResponse.json({ error: "Missing userId or type" }, { status: 400 });
	}

	try {
		const total = await getTotalActivePoints(supabase, userId, type);
		return NextResponse.json({ total });
	} catch (err) {
		console.error(err);
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
