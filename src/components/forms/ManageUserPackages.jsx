// components/forms/ManageUserPackages.jsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
// No direct Supabase client needed here if all data is passed as props or updates go via API
import { ChevronDown, ChevronUp, Save, XCircle } from "lucide-react";

// Helper component for the editable package form (can be defined here or imported)
function EditablePackageForm({ pkg: initialPkg, onSave, onCancel }) {
    const [pkgData, setPkgData] = useState({ ...initialPkg });

    useEffect(() => {
        setPkgData({ ...initialPkg });
    }, [initialPkg]);

    const handleChange = (field, value) => {
        let parsedValue = value;
        if (['editingPoints', 'recordingPoints', 'designPoints', 'lifespan'].includes(field)) {
            parsedValue = parseInt(value, 10);
            if (isNaN(parsedValue)) parsedValue = (field === 'lifespan' && value !== '') ? 1 : 0;
        } else if (field === 'price') {
            parsedValue = parseFloat(value);
            if (isNaN(parsedValue)) parsedValue = 0.00;
        }
        if ((field === 'lifespan') && parsedValue <= 0 && value !== '') {
            parsedValue = 1;
        } else if (field !== 'price' && field !== 'status' && parsedValue < 0) {
            parsedValue = 0;
        }
        setPkgData(prev => ({ ...prev, [field]: parsedValue }));
    };
    
    const inputClassName = "w-full bg-gray-700 border-gray-600 px-3 py-1.5 rounded-md text-white text-sm placeholder-gray-400 focus:ring-1 focus:ring-accent focus:border-transparent";
    const labelClassName = "block text-xs font-medium text-gray-400 mb-1";

    return (
        <div className="bg-gray-700/50 p-4 rounded-b-md mt-0 border-t border-gray-600/80 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
                <div>
                    <label htmlFor={`edit-form-editingPoints-${pkgData.id}`} className={labelClassName}>Точки Монтаж</label>
                    <input id={`edit-form-editingPoints-${pkgData.id}`} type="number" min="0" value={pkgData.editingPoints || ''} onChange={(e) => handleChange('editingPoints', e.target.value)} className={inputClassName} />
                </div>
                <div>
                    <label htmlFor={`edit-form-recordingPoints-${pkgData.id}`} className={labelClassName}>Точки Запис</label>
                    <input id={`edit-form-recordingPoints-${pkgData.id}`} type="number" min="0" value={pkgData.recordingPoints || ''} onChange={(e) => handleChange('recordingPoints', e.target.value)} className={inputClassName} />
                </div>
                <div>
                    <label htmlFor={`edit-form-designPoints-${pkgData.id}`} className={labelClassName}>Точки Дизайн</label>
                    <input id={`edit-form-designPoints-${pkgData.id}`} type="number" min="0" value={pkgData.designPoints || ''} onChange={(e) => handleChange('designPoints', e.target.value)} className={inputClassName} />
                </div>
                <div>
                    <label htmlFor={`edit-form-lifespan-${pkgData.id}`} className={labelClassName}>Валидност (дни)</label>
                    <input id={`edit-form-lifespan-${pkgData.id}`} type="number" min="1" value={pkgData.lifespan || ''} onChange={(e) => handleChange('lifespan', e.target.value)} className={inputClassName} />
                </div>
                <div>
                    <label htmlFor={`edit-form-status-${pkgData.id}`} className={labelClassName}>Статус</label>
                    <select 
                        id={`edit-form-status-${pkgData.id}`} 
                        value={pkgData.status || ""} 
                        onChange={(e) => handleChange('status', e.target.value)} 
                        className={inputClassName}
                    >
                        <option value="Активен">Активен</option>
                        <option value="Изтекъл">Изтекъл</option>
                        <option value="Използван">Използван (Нулиран)</option>
                        <option value="Отказана">Отказана</option>
                    </select>
                </div>
                 {/* Price might not be directly editable for pointsorders if it's fixed upon purchase */}
                {/* <div>
                    <label htmlFor={`edit-form-price-${pkgData.id}`} className={labelClassName}>Цена (лв.)</label>
                    <input id={`edit-form-price-${pkgData.id}`} type="number" min="0.01" step="0.01" value={pkgData.price || ''} onChange={(e) => handleChange('price', e.target.value)} className={inputClassName} />
                </div> */}
                 <div className="md:col-span-3">
                    <label htmlFor={`edit-form-description-${pkgData.id}`} className={labelClassName}>Описание/Бележки</label>
                    <textarea id={`edit-form-description-${pkgData.id}`} value={pkgData.description || ''} onChange={(e) => handleChange('description', e.target.value)} className={`${inputClassName} min-h-[60px]`} rows="2"></textarea>
                </div>
            </div>
            <div className="flex gap-2 justify-end mt-3 pt-3 border-t border-gray-600/50">
                <button onClick={() => onSave(pkgData)} className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-1.5 px-3 rounded-md flex items-center">
                    <Save size={14} className="mr-1.5" /> Запази
                </button>
                <button onClick={onCancel} className="bg-gray-500 hover:bg-gray-600 text-white text-xs font-medium py-1.5 px-3 rounded-md flex items-center">
                    <XCircle size={14} className="mr-1.5" /> Откажи
                </button>
            </div>
        </div>
    );
}


export default function ManageUserPackages({ profilesList = [], allPointsOrders = [], onPackageUpdate }) {
    const [selectedUserId, setSelectedUserId] = useState("");
    const [userPackages, setUserPackages] = useState([]);
    const [editingPackageId, setEditingPackageId] = useState(null);
    const [componentError, setComponentError] = useState(null); // Local error state for this component

    useEffect(() => {
        if (selectedUserId) {
            const filtered = (allPointsOrders || [])
                .filter(pkg => pkg.user === selectedUserId)
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setUserPackages(filtered);
            setEditingPackageId(null); // Close any open edit form when user changes
        } else {
            setUserPackages([]);
            setEditingPackageId(null);
        }
    }, [selectedUserId, allPointsOrders]);

    const handleToggleEdit = (packageId) => {
        setEditingPackageId(prevId => (prevId === packageId ? null : packageId));
    };

    const handleSavePackageUpdate = async (updatedPackageData) => {
        setComponentError(null);
        try {
            const response = await fetch(`/api/pointsorders`, { // Target pointsorders API
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    packageId: updatedPackageData.id,
                    editingPoints: parseInt(updatedPackageData.editingPoints, 10),
                    recordingPoints: parseInt(updatedPackageData.recordingPoints, 10),
                    designPoints: parseInt(updatedPackageData.designPoints, 10),
                    lifespan: parseInt(updatedPackageData.lifespan, 10),
                    status: updatedPackageData.status,
                    description: updatedPackageData.description,
                    // price: parseFloat(updatedPackageData.price), // Only if price is part of pointsorders and updatable
                }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || "Failed to update user package.");
            }
            
            // Notify parent component (AdminPointsOrdersPage) to refresh its master list
            if (onPackageUpdate) {
                onPackageUpdate(result.package); // Pass the updated package data back
            }

            setEditingPackageId(null); // Close edit form
            alert("Пакетът на потребителя е обновен успешно!");

        } catch (err) {
            console.error("Error updating user package:", err);
            setComponentError(`Грешка при обновяване: ${err.message}`);
            // alert(`Грешка при обновяване: ${err.message}`); // Parent page will show main error
        }
    };
    
    function formatDate(dateString) {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "Invalid Date";
            return date.toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch (e) { return "Error Date"; }
    }

    const inputClassName = "w-full bg-gray-700 border-gray-600 px-3 py-2 rounded-md text-white text-sm placeholder-gray-400 focus:ring-2 focus:ring-accent focus:border-transparent transition-colors";
    const labelClassName = "block text-sm font-medium text-gray-400 mb-1";

    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700 space-y-6">
            <h3 className="text-xl font-semibold text-white border-b border-gray-700 pb-3">
                Управление на Пакети на Потребител
            </h3>

            {componentError && (
                <div className="bg-red-900/30 border border-red-700 text-red-300 px-3 py-2 rounded-md text-sm" role="alert">
                    {componentError}
                </div>
            )}

            <div>
                <label htmlFor="manage-user-select" className={labelClassName}>Избери потребител:</label>
                <select
                    id="manage-user-select"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className={`${inputClassName} mb-4`}
                >
                    <option value="">Моля, изберете потребител...</option>
                    {(profilesList || []).map(profile => (
                        <option key={profile.id} value={profile.id}>{profile.fullname} ({profile.email})</option>
                    ))}
                </select>
            </div>

            {selectedUserId && userPackages.length === 0 && !componentError && (
                <p className="text-gray-500">Няма намерени пакети за този потребител.</p>
            )}

            {userPackages.length > 0 && (
                <div className="space-y-3">
                    {userPackages.map(pkg => (
                        <div key={pkg.id} className="bg-gray-700/40 rounded-lg border border-gray-600/50 shadow-sm">
                            <div 
                                className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-700/60 transition-colors rounded-t-lg"
                                onClick={() => handleToggleEdit(pkg.id)}
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-400">
                                        ID: <span className="font-mono text-gray-300 truncate" title={pkg.id}>{pkg.id.substring(0,8)}...</span>
                                        <span className="mx-1.5 text-gray-600">|</span>
                                        Дата: {formatDate(pkg.created_at)}
                                        <span className="mx-1.5 text-gray-600">|</span>
                                        Статус: <span className={`font-semibold ${pkg.status === 'Активен' ? 'text-green-400' : 'text-red-400'}`}>{pkg.status || "N/A"}</span>
                                    </p>
                                     <p className="text-xs text-gray-400 mt-0.5">
                                        М: {pkg.editingPoints}т., З: {pkg.recordingPoints}т., Д: {pkg.designPoints}т.
                                        <span className="mx-1.5 text-gray-600">|</span>
                                        Валидност: {pkg.lifespan} дни
                                        {/* Price might not be on pointsorders, or you might not want to show it here */}
                                        {/* <span className="mx-1.5 text-gray-600">|</span> Цена: {pkg.price}лв. */}
                                    </p>
                                </div>
                                <div className="ml-2 shrink-0 text-gray-400 hover:text-white">
                                    {editingPackageId === pkg.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>

                            {editingPackageId === pkg.id && (
                                <EditablePackageForm
                                    pkg={pkg}
                                    onSave={handleSavePackageUpdate}
                                    onCancel={() => setEditingPackageId(null)}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}