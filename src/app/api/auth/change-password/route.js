// app/api/auth/change-password/route.js
import { NextResponse } from "next/server";
import { createServerClient } from "@/utils/supabase/server"; 
import { getSession } from "@/utils/lib"; 
import bcrypt from 'bcrypt';

export async function POST(req) {
    const supabase = createServerClient(); 

    try {
        const customSessionPayload = await getSession();

        if (!customSessionPayload || !customSessionPayload.user || !customSessionPayload.user.id) {
            return NextResponse.json({ message: "Authentication required (invalid or missing session)." }, { status: 401 });
        }
        
        const customSessionUserId = customSessionPayload.user.id; 

        console.log(`Change Password API - Authenticated via custom getSession. User ID: ${customSessionUserId}`);

        const body = await req.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ message: "Current password and new password are required." }, { status: 400 });
        }
        if (newPassword.length < 6) {
            return NextResponse.json({ message: "New password must be at least 6 characters." }, { status: 400 });
        }

        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('id, password') 
            .eq('id', customSessionUserId) 
            .single();

        if (fetchError || !profile) {
            console.error(`Change Password API - Profile not found for custom session user ID ${customSessionUserId} or DB error:`, fetchError);
            return NextResponse.json({ message: "User profile not found or database error." }, { status: 404 });
        }

        const currentPasswordMatches = await bcrypt.compare(currentPassword, profile.password);
        if (!currentPasswordMatches) {
            return NextResponse.json({ message: "Текущата парола е грешна." }, { status: 401 });
        }

        const newHashedPassword = await bcrypt.hash(newPassword, 10);
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ password: newHashedPassword })
            .eq('id', customSessionUserId);

        if (updateError) {
            console.error("Change Password API - Error updating password in profiles table:", updateError);
            return NextResponse.json({ message: `Database error updating password: ${updateError.message}` }, { status: 500 });
        }

        return NextResponse.json({ message: "Паролата е сменена успешно!" });

    } catch (error) {
        console.error("Change Password API - Catch block error:", error);
        if (error instanceof SyntaxError) {
            return NextResponse.json({ message: "Invalid JSON in request body." }, { status: 400 });
        }
        return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
    }
}