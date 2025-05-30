// app/api/admin/manage-users/[userId]/route.js
import { NextResponse } from "next/server";
import { createServerClient } from "@/utils/supabase/server";
import { getSession } from "@/utils/lib";   


// PUT: Update user details (fullname, email (careful!), role)
export async function PUT(req, { params }) {
    const customSession = await getSession();
    if (!customSession || !customSession.user || customSession.user.role !== 'admin') {
        return NextResponse.json({ message: "Forbidden: Admin privileges required." }, { status: 403 });
    }
    console.log(`Admin Update User Details API - Caller (custom session) IS ADMIN. Admin ID: ${customSession.user.id}`);

    const supabase = createServerClient();


    const userIdToUpdate = params.userId;
    const body = await req.json();
    const { fullName, email, role } = body; 

    if (!userIdToUpdate) {
        return NextResponse.json({ message: "User ID is required." }, { status: 400 });
    }

    const updateDataProfiles = {};
    if (fullName !== undefined) updateDataProfiles.fullname = fullName;
    if (role !== undefined) updateDataProfiles.role = role;
    if (email !== undefined) updateDataProfiles.email = email;


    let updatedSupabaseAuthUser = null;
    if (role !== undefined) {
        const { data: { user: authUser }, error: authUserUpdateError } = await supabase.auth.admin.updateUserById(
            userIdToUpdate,
            { app_metadata: { role: role, user_role: role } }
        );
        if (authUserUpdateError) {
            console.error("Error updating user app_metadata in Supabase Auth:", authUserUpdateError);
        }
        updatedSupabaseAuthUser = authUser;
    }


    if (Object.keys(updateDataProfiles).length > 0) {
        const { data: updatedProfile, error: profileUpdateError } = await supabase
            .from('profiles')
            .update(updateDataProfiles)
            .eq('id', userIdToUpdate)
            .select("id, fullname, email, role, created_at") 
            .single();

        if (profileUpdateError) {
            console.error("Error updating profile:", profileUpdateError);
            return NextResponse.json({ message: `Error updating profile: ${profileUpdateError.message}` }, { status: 500 });
        }
        if (!updatedProfile) {
             return NextResponse.json({ message: "Profile not found or update failed." }, { status: 404 });
        }
        return NextResponse.json({ message: "User details updated.", profile: updatedProfile });
    }

    return NextResponse.json({ message: "No details provided for update.", profile: updatedSupabaseAuthUser ? {id: updatedSupabaseAuthUser.id, role: updatedSupabaseAuthUser.app_metadata.role, email: updatedSupabaseAuthUser.email, fullname: updatedSupabaseAuthUser.user_metadata.fullname || ''} : null });
}


// DELETE: Delete user
export async function DELETE(req, { params }) {
    const customSession = await getSession();
    if (!customSession || !customSession.user || customSession.user.role !== 'admin') {
        return NextResponse.json({ message: "Forbidden: Admin privileges required." }, { status: 403 });
    }
    console.log(`Admin Delete User API - Caller (custom session) IS ADMIN. Admin ID: ${customSession.user.id}`);

    const supabase = createServerClient();
    
    const userIdToDelete = params.userId;
    if (!userIdToDelete) {
        return NextResponse.json({ message: "User ID is required." }, { status: 400 });
    }

    
    const { data: user, error: deleteAuthUserError } = await supabase.auth.admin.deleteUser(userIdToDelete);

    if (deleteAuthUserError) {
        if (deleteAuthUserError.message.includes("User not found")) {
            console.warn(`User ${userIdToDelete} not found in Supabase Auth, attempting to delete from profiles only.`);
        } else {
            console.error("Error deleting user from Supabase Auth:", deleteAuthUserError);
            return NextResponse.json({ message: `Error deleting user from Auth: ${deleteAuthUserError.message}` }, { status: 500 });
        }
    }
    const { error: deleteProfileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userIdToDelete);

    if (deleteProfileError) {
        console.error("Error deleting profile (auth user might be deleted):", deleteProfileError);
        return NextResponse.json({ message: `User possibly deleted from Auth, but error deleting profile: ${deleteProfileError.message}` }, { status: 500 });
    }

    return NextResponse.json({ message: "User deleted successfully." });
}