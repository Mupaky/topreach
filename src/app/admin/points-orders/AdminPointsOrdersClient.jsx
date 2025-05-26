// app/admin/points-orders/AdminPointsOrdersClient.jsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import AddPoints from "@/components/forms/AddPoints";
import AddCustomPackage from "@/components/forms/AddCustomPackage";
import ManageUserPackages from "@/components/forms/ManageUserPackages";
// No createClient from "@/utils/client" needed for initial data load if server provides it.
// It might still be used by child components like AddPoints if they do client-side validation with Supabase.

export default function AdminPointsOrdersClient({
    initialUser,
    initialAllPointsOrders,
    initialAllProfiles, // These are profiles fetched specifically for form dropdowns
    serverFetchError
}) {
    const [user, setUser] = useState(initialUser); // User info from custom session
    const [allPointsOrders, setAllPointsOrdersState] = useState(initialAllPointsOrders || []);
    const [allProfilesForForms, setAllProfilesForForms] = useState(initialAllProfiles || []);

    // isLoadingData now primarily reflects client-side operations,
    // as initial load is handled by server. Could be true if e.g., a form is submitting.
    const [isLoadingActions, setIsLoadingActions] = useState(false);
    const [error, setError] = useState(serverFetchError || null);
    const [isClientMounted, setIsClientMounted] = useState(false);

    useEffect(() => {
        setIsClientMounted(true);
    }, []);

    // Update local state if props change (e.g., due to Next.js revalidation)
    useEffect(() => {
        setUser(initialUser);
        setAllPointsOrdersState(initialAllPointsOrders || []);
        setAllProfilesForForms(initialAllProfiles || []);
        setError(serverFetchError || null);
    }, [initialUser, initialAllPointsOrders, initialAllProfiles, serverFetchError]);

    const handlePackageUpdatedInChild = (updatedOrder) => {
        // This callback is used by ManageUserPackages when an order is successfully updated via an API call.
        // It updates the local state to reflect the change without needing a full page reload.
        setAllPointsOrdersState(prevOrders =>
            prevOrders.map(order => (order.id === updatedOrder.id ? updatedOrder : order))
        );
        // You might also want to clear any general error messages here
        // setError(null);
    };

    // Add similar handlers for when AddPoints or AddCustomPackage successfully create new orders/packages
    // so they can be added to the `allPointsOrders` or relevant state.
    // For example:
    const handlePointsOrderAdded = (newOrder) => {
       setAllPointsOrdersState(prev => [newOrder, ...prev]);
    };

    const sortedProfilesForDropdown = useMemo(() =>
        [...(allProfilesForForms || [])].sort((a, b) => (a.fullname || "").localeCompare(b.fullname || "")),
    [allProfilesForForms]);


    if (!isClientMounted) {
        return <div className="text-white text-center p-10">Инициализиране на клиентски интерфейс...</div>;
    }

    // Primary authorization check already happened in the Server Component.
    // This is a fallback or if UI needs to react to user prop changes.
    if (!user || user.role !== 'admin') {
        // This should ideally not be reached if the Server Component redirects correctly.
        return (
            <div className="text-center py-10">
                <h1 className="text-2xl font-bold text-red-500 mb-4">Достъп отказан</h1>
                <p className="text-gray-300">Нямате необходимите права за достъп до тази страница.</p>
                <p className="text-gray-400 text-sm mt-2">Проверката е извършена на сървъра.</p>
            </div>
        );
    }

    // If there was a server-side error fetching initial data AND no data was loaded
    if (error && (!allPointsOrders || allPointsOrders.length === 0)) {
        return (
            <div className="text-center py-10">
                 <h1 className="text-2xl font-bold text-red-500 mb-4">Грешка при Зареждане на Данни от Сървъра</h1>
                 <p className="text-gray-300">{error}</p>
            </div>
        );
    }

    return (
        <> {/* AdminLayout is already wrapping this from the Server Component */}
            {/* Section 1: Add Points */}
            <h2 className="text-xl md:text-3xl font-[700] mb-5 mt-10 text-white">
                Зареди точки на Потребител
            </h2>
            <div className="mb-10 bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700">
                <AddPoints
                    sortedProfiles={sortedProfilesForDropdown}
                    pointsOrdersData={allPointsOrders} 
                    onPointsOrderAdded={handlePointsOrderAdded} 
                />
            </div>

            {/* Section 2: Manage Existing User Packages/Points Orders */}
            <div className="space-y-10 mb-10">
                <h1 className="text-3xl font-bold text-white">Управление на Закупени Пакети с Точки</h1>
                {/* ... error display ... */}
                {isLoadingActions ? (
                    <p className="text-gray-400 py-10 text-center">Обработка...</p>
                ) : ( /* Removed check for allPointsOrders.length > 0 here, ManageUserPackages can handle empty state */
                    <ManageUserPackages
                        profilesList={sortedProfilesForDropdown} // <<<< PASS THE PROFILES LIST HERE
                        allPointsOrders={allPointsOrders}
                        onPackageUpdate={handlePackageUpdatedInChild}
                    />
                ) /* : !error ? ( ... ) : null removed for simplicity, ManageUserPackages should show its own empty/error state if needed */}
            </div>

            {/* Section 3: Add Custom Package */}
            <div className="px-6 py-10 text-white bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700">
                <h1 className="text-2xl md:text-3xl font-bold mb-6 text-accent">
                    Добави Персонален Пакет на Потребител
                </h1>
                <AddCustomPackage
                    sortedProfiles={sortedProfilesForDropdown}
                    // onCustomPackageAdded={...} // Example callback
                />
            </div>
        </>
    );
}