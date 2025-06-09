// components/forms/AddPoints.jsx
"use client";
import React, { useState, useEffect, useMemo } from "react"; // Added useMemo
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button as ShadButton } from "@/components/ui/button";
import { BeatLoader } from "react-spinners";
// No createClient needed here if all data comes via props

export default function AddPoints({
  sortedProfiles,
  allPointsOrders, // <<<< NEW PROP: Pass the full list of orders from parent
  onPointsUpdated,
  setParentLoading,
  setParentError,
  setParentSuccess,
}) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userSpecificOrders, setUserSpecificOrders] = useState([]); // For the package dropdown
  const [selectedPackageOrderId, setSelectedPackageOrderId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false); // Local loading for this form's submit

  const [actionType, setActionType] = useState("add");
  const [pointsType, setPointsType] = useState("editingPoints");
  const [pointsCount, setPointsCount] = useState("");
  const [reason, setReason] = useState("");

  // Filter user's packages when a user is selected or allPointsOrders prop changes
  useEffect(() => {
    if (selectedUserId && Array.isArray(allPointsOrders)) {
      console.log(`[AddPoints] Filtering orders for selectedUser: ${selectedUserId}`);
      const filtered = allPointsOrders
        .filter(order => order.user === selectedUserId || order.user_id === selectedUserId || order.profiles?.id === selectedUserId)
        // Optionally, filter further for only 'Активен' packages if admin should only adjust active ones
        // .filter(order => order.status === 'Активен')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setUserSpecificOrders(filtered);
      setSelectedPackageOrderId(''); // Reset selected package
      console.log(`[AddPoints] Filtered packages for user ${selectedUserId}:`, filtered);
    } else {
      setUserSpecificOrders([]);
      setSelectedPackageOrderId('');
    }
  }, [selectedUserId, allPointsOrders]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !selectedPackageOrderId || !pointsType || !pointsCount || !reason) {
      setParentError("Моля, попълнете всички полета: потребител, пакет, тип точки, количество и причина.");
      return;
    }
    const count = parseInt(pointsCount, 10);
    if (isNaN(count) || count <= 0) {
      setParentError("Броят точки трябва да е положително число.");
      return;
    }

    setParentLoading(true);
    setIsProcessing(true);
    setParentError(null);
    setParentSuccess(null);

    try {
      const response = await fetch(`/api/admin/adjust-user-points`, { // Your dedicated API
        method: "POST", // Or PUT, depending on your API design for adjustments
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageOrderId: selectedPackageOrderId, // ID of the pointsorder to adjust
          actionType,
          pointsType,
          pointsCount: count,
          reason,
          // userId: selectedUserId, // API can get this from packageOrderId's record or take it for validation
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Грешка при обновяване на точките.");
      }

      setParentSuccess(result.message || "Точките са обновени успешно!");
      if (result.updatedOrder && onPointsUpdated) {
        onPointsUpdated(result.updatedOrder); // Update parent's list
      }
      
      // Reset only action fields, keep user and package selected if admin wants to make more changes
      // Or reset all if preferred:
      // setSelectedUserId(''); 
      // setSelectedPackageOrderId(''); 
      setActionType("add");
      setPointsType("editingPoints");
      setPointsCount("");
      setReason("");

    } catch (err) {
      console.error("Error adjusting points in AddPoints:", err);
      setParentError(err.message);
    } finally {
      setParentLoading(false);
      setIsProcessing(false);
    }
  };

  const inputClassName = "w-full bg-gray-700 border-gray-600 px-3 py-2 rounded-md text-white text-sm placeholder-gray-400 focus:ring-1 focus:ring-accent focus:border-transparent";
  const labelClassName = "block text-xs font-medium text-gray-300 mb-1";

  const formatDateShort = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('bg-BG', {day:'2-digit', month:'short'}) : 'N/A';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="add-points-user" className={labelClassName}>Потребител <span className="text-red-500">*</span></label>
        <select
          id="add-points-user"
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          required
          className={`${inputClassName} appearance-none`}
          style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
        >
          <option value="">-- Избери потребител --</option>
          {(sortedProfiles || []).map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.fullname} ({profile.email})
            </option>
          ))}
        </select>
      </div>

      {selectedUserId && (
        <div>
          <label htmlFor="add-points-package-order" className={labelClassName}>Избери Пакет/Поръчка за Корекция <span className="text-red-500">*</span></label>
          <select
            id="add-points-package-order"
            value={selectedPackageOrderId}
            onChange={(e) => setSelectedPackageOrderId(e.target.value)}
            required
            disabled={userSpecificOrders.length === 0} // No need for isFetchingUserPackages if data is from prop
            className={`${inputClassName} appearance-none`}
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
          >
            <option value="">
              {userSpecificOrders.length === 0 ? "Няма пакети за този потребител" : "-- Избери пакет/поръчка --"}
            </option>
            {userSpecificOrders.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                ID:{pkg.id.substring(0,4)}.. ({formatDateShort(pkg.created_at)}) S:{pkg.status} | E:{pkg.editingPoints||0} R:{pkg.recordingPoints||0} D:{pkg.designPoints||0} C:{pkg.consultingPoints||0}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedPackageOrderId && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="add-points-action" className={labelClassName}>Действие <span className="text-red-500">*</span></label>
              <select id="add-points-action" value={actionType} onChange={(e) => setActionType(e.target.value)} className={`${inputClassName} appearance-none`} style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}>
                <option value="add">Добави</option>
                <option value="subtract">Извади</option>
              </select>
            </div>
            <div>
              <label htmlFor="add-points-type" className={labelClassName}>Тип Точки <span className="text-red-500">*</span></label>
              <select id="add-points-type" value={pointsType} onChange={(e) => setPointsType(e.target.value)} className={`${inputClassName} appearance-none`} style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}>
                <option value="editingPoints">Видео Монтаж</option>
                <option value="recordingPoints">Видео Запис</option>
                <option value="designPoints">Дизайн</option>
                <option value="consultingPoints">Консултации</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="add-points-count" className={labelClassName}>Количество Точки <span className="text-red-500">*</span></label>
            <Input id="add-points-count" type="number" min="1" value={pointsCount} onChange={(e) => setPointsCount(e.target.value)} required className={inputClassName} />
          </div>
          <div>
            <label htmlFor="add-points-reason" className={labelClassName}>Причина за Промяната <span className="text-red-500">*</span></label>
            <Textarea id="add-points-reason" value={reason} onChange={(e) => setReason(e.target.value)} required className={`${inputClassName} min-h-[70px]`} rows={3} placeholder="Напр. Бонус, Корекция, Компенсация..." />
          </div>
          <ShadButton type="submit" disabled={isProcessing} className="w-full bg-accent hover:bg-accentLighter text-white font-semibold">
            {isProcessing ? <BeatLoader size={8} color="white" /> : "Запази Промените"}
          </ShadButton>
        </>
      )}
      <style jsx>{`
            .label-xs { @apply block text-xs font-medium text-gray-300 mb-1; }
            .dynamic-field-input { @apply w-full bg-gray-700 border border-gray-600 px-3 py-2 rounded-md text-white text-sm placeholder-gray-400 focus:ring-1 focus:ring-accent; }
            select.dynamic-field-input { @apply appearance-none bg-no-repeat; background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e"); background-position: right 0.5rem center; background-size: 1.5em 1.5em; padding-right: 2.5rem; }
      `}</style>
    </form>
  );
}