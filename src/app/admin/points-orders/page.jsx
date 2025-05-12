// app/admin/points-orders/page.jsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import AddPoints from "@/components/forms/AddPoints";
import AddCustomPackage from "@/components/forms/AddCustomPackage";
import AdminLayout from "@/components/dashboard/AdminLayout";
import { createClient } from "@/utils/client";
import ManageUserPackages from "@/components/forms/ManageUserPackages"; // Import the component

const supabase = createClient();

export default function AdminPointsOrdersPage() {
    const [allPointsOrders, setAllPointsOrders] = useState([]);
    const [allProfiles, setAllProfiles] = useState([]); // For the dropdown in ManageUserPackages
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    async function loadInitialData() {
        setIsLoading(true);
        setError(null);
        try {
            const { data: ordersData, error: ordersError } = await supabase
                .from("pointsorders")
                .select("*")
                .order("created_at", { ascending: false });
            if (ordersError) throw ordersError;
            setAllPointsOrders(ordersData || []);

            const { data: profilesData, error: profilesError } = await supabase
                .from("profiles")
                .select("id, fullname, email"); // Fetch what ManageUserPackages needs
            if (profilesError) throw profilesError;
            setAllProfiles(profilesData || []);

        } catch (fetchError) {
            console.error("Failed to fetch initial data for points orders page:", fetchError.message);
            setError("⚠️ Грешка при зареждане на данните.");
        }
        setIsLoading(false);
    }

    useEffect(() => {
        loadInitialData();
    }, []);

    const [profiles, setProfiles] = useState([]);

	useEffect(() => {
		async function fetchProfiles() {
			const { data, error } = await supabase
				.from("profiles")
				.select("id, fullname, email")
				.order("fullname", { ascending: true });

			if (error) {
				console.error("Грешка при зареждане на профилите:", error.message);
			} else {
				setProfiles(data || []);
			}
		}
		fetchProfiles();
	}, []);

    // Callback function to update the main list when a package is updated within ManageUserPackages
    const handlePackageUpdatedInChild = (updatedPackage) => {
        setAllPointsOrders(prevOrders =>
            prevOrders.map(order => (order.id === updatedPackage.id ? updatedPackage : order))
        );
    };

    // Prepare sorted profiles once for the prop
    const sortedProfilesForDropdown = useMemo(() =>
        [...(allProfiles || [])].sort((a, b) => (a.fullname || "").localeCompare(b.fullname || "")),
    [allProfiles]);


    return (
        <AdminLayout>
            {/* Add points dashboard */}
			<h2 className="text-xl md:text-3xl font-[700] mb-5 mt-10">
						Зареди точки
					</h2>
					<div className="mb-10"> {/* Added margin-bottom */}
                        <AddPoints sortedProfiles={sortedProfilesForDropdown} pointsOrdersData={allPointsOrders} />
                    </div>		
            <div className="space-y-10">
                <h1 className="text-3xl font-bold text-white">Управление на Пакети с Точки</h1>

                {error && (
                    <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-6" role="alert">
                        <p><span className="font-bold">Грешка:</span> {error}</p>
                    </div>
                )}

                {isLoading ? (
                    <p className="text-gray-400 py-10 text-center">Зареждане на данни...</p>
                ) : (
                    <ManageUserPackages
                        profilesList={sortedProfilesForDropdown}
                        allPointsOrders={allPointsOrders}
                        onPackageUpdate={handlePackageUpdatedInChild}
                    />
                )}
                
                {/* You could add other sections here if needed, e.g., a summary or global actions */}

            </div>

            <div className="min-h-screen px-6 py-10 text-white">
				<h1 className="text-2xl md:text-3xl font-bold mb-6 text-accent">
					Добави персонален пакет
				</h1>
				<AddCustomPackage sortedProfiles={profiles} />
			</div>
        </AdminLayout>
    );
}