// app/admin/points-orders/page.jsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import AdminLayout from "@/components/dashboard/AdminLayout";
import { createClient } from "@/utils/client";
import Link from "next/link"; // For linking to individual order details if needed
import { CheckCircle, XCircle, CalendarClock, Archive } from "lucide-react"; // Icons

const supabase = createClient();

export default function AdminPointsOrdersPage() {
    const [pointsOrders, setPointsOrders] = useState([]);
    const [profiles, setProfiles] = useState({}); // For mapping user IDs to names
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch initial data
    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            setError(null);
            try {
                const { data: ordersData, error: ordersError } = await supabase
                    .from("pointsorders")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (ordersError) throw ordersError;
                setPointsOrders(ordersData || []);

                const { data: profilesData, error: profilesError } = await supabase
                    .from("profiles")
                    .select("id, fullname"); // Only fetch id and fullname

                if (profilesError) throw profilesError;
                const profilesMap = (profilesData || []).reduce((acc, item) => {
                    acc[item.id] = item.fullname;
                    return acc;
                }, {});
                setProfiles(profilesMap);

            } catch (fetchError) {
                console.error("Failed to fetch points orders or profiles:", fetchError.message);
                setError("⚠️ Грешка при зареждане на данните.");
                setPointsOrders([]);
                setProfiles({});
            }
            setIsLoading(false);
        }
        loadData();
    }, []);

    function formatDate(dateString) {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "Invalid Date";
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = date.getFullYear();
            return `${day}.${month}.${year}`;
        } catch (e) {
            return "Error Date";
        }
    }

    // Function to update the points order status
    async function updatePointsOrderStatus(orderId, newStatus) {
        if (!orderId || !newStatus) {
            alert("Липсва ID на поръчка или нов статус.");
            return;
        }

        try {
            // We'll use the generic /api/orders PUT endpoint,
            // but ensure it can handle 'pointsorders' type and specific statuses.
            // Alternatively, create a dedicated /api/pointsorders/[id]/status endpoint.
            const response = await fetch("/api/orders", { // Assuming this endpoint can handle 'pointsorders'
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, newStatus, type: "pointsorders" }), // Specify type
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || "Failed to update points order status.");
            }

            setPointsOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                )
            );
            alert("Статусът на поръчката с точки е обновен успешно!");
            setError(null);
        } catch (error) {
            console.error("Failed to update points order status:", error);
            setError(`Грешка при обновяване на статус: ${error.message}`);
            // alert(`Грешка при обновяване на статус: ${error.message}`);
        }
    }
    
    const getStatusColor = (status) => {
        switch (status) {
            case "Активен": return "text-green-400";
            case "Изтекъл": return "text-red-400";
            case "Използван": return "text-yellow-400"; // If you add this status
            default: return "text-gray-400";
        }
    };


    const sortedPointsOrders = useMemo(() => 
        [...pointsOrders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [pointsOrders]);


    return (
        <AdminLayout>
            <div className="space-y-10">
                <h1 className="text-3xl font-bold text-white">Управление на Поръчки с Точки</h1>

                {error && (
                    <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-6" role="alert">
                        <p><span className="font-bold">Грешка:</span> {error}</p>
                    </div>
                )}

                <div className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-xl border border-gray-700">
                    <h2 className="text-2xl font-semibold mb-6 text-white border-b border-gray-700 pb-3">
                        Всички Поръчки за Точки
                    </h2>

                    {isLoading ? (
                        <p className="text-gray-400 py-10 text-center">Зареждане на поръчките...</p>
                    ) : sortedPointsOrders.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className="bg-gray-700/50">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Клиент</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Дата</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Цена (лв.)</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Точки Монтаж</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Точки Запис</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Точки Дизайн</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Валидност (дни)</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Статус</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Действия</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-gray-800 divide-y divide-gray-700/50">
                                    {sortedPointsOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-700/30 transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-400 font-mono truncate max-w-[100px]" title={order.id}>{order.id}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{profiles[order.user] || order.user}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{formatDate(order.created_at)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{order.price} лв.</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{order.editingPoints}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{order.recordingPoints}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{order.designPoints}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{order.lifespan}</td>
                                            <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${getStatusColor(order.status)}`}>
                                                {order.status || "Недефиниран"}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                <select
                                                    value={order.status || ""}
                                                    onChange={(e) => updatePointsOrderStatus(order.id, e.target.value)}
                                                    className="bg-gray-700 border border-gray-600 text-white text-xs rounded-md p-1.5 focus:ring-accent focus:border-accent"
                                                    aria-label={`Промяна на статус за поръчка ${order.id}`}
                                                >
                                                    <option value="" disabled>Промени...</option>
                                                    <option value="Активен">Активен</option>
                                                    <option value="Изтекъл">Изтекъл</option>
                                                    <option value="Използван">Използван</option> {/* If you want to mark fully used packages */}
                                                    <option value="Отказана">Отказана</option> {/* If a payment failed or was refunded */}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 py-10 text-center">Няма намерени поръчки за точки.</p>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}