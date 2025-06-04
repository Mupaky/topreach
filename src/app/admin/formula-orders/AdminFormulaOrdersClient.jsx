// app/admin/formula-orders/AdminFormulaOrdersClient.jsx
"use client";

import { useEffect, useState, useMemo, useRef } from "react"; // Added useRef
import { createClient } from "@/utils/client";
import { ChevronDown, ChevronUp } from "lucide-react";
import { BeatLoader } from "react-spinners";
import { Textarea } from "@/components/ui/textarea"; // Ensure this path is correct for your shadcn/ui Textarea

const supabase = createClient();

export default function AdminFormulaOrdersClient({ initialUser }) {
  const [user, setUser] = useState(initialUser);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderIds, setExpandedOrderIds] = useState(new Set());
  const [isClientMounted, setIsClientMounted] = useState(false);

  // State for managing notes in textareas before saving
  const [currentNotes, setCurrentNotes] = useState({}); // Keyed by order.id
  // Refs for textareas to get scrollHeight
  const notesTextareaRefs = useRef({});
  // State to indicate if notes for a specific order are being updated
  const [isUpdatingNotes, setIsUpdatingNotes] = useState(null); // Stores order.id or null


  const pointTypeLabels = useMemo(() => ({
    editingPoints: "Монтаж",
    recordingPoints: "Заснемане",
    designPoints: "Дизайн",
  }), []);

  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  useEffect(() => {
    if (isClientMounted && (!user || user.role !== 'admin')) {
        setError("Нямате права за достъп до тази страница.");
        setLoading(false);
        return;
    }

    if (isClientMounted && user && user.role === 'admin') {
        async function fetchOrders() {
          setLoading(true);
          setError(null);
          try {
            const { data, error: fetchErr } = await supabase
              .from("formulaorders")
              .select(`
                id, created_at, formula_name_used, status,
                points_cost_breakdown, order_details, admin_notes,
                user_id, profiles (fullname, email)
              `)
              .order("created_at", { ascending: false });
      
            if (fetchErr) throw fetchErr;
            
            const fetchedOrders = data || [];
            setOrders(fetchedOrders);
            // Initialize currentNotes for fetched orders to avoid undefined issues
            const initialNotes = {};
            fetchedOrders.forEach(order => {
                initialNotes[order.id] = order.admin_notes || "";
            });
            setCurrentNotes(initialNotes);

          } catch (err) {
            console.error("Error fetching formula orders:", err);
            setError(`⚠️ Грешка при зареждане на поръчките: ${err.message}`);
            setOrders([]);
          } finally {
            setLoading(false);
          }
        }
        fetchOrders();
    } else if (isClientMounted && !user) {
        setError("Сесията не е намерена. Моля, влезте отново.");
        setLoading(false);
    }
  }, [user, isClientMounted]);

  const adjustTextareaHeight = (textareaElement) => {
    if (textareaElement) {
        textareaElement.style.height = 'auto'; // Reset height to correctly calculate scrollHeight
        textareaElement.style.height = `${textareaElement.scrollHeight}px`;
    }
  };

  const handleNotesInputChange = (orderId, value) => {
    setCurrentNotes(prev => ({ ...prev, [orderId]: value }));
    // Adjust height immediately on input
    if (notesTextareaRefs.current[orderId]) {
        adjustTextareaHeight(notesTextareaRefs.current[orderId]);
    }
  };

  // Effect to adjust textarea height when a card is expanded and notes are populated
  useEffect(() => {
    expandedOrderIds.forEach(orderId => {
        const order = orders.find(o => o.id === orderId);
        // If currentNotes for this order isn't set yet (e.g. first expand after fetch),
        // initialize it from the order data.
        if (order && currentNotes[orderId] === undefined) {
            // This condition might be too strict if currentNotes was already empty string
            // Let's ensure it's set from order.admin_notes if not actively being edited
            setCurrentNotes(prev => ({ ...prev, [orderId]: order.admin_notes || "" }));
        }
        
        // Ensure height is adjusted after state update and textarea might have rendered/re-rendered
        // Using a timeout helps ensure the DOM has updated with the new value/content
        setTimeout(() => {
             if (notesTextareaRefs.current[orderId]) {
                adjustTextareaHeight(notesTextareaRefs.current[orderId]);
            }
        }, 0);
    });
    // Only run when expandedOrderIds or the main orders data changes.
    // currentNotes is removed to prevent loop if setCurrentNotes inside was causing re-trigger.
    // The main purpose is to set initial height on expand.
  }, [expandedOrderIds, orders]);


  const handleAdminNotesSave = async (orderId) => {
    const notesToSave = currentNotes[orderId];
    // If notesToSave is undefined, it means it hasn't been touched by handleNotesInputChange for this expansion.
    // In this case, we don't want to save unless it's different from the original order.admin_notes
    // However, if it *is* defined (even as an empty string from typing then deleting), we compare.

    const orderInState = orders.find(o => o.id === orderId);
    if (orderInState && (orderInState.admin_notes || "") === (notesToSave === undefined ? (orderInState.admin_notes || "") : (notesToSave || ""))) {
        console.log("Admin notes for order", orderId, "haven't effectively changed. No save needed.");
        return;
    }

    setIsUpdatingNotes(orderId);
    setError(null); // Clear general errors

    try {
        const response = await fetch(`/api/admin/formula-orders/${orderId}/notes`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ admin_notes: notesToSave === undefined ? "" : notesToSave }) // Send empty string if notes were cleared
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || "Грешка при запазване на бележките.");
        }
        // Update the main orders state with the newly saved notes
        setOrders(prevOrders =>
            prevOrders.map(o => o.id === orderId ? { ...o, admin_notes: notesToSave } : o)
        );
        // Optional: show a success toast for this specific action
        // For now, error state will be cleared, indicating success for this action.
    } catch (err) {
        console.error(`Error updating admin notes for order ${orderId}:`, err);
        setError(`Бележки за поръчка #${orderId}: ${err.message}`);
        // If optimistic update was done, you might revert currentNotes[orderId] here.
        // But since it's onBlur, the UI already reflects what user typed.
        // The error message will inform them of save failure.
    } finally {
        setIsUpdatingNotes(null);
    }
  };


  const toggleDetails = (id) => {
    setExpandedOrderIds((prevExpanded) => {
      const newSet = new Set(prevExpanded);
      if (newSet.has(id)) {
        newSet.delete(id);
        // When collapsing, check if notes were changed and not saved (onBlur would have saved)
        // For simplicity now, we don't offer a "save before collapse" prompt.
        // We can also reset currentNotes[id] so next expand shows DB value
        setCurrentNotes(prevNotes => {
            const updatedNotes = {...prevNotes};
            // Keep currentNotes if you want to preserve unsaved changes across collapse/expand
            // Or delete to reset: delete updatedNotes[id];
            return updatedNotes;
        });
      } else {
        newSet.add(id);
        // When expanding, ensure currentNotes has the latest from orders state
        // The useEffect for expandedOrderIds already handles initializing/adjusting height
      }
      return newSet;
    });
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setError(null);
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (orderToUpdate && orderToUpdate.status === newStatus) return;

    try {
      const res = await fetch("/api/formulas/update-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, newStatus }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Грешка при обновяване на статуса.");
      }
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error("Error updating status:", err);
      setError(err.message);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
        return new Date(dateString).toLocaleDateString("bg-BG", {
            day: '2-digit', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch (e) {
        return "Invalid Date";
    }
  };
  
  const formatLabel = (label, key) => {
    if (label && String(label).trim() !== "") {
        return label;
    }
    if (key && String(key).trim() !== "") {
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/_/g, ' ')
            .replace(/^./, str => str.toUpperCase());
    }
    return "Неизвестно поле";
  };

  const renderFieldValue = (value, type) => {
    if (type === "checkbox" || type === "yesno") {
      return value ? <span className="text-green-400 font-semibold">Да</span> : <span className="text-red-400 font-semibold">Не</span>;
    }
    if (value === null || value === undefined || String(value).trim() === "") {
        return <span className="italic text-gray-500">Няма стойност</span>;
    }
    if (String(value).includes('\n')) {
        return <pre className="whitespace-pre-wrap text-white font-sans text-xs">{String(value)}</pre>;
    }
    return <span className="text-white">{String(value)}</span>;
  };

  if (!isClientMounted) {
    return <div className="pt-24 px-4 md:px-10 text-white text-center">Инициализиране на интерфейса...</div>;
  }

  if (error && error.includes("Нямате права")) { // Specific auth error
    return (
        <div className="pt-24 px-4 md:px-10 text-white text-center">
            <h1 className="text-2xl font-bold text-red-500">{error}</h1>
        </div>
    );
  }

  return (
    <div className="pt-6 px-0 md:px-4 text-white">
        <h1 className="text-3xl font-bold mb-8 text-center sm:text-left text-gray-100">Управление на Поръчки по Формули</h1>

        {/* General Error Display (not auth related) */}
        {error && !error.includes("Нямате права") && (
            <div className="bg-red-800/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6 shadow-md">
            <p><span className="font-semibold">⚠️ Грешка:</span> {error}</p>
            </div>
        )}

        {loading && (
            <div className="flex justify-center items-center py-20">
                <BeatLoader color="#A78BFA" size={15} />
                <p className="text-gray-400 ml-4">Зареждане на поръчките...</p>
            </div>
        )}

        {!loading && orders.length === 0 && !error && (
            <div className="text-center py-10 bg-gray-800 rounded-lg shadow-md border border-gray-700">
                <p className="text-gray-400 text-lg">Няма намерени поръчки по формули.</p>
                <p className="text-sm text-gray-500 mt-2">Когато потребителите направят поръчки, те ще се появят тук.</p>
            </div>
        )}

        {!loading && orders.length > 0 && (
            <div className="space-y-4">
            {orders.map((order) => {
                const isExpanded = expandedOrderIds.has(order.id);
                const userFullname = order.profiles?.fullname || 'Няма данни за име';
                const userEmail = order.profiles?.email || 'Няма данни за имейл';
                
                return (
                <div
                    key={order.id}
                    className="bg-gray-800 border border-gray-700/60 rounded-lg shadow-lg transition-shadow hover:shadow-accent/20"
                >
                    <div
                    className="flex flex-col sm:flex-row justify-between sm:items-center p-4 cursor-pointer hover:bg-gray-700/40 transition-colors duration-150 ease-in-out gap-3 sm:gap-4"
                    onClick={() => toggleDetails(order.id)}
                    >
                        <div className="flex-1 min-w-0">
                            <h2 className="text-md sm:text-lg font-semibold text-accentLighter truncate" title={order.formula_name_used || "Без Име"}>
                            Поръчка #{order.id} — {order.formula_name_used || "Без Име"}
                            </h2>
                            <p className="text-xs text-gray-400 mt-1">
                            Клиент: <span className="font-medium text-gray-200">{userFullname}</span>
                            <span className="text-gray-500"> ({userEmail})</span>
                            </p>
                            <p className="text-xs text-gray-400">
                            Дата: {formatDate(order.created_at)}
                            </p>
                        </div>
                        <div className="flex items-center gap-3 mt-2 sm:mt-0 ml-0 sm:ml-2 shrink-0 self-start sm:self-center">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm ${
                                order.status === 'Завършена' ? 'bg-green-600/80 text-green-50 border border-green-500/50' :
                                order.status === 'Отказана' ? 'bg-red-600/80 text-red-50 border border-red-500/50' :
                                'bg-yellow-600/80 text-yellow-50 border border-yellow-500/50'
                            }`}>
                                {order.status || "Неизвестен"}
                            </span>
                            {isExpanded ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}
                        </div>
                    </div>

                    {isExpanded && (
                    <div className="px-4 pb-4 pt-3 border-t border-gray-700 space-y-5 bg-gray-800/50 rounded-b-lg">
                        {/* Section for Status Update */}
                        <div className="flex flex-wrap items-center gap-2 pt-2">
                            <label htmlFor={`status-${order.id}`} className="text-sm text-gray-300 whitespace-nowrap font-medium">Промени статус:</label>
                            <select
                                id={`status-${order.id}`}
                                value={order.status || ""}
                                onChange={(e) => { e.stopPropagation(); updateOrderStatus(order.id, e.target.value); }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-gray-700 border border-gray-600 px-3 py-1.5 rounded-md text-white text-xs focus:ring-1 focus:ring-accent focus:border-accent shadow-sm appearance-none"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                            >
                                <option value="Обработва се">Обработва се</option>
                                <option value="В изпълнение">В изпълнение</option>
                                <option value="Завършена">Завършена</option>
                                <option value="Отказана">Отказана</option>
                            </select>
                        </div>
                        
                        {/* Section for Points Cost Breakdown */}
                        {order.points_cost_breakdown && Object.keys(order.points_cost_breakdown).length > 0 && (
                            <div className="mt-2 pt-3 border-t border-gray-700/40">
                                <h4 className="text-sm text-gray-200 font-semibold mb-2">Разбивка Изразходвани Точки:</h4>
                                <ul className="space-y-1.5 text-xs pl-1">
                                    {Object.entries(order.points_cost_breakdown)
                                        .filter(([_, cost]) => Number(cost) > 0)
                                        .map(([type, cost]) => (
                                        <li key={type} className="text-gray-300 items-center">
                                            <span className="text-gray-300 font-medium">
                                                {pointTypeLabels[type] || type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                                            </span>
                                            <span className="font-semibold text-accentLighter">
                                                {Number(cost)} т.
                                            </span>
                                        </li>
                                    ))}
                                    {Object.values(order.points_cost_breakdown).every(cost => Number(cost) === 0) && (
                                        <li className="text-gray-500 italic">Няма изразходвани точки за тази поръчка.</li>
                                    )}
                                </ul>
                            </div>
                        )}
                        
                        {/* Section for Order Details (Filled Fields) */}
                        {order.order_details?.fields && order.order_details.fields.length > 0 && (
                          <div className="mt-2 pt-3 border-t border-gray-700/40">
                            <h4 className="text-sm text-gray-200 font-semibold mb-2">Попълнени Данни от Формулата:</h4>
                            <div className="bg-gray-700/40 p-3 rounded-md space-y-2 max-h-60 overflow-y-auto border border-gray-600/50">
                              {order.order_details.fields.map((fieldDetail, index) => (
                                  <div key={fieldDetail.key || index} className="text-xs grid grid-cols-3 gap-2 items-start border-b border-gray-600/30 pb-1.5 last:border-b-0 last:pb-0">
                                    <span className="col-span-1 text-gray-300 font-medium break-words">
                                        {formatLabel(fieldDetail.label, fieldDetail.key)}:
                                    </span>
                                    <div className="col-span-2">
                                        {renderFieldValue(fieldDetail.display !== undefined ? fieldDetail.display : fieldDetail.value, fieldDetail.type)}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {/* Admin Notes Section */}
                        <div className="mt-3 pt-3 border-t border-gray-700/40">
                          <h4 className="text-sm text-gray-200 font-semibold mb-2">Администраторски Бележки:</h4>
                          <Textarea
                              ref={(el) => (notesTextareaRefs.current[order.id] = el)}
                              value={currentNotes[order.id] !== undefined ? currentNotes[order.id] : ""}
                              onChange={(e) => handleNotesInputChange(order.id, e.target.value)}
                              onBlur={() => {
                                  const orderInState = orders.find(o => o.id === order.id);
                                  if (orderInState && (orderInState.admin_notes || "") !== (currentNotes[order.id] || "")) {
                                      handleAdminNotesSave(order.id);
                                  }
                              }}
                              placeholder="Вътрешни бележки за тази поръчка..."
                              className="bg-gray-700 border-gray-600 text-white text-xs p-2 rounded-md w-full min-h-[60px] focus:ring-1 focus:ring-accent resize-none overflow-hidden"
                              onClick={(e) => e.stopPropagation()}
                              disabled={isUpdatingNotes === order.id}
                              rows={3}
                          />
                          {isUpdatingNotes === order.id && <BeatLoader color="#A78BFA" size={8} className="inline-block ml-2 mt-1 align-bottom" />}
                        </div>

                        {/* Legacy Data Display (if needed) */}
                         {(order.total_points_cost !== undefined || order.points_type_charged) &&
                         !Object.keys(order.points_cost_breakdown || {}).some(k => (order.points_cost_breakdown[k] || 0) > 0) && (
                             <div className="mt-2 pt-3 border-t border-gray-700/40">
                                <p className="text-xs text-gray-500 italic mb-1">Информация (стар формат):</p>
                                {order.total_points_cost !== undefined && <p className="text-xs text-gray-500">Общо точки: {order.total_points_cost}</p>}
                                {order.points_type_charged && <p className="text-xs text-gray-500">Тип точки: {order.points_type_charged}</p>}
                            </div>
                        )}
                    </div>
                    )}
                </div>
                );
            })}
            </div>
        )}
    </div>
  );
}