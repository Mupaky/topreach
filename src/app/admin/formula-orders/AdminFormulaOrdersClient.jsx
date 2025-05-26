// app/admin/formula-orders/AdminFormulaOrdersClient.jsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/client";
import { ChevronDown, ChevronUp } from "lucide-react"; // If you want icons for expand/collapse

const supabase = createClient();

export default function AdminFormulaOrdersClient({ initialUser }) { // Receive initialUser as a prop
  const [user, setUser] = useState(initialUser); // Initialize user state
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderIds, setExpandedOrderIds] = useState(new Set());
  const [isClientMounted, setIsClientMounted] = useState(false);

  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  // Update user state if prop changes
  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);
  

  useEffect(() => {
    // Client-side auth check (secondary)
    if (isClientMounted && (!user || user.role !== 'admin')) {
        setError("Нямате права за достъп до тази страница.");
        setLoading(false); // Stop loading if access denied
        return; // Don't fetch orders
    }

    // Only fetch if user is admin
    if (isClientMounted && user && user.role === 'admin') {
        async function fetchOrders() {
          setLoading(true);
          setError(null); // Clear previous errors
          const { data, error: fetchErr } = await supabase
            .from("formulaorders")
            .select("*, profiles(fullname, email)") // Assuming 'profiles' is the related table name
            .order("created_at", { ascending: false });
    
          if (fetchErr) {
            console.error("Error fetching formula orders:", fetchErr);
            setError("⚠️ Грешка при зареждане на поръчките.");
            setOrders([]);
          } else {
            setOrders(data || []);
          }
          setLoading(false);
        }
        fetchOrders();
    } else if (isClientMounted && !user) { // If user is null after mount (shouldn't happen if server redirects)
        setError("Сесията не е намерена. Моля, влезте отново.");
        setLoading(false);
    }
  }, [user, isClientMounted]); // Re-run if user or mount status changes

  const toggleDetails = (id) => {
    setExpandedOrderIds((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setError(null); // Clear previous errors
    // Find the order to prevent unnecessary UI updates if status is the same
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (orderToUpdate && orderToUpdate.status === newStatus) {
        // console.log("Status is already", newStatus);
        return;
    }

    try {
      // IMPORTANT: Ensure this API route /api/formulas/update-status exists
      // and is secured to only allow admin access.
      const res = await fetch("/api/formulas/update-status", { // This should be a dedicated API for formula order status
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, newStatus }),
      });
  
      const result = await res.json();
      if (!res.ok) {
        console.error("API Error updating status:", result.message);
        setError(result.message || "Грешка при обновяване на статуса.");
        // alert(result.message || "Грешка при обновяване на статуса."); // Alert might be too intrusive
        return;
      }
  
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      // alert("Статусът е обновен успешно!"); // Maybe a toast notification instead
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Грешка при връзка със сървъра за обновяване на статус.");
      // alert("Грешка при връзка със сървъра.");
    }
  };
  
  if (!isClientMounted) {
    return <div className="pt-24 px-4 md:px-10 text-white text-center">Инициализиране...</div>;
  }

  // If error is set due to auth failure on client, show access denied
  if (error && error.includes("Нямате права")) {
    return (
        <div className="pt-24 px-4 md:px-10 text-white text-center">
            <h1 className="text-2xl font-bold text-red-500">{error}</h1>
        </div>
    );
  }


  return (
    // AdminLayout is now provided by the parent Server Component (page.jsx)
    <> 
      <div className="pt-6 px-0 md:px-4 text-white"> {/* Adjusted top padding as AdminLayout might have its own */}
        <h1 className="text-3xl font-bold mb-8 text-center sm:text-left">Управление на Поръчки по Формули</h1>

        {error && !error.includes("Нямате права") && ( // Show other errors normally
          <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-6 shadow-md">
            <p><span className="font-semibold">⚠️ Грешка:</span> {error}</p>
          </div>
        )}

        {loading ? (
          <p className="text-gray-400 py-10 text-center">Зареждане на поръчките...</p>
        ) : orders.length === 0 && !error ? ( // Check !error also
          <p className="text-gray-400 py-10 text-center">Няма намерени поръчки по формули.</p>
        ) : orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const isExpanded = expandedOrderIds.has(order.id);
              const userProfile = order.profiles || {}; // Use empty object if profiles is null/undefined
              return (
                <div
                  key={order.id}
                  className={`bg-gray-800 border border-gray-700/70 rounded-lg shadow-md transition-all duration-300 ease-in-out`}
                >
                  <div
                    className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-700/50"
                    onClick={() => toggleDetails(order.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <h2 className="text-md sm:text-lg font-semibold text-accent truncate" title={order.formula_name_used}>
                        Поръчка #{order.id} — {order.formula_name_used}
                      </h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Клиент: <span className="font-medium text-gray-300">{userProfile.fullname || 'Няма данни'}</span> ({userProfile.email || 'Няма данни'})
                      </p>
                       <p className="text-xs text-gray-400">
                        Дата: {new Date(order.created_at).toLocaleDateString("bg-BG", { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-2 shrink-0">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            order.status === 'Завършена' ? 'bg-green-700 text-green-200' :
                            order.status === 'Отказана' ? 'bg-red-700 text-red-200' :
                            'bg-yellow-700 text-yellow-200' // Обработва се
                        }`}>
                            {order.status}
                        </span>
                        {isExpanded ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-gray-700/50">
                      <div className="text-sm space-y-2 mt-2">
                        <p><strong>Точки:</strong> <span className="text-accent">{order.total_points_cost}</span> ({order.points_type_charged})</p>
                        
                        <div className="flex items-center gap-2">
                          <label htmlFor={`status-${order.id}`} className="text-gray-300">Промяна на статус:</label>
                          <select
                            id={`status-${order.id}`}
                            value={order.status}
                            onChange={(e) => {
                              e.stopPropagation(); // Prevent card collapse
                              updateOrderStatus(order.id, e.target.value);
                            }}
                            onClick={(e) => e.stopPropagation()} // Prevent card collapse
                            className="bg-gray-700 border border-gray-600 px-2 py-1 rounded text-white text-xs focus:ring-1 focus:ring-accent focus:border-accent"
                          >
                            <option value="Обработва се">Обработва се</option>
                            <option value="В изпълнение">В изпълнение</option>
                            <option value="Завършена">Завършена</option>
                            <option value="Отказана">Отказана</option>
                          </select>
                        </div>

                        {order.order_details?.formulaFields && Object.keys(order.order_details.formulaFields).length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-700/30">
                            <p className="text-gray-300 font-semibold mb-1.5">Детайли по Формулата:</p>
                            <ul className="list-disc list-inside pl-1 space-y-1 text-xs">
                              {Object.entries(order.order_details.formulaFields).map(([key, val]) => {
                                // Find the field label from selectedFormula if available (more complex to pass down)
                                // For now, just display key and value
                                let displayValue = typeof val === 'boolean' ? (val ? 'Да' : 'Не') : String(val);
                                if (displayValue === "" || val === null) displayValue = "N/A";
                                return (
                                  <li key={key} className="text-gray-400">
                                    <span className="text-gray-300">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span> {displayValue}
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}