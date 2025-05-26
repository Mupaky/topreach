// app/admin/formula-orders/page.jsx (SERVER COMPONENT)
import { getSession } from "@/utils/lib"; // Your custom session utility
import AdminLayout from "@/components/dashboard/AdminLayout";
import AdminFormulaOrdersClient from "./AdminFormulaOrdersClient"; // The Client Component
import { redirect } from "next/navigation";

// No Supabase client needed here if the client component fetches its own data

export default async function AdminFormulaOrdersPageServer() {
    const session = await getSession();

    if (!session || !session.user) {
        console.log("AdminFormulaOrdersPage (Server): No session, redirecting to login.");
        redirect("/login"); // Or your admin login page
    }

    if (session.user.role !== 'admin') {
        console.log("AdminFormulaOrdersPage (Server): User is not admin, redirecting.");
        redirect("/"); // Or a "not authorized" page or admin dashboard home
    }

    // AdminFormulaOrdersClient will fetch its own data.
    // We pass initialUser for client-side checks or if it needs user info directly.
    return (
        <AdminLayout role={session.user.role}> {/* Pass role if AdminLayout uses it */}
            <AdminFormulaOrdersClient initialUser={session.user} />
        </AdminLayout>
    );
}