// src/app/pointsOrders/[id]/page.jsx
import { getSession } from "@/utils/lib";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbars/Navbar";
import PointsOrderView from "@/pages/PointsOrderView"; // Path to your client component
import { createServerClient } from '@/utils/supabase/server';

export default async function PointsOrderDetailPage({ params }) {
    const supabase = createServerClient();
    const session = await getSession(); // Your custom jose session
    const { id: orderIdFromParams } = params;

    if (!session || !session.user) {
        console.log(`❌ PointsOrderDetailPage (Server) for ID ${orderIdFromParams}: No custom session. Redirecting to /login.`);
        redirect("/login");
    }

    const currentUserFromCustomSession = session.user;
    console.log(`PointsOrderDetailPage (Server) for ID ${orderIdFromParams}: Custom session user role: ${currentUserFromCustomSession.role}, User ID from custom session: ${currentUserFromCustomSession.id}`);

    let orderData;
    let fetchErrorObject; // Store the whole error object

    try {
        // Get Supabase session to log its user ID for comparison
        const { data: { session: supabaseSessionContext } } = await supabase.auth.getSession();
        console.log(`   Supabase auth session user ID for this request (auth.uid() in RLS): ${supabaseSessionContext?.user?.id}`);
        console.log(`   Supabase auth session user role (from app_metadata for RLS): ${supabaseSessionContext?.user?.app_metadata?.role || supabaseSessionContext?.user?.app_metadata?.user_role}`);

        const { data, error } = await supabase
            .from("pointsorders")
            .select(`
                *,
                profiles (id, fullname, email)
            `)
            .eq("id", orderIdFromParams)
            .single(); // This is line 33 (approximately) that might throw PGRST116

        orderData = data;
        fetchErrorObject = error;

    } catch (catchedError) {
        console.error(`❌ PointsOrderDetailPage (Server) for ID ${orderIdFromParams}: Unexpected error during Supabase query (try-catch):`, catchedError);
        // This catch block is for errors not originating from Supabase client's error object directly
        // (e.g., network issues before Supabase can respond, or issues within createServerClient itself)
        // We'll re-throw to show Next.js error overlay for now.
        throw new Error(`Server error during data fetch: ${catchedError.message}`);
    }

    if (fetchErrorObject) {
        console.error(`❌ PointsOrderDetailPage (Server) for ID ${orderIdFromParams}: Error explicitly returned from Supabase query:`, JSON.stringify(fetchErrorObject, null, 2));
        if (fetchErrorObject.code === 'PGRST116') {
            console.warn(`   PGRST116: RLS likely denied access, or order ID ${orderIdFromParams} is invalid for the current Supabase authenticated user.`);
            // Instead of throwing, redirect or show a specific "not found / not authorized" UI
            // For debugging, let's allow it to fall through to !orderData check to see if orderData is null.
        } else {
            // For other Supabase errors, re-throw to see the Next.js error overlay
            throw new Error(`Failed to fetch order (Supabase error code ${fetchErrorObject.code}): ${fetchErrorObject.message}`);
        }
    }

    if (!orderData) {
        // This condition is met if:
        // 1. fetchErrorObject had PGRST116 (so orderData is null)
        // 2. Supabase query returned { data: null, error: null } (less common for .single() but possible if row truly doesn't exist without RLS block)
        console.warn(`❌ PointsOrderDetailPage (Server) for ID ${orderIdFromParams}: Order data is null after fetch attempt. Redirecting to /home.
        This likely means the order ID is invalid or RLS prevented access for the authenticated Supabase user.`);
        return redirect("/home"); // Or render a <NotFound /> component or <Unauthorized />
    }

    // --- RLS has passed at this point for the Supabase authenticated user ---
    // Now, perform your application-level authorization check using your custom session.
    // This ensures the user identified by your custom session should see this order,
    // even if RLS (based on Supabase session) allowed it.
    // `orderData.user` should be the Supabase auth.uid of the order's owner.
    // `currentUserFromCustomSession.id` is the ID from your custom session.
    // These two IDs should ideally match for a non-admin user if your systems are aligned.

    if (currentUserFromCustomSession.role !== 'admin' && orderData.user !== currentUserFromCustomSession.id) {
        console.warn(`❌ PointsOrderDetailPage (Server) for Order ID ${orderData.id}:
            Custom session role: '${currentUserFromCustomSession.role}' (not admin).
            Order owner Supabase ID: '${orderData.user}'.
            Custom session user ID: '${currentUserFromCustomSession.id}'.
            Mismatch or not admin. Redirecting to /home.`);
        // This indicates a potential mismatch or an attempt to access another user's order
        // even if RLS might have technically allowed it (e.g., if auth.uid() was somehow manipulated, though unlikely with server client).
        return redirect("/home"); // Or an "unauthorized" page
    }

    console.log(`PointsOrderDetailPage (Server) for ID ${orderData.id}: Successfully fetched and authorized. Passing to client component.`);

    return (
        <>
            <Navbar />
            <PointsOrderView data={orderData} user={currentUserFromCustomSession} />
        </>
    );
}