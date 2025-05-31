import AdminLayout from "@/components/dashboard/AdminLayout"; 
import ManageUsersNav from "@/components/dashboard/admin/ManageUsersNav";
import { getSession } from "@/utils/lib"; 
import { redirect } from "next/navigation";
import { createServerClient } from "@/utils/supabase/server";

export default async function ManageUsersLayout({ children }) {
    const supabase = createServerClient();
    const session = await getSession(); 

    if (!session || !session.user) {
        redirect("/login");
    }

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
                <h1 className="text-2xl font-bold text-white mb-6">Управление на Потребители</h1>
                <ManageUsersNav />
                <div className="mt-6"> 
                    {children} 
                </div>
            </div>
        </AdminLayout>
    );
}