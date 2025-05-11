// app/formulas/page.jsx
import { getSession } from "@/utils/lib"; // Your session utility
import { createClient } from "@/utils/client";
import { redirect } from "next/navigation";
import UserFormulasClient from "@/components/formulas/UserFormulasClient"; // Adjust path as needed
// import Navbar from "@/components/navbars/Navbar"; // If you want Navbar/Footer, add them here or in a layout
// import Footer from "@/components/footers/Footer";

const supabase = createClient();

export default async function FormulasPage() {
    const session = await getSession();

    if (!session || !session.user) {
        console.log("❌ No session found on formulas page. Redirecting...");
        redirect("/"); // Or your login page
    }

    const user = session.user;

    // Fetch formulas on the server
    let formulas = [];
    let fetchError = null;

    try {
        const { data, error } = await supabase
            .from('priceFormulas')
            .select('*'); // Select all necessary fields

        if (error) {
            console.error('❌ Error loading formulas on server:', error.message);
            fetchError = 'Грешка при зареждане на формулите от сървъра.';
            // formulas will remain []
        } else {
            formulas = data || [];
        }
    } catch (e) {
        console.error('❌ Unexpected error fetching formulas on server:', e.message);
        fetchError = 'Неочаквана сървърна грешка при зареждане на формули.';
    }


    return (
        <>
            {/* 
            If you want Navbar and Footer, and they are not in a global layout, add them here:
            <Navbar /> 
            */}
            <UserFormulasClient 
                initialUser={user} 
                initialFormulas={formulas}
                serverFetchError={fetchError} // Pass any server-side fetch error
            />
            {/* 
            <Footer /> 
            */}
        </>
    );
}