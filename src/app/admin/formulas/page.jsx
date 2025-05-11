// app/admin/formulas/page.jsx
"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/dashboard/AdminLayout";
import FormulaBuilder from "@/components/dashboard/FormulaBuilder";
import { createClient } from "@/utils/client";

const supabase = createClient();

export default function AdminFormulasPage() {
  const [formulas, setFormulas] = useState([]);
  const [error, setError] = useState(null);
  const [editingFormula, setEditingFormula] = useState(null);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from("priceFormulas").select("*");
      if (error) {
        console.error("Failed to fetch formulas:", error.message);
        setError("⚠️ Грешка при зареждане на формулите.");
      } else {
        setFormulas(data);
      }
    }
    load();
  }, []);

  async function handleCreateFormula(formulaData) {
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
        console.error("API error:", result.error);
        setError(result.error || "Неуспешно създаване/обновяване на формулата.");
        return;
      }

      if (method === "POST") {
        setFormulas((prev) => [...prev, result.formula]);
      } else {
        setFormulas((prev) =>
          prev.map((f) => (f.id === result.formula.id ? result.formula : f))
        );
      }

      setEditingFormula(null);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Възникна грешка при създаване/обновяване на формулата.");
    }
  }

  async function deleteFormula(id) {
    try {
      const res = await fetch(`/api/formulas/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const result = await res.json();
        console.error("API error:", result.error);
        setError(result.error || "Неуспешно изтриване на формулата.");
        return;
      }

      setFormulas((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Възникна грешка при изтриването.");
    }
  }

  function handleEdit(formula) {
    setEditingFormula(formula);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Optional: scroll to form
  }

  function handleDelete(formula) {
    const confirmed = window.confirm(`Сигурни ли сте, че искате да изтриете формулата "${formula.name}"?`);
    if (confirmed) {
      deleteFormula(formula.id);
    }
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Управление на формули</h1>

      {error && (
        <p className="text-red-500 font-semibold mb-4">
          ⚠️ {error}
        </p>
      )}

      <FormulaBuilder 
        onSubmit={handleCreateFormula} 
        formula={editingFormula}
        key={editingFormula?.id || 'new'} 
      />

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Съществуващи формули</h2>
        <ul className="space-y-4">
          {formulas.map((f) => (
            <li
              key={f.id}
              className="border border-secondary p-4 rounded-lg bg-gray-800 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-white">{f.name}</h3>
              <p className="text-sm text-gray-400">Тип: {f.formType}</p>
              <div className="mt-3 flex gap-2">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1.5 rounded font-medium transition"
                  onClick={() => handleEdit(f)}
                >
                  ✏️ Редактирай
                </button>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-1.5 rounded font-medium transition"
                  onClick={() => handleDelete(f)}
                >
                  🗑️ Изтрий
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </AdminLayout>
  );
}