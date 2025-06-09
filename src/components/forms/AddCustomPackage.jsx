// components/forms/AddCustomPackage.jsx
"use client";
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button as ShadButton } from "@/components/ui/button";
import { BeatLoader } from "react-spinners";

export default function AddCustomPackage({
  sortedProfiles,
  onCustomPackageAdded, // Callback to update parent's list
  setParentLoading,
  setParentError,
  setParentSuccess
}) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [editingPoints, setEditingPoints] = useState('');
  const [recordingPoints, setRecordingPoints] = useState('');
  const [designPoints, setDesignPoints] = useState('');
  const [consultingPoints, setConsultingPoints] = useState(''); // <<<< NEW STATE
  const [lifespan, setLifespan] = useState('30');
  const [price, setPrice] = useState('0');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Активен'); // Default status for admin-added package
  const [isLoading, setIsLoading] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      setParentError("Моля, изберете потребител.");
      return;
    }

    const edP = parseInt(editingPoints, 10) || 0;
    const recP = parseInt(recordingPoints, 10) || 0;
    const desP = parseInt(designPoints, 10) || 0;
    const conP = parseInt(consultingPoints, 10) || 0; // <<<< PARSE NEW
    const lifeD = parseInt(lifespan, 10);
    const prc = parseFloat(price);

    if (lifeD <= 0) {
      setParentError("Валидността трябва да е поне 1 ден.");
      return;
    }
    if (prc < 0) {
      setParentError("Цената не може да е отрицателна.");
      return;
    }
    if (edP < 0 || recP < 0 || desP < 0 || conP < 0) { // <<<< VALIDATE NEW
        setParentError("Точките не могат да бъдат отрицателни.");
        return;
    }

    setParentLoading(true);
    setIsLoading(true);
    setParentError(null);
    setParentSuccess(null);

    try {
      const payload = {
        userId: selectedUserId,
        editingPoints: edP,
        recordingPoints: recP,
        designPoints: desP,
        consultingPoints: conP, // <<<< INCLUDE IN PAYLOAD
        lifespan: lifeD,
        price: prc,
        status: status,
        description: description || `Персонален пакет, добавен от администратор на ${new Date().toLocaleDateString('bg-BG')}`,
        type: "points", // To match what /api/createOrder might expect if you reuse it
      };

      // This API endpoint should insert into 'pointsorders' table
      const response = await fetch('/api/createOrder', { // Reusing /api/createOrder
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Грешка при създаване на персоналния пакет.");
      }

      setParentSuccess(result.message || "Персоналният пакет е добавен успешно!");
      if (result.order && onCustomPackageAdded) { // result.order should be the new pointsorder
        onCustomPackageAdded(result.order);
      }
      // Reset form
      setSelectedUserId(''); setEditingPoints(''); setRecordingPoints('');
      setDesignPoints(''); setConsultingPoints(''); setLifespan('30'); // Reset new
      setPrice('0'); setDescription(''); setStatus('Активен');

    } catch (err) {
      console.error("Error creating custom package:", err);
      setParentError(err.message);
    } finally {
      setParentLoading(false);
      setIsLoading(false);
    }
  };

  const inputClassName = "w-full bg-gray-700 border-gray-600 px-3 py-2 rounded-md text-white text-sm placeholder-gray-400 focus:ring-1 focus:ring-accent focus:border-transparent";
  const labelClassName = "block text-xs font-medium text-gray-300 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="custom-pkg-user" className={labelClassName}>Потребител <span className="text-red-500">*</span></label>
        <select id="custom-pkg-user" value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} required className={inputClassName}>
          <option value="">-- Избери потребител --</option>
          {(sortedProfiles || []).map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.fullname} ({profile.email})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div><label className={labelClassName}>Точки Монтаж</label><Input type="number" min="0" placeholder="0" value={editingPoints} onChange={(e) => setEditingPoints(e.target.value)} className={inputClassName} /></div>
        <div><label className={labelClassName}>Точки Запис</label><Input type="number" min="0" placeholder="0" value={recordingPoints} onChange={(e) => setRecordingPoints(e.target.value)} className={inputClassName} /></div>
        <div><label className={labelClassName}>Точки Дизайн</label><Input type="number" min="0" placeholder="0" value={designPoints} onChange={(e) => setDesignPoints(e.target.value)} className={inputClassName} /></div>
        <div><label className={labelClassName}>Точки Консултации</label><Input type="number" min="0" placeholder="0" value={consultingPoints} onChange={(e) => setConsultingPoints(e.target.value)} className={inputClassName} /></div> {/* <<<< NEW INPUT */}
      </div>
       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div><label className={labelClassName}>Валидност (дни) <span className="text-red-500">*</span></label><Input type="number" min="1" value={lifespan} onChange={(e) => setLifespan(e.target.value)} required className={inputClassName} /></div>
        <div><label className={labelClassName}>Цена (лв) <span className="text-red-500">*</span></label><Input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required className={inputClassName} /></div>
        <div>
            <label className={labelClassName}>Статус</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClassName}>
                <option value="Активен">Активен</option>
                <option value="Чака плащане">Чака плащане</option>
                <option value="Подарък">Подарък</option> {/* Example other status */}
            </select>
        </div>
      </div>
      <div>
        <label className={labelClassName}>Описание/Бележка</label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className={inputClassName} rows="2" placeholder="Напр. Бонус точки, Специален пакет за лоялност..." />
      </div>
      <ShadButton type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-accentLighter text-white font-semibold">
        {isLoading ? <BeatLoader size={8} color="white" /> : "Добави Персонален Пакет"}
      </ShadButton>
      <style jsx>{` /* ... same styles ... */ `}</style>
    </form>
  );
}