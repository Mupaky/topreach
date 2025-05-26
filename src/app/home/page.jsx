// /app/home/page.jsx
import { getSession } from "@/utils/lib";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbars/Navbar";
import Home from "@/pages/Home"; // This is likely your client component for display
// IMPORTANT: Use the server client creator
import { createServerClient } from '@/utils/supabase/server'; // Or your actual path to server client factory

// DO NOT initialize client at top level for Server Components needing user context
// const supabase = createClient(); // REMOVE THIS

export default async function Page() {
    const supabase = createServerClient(); // <<< CREATE CLIENT HERE, PER REQUEST
    const session = await getSession();    // Your custom jose session
    let user, ordersDataForClient; // Renamed for clarity

    // Initialize ordersDataForClient to ensure it's always an object
    ordersDataForClient = {
        vlogOrders: [],
        tiktokOrders: [],
        thumbnailOrders: [],
        recordingOrders: [],
        pointsOrders: [],
    };

    // All other data needed by admin on this page
    let adminSpecificData = {
        allProfiles: [],
        allPointsOrders: [], // If admin needs all points orders, not just their own
        allPackages: [],    // Master list of pointsPackages
    };


    if (!session || !session.user) {
        console.log("❌ Home Page (Server): No custom session found. Redirecting to /");
        redirect("/");
    }

    user = session.user; // User from your custom jose session

    try {
        // At this point, 'supabase' is a server client authenticated via Supabase cookies.
        // Your RLS policies will now use the auth.uid() and claims from the Supabase JWT.

        if (user.role === "admin") {
            console.log("Home Page (Server): 🔐 Admin access. Fetching all relevant data...");

            // Fetch all data an admin might need, RLS will apply based on Supabase JWT
            const results = await Promise.all([
                supabase.from("vlogOrders").select("*").order("created_at", { ascending: false }),
                supabase.from("tiktokOrders").select("*").order("created_at", { ascending: false }),
                supabase.from("thumbnailOrders").select("*").order("created_at", { ascending: false }),
                supabase.from("recordings").select("*").order("created_at", { ascending: false }),
                supabase.from("profiles").select("*"), // All profiles for admin view
                supabase.from("pointsorders").select("*, profiles(id, fullname, email)").order("created_at", { ascending: false }), // All points orders for admin
                supabase.from("pointsPackages").select("*") // Master list of packages
            ]);

            const [
                vlogOrdersRes, tiktokOrdersRes, thumbnailOrdersRes, recordingOrdersRes,
                profilesRes, pointsOrdersRes, packagesRes
            ] = results;

            // Check each for errors - simplified for brevity, add proper error handling
            if (vlogOrdersRes.error) throw new Error(`Vlog Orders: ${vlogOrdersRes.error.message}`);
            if (tiktokOrdersRes.error) throw new Error(`Tiktok Orders: ${tiktokOrdersRes.error.message}`);
            if (thumbnailOrdersRes.error) throw new Error(`Thumbnail Orders: ${thumbnailOrdersRes.error.message}`);
            if (recordingOrdersRes.error) throw new Error(`Recordings: ${recordingOrdersRes.error.message}`);
            if (profilesRes.error) throw new Error(`Profiles: ${profilesRes.error.message}`);
            if (pointsOrdersRes.error) throw new Error(`Points Orders: ${pointsOrdersRes.error.message}`);
            if (packagesRes.error) throw new Error(`Packages: ${packagesRes.error.message}`);

            // Assign to ordersDataForClient for admin (they see everything if RLS allows)
            ordersDataForClient.vlogOrders = vlogOrdersRes.data || [];
            ordersDataForClient.tiktokOrders = tiktokOrdersRes.data || [];
            ordersDataForClient.thumbnailOrders = thumbnailOrdersRes.data || [];
            ordersDataForClient.recordingOrders = recordingOrdersRes.data || [];
            ordersDataForClient.pointsOrders = pointsOrdersRes.data || []; // Admin sees all points orders

            // Assign to adminSpecificData
            adminSpecificData.allProfiles = profilesRes.data || [];
            adminSpecificData.allPointsOrders = pointsOrdersRes.data || []; // Can be redundant if same as above
            adminSpecificData.allPackages = packagesRes.data || [];

            console.log("Home Page (Server): Admin data fetched.");

        } else { // Regular user
            console.log("Home Page (Server): 👤 Regular user detected:", user.email);

            // For a regular user, Supabase RLS will filter data based on auth.uid()
            // The `user.id` from your custom session needs to match `auth.uid()` from Supabase session
            // This implies your custom session's user.id IS the Supabase auth.uid()

            // If your custom session's user.id IS the Supabase auth.uid(), you can rely on RLS.
            // If not, you'd first need to get the Supabase auth.uid() if your RLS needs it explicitly beyond just session.
            // For RLS like `USING ("user" = auth.uid())`, this should work directly.

            const currentSupabaseUserId = user.id; // Assuming user.id from your custom session IS the Supabase auth.uid()

            const results = await Promise.all([
                supabase.from("vlogOrders").select("id, created_at, price, status").eq("user", currentSupabaseUserId).order("created_at", { ascending: false }),
                supabase.from("tiktokOrders").select("id, created_at, price, status").eq("user", currentSupabaseUserId).order("created_at", { ascending: false }),
                supabase.from("thumbnailOrders").select("id, created_at, price, status").eq("user", currentSupabaseUserId).order("created_at", { ascending: false }),
                supabase.from("recordings").select("id, created_at, price, status").eq("user", currentSupabaseUserId).order("created_at", { ascending: false }),
                supabase.from("pointsorders").select("id, created_at, price, status, editingPoints, recordingPoints, designPoints, lifespan").eq("user", currentSupabaseUserId).order("created_at", { ascending: false })
            ]);

            const [
                vlogOrdersRes, tiktokOrdersRes, thumbnailOrdersRes, recordingOrdersRes, pointsOrdersRes
            ] = results;

            // Check each for errors
            if (vlogOrdersRes.error) throw new Error(`User Vlog Orders: ${vlogOrdersRes.error.message}`);
            if (tiktokOrdersRes.error) throw new Error(`User Tiktok Orders: ${tiktokOrdersRes.error.message}`);
            if (thumbnailOrdersRes.error) throw new Error(`User Thumbnail Orders: ${thumbnailOrdersRes.error.message}`);
            if (recordingOrdersRes.error) throw new Error(`User Recordings: ${recordingOrdersRes.error.message}`);
            if (pointsOrdersRes.error) throw new Error(`User Points Orders: ${pointsOrdersRes.error.message}`);


            ordersDataForClient.vlogOrders = vlogOrdersRes.data || [];
            ordersDataForClient.tiktokOrders = tiktokOrdersRes.data || [];
            ordersDataForClient.thumbnailOrders = thumbnailOrdersRes.data || [];
            ordersDataForClient.recordingOrders = recordingOrdersRes.data || [];
            ordersDataForClient.pointsOrders = pointsOrdersRes.data || [];

            console.log("Home Page (Server): User-specific data fetched.");
        }
    } catch (err) {
        console.error("Home Page (Server): ❌ Error fetching data:", err.message);
        // You might want to pass this error to the client component to display
        // For now, ordersDataForClient will remain with its empty array defaults
        // Consider setting an error prop: ordersDataForClient.fetchError = err.message;
    }

    // Pass all necessary data to the Home client component
    return (
        <>
            <Navbar /> {/* Assuming Navbar can also use getSession or is a client component */}
            <Home
                user={user} // User from custom jose session
                orders={ordersDataForClient}
                // Pass admin-specific data if the Home component needs to differentiate
                adminData={user.role === "admin" ? adminSpecificData : null}
            />
        </>
    );
}