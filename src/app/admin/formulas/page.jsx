// app/admin/formulas/page.jsx

import { getSession } from "@/utils/lib"; // Your custom session utility
import { createClient } from "@/utils/client"; // Your Supabase client (ensure it's suitable for server-side reads or RLS allows)
import AdminLayout from "@/components/dashboard/AdminLayout";
import AdminFormulasClient from "./AdminFormulasClient"; // The Client Component
import { redirect } from "next/navigation";

const supabase = createClient();

export default async function AdminFormulasPageServer() { // Renamed function for clarity, Next.js uses file name for routing
    const session = await getSession();

    if (!session || !session.user) {
        console.log("AdminFormulasPage (Server): No session, redirecting to login.");
        redirect("/login"); 
    }

    if (session.user.role !== 'admin') {
        console.log("AdminFormulasPage (Server): User is not admin, redirecting.");
        redirect("/"); 
    }

    // Fetch initial formulas data on the server
    let initialFormulasData = [];
    let serverFetchErrorMsg = null;

    try {
        console.log("AdminFormulasPage (Server): Fetching price formulas...");
        const { data, error } = await supabase
            .from("priceFormulas")
            .select("*")
            .order("name", { ascending: true });

        if (error) {
            throw error; 
        }
        initialFormulasData = data || [];
        console.log(`AdminFormulasPage (Server): Fetched ${initialFormulasData.length} formulas.`);
    } catch (err) {
        console.error("AdminFormulasPage (Server): Error fetching formulas:", err.message);
        serverFetchErrorMsg = "Грешка при зареждане на формулите от сървъра.";
    }

    return (
        <AdminLayout role={session.user.role}>
            <AdminFormulasClient
                initialUser={session.user}
                initialFormulas={initialFormulasData}
                serverFetchError={serverFetchErrorMsg}
            />
        </AdminLayout>
    );
}