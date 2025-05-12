'use client';

import { useEffect, useState } from "react";
import AdminLayout from "@/components/dashboard/AdminLayout";
import { createClient } from "@/utils/client";

const supabase = createClient();

export default function AdminFormulaOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderIds, setExpandedOrderIds] = useState(new Set());
  

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      const { data, error } = await supabase
        .from("formulaorders")
        .select("*, profiles(fullname, email)")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching formula orders:", error);
        setError("⚠️ Грешка при зареждане на поръчките.");
      } else {
        setOrders(data || []);
      }

      setLoading(false);
    }

    fetchOrders();
  }, []);

  const toggleDetails = (id) => {
    setExpandedOrderIds((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch("/api/formulas/update-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, newStatus }),
      });
  
      const result = await res.json();
      if (!res.ok) {
        alert(result.message || "Грешка при обновяване на статуса.");
        return;
      }
  
      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Грешка при връзка със сървъра.");
    }
  };
  

  return (
    <AdminLayout>
      <div className="pt-24 px-4 md:px-10 text-white">
        <h1 className="text-3xl font-bold mb-6">Формула Поръчки</h1>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-6">
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <p className="text-gray-400">Зареждане...</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-400">Няма поръчки.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const isExpanded = expandedOrderIds.has(order.id);
              return (
                <div
                  key={order.id}
                  className={`cursor-pointer bg-gray-800 border border-gray-700 rounded-xl p-5 transition hover:bg-gray-700/60 ${
                    isExpanded ? "ring-1 ring-accent" : ""
                  }`}
                  onClick={() => toggleDetails(order.id)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold text-accent">
                      #{order.id} — {order.formula_name_used}
                    </h2>
                    <span className="text-sm text-gray-400">
                      {new Date(order.created_at).toLocaleDateString("bg-BG")}
                    </span>
                  </div>

                  <p className="text-sm text-gray-300 mb-1">
                    Клиент: <strong>{order.profiles?.fullname || '–'}</strong> (
                    {order.profiles?.email || '–'})
                  </p>

                  <div className="flex items-center flex-wrap gap-4 mb-1 text-sm text-gray-300">
                    <span>Точки: <strong>{order.total_points_cost}</strong> ({order.points_type_charged})</span>
                    <label className="mr-1">Статус:</label>
                    <select
                      value={order.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateOrderStatus(order.id, e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-gray-700 border border-gray-600 px-2 py-1 rounded text-white text-sm"
                    >
                      <option value="Обработва се">Обработва се</option>
                      <option value="Завършена">Завършена</option>
                      <option value="Отказана">Отказана</option>
                    </select>
                  </div>

                  {isExpanded && Array.isArray(order.order_details?.fields) && (
                    <div className="mt-4 bg-gray-900 p-3 rounded-md text-sm border border-gray-700">
                      <p className="text-accent font-semibold mb-2">Детайли:</p>
                      <ul className="space-y-1">
                        {order.order_details.fields.map((f) => (
                          <li key={f.key}>
                            <span className="text-gray-300">{f.label}:</span>{" "}
                            {f.display}
                            {typeof f.cost === "number" && !isNaN(f.cost) && (
                              <span className="text-gray-500"> ({f.cost} т.)</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
