import { NextResponse } from "next/server";
import { createClient } from "@/utils/client";

const supabase = createClient();

export async function POST(req) {
    try {
        const { email } = await req.json();

        const { data, error } = await supabase
            .from('profiles')
            .select()
            .match({ email })
            .single();

        if (error) {
            return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 });
        }

        if (data) {
            return NextResponse.json(
                { message: "User fetched successfully", user: data },
                { status: 200 }
            );
        }

        return NextResponse.json({ message: "No user with such email." }, { status: 404 });
    } catch (err) {
        return NextResponse.json({ message: `Server Error: ${err.message}` }, { status: 500 });
    }
}
