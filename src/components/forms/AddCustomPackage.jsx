"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddCustomPackage({ sortedProfiles }) {
  const [selectedUser, setSelectedUser] = useState("");
  const [editingPoints, setEditingPoints] = useState(0);
  const [recordingPoints, setRecordingPoints] = useState(0);
  const [designPoints, setDesignPoints] = useState(0);
  const [lifespanDays, setLifespanDays] = useState(30);
  const router = useRouter();

  const handleSubmit = async () => {
    let missingFields = [];
    if (!selectedUser) missingFields.push("Потребител");
    if (editingPoints < 0) missingFields.push("Видео точки");
    if (recordingPoints < 0) missingFields.push("Запис точки");
    if (designPoints < 0) missingFields.push("Дизайн точки");
    if (lifespanDays <= 0) missingFields.push("Валидност");

    if (missingFields.length > 0) {
      alert(`Моля, попълнете следните полета: ${missingFields.join(", ")}`);
      return;
    }

    try {

        const res = await fetch("/api/pointsorders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser,
          editingPoints: parseInt(editingPoints, 10),
          recordingPoints: parseInt(recordingPoints, 10),
          designPoints: parseInt(designPoints, 10),
          lifespan : parseInt(lifespanDays, 10),
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        alert(`Грешка: ${result.message || 'Неуспешно запазване'}`);
        throw new Error(result.message || 'Failed to save package');
      }
      alert("Пакетът е създаден успешно!");
      router.refresh();
      // Reset form
      setSelectedUser("");
      setEditingPoints(0);
      setRecordingPoints(0);
      setDesignPoints(0);
      setLifespanDays(30);
    } catch (error) {
      console.error("Грешка при създаване на пакет:", error);
      alert("Възникна грешка при създаването.");
    }
  };

  return (
    <div className="flex flex-col gap-5 border p-5 rounded-xl bg-background border-secondary">
      <h2 className="text-2xl font-bold mb-2">Добави персонален пакет за потребител</h2>

      {/* User dropdown */}
      <select
        value={selectedUser}
        onChange={(e) => setSelectedUser(e.target.value)}
        className="border rounded-lg p-2 bg-background text-foreground border-secondary"
      >
        <option value="">Избери потребител</option>
        {sortedProfiles.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.fullname}
          </option>
        ))}
      </select>

      {/* Points inputs */}
      <input
        type="number"
        min="0"
        value={editingPoints}
        onChange={(e) => setEditingPoints(e.target.value)}
        placeholder="Точки Видео Монтаж"
        className="border rounded-lg p-2 bg-background text-foreground border-secondary"
      />
      <input
        type="number"
        min="0"
        value={recordingPoints}
        onChange={(e) => setRecordingPoints(e.target.value)}
        placeholder="Точки Заснемане"
        className="border rounded-lg p-2 bg-background text-foreground border-secondary"
      />
      <input
        type="number"
        min="0"
        value={designPoints}
        onChange={(e) => setDesignPoints(e.target.value)}
        placeholder="Точки Дизайн"
        className="border rounded-lg p-2 bg-background text-foreground border-secondary"
      />
      <input
        type="number"
        min="1"
        value={lifespanDays}
        onChange={(e) => setLifespanDays(e.target.value)}
        placeholder="Валидност (дни)"
        className="border rounded-lg p-2 bg-background text-foreground border-secondary"
      />

      <button
        onClick={handleSubmit}
        className="mt-4 p-2 bg-accent hover:bg-accentLighter text-white rounded-lg"
      >
        Създай пакет
      </button>
    </div>
  );
}
