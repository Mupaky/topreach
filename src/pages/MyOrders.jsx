"use client";

import { useEffect, useState, useMemo } from "react"; // Added useMemo
import { createClient } from "@/utils/client"; // Your client-side Supabase instance
import { ChevronDown, ChevronUp } from "lucide-react"; // For expand/collapse icons
import { BeatLoader } from "react-spinners"; // For loading state
import Link from "next/link";

const supabase = createClient();

export default function MyOrders({ userId }) { // userId is passed as a prop
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // For fetch errors
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [isClientMounted, setIsClientMounted] = useState(false);

  // For displaying Bulgarian labels for point types
  const pointTypeLabels = useMemo(() => ({
    editingPoints: "Монтаж",
    recordingPoints: "Заснемане",
    designPoints: "Дизайн"
    // Add more if you have other point types
  }), []);


  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  useEffect(() => {
    async function fetchOrders() {
      if (!userId) {
        setLoading(false); // Stop loading if no userId
        return;
      }

      setLoading(true);
      setError(null); // Clear previous errors

      try {
        // Fetch orders including points_cost_breakdown and order_details
        const { data, error: fetchError } = await supabase
          .from("formulaorders")
          .select("id, created_at, formula_name_used, status, order_details, points_cost_breakdown, total_points_cost, points_type_charged") // Select all relevant fields
          .eq("user_id", userId) // Ensure this column name matches your formulaorders table
          .order("created_at", { ascending: false });

        if (fetchError) {
          console.error("❌ Error fetching user's formula orders:", fetchError.message);
          setError(`Грешка при зареждане на поръчките: ${fetchError.message}`);
          setOrders([]);
        } else {
          console.log("Fetched user orders:", data);
          setOrders(data || []);
        }
      } catch (err) {
        console.error("❌ Catch error fetching user's formula orders:", err);
        setError("Възникна неочаквана грешка при зареждане на поръчките.");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }

    if (isClientMounted) { // Only fetch after component has mounted
        fetchOrders();
    }
  }, [userId, isClientMounted]); // Re-fetch if userId changes or on mount

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
        return new Date(dateString).toLocaleDateString("bg-BG", {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    } catch(e) { return "Invalid Date"; }
  };

  const renderFieldValue = (value, type) => {
    if (type === "checkbox" || type === "yesno") {
      return value ? <span className="font-semibold text-green-400">Да</span> : <span className="font-semibold text-red-400">Не</span>;
    }
    if (value === null || value === undefined || String(value).trim() === "") {
        return <span className="italic text-gray-500">Няма стойност</span>;
    }
    if (String(value).includes('\n')) {
        return <pre className="whitespace-pre-wrap text-sm">{String(value)}</pre>;
    }
    return String(value);
  };

  const formatLabel = (label, key) => {
    if (label && String(label).trim() !== "") return label;
    if (key && String(key).trim() !== "") return key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^./, str => str.toUpperCase());
    return "Детайл";
  };

  if (!isClientMounted) {
      return (
        <div className="min-h-screen bg-background text-white py-20 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
            <BeatLoader color="#A78BFA" size={15} /> <p className="ml-4 text-gray-400">Зареждане...</p>
        </div>
      );
  }
  
  if (!userId) { // Should be handled by parent page ideally, but as a fallback
    return (
        <div className="min-h-screen bg-background text-white py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
                <p className="text-gray-400">Информацията за потребителя не е налична.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white py-24 md:py-32 px-4 sm:px-6 lg:px-8"> {/* Changed bg-gray-900 to bg-background */}
      <div className="max-w-3xl mx-auto"> {/* Adjusted max-width for better focus */}
        <div className="text-center mb-10 md:mb-12">
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                Моите Поръчки
            </h1>
            <p className="text-gray-400 mt-2">Преглед на вашите завършени и текущи поръчки по формули.</p>
        </div>


        {loading ? (
          <div className="flex justify-center items-center py-10">
            <BeatLoader color="#A78BFA" size={15} />
            <p className="text-gray-400 ml-4">Зареждане на поръчки...</p>
          </div>
        ) : error ? (
          <div className="bg-red-800/30 border border-red-700 text-red-300 p-4 rounded-lg text-center">
            <p>{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10 bg-gray-800/70 border border-secondary rounded-lg shadow-xl p-6">
            <p className="text-gray-300 text-lg">Все още нямате направени поръчки.</p>
            <p className="text-gray-400 mt-2">Разгледайте нашите <Link href="/formulas" className="text-accent hover:underline">услуги</Link> и направете своята първа поръчка!</p>
          </div>
        ) : (
          <ul className="space-y-6">
            {orders.map((order) => {
              const isOpen = expandedOrderId === order.id;
              const pointsBreakdownExists = order.points_cost_breakdown && Object.keys(order.points_cost_breakdown).length > 0 && Object.values(order.points_cost_breakdown).some(cost => Number(cost) > 0);

              return (
                <li
                  key={order.id}
                  className="bg-gray-800/70 backdrop-blur-sm border border-secondary rounded-xl shadow-lg transition-all duration-300 hover:shadow-accent/20"
                >
                  <div
                    className="flex justify-between items-center p-4 sm:p-5 cursor-pointer"
                    onClick={() => setExpandedOrderId(isOpen ? null : order.id)}
                  >
                    <div>
                      <h2 className="text-lg font-semibold text-accentLighter truncate max-w-[200px] sm:max-w-xs md:max-w-md" title={order.formula_name_used || "Поръчка по формула"}>
                        {order.formula_name_used || "Поръчка по формула"} <span className="text-xs text-gray-500">(#{order.id})</span>
                      </h2>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm ${
                            order.status === 'Завършена' ? 'bg-green-600/80 text-green-100 border border-green-500/50' :
                            order.status === 'Отказана' ? 'bg-red-600/80 text-red-100 border border-red-500/50' :
                            'bg-yellow-600/80 text-yellow-100 border border-yellow-500/50'
                        }`}>
                        {order.status || "N/A"}
                      </span>
                      {isOpen ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}
                    </div>
                  </div>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-3 border-t border-gray-700/50 space-y-4">
                      {/* Display Points Cost Breakdown */}
                      {pointsBreakdownExists ? (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-200 mb-1.5">Изразходвани Точки:</h3>
                          <ul className="space-y-1 text-xs pl-1">
                            {Object.entries(order.points_cost_breakdown)
                              .filter(([_, cost]) => Number(cost) > 0)
                              .map(([type, cost]) => (
                                <li key={type} className="flex justify-between items-center text-gray-300">
                                  <span>{pointTypeLabels[type] || type}:</span>
                                  <span className="font-semibold text-accentLighter">{Number(cost)} т.</span>
                                </li>
                            ))}
                          </ul>
                        </div>
                      ) : (order.total_points_cost !== undefined && order.points_type_charged) ? ( // Fallback to old system if breakdown is empty but old fields exist
                        <div>
                          <h3 className="text-sm font-semibold text-gray-200 mb-1.5">Изразходвани Точки (стар формат):</h3>
                          <p className="text-xs text-gray-300">
                            {pointTypeLabels[order.points_type_charged] || order.points_type_charged}: <span className="font-semibold text-accentLighter">{order.total_points_cost} т.</span>
                          </p>
                        </div>
                      ) : (
                        <div>
                             <h3 className="text-sm font-semibold text-gray-200 mb-1.5">Изразходвани Точки:</h3>
                             <p className="text-xs text-gray-400 italic">0 т. или информацията не е налична.</p>
                        </div>
                      )}

                      {/* Display Order Details (User's filled values) */}
                      {order.order_details?.fields && order.order_details.fields.length > 0 && (
                        <div className="pt-3 border-t border-gray-700/30">
                          <h3 className="text-sm font-semibold text-gray-200 mb-1.5">Попълнени Детайли:</h3>
                          <div className="bg-gray-700/30 p-3 rounded-md space-y-1.5 max-h-48 overflow-y-auto border border-gray-600/40">
                            {order.order_details.fields.map((fieldDetail, index) => (
                              <div key={fieldDetail.key || index} className="text-xs grid grid-cols-5 gap-2 items-start">
                                <span className="col-span-2 text-gray-300 font-medium break-words truncate" title={formatLabel(fieldDetail.label, fieldDetail.key)}>
                                    {formatLabel(fieldDetail.label, fieldDetail.key)}:
                                </span>
                                <div className="col-span-3 text-gray-100">
                                    {renderFieldValue(fieldDetail.display !== undefined ? fieldDetail.display : fieldDetail.value, fieldDetail.type)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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