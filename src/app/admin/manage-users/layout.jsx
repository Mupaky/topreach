import AdminLayout from "@/components/dashboard/AdminLayout"; // Your main admin layout
import ManageUsersNav from "@/components/dashboard/admin/ManageUsersNav"; // The new sub-nav
import { getSession } from "@/utils/lib"; // To pass role to AdminLayout
import { redirect } from "next/navigation";
import { createServerClient } from "@/utils/supabase/server";

export default async function ManageUsersLayout({ children }) {
    const supabase = createServerClient();
    const session = await getSession(); // Your custom jose session

    if (!session || !session.user) {
        redirect("/login");
    }

    // Perform admin check here as well to protect this entire section
    let isAdmin = false;
    const { data: { session: supabaseSession } } = await supabase.auth.getSession();
    if (supabaseSession?.user) {
        const { data: adminProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', supabaseSession.user.id)
            .single();
        if (adminProfile?.role === 'admin') {
            isAdmin = true;
        }
    }
    
    if (!isAdmin && session.user.role !== 'admin') {
        console.log("ManageUsersLayout (Server): Not an admin. Redirecting.");
        redirect("/");
    }


    return (
        <AdminLayout role={session.user.role}> 
            <div className="p-4 md:p-6"> 
                <ManageUsersNav />
                {children} 
            </div>
        </AdminLayout>
    );
}