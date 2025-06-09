// /app/home/page.jsx
import { getSession } from "@/utils/lib";
import { redirect } from "next/navigation";
import Home from "@/pages/Home"; 
import { createServerClient } from '@/utils/supabase/server';


export default async function Page() {
    const supabase = createServerClient(); 
    const session = await getSession();   
    let user, ordersDataForClient; 

    ordersDataForClient = {
        vlogOrders: [],
        tiktokOrders: [],
        thumbnailOrders: [],
        recordingOrders: [],
        pointsOrders: [],
    };

    let adminSpecificData = {
        allProfiles: [],
        allPointsOrders: [], 
        allPackages: [],    
    };


    if (!session || !session.user) {
        console.log("❌ Home Page (Server): No custom session found. Redirecting to /");
        redirect("/");
    }

    user = session.user; 

    try {

        if (user.role === "admin") {
            console.log("Home Page (Server): 🔐 Admin access. Fetching all relevant data...");

            const results = await Promise.all([

                supabase.from("profiles").select("*"), 
                supabase.from("pointsorders").select("*, profiles(id, fullname, email)").order("created_at", { ascending: false }), // All points orders for admin
                supabase.from("pointsPackages").select("*") 
            ]);

            const [
                profilesRes, pointsOrdersRes, packagesRes
            ] = results;

            if (profilesRes.error) throw new Error(`Profiles: ${profilesRes.error.message}`);
            if (pointsOrdersRes.error) throw new Error(`Points Orders: ${pointsOrdersRes.error.message}`);
            if (packagesRes.error) throw new Error(`Packages: ${packagesRes.error.message}`);

            
            ordersDataForClient.pointsOrders = pointsOrdersRes.data || [];

            adminSpecificData.allProfiles = profilesRes.data || [];
            adminSpecificData.allPointsOrders = pointsOrdersRes.data || []; 
            adminSpecificData.allPackages = packagesRes.data || [];

            console.log("Home Page (Server): Admin data fetched.");

        } else { // Regular user
            console.log("Home Page (Server): 👤 Regular user detected:", user.email);

            const currentSupabaseUserId = user.id;

            const results = await Promise.all([
                supabase.from("pointsorders").select("id, created_at, price, status, editingPoints, recordingPoints, designPoints, lifespan").eq("user", currentSupabaseUserId).order("created_at", { ascending: false })
            ]);

            const [
                pointsOrdersRes
            ] = results;

            if (pointsOrdersRes.error) throw new Error(`User Points Orders: ${pointsOrdersRes.error.message}`);

            ordersDataForClient.pointsOrders = pointsOrdersRes.data || [];

            console.log("Home Page (Server): User-specific data fetched.");
        }
    } catch (err) {
        console.error("Home Page (Server): ❌ Error fetching data:", err.message);
    }

    return (
        <>
            <Home
                user={user} 
                orders={ordersDataForClient}
                adminData={user.role === "admin" ? adminSpecificData : null}
            />
        </>
    );
}