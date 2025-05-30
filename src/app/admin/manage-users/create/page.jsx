// app/admin/manage-users/create/page.jsx
import { getSession } from "@/utils/lib"; // Your custom session
import { createServerClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import CreateUserClientPage from "./CreateUserClientPage"; // We'll create this

export default async function AdminCreateUserPage() {
    const supabase = createServerClient();
    const session = await getSession();

    if (!session || !session.user) {
        redirect("/login"); 
    }

    let isAdmin = false;
    const { data: { session: supabaseSession } } = await supabase.auth.getSession();
    if (supabaseSession && supabaseSession.user) {
        const { data: adminProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', supabaseSession.user.id)
            .single();
        if (adminProfile && adminProfile.role === 'admin') {
            isAdmin = true;
        }
    }

    if (!isAdmin) {
        if (session.user.role !== 'admin') {
            console.log("AdminCreateUserPage (Server): Not an admin. Redirecting.");
            redirect("/"); // Or an unauthorized page
        }
        if (!isAdmin && session.user.role === 'admin') {
            console.warn("AdminCreateUserPage: Custom session indicates admin, but Supabase context check failed. Proceeding based on custom session.");
        }
    }


    return (
        <CreateUserClientPage />
    );
}