// app/api/admin/manage-users/[userId]/change-password/route.js
import { NextResponse } from "next/server";
import { createServerClient } from "@/utils/supabase/server";
import { getSession } from "@/utils/lib";      
import bcrypt from 'bcrypt';

// Helper to check if caller is admin
async function isAdmin(supabase) {
    
}

export async function POST(req, { params }) {

    const customSession = await getSession();

    if (!customSession || !customSession.user) {
        return NextResponse.json({ message: "Authentication required (no custom session)." }, { status: 401 });
    }

    if (customSession.user.role !== 'admin') {
        console.log(`Admin Change User Password API - Caller (from custom session) IS NOT ADMIN. Role: ${customSession.user.role}`);
        return NextResponse.json({ message: "Forbidden: Admin privileges required." }, { status: 403 });
    }
    console.log(`Admin Change User Password API - Caller (from custom session) IS ADMIN. Admin ID: ${customSession.user.id}`);

    const supabase = createServerClient();
    

    const userIdToUpdate = params.userId;
    const body = await req.json();
    const { newPassword } = body;

    if (!userIdToUpdate) {
        return NextResponse.json({ message: "User ID is required." }, { status: 400 });
    }
    if (!newPassword || newPassword.length < 6) {
        return NextResponse.json({ message: "New password must be at least 6 characters." }, { status: 400 });
    }

    // Update password in Supabase Auth
    const { data: updatedUser, error: authUpdateError } = await supabase.auth.admin.updateUserById(
        userIdToUpdate,
        { password: newPassword }
    );

    if (authUpdateError) {
        console.error("Error updating user password in Supabase Auth by admin:", authUpdateError);
        return NextResponse.json({ message: `Error updating Auth password: ${authUpdateError.message}` }, { status: 500 });
    }

    // Update hashed password in your `profiles` table
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ password: newHashedPassword })
        .eq('id', userIdToUpdate);

    if (profileUpdateError) {
        console.error("Error updating hashed password in profiles table by admin:", profileUpdateError);
        // At this point, Supabase Auth password IS changed, but your hash is not. This is a desync.
        return NextResponse.json({ message: `Auth password updated, but error updating profile hash: ${profileUpdateError.message}` }, { status: 500 });
    }

    return NextResponse.json({ message: "User password changed successfully by admin." });
}