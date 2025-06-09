// app/admin/packages/page.jsx
import { getSession } from "@/utils/lib";
import AdminLayout from "@/components/dashboard/AdminLayout";
import AdminPackagesClient from "./AdminPackagesClient";
import { redirect } from "next/navigation";
import { createServerClient } from '@/utils/supabase/server'; 

export default async function AdminPackagesPageServer() {
    const supabase = createServerClient();
    const session = await getSession(); 

    if (!session || !session.user) {
        console.log("AdminPackagesPage (Server): No session, redirecting to login.");
        redirect("/login");
    }


    if (session.user.role !== 'admin') {
        console.log("AdminPackagesPage (Server): User is not admin, redirecting.");
        redirect("/");
    }

    let initialPackages = [];
    let fetchErrorMsg = null;

    const { data, error } = await supabase
        .from("pointsPackages")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("AdminPackagesPage (Server): Failed to fetch packages:", error.message);
        fetchErrorMsg = "⚠️ Грешка при зареждане на пакетите от сървъра.";

    } else {
        initialPackages = data || [];
    }

    return (
        <AdminLayout role={session.user.role}>
            <AdminPackagesClient
                initialUser={session.user}
                initialPackages={initialPackages} 
                fetchErrorMsg={fetchErrorMsg}  
            />
        </AdminLayout>
    );
}