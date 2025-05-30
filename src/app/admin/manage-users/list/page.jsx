// app/admin/manage-users/list/page.jsx
import { getSession } from "@/utils/lib";
import { createServerClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ManageUsersListPageClient from "./ManageUsersListPageClient"; // New client component

export default async function ManageUsersListPage() {
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
        redirect("/");
    }

    let users = [];
    let fetchError = null;
    try {
        const { data, error } = await supabase
            .from("profiles") // Assuming you fetch from your profiles table
            .select("id, fullname, email, role, created_at") // Don't select password hash
            .order("created_at", { ascending: false });

        if (error) throw error;
        users = data || [];
    } catch (err) {
        console.error("Error fetching users for admin list:", err);
        fetchError = "Грешка при зареждане на потребителите.";
    }

    return (
        <ManageUsersListPageClient
            initialUsers={users}
            serverFetchError={fetchError}
        />
    );
}