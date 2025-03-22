import { logout } from "@/utils/lib";
import { NextResponse } from "next/server";

export async function POST() {
    await logout();

    return NextResponse.json({ message: "User logged out successfully." });
}
