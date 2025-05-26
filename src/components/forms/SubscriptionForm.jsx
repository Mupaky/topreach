"use client";

import { useState } from "react";

export default function SubscriptionForm() {
  const [plan, setPlan] = useState("");
  const [price, setPrice] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("/api/subscriptions", {
      method: "POST",
      body: JSON.stringify({
        plan,
        price: parseFloat(price),
        end_date: endDate,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (response.ok) {
      setMessage("✅ Абонаментът е добавен успешно!");
      setPlan("");
      setPrice("");
      setEndDate("");
    } else {
      setMessage("❌ Грешка: " + data.message);
    }
  };

  return (
    <div className="flex flex-col gap-5 border p-5 rounded-xl bg-background border-secondary max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-2 text-accent">Създай абонамент</h2>

      <input
        type="text"
        placeholder="Име на план (напр. Pro, Premium)"
        value={plan}
        onChange={(e) => setPlan(e.target.value)}
        className="border rounded-lg p-2 bg-background text-foreground border-secondary"
        required
      />

      <input
        type="number"
        step="0.01"
        min="0"
        placeholder="Цена в лв."
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="border rounded-lg p-2 bg-background text-foreground border-secondary"
        required
      />

      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="border rounded-lg p-2 bg-background text-foreground border-secondary"
        required
      />

      <button
        type="submit"
        onClick={handleSubmit}
        className="mt-2 p-2 bg-accent hover:bg-accentLighter text-white rounded-lg"
      >
        Запази абонамент
      </button>

      {message && (
        <p
          className={`text-sm mt-2 rounded px-3 py-2 ${
            message.startsWith("✅")
              ? "bg-green-800/30 text-green-300"
              : "bg-red-800/30 text-red-300"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
