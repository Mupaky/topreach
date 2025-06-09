// src/app/pointsOrders/[id]/page.jsx
import { getSession } from "@/utils/lib";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbars/Navbar";
import PointsOrderView from "@/pages/PointsOrderView"; 
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
    let fetchErrorObject; 

    try {
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
            .single(); 

        orderData = data;
        fetchErrorObject = error;

    } catch (catchedError) {
        console.error(`❌ PointsOrderDetailPage (Server) for ID ${orderIdFromParams}: Unexpected error during Supabase query (try-catch):`, catchedError);
        throw new Error(`Server error during data fetch: ${catchedError.message}`);
    }

    if (fetchErrorObject) {
        console.error(`❌ PointsOrderDetailPage (Server) for ID ${orderIdFromParams}: Error explicitly returned from Supabase query:`, JSON.stringify(fetchErrorObject, null, 2));
        if (fetchErrorObject.code === 'PGRST116') {
            console.warn(`   PGRST116: RLS likely denied access, or order ID ${orderIdFromParams} is invalid for the current Supabase authenticated user.`);
        } else {
            throw new Error(`Failed to fetch order (Supabase error code ${fetchErrorObject.code}): ${fetchErrorObject.message}`);
        }
    }

    if (!orderData) {
        console.warn(`❌ PointsOrderDetailPage (Server) for ID ${orderIdFromParams}: Order data is null after fetch attempt. Redirecting to /home.
        This likely means the order ID is invalid or RLS prevented access for the authenticated Supabase user.`);
        return redirect("/home"); // Or render a <NotFound /> component or <Unauthorized />
    }

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