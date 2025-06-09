// app/points/page.jsx
import React from "react";
import { getSession } from "@/utils/lib";
import { redirect } from "next/navigation";
import Points from "@/pages/Points";
import { createServerClient } from '@/utils/supabase/server';

export default async function PointsPageServer() { 
    const supabase = createServerClient(); 
    const session = await getSession();   
    let user, packageDefinitionsData = []; 
    let fetchErrorMsg = null;

    if (!session || !session.user) {
        console.log("PointsPage (Server): No custom session, redirecting to /login.");
        redirect("/login");
    }

    user = session.user;

    try {
        const { data, error } = await supabase
            .from("pointsPackages") 
            .select("id, price, editingPoints, recordingPoints, designPoints, consultingPoints, lifespan")
            .order("price", { ascending: true }); 
        if (error) {
            throw error;
        }
        packageDefinitionsData = data || [];
        console.log("PointsPage (Server): Fetched pointsPackages definitions:", packageDefinitionsData);

    } catch (err) {
        console.error("PointsPage (Server): Error fetching points packages definitions:", err.message);
        fetchErrorMsg = `Грешка при зареждане на пакетите: ${err.message}`;
    }

    return (
        <>
            <Points
                data={packageDefinitionsData} 
                email={user.email}
                name={user.fullName}
                userId={user.id} 
                fetchError={fetchErrorMsg} 
            />
        </>
    );
}