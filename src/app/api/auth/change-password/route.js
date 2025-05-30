// app/api/auth/change-password/route.js
import { NextResponse } from "next/server";
import { createServerClient } from "@/utils/supabase/server"; // For DB access
import { getSession, decrypt } from "@/utils/lib"; // Your custom session utilities
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers'; // To read your custom session cookie

export async function POST(req) {
    const supabase = createServerClient(); // Request-scoped for DB operations

    try {
        // 1. Get user from your custom 'jose' session
        const cookieStore = cookies();
        const rawSessionCookie = cookieStore.get("session")?.value;

        if (!rawSessionCookie) {
            return NextResponse.json({ message: "Authentication required (no session cookie)." }, { status: 401 });
        }

        let sessionPayload;
        try {
            sessionPayload = await decrypt(rawSessionCookie); // Decrypt your jose JWT
        } catch (e) {
            console.error("Change Password API - Invalid session cookie:", e);
            return NextResponse.json({ message: "Invalid session." }, { status: 401 });
        }
        
        if (!sessionPayload || !sessionPayload.user || !sessionPayload.user.id) {
            return NextResponse.json({ message: "Authentication required (invalid session payload)." }, { status: 401 });
        }
        
        const customSessionUserId = sessionPayload.user.id; // ID from your custom JWT
        const customSessionUserEmail = sessionPayload.user.email;


        const body = await req.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ message: "Current password and new password are required." }, { status: 400 });
        }
        if (newPassword.length < 6) { // Your password policy
            return NextResponse.json({ message: "New password must be at least 6 characters." }, { status: 400 });
        }

        // 2. Fetch user's current hashed password from your `profiles` table
        // using the ID from your custom session to ensure they are changing their own password.
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('id, password') // Select current hashed password and ID
            .eq('id', customSessionUserId) // Match based on ID from your custom session
            .single();

        if (fetchError || !profile) {
            console.error(`Change Password API - Profile not found for custom session user ID ${customSessionUserId} or DB error:`, fetchError);
            return NextResponse.json({ message: "User profile not found or database error." }, { status: 404 });
        }

        // 3. Compare provided currentPassword with stored hash
        const currentPasswordMatches = await bcrypt.compare(currentPassword, profile.password);
        if (!currentPasswordMatches) {
            return NextResponse.json({ message: "Текущата парола е грешна." }, { status: 401 });
        }

        // 4. Hash the new password
        const newHashedPassword = await bcrypt.hash(newPassword, 10);

        // 5. Update the password in your `profiles` table
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ password: newHashedPassword })
            .eq('id', customSessionUserId); // Ensure updating the correct user

        if (updateError) {
            console.error("Change Password API - Error updating password in profiles table:", updateError);
            return NextResponse.json({ message: `Database error updating password: ${updateError.message}` }, { status: 500 });
        }

        // Optionally: If you want to invalidate other sessions for this user,
        // you might need more complex session management (e.g., a session version number in your JWT).
        // For now, this just updates the password. The current custom 'jose' session cookie remains valid
        // until it expires or the user logs out (which clears it).

        return NextResponse.json({ message: "Паролата е сменена успешно!" });

    } catch (error) {
        console.error("Change Password API - Catch block error:", error);
        if (error instanceof SyntaxError) {
            return NextResponse.json({ message: "Invalid JSON in request body." }, { status: 400 });
        }
        return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
    }
}