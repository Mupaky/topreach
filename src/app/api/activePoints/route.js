import { NextResponse } from "next/server";
import { getTotalActivePoints } from "@/utils/getActivePoints";

export async function GET(req) {
	const { searchParams } = new URL(req.url);
	const userId = searchParams.get("userId");
	const type = searchParams.get("type");

	if (!userId || !type) {
		return NextResponse.json({ error: "Missing userId or type" }, { status: 400 });
	}

	try {
		const total = await getTotalActivePoints(userId, type);
		return NextResponse.json({ total });
	} catch (err) {
		console.error(err);
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
