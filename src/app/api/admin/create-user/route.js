// app/api/admin/create-user/route.js
import { NextResponse } from "next/server";
import { createServerClient } from "@/utils/supabase/server";
import { getSession } from "@/utils/lib";
import bcrypt from 'bcrypt';
// You might not need your custom 'login' lib here if admin isn't auto-logged in as new user

export async function POST(req) {

    // Step 1: Verify if the current user making this API request is an admin
    // using YOUR custom 'jose' session.
    const customSession = await getSession(); // Uses cookies() and decrypt() internally

    if (!customSession || !customSession.user) {
        return NextResponse.json({ message: "Authentication required (no custom session)." }, { status: 401 });
    }

    if (customSession.user.role !== 'admin') {
        console.log(`Admin Create User API - Caller (from custom session) is NOT ADMIN. Role: ${customSession.user.role}`);
        return NextResponse.json({ message: "Forbidden: Admin privileges required." }, { status: 403 });
    }

    console.log(`Admin Create User API - Caller (from custom session) IS ADMIN. User ID: ${customSession.user.id}`);


    const supabase = createServerClient();

    // 2. Proceed with creating the new user
    const body = await req.json();
    const { fullName, email, password , role: newUserRole = 'user' } = body; 

    if (!fullName || !email || !password) {
        return NextResponse.json({ message: "Missing fullName, email, or password for the new user." }, { status: 400 });
    }
    if (password.length < 6) {
        return NextResponse.json({ message: "New user's password must be at least 6 characters." }, { status: 400 });
    }

    // 3. Create the user in Supabase Auth first
    // This is important so their auth.users entry exists.
    // We are NOT logging this new user in. The admin is performing the action.
    const { data: newAuthUser, error: signUpError } = await supabase.auth.admin.createUser({ // Use admin.createUser
        email: email,
        password: password,
        email_confirm: true, // Or false if you don't want them to confirm via email initially
        user_metadata: { full_name: fullName }, // Optional: good place for name
        app_metadata: { role: newUserRole } // If setting role via app_metadata for Supabase JWT
    });

    if (signUpError) {
        console.error("Admin Create User - Supabase Auth createUser error:", signUpError);
        return NextResponse.json({ message: signUpError.message || "Failed to create user in Supabase Auth." }, { status: 400 });
    }

    if (!newAuthUser || !newAuthUser.user) {
        console.error("Admin Create User - Supabase Auth createUser: No user data returned.");
        return NextResponse.json({ message: "Failed to create user (no user object returned)." }, { status: 500 });
    }

    // 4. Hash the password for your `profiles` table
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create the corresponding entry in your `public.profiles` table
    const { data: newProfile, error: profileInsertError } = await supabase
        .from('profiles')
        .insert({
            id: newAuthUser.user.id, // Use the ID from Supabase Auth user
            fullname: fullName,
            email: email,
            password: hashedPassword,
            role: newUserRole, // Default role to 'user', admin can change later if needed via user management
            editingPoints: 0, // Default points
            recordingPoints: 0,
            designPoints: 0,
        })
        .select('id, fullname, email, role') // Select some data to return
        .single();

    if (profileInsertError) {
        console.error("Admin Create User - Error inserting into profiles table:", profileInsertError);
        // CRITICAL: If profile insert fails, you should ideally delete the Supabase Auth user
        // to prevent orphaned auth users. This requires service_role or admin privileges for the client.
        const { error: deleteUserError } = await supabase.auth.admin.deleteUser(newAuthUser.user.id);
        if (deleteUserError) console.error("Failed to delete orphaned Supabase Auth user:", deleteUserError);
        return NextResponse.json({ message: `User created in Auth, but profile insert failed: ${profileInsertError.message}` }, { status: 500 });
    }

    return NextResponse.json({ message: "User created successfully by admin.", profile: newProfile }, { status: 201 });
}