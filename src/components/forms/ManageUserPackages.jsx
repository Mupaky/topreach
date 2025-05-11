"use client";

import React, { useState, useEffect } from "react";

export default function ManageUserPackages({ sortedProfiles, pointsOrdersData }) {
  const [selectedUser, setSelectedUser] = useState("");
  const [userPackages, setUserPackages] = useState([]);
  const [editingPackages, setEditingPackages] = useState({});

  useEffect(() => {
    if (selectedUser) {
      const packages = pointsOrdersData.filter((pkg) => pkg.user === selectedUser);
      setUserPackages(packages);
    } else {
      setUserPackages([]);
    }
  }, [selectedUser, pointsOrdersData]);

  const handleFieldChange = (packageId, field, value) => {
    setEditingPackages((prev) => ({
      ...prev,
      [packageId]: {
        ...prev[packageId],
        [field]: value,
      },
    }));
  };

  const handleSave = async (packageId) => {
    const changes = editingPackages[packageId];
    if (!changes) {
      alert("Няма направени промени.");
      return;
    }

    try {
      const response = await fetch("/api/pointsorders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId,
          ...changes,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Неуспешно запазване");
      }

      alert("Промените са запазени успешно!");
      window.location.reload(); // Quick refresh to get updated data
    } catch (error) {
      console.error("Грешка при запазване на пакет:", error);
      alert("Грешка при запазване на пакет.");
    }
  };

  return (
    <div className="flex flex-col gap-5 border p-5 rounded-xl bg-background border-secondary">
      <h2 className="text-2xl font-bold mb-2">Управление на пакети на потребител</h2>

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

      {/* Packages list */}
      {userPackages.length > 0 ? (
        userPackages.map((pkg) => (
          <div
            key={pkg.id}
            className="border p-4 rounded-lg bg-background text-foreground border-secondary flex flex-col gap-4"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm text-muted-foreground">Статус</label>
                <select
                  value={editingPackages[pkg.id]?.status ?? pkg.status ?? ""}
                  onChange={(e) => handleFieldChange(pkg.id, "status", e.target.value)}
                  className="w-full border rounded-lg p-2 bg-background text-foreground border-secondary"
                >
                  <option value="Активен">Активен</option>
                  <option value="Изтекъл">Изтекъл</option>
                  <option value="Неактивен">Неактивен</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="text-sm text-muted-foreground">Валидност (дни)</label>
                <input
                    type="number"
                    min="0"
                    value={editingPackages[pkg.id]?.lifespan !== undefined ? editingPackages[pkg.id].lifespan : pkg.lifespan}
                    onChange={(e) => handleFieldChange(pkg.id, "lifespan", parseInt(e.target.value, 10))} 
                    className="w-full border rounded-lg p-2 bg-background text-foreground border-secondary"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Описание</label>
              <textarea
                readOnly
                value={pkg.description || "Няма описание."}
                rows="4"
                className="w-full border rounded-lg p-2 bg-background text-foreground border-secondary resize-none"
              />
            </div>

            <button
              onClick={() => handleSave(pkg.id)}
              className="self-start px-4 py-2 bg-accent hover:bg-accentLighter text-white rounded-lg"
            >
              Запази промените
            </button>
          </div>
        ))
      ) : selectedUser ? (
        <p>Няма намерени пакети за този потребител.</p>
      ) : (
        <p>Моля, изберете потребител.</p>
      )}
    </div>
  );
}
