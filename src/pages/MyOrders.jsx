"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/client";

const supabase = createClient();

export default function MyOrders({ userId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    async function fetchOrders() {
      if (!userId) return;

      setLoading(true);

      const { data, error } = await supabase
        .from("formulaorders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Error fetching formula orders:", error.message);
        setOrders([]);
      } else {
        setOrders(data || []);
      }

      setLoading(false);
    }

    fetchOrders();
  }, [userId]);

  return (
    <div className="min-h-screen bg-gray-900 text-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-accent">Поръчки</h1>

        {loading ? (
          <p className="text-gray-400">Зареждане...</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-400">Нямате направени поръчки.</p>
        ) : (
          <ul className="space-y-6">
            {orders.map((order) => {
              const details = order.order_details?.fields || {};
              const isOpen = expandedOrderId === order.id;

              return (
                <li
                  key={order.id}
                  className="bg-gray-800 p-5 rounded-lg border border-gray-700 shadow"
                >
                  <div
                    className="cursor-pointer"
                    onClick={() =>
                      setExpandedOrderId(isOpen ? null : order.id)
                    }
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-lg font-semibold">
                        {order.formula_name_used || "—"}
                      </h2>
                      <span className="text-sm text-gray-400">
                        {new Date(order.created_at).toLocaleDateString("bg-BG")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Статус:{" "}
                      <span className="text-white font-medium">
                        {order.status}
                      </span>
                    </p>
                    <p className="text-sm text-gray-400">
                      Общо точки:{" "}
                      <span className="text-white font-medium">
                        {order.total_points_cost}
                      </span>
                    </p>
                  </div>

                  {isOpen && (
                    <div className="mt-4 text-sm bg-gray-700/40 p-4 rounded">
                      <p className="text-accent mb-2 font-semibold">
                        Детайли:
                      </p>
                      <ul className="space-y-1">
                        {Object.entries(details).map(([key, item]) => {
                          const answer =
                            typeof item?.value === "boolean"
                              ? item.value
                                ? "Да"
                                : "Не"
                              : item?.value ?? "";
                          const cost = item?.cost;
                          const label = item?.label || key;

                          return (
                            <li key={key}>
                              <span className="text-gray-300">{label}:</span>{" "}
                              {answer}
                              {cost !== undefined && !isNaN(cost) ? (
                                <span className="text-gray-400">
                                  {" "}
                                  ({cost} т.)
                                </span>
                              ) : null}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}