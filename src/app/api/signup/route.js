import { NextResponse } from "next/server";
import { login } from "@/utils/lib";
import { createClient } from "@/utils/client";
import bcrypt from 'bcrypt';

const supabase = createClient();

export async function POST(req) {
    const body = await req.json();
    const { fullName, email, password } = body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase.from('profiles').insert({
        fullname: fullName,
        email: email,
        password: hashedPassword,
    });

    if (error) {
        return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 });
    }

    const editingPoints = 0;
    const recordingPoints = 0;
    const designPoints = 0;

    await login({ fullName, email, editingPoints, recordingPoints, designPoints });

    return NextResponse.json({ message: "Profile created successfully." });
}
