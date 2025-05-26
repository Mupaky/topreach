// app/admin/formulas/AdminFormulasClient.jsx
"use client";

import { useState, useEffect } from "react";
import FormulaBuilder from "@/components/dashboard/FormulaBuilder";
import { Edit2, Trash2 } from "lucide-react"; // <<< ADD Edit2 HERE
// No getSession or server-side createClient needed here

export default function AdminFormulasClient({ initialUser, initialFormulas, serverFetchError }) {
    const [user, setUser] = useState(initialUser); // User passed as prop
    const [formulas, setFormulas] = useState(initialFormulas || []);
    const [error, setError] = useState(serverFetchError || null);
    const [editingFormula, setEditingFormula] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // For API call loading states
    const [isClientMounted, setIsClientMounted] = useState(false);

    useEffect(() => {
        setIsClientMounted(true); // Component has mounted on the client
    }, []);

    // Update state if props change (e.g., due to revalidation or parent changes)
    useEffect(() => {
        setUser(initialUser);
    }, [initialUser]);

    useEffect(() => {
        setFormulas(initialFormulas || []);
        if (serverFetchError) { // Prioritize server fetch error on initial load
            setError(serverFetchError);
        }
    }, [initialFormulas, serverFetchError]);

    async function handleCreateFormula(formulaData) {
        setIsLoading(true);
        setError(null); // Clear previous errors
        try {
            const method = formulaData.id ? "PUT" : "POST";
            const url = formulaData.id ? `/api/formulas/${formulaData.id}` : "/api/formulas";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formulaData),
            });
            const result = await res.json();
            if (!res.ok) {
                console.error("API error in handleCreateFormula:", result.message, result.errorDetails || result);
                throw new Error(result.message || "Грешка от API при обработка на формула.");
            }

            if (method === "POST") {
                setFormulas((prev) => [...prev, result.formula]);
            } else {
                setFormulas((prev) =>
                    prev.map((f) => (f.id === result.formula.id ? result.formula : f))
                );
            }
            setEditingFormula(null); // Close form
            alert(method === "POST" ? "Формулата е създадена успешно!" : "Формулата е обновена успешно!");
        } catch (err) {
            console.error("Catch error in handleCreateFormula:", err);
            setError(err.message || "Възникна неочаквана грешка при създаване/обновяване на формулата.");
        }
        setIsLoading(false);
    }

    async function deleteFormula(id) {
        setIsLoading(true);
        setError(null); // Clear previous errors
        try {
            const res = await fetch(`/api/formulas/${id}`, { method: "DELETE" });
            if (!res.ok) {
                const result = await res.json();
                console.error("API error in deleteFormula:", result.message, result.errorDetails || result);
                throw new Error(result.message || "Грешка от API при изтриване на формула.");
            }
            setFormulas((prev) => prev.filter((f) => f.id !== id));
            alert("Формулата е изтрита успешно!");
        } catch (err) {
            console.error("Catch error in deleteFormula:", err);
            setError(err.message || "Възникна неочаквана грешка при изтриването на формулата.");
        }
        setIsLoading(false);
    }

    function handleEdit(formula) {
        setEditingFormula(formula);
        setError(null); // Clear errors when opening edit form
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function handleDelete(formula) {
        const confirmed = window.confirm(`Сигурни ли сте, че искате да изтриете формулата "${formula.name}"?`);
        if (confirmed) {
            deleteFormula(formula.id);
        }
    }
    
    if (!isClientMounted) {
        // Optional: Render a minimal loader or null to prevent hydration mismatch issues
        // if initial render relies heavily on client-side state not derived from props.
        // For this component, it might not be strictly necessary if initialFormulas is reliable.
        return <div className="text-white text-center p-10">Инициализиране...</div>;
    }

    // Authorization check based on prop (user object should be up-to-date from server)
    if (!user || user.role !== 'admin') {
        return <div className="text-white text-center p-10">Нямате достъп до тази страница. Моля, влезте като администратор.</div>;
    }

    return (
        <> {/* AdminLayout is now wrapping this component from the server component (page.jsx) */}
            <h1 className="text-2xl font-bold mb-6 text-white">Управление на Формули</h1>
            
            {error && (
                <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-6 shadow-md" role="alert">
                    <p className="font-semibold">⚠️ Грешка:</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            <div className="mb-10 bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700">
                <h2 className="text-xl font-semibold text-accentLighter mb-4 pb-2 border-b border-gray-700">
                    {editingFormula ? "Редактиране на Формула" : "Създай Нова Формула"}
                </h2>
                <FormulaBuilder
                    onSubmit={handleCreateFormula}
                    formula={editingFormula}
                    key={editingFormula ? editingFormula.id : 'new-formula-builder'} // More robust key
                />
                {editingFormula && (
                    <button
                        onClick={() => { setEditingFormula(null); setError(null); }}
                        className="mt-4 text-sm text-gray-400 hover:text-white underline"
                    >
                        Отказ от редакцията
                    </button>
                )}
            </div>

            <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700">
                <h2 className="text-xl font-semibold mb-6 text-white border-b border-gray-700 pb-3">Съществуващи Формули</h2>
                {(formulas.length === 0 && !isLoading && !error) && 
                    <p className="text-gray-400 py-5 text-center">Няма създадени формули.</p>
                }
                {isLoading && formulas.length === 0 && 
                    <p className="text-gray-400 py-5 text-center">Зареждане на формули...</p>
                }
                <ul className="space-y-4">
                    {formulas.map((f) => (
                        <li
                            key={f.id}
                            className="border border-gray-700/80 p-4 rounded-lg bg-gray-700/30 shadow-md hover:shadow-lg transition-shadow"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">{f.name}</h3>
                                    <p className="text-sm text-gray-400">Тип: <span className="font-medium text-gray-300">{f.formType}</span></p>
                                    <p className="text-xs text-gray-500 mt-1">ID: {f.id}</p>
                                </div>
                                <div className="flex gap-2 mt-1 sm:mt-0 shrink-0">
                                    <button
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-md font-medium transition disabled:opacity-60 flex items-center gap-1.5"
                                        onClick={() => handleEdit(f)}
                                        disabled={isLoading}
                                    >
                                        <Edit2 size={14}/> Редактирай
                                    </button>
                                    <button
                                        className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-md font-medium transition disabled:opacity-60 flex items-center gap-1.5"
                                        onClick={() => handleDelete(f)}
                                        disabled={isLoading}
                                    >
                                        <Trash2 size={14}/> Изтрий
                                    </button>
                                </div>
                            </div>
                            {f.description && <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-700/50">{f.description}</p>}
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}