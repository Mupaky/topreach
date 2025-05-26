// app/admin/packages/page.jsx
import { getSession } from "@/utils/lib";
import AdminLayout from "@/components/dashboard/AdminLayout";
import AdminPackagesClient from "./AdminPackagesClient";
import { redirect } from "next/navigation";
import { createServerClient } from '@/utils/supabase/server'; // Use server client

export default async function AdminPackagesPageServer() {
    const supabase = createServerClient(); // Initialize server client
    const session = await getSession(); // Or use supabase.auth.getSession() with server client

    if (!session || !session.user) {
        console.log("AdminPackagesPage (Server): No session, redirecting to login.");
        redirect("/login");
    }

    // Ensure the role check uses the same source of truth as your RLS (e.g., JWT claim if available, or profile lookup)
    // For simplicity, if session.user.role is reliable from getSession():
    if (session.user.role !== 'admin') {
        console.log("AdminPackagesPage (Server): User is not admin, redirecting.");
        redirect("/");
    }

    // Fetch packages on the server IF the user is an admin
    let initialPackages = [];
    let fetchErrorMsg = null;

    // The RLS policy for SELECT on pointsPackages allows admins to read.
    // So, this call should succeed if the server client is correctly authenticated as an admin.
    // (The createServerClient should handle this based on the session/cookies)
    const { data, error } = await supabase
        .from("pointsPackages")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("AdminPackagesPage (Server): Failed to fetch packages:", error.message);
        fetchErrorMsg = "⚠️ Грешка при зареждане на пакетите от сървъра.";
        // Don't necessarily redirect, can show an error in the client
    } else {
        initialPackages = data || [];
    }

    return (
        <AdminLayout role={session.user.role}>
            <AdminPackagesClient
                initialUser={session.user}
                initialPackages={initialPackages} // Pass fetched packages
                fetchErrorMsg={fetchErrorMsg}   // Pass any fetch error
            />
        </AdminLayout>
    );
}