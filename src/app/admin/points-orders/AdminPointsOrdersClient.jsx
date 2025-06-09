// app/admin/points-orders/AdminPointsOrdersClient.jsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import AddPoints from "@/components/forms/AddPoints";
import AddCustomPackage from "@/components/forms/AddCustomPackage";
import ManageUserPackages from "@/components/forms/ManageUserPackages";
import { BeatLoader } from "react-spinners"; // For loading indicator
import { useRouter } from "next/navigation";

export default function AdminPointsOrdersClient({
    initialUser,
    initialAllPointsOrders,
    initialAllProfiles,
    serverFetchError
}) {
    const router = useRouter();
    const [user, setUser] = useState(initialUser);
    const [allPointsOrders, setAllPointsOrdersState] = useState(initialAllPointsOrders || []);
    const [allProfilesForForms, setAllProfilesForForms] = useState(initialAllProfiles || []);

    const [isLoadingActions, setIsLoadingActions] = useState(false); // For child component API calls
    const [error, setError] = useState(serverFetchError || null); // For server errors or child action errors
    const [successMessage, setSuccessMessage] = useState(null);   // For child action success messages
    const [isClientMounted, setIsClientMounted] = useState(false);

    useEffect(() => {
        setIsClientMounted(true);
    }, []);

    useEffect(() => {
        setUser(initialUser);
        setAllPointsOrdersState(initialAllPointsOrders || []);
        setAllProfilesForForms(initialAllProfiles || []);
        setError(serverFetchError || null); // Prioritize server fetch error on initial load
    }, [initialUser, initialAllPointsOrders, initialAllProfiles, serverFetchError]);

    const handlePointsOrderUpdated = (updatedOrder) => {
        setAllPointsOrdersState(prevOrders =>
            prevOrders.map(order => (order.id === updatedOrder.id ? { ...order, ...updatedOrder } : order))
        );
        router.refresh();
        // Success message will be set by child component via setParentSuccess
    };

    const handlePointsOrderAdded = (newOrder) => {
       setAllPointsOrdersState(prev => 
            [newOrder, ...prev].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
       );
       router.refresh();
       // Success message will be set by child component via setParentSuccess
    };
    
    const handlePointsOrderDeleted = (deletedOrderId) => {
        setAllPointsOrdersState(prevOrders => prevOrders.filter(order => order.id !== deletedOrderId));
        router.refresh();
        // Success message will be set by child component via setParentSuccess
    };

    const sortedProfilesForDropdown = useMemo(() =>
        [...(allProfilesForForms || [])].sort((a, b) => (a.fullname || "").localeCompare(b.fullname || "")),
    [allProfilesForForms]);


    if (!isClientMounted) {
        return <div className="text-white text-center p-10">Инициализиране на клиентски интерфейс...</div>;
    }

    if (!user || user.role !== 'admin') {
        return (
            <div className="text-center py-10">
                <h1 className="text-2xl font-bold text-red-500 mb-4">Достъп отказан</h1>
                <p className="text-gray-300">Нямате необходимите права за достъп до тази страница.</p>
                <p className="text-gray-400 text-sm mt-2">Проверката е извършена на сървъра.</p>
            </div>
        );
    }

    // If there was a server-side error fetching initial data AND no data was loaded
    if (error && (!allPointsOrders || allPointsOrders.length === 0) && !isLoadingActions) {
        return (
            <div className="text-center py-10">
                 <h1 className="text-2xl font-bold text-red-500 mb-4">Грешка при Зареждане на Данни от Сървъра</h1>
                 <p className="text-gray-300">{error}</p>
            </div>
        );
    }

    return (
        <> {/* AdminLayout is already wrapping this from the Server Component */}
            <div className="space-y-12"> {/* Added more spacing between sections */}
                {/* --- Global Messages Area --- */}
                {isLoadingActions && (
                    <div className="mb-6 p-4 bg-blue-800/30 border border-blue-700 text-blue-300 rounded-lg shadow-md flex items-center justify-center">
                        <BeatLoader color="white" size={10} />
                        <span className="ml-3">Обработка на заявката...</span>
                    </div>
                )}
                {successMessage && !isLoadingActions && (
                    <div className="mb-6 p-4 bg-green-800/30 border border-green-700 text-green-300 rounded-lg shadow-md" role="alert">
                        {successMessage}
                    </div>
                )}
                {/* Display general error if it's from an action and not the initial server fetch error already shown */}
                {error && !serverFetchError && !isLoadingActions && (
                    <div className="mb-6 p-4 bg-red-800/30 border border-red-700 text-red-300 rounded-lg shadow-md" role="alert">
                        <span className="font-bold">Грешка:</span> {error}
                    </div>
                )}

                {/* Section 1: Add Points */}
                <section className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700">
                    <h2 className="text-xl md:text-2xl font-bold mb-6 text-white border-b border-gray-700 pb-3">
                        Зареди/Извади Точки на Потребител
                    </h2>
                    <AddPoints
                        sortedProfiles={sortedProfilesForDropdown}
                        allPointsOrders={allPointsOrders}
                        onPointsUpdated={handlePointsOrderAdded} 
                        setParentLoading={setIsLoadingActions}
                        setParentError={setError}
                        setParentSuccess={setSuccessMessage}
                    />
                </section>

                {/* Section 2: Manage Existing User Packages/Points Orders */}
                <section className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700">
                    <h1 className="text-xl md:text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-3">
                        Управление на Закупени Пакети с Точки от Потребители
                    </h1>
                    <ManageUserPackages
                        profilesList={sortedProfilesForDropdown}
                        allPointsOrders={allPointsOrders}
                        onPackageUpdate={handlePointsOrderUpdated}
                        onPackageDelete={handlePointsOrderDeleted} // Pass delete handler
                        setParentLoading={setIsLoadingActions}
                        setParentError={setError}
                        setParentSuccess={setSuccessMessage}
                    />
                </section>

                {/* Section 3: Add Custom Package */}
                <section className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700">
                    <h1 className="text-xl md:text-2xl font-bold mb-6 text-accent border-b border-gray-700 pb-3">
                        Добави Персонален Пакет на Потребител
                    </h1>
                    <AddCustomPackage
                        sortedProfiles={sortedProfilesForDropdown}
                        onCustomPackageAdded={handlePointsOrderAdded}
                        setParentLoading={setIsLoadingActions}
                        setParentError={setError}
                        setParentSuccess={setSuccessMessage}
                    />
                </section>
            </div>
        </>
    );
}