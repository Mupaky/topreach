// app/admin/points-orders/page.jsx
// REMOVE "use client";  <-- This makes it a Server Component

import React from "react";
import { getSession } from "@/utils/lib"; // Your custom 'jose' session utility
import { createServerClient } from "@/utils/supabase/server"; // Supabase server client
import AdminLayout from "@/components/dashboard/AdminLayout";
import AdminPointsOrdersClient from "./AdminPointsOrdersClient"; // The Client Component to display UI
import { redirect } from "next/navigation";

// Note: No top-level `const supabase = createServerClient();` here,
// it should be inside the async function if used, or just once.

export default async function AdminPointsOrdersPage() { // Can be async
    const supabase = createServerClient(); // Initialize Supabase server client for this request
    const session = await getSession();    // Get your custom 'jose' session

    if (!session || !session.user) {
        console.log("AdminPointsOrdersPage (Server): No custom session, redirecting to /login.");
        redirect("/login"); // Or your designated admin login page
    }

    // This role check is based on your custom 'jose' session.
    // The Supabase RLS will rely on the Supabase JWT's role for actual data access.
    // Ensure these are consistent for your admin users.
    if (session.user.role !== 'admin') {
        console.log(`AdminPointsOrdersPage (Server): Custom session role is '${session.user.role}', not 'admin'. Redirecting to /.`);
        redirect("/"); // Or a "not authorized" page
    }
    console.log("AdminPointsOrdersPage (Server): Custom session role is 'admin'. Proceeding to fetch data.");

    let initialAllPointsOrders = [];
    let initialAllProfiles = [];
    let serverFetchError = null;

    try {
        // Since createServerClient() uses the request's Supabase cookies,
        // and we've established (via custom session) that the user *should* be an admin,
        // these Supabase calls should be authenticated as an admin, and RLS should pass.

        console.log("AdminPointsOrdersPage (Server): Fetching pointsorders with profile details...");
        // Fetch pointsorders and join with profiles if there's a user_id FK in pointsorders
        // For example, if pointsorders.user_id references profiles.id:
        const { data: ordersData, error: ordersError } = await supabase
            .from("pointsorders")
            .select(`
                *,
                profiles (
                    id,
                    fullname,
                    email
                )
            `)
            .order("created_at", { ascending: false });

        if (ordersError) {
            console.error("AdminPointsOrdersPage (Server): Error fetching pointsorders:", ordersError);
            throw ordersError; // Propagate error to be caught by the catch block
        }
        initialAllPointsOrders = ordersData || [];
        console.log(`AdminPointsOrdersPage (Server): Fetched ${initialAllPointsOrders.length} pointsorders.`);

        // Fetch all profiles for dropdowns/forms (if needed separately, or rely on joined data)
        console.log("AdminPointsOrdersPage (Server): Fetching all profiles for forms...");
        const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("id, fullname, email")
            .order("fullname", { ascending: true });

        if (profilesError) {
            console.error("AdminPointsOrdersPage (Server): Error fetching all profiles:", profilesError);
            throw profilesError;
        }
        initialAllProfiles = profilesData || [];
        console.log(`AdminPointsOrdersPage (Server): Fetched ${initialAllProfiles.length} profiles for forms.`);

    } catch (err) {
        console.error("AdminPointsOrdersPage (Server): Catch block - Error during server-side data fetch:", err.message);
        serverFetchError = `⚠️ Грешка при зареждане на данните от сървъра: ${err.message}`;
        // Ensure client component receives empty arrays if data fetch fails
        initialAllPointsOrders = [];
        initialAllProfiles = [];
    }

    return (
        <AdminLayout role={session.user.role}> {/* Pass role from your custom 'jose' session */}
            <AdminPointsOrdersClient
                initialUser={session.user} // User object from your custom 'jose' session
                initialAllPointsOrders={initialAllPointsOrders}
                initialAllProfiles={initialAllProfiles} // Profiles specifically for dropdowns
                serverFetchError={serverFetchError}
            />
        </AdminLayout>
    );
}