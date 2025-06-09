// app/profile/page.jsx
// This IS a Server Component (no "use client")

import { getSession } from "@/utils/lib";
import { redirect } from "next/navigation";
import { createServerClient } from "@/utils/supabase/server"; // <<< USE SERVER CLIENT
// import Navbar from "@/components/navbars/Navbar"; // Already in RootLayout
import ProfileClientComponent from "@/pages/Profile"; // Renamed for clarity, assuming this is your client UI

// REMOVE: const supabase = createClient(); // Do not use global client from @/utils/client here

export default async function UserProfilePage() { // Renamed function for convention
    const supabase = createServerClient(); // <<< Create request-scoped server client
    const session = await getSession();    // Your custom 'jose' session

    if (!session || !session.user) {
        console.log("UserProfilePage (Server): No custom session, redirecting to /login.");
        redirect("/login");
    }

    const currentUserFromCustomSession = session.user;
    console.log("UserProfilePage (Server) - Custom session user:", JSON.stringify(currentUserFromCustomSession, null, 2));

    let pointsOrdersData = [];
    let fetchErrorMsg = null;

    try {
        // currentUserFromCustomSession.id should be the Supabase auth.users.id
        // RLS on pointsorders table: USING ("user" = auth.uid())
        // The `supabase` client here is authenticated via Supabase cookies, so auth.uid() will be set.
        console.log(`UserProfilePage (Server): Fetching pointsorders for user ID: ${currentUserFromCustomSession.id}`);
        const { data, error } = await supabase
            .from("pointsorders")
            .select("id, created_at, editingPoints, recordingPoints, designPoints, consultingPoints, lifespan, status, price") // Select necessary fields
            .eq("user", currentUserFromCustomSession.id) // Filter by user ID from your custom session
            .order("created_at", { ascending: false });

        if (error) {
            console.error("UserProfilePage (Server): Error fetching pointsorders:", error);
            fetchErrorMsg = `Грешка при зареждане на поръчките: ${error.message}`;
        } else {
            pointsOrdersData = data || [];
            console.log(`UserProfilePage (Server): Fetched ${pointsOrdersData.length} pointsorders.`);
        }
    } catch (err) {
        console.error("UserProfilePage (Server): Catch block error during data fetch:", err.message);
        fetchErrorMsg = `Сървърна грешка: ${err.message}`;
    }

    return (
        <>
            {/* Navbar is handled by RootLayout */}
            <ProfileClientComponent
                user={currentUserFromCustomSession}
                pointsOrders={pointsOrdersData}
                initialError={fetchErrorMsg}
            />
        </>
    );
}