import { NextResponse } from "next/server";
import { login } from "@/utils/lib";
import { createClient } from "@/utils/client";
import bcrypt from 'bcrypt';

const supabase = createClient();

export async function POST(req) {
    const body = await req.json();
    const { email, password } = body;

    const { data, error } = await supabase
        .from('profiles')
        .select()
        .eq('email', email)
        .single();

    if (!data) {
        return NextResponse.json({ message: `Не съществува акаунт с този имейл.` }, { status: 404 });
    }

    if (error) {
        return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 });
    }

    const passwordMatches = await bcrypt.compare(password, data.password);
    if (!passwordMatches) {
        return NextResponse.json({ message: `Грешен имейл или парола.` }, { status: 401 });
    }

    const fullName = data.fullname;
    const editingPoints = data.editingPoints;
    const recordingPoints = data.recordingPoints;
    const designPoints = data.designPoints;

    await login({ fullName, email, editingPoints, recordingPoints, designPoints });

    return NextResponse.json({ message: "Logged in successfully." });
}
