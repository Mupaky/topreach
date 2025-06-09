// components/forms/ManageUserPackages.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button as ShadButton } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog"; // Assuming DialogFooter is from shadcn
import { BeatLoader } from "react-spinners";
import { ChevronDown, ChevronUp, Save, Trash2 } from "lucide-react";


// --- EditableUserPackageForm Sub-Component ---
function EditableUserPackageForm({ pkgOrder, onSave, onCancel, setParentError, setParentSuccess, setParentLoading }) {
    const [formData, setFormData] = useState({
        editingPoints: pkgOrder.editingPoints || 0,
        recordingPoints: pkgOrder.recordingPoints || 0,
        designPoints: pkgOrder.designPoints || 0,
        consultingPoints: pkgOrder.consultingPoints || 0, // <<<< NEW
        lifespan: pkgOrder.lifespan || 30,
        status: pkgOrder.status || 'Активен',
        description: pkgOrder.description || '',
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => { // Sync with prop changes if pkgOrder ID changes
        setFormData({
            editingPoints: pkgOrder.editingPoints || 0,
            recordingPoints: pkgOrder.recordingPoints || 0,
            designPoints: pkgOrder.designPoints || 0,
            consultingPoints: pkgOrder.consultingPoints || 0, // <<<< NEW
            lifespan: pkgOrder.lifespan || 30,
            status: pkgOrder.status || 'Активен',
            description: pkgOrder.description || '',
        });
    }, [pkgOrder]);


    const handleChange = (field, value) => {
        let parsedValue = value;
        if (['editingPoints', 'recordingPoints', 'designPoints', 'consultingPoints', 'lifespan'].includes(field)) {
            parsedValue = parseInt(value, 10);
            if (isNaN(parsedValue) || (field !== 'lifespan' && parsedValue < 0) || (field === 'lifespan' && parsedValue <= 0)) {
                parsedValue = (field === 'lifespan' ? 1 : 0);
            }
        }
        setFormData(prev => ({ ...prev, [field]: parsedValue }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setParentLoading(true); // Signal parent that an action is in progress
        setIsLoading(true);
        setParentError(null);
        setParentSuccess(null);

        try {
            // This API endpoint needs to handle updates to pointsorders, including consultingPoints
            const response = await fetch(`/api/pointsorders/${pkgOrder.id}`, { // Assuming a route like /api/pointsorders/[orderId]
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData, // Send all form data
                    packageId: pkgOrder.id // Ensure API knows which order to update
                }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Грешка при обновяване на пакета.");
            
            onSave(result.package || result.updatedOrder || result.order); // Pass back the updated order from API (check API response structure)
            setParentSuccess("Пакетът на потребителя е обновен успешно.");
        } catch (err) {
            console.error("Error updating user package:", err);
            setParentError(err.message);
        } finally {
            setParentLoading(false);
            setIsLoading(false);
        }
    };

    const inputClassName = "w-full bg-gray-600 border-gray-500 px-3 py-1.5 rounded-md text-white text-xs placeholder-gray-400 focus:ring-1 focus:ring-accent focus:border-transparent";
    const labelClassName = "block text-xs font-medium text-gray-300 mb-0.5";

    return (
        <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-gray-700/50 rounded-b-md mt-0 border-t border-gray-600">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
                <div><label htmlFor={`form-ep-${pkgOrder.id}`} className={labelClassName}>Монтаж</label><Input id={`form-ep-${pkgOrder.id}`} type="number" min="0" value={formData.editingPoints} onChange={e=>handleChange('editingPoints', e.target.value)} className={inputClassName}/></div>
                <div><label htmlFor={`form-rp-${pkgOrder.id}`} className={labelClassName}>Запис</label><Input id={`form-rp-${pkgOrder.id}`} type="number" min="0" value={formData.recordingPoints} onChange={e=>handleChange('recordingPoints', e.target.value)} className={inputClassName}/></div>
                <div><label htmlFor={`form-dp-${pkgOrder.id}`} className={labelClassName}>Дизайн</label><Input id={`form-dp-${pkgOrder.id}`} type="number" min="0" value={formData.designPoints} onChange={e=>handleChange('designPoints', e.target.value)} className={inputClassName}/></div>
                <div><label htmlFor={`form-cp-${pkgOrder.id}`} className={labelClassName}>Консултации</label><Input id={`form-cp-${pkgOrder.id}`} type="number" min="0" value={formData.consultingPoints} onChange={e=>handleChange('consultingPoints', e.target.value)} className={inputClassName}/></div> {/* <<<< NEW */}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                 <div><label htmlFor={`form-ls-${pkgOrder.id}`} className={labelClassName}>Валидност (дни)</label><Input id={`form-ls-${pkgOrder.id}`} type="number" min="1" value={formData.lifespan} onChange={e=>handleChange('lifespan', e.target.value)} className={inputClassName}/></div>
                <div>
                    <label htmlFor={`form-status-${pkgOrder.id}`} className={labelClassName}>Статус</label>
                    <select id={`form-status-${pkgOrder.id}`} value={formData.status} onChange={e=>handleChange('status', e.target.value)} className={`${inputClassName} appearance-none`} style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}>
                        <option value="Активен">Активен</option><option value="Използван">Използван (Нулиран)</option>
                        <option value="Изтекъл">Изтекъл</option><option value="Отказана">Отказана</option>
                        <option value="Чака плащане">Чака плащане</option>
                    </select>
                </div>
            </div>
            <div><label htmlFor={`form-desc-${pkgOrder.id}`} className={labelClassName}>Описание/Бележки</label><Textarea id={`form-desc-${pkgOrder.id}`} value={formData.description} onChange={e=>handleChange('description', e.target.value)} className={`${inputClassName} min-h-[60px]`} rows="2"/></div>
            <DialogFooter className="pt-3 flex sm:justify-end gap-2">
                <ShadButton type="button" variant="outline" size="sm" onClick={onCancel} className="text-gray-300 border-gray-500 hover:bg-gray-600 h-8 px-3 text-xs">Отказ</ShadButton>
                <ShadButton type="submit" disabled={isLoading} size="sm" className="bg-accent hover:bg-accentLighter text-white h-8 px-3 text-xs">
                    {isLoading ? <BeatLoader size={7} color="#fff" /> : <><Save size={14} className="mr-1"/>Запази Промените</>}
                </ShadButton>
            </DialogFooter>
        </form>
    );
}


export default function ManageUserPackages({
    profilesList = [],
    allPointsOrders = [],
    onPackageUpdate, // Renamed from handlePackageUpdatedInChild for clarity
    onPackageDelete, // New prop for delete callback
    setParentLoading,
    setParentError,
    setParentSuccess
}) {
    const [selectedUserId, setSelectedUserId] = useState('');
    const [userPackages, setUserPackages] = useState([]);
    const [editingOrderId, setEditingOrderId] = useState(null);

    useEffect(() => {
        if (selectedUserId && Array.isArray(allPointsOrders)) {
            const filtered = allPointsOrders
                .filter(order => order.user === selectedUserId || order.user_id === selectedUserId || order.profiles?.id === selectedUserId)
                .sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
            setUserPackages(filtered);
            setEditingOrderId(null); // Close edit form when user changes
        } else {
            setUserPackages([]);
            setEditingOrderId(null);
        }
    }, [selectedUserId, allPointsOrders]);

    const handleToggleEdit = (orderId) => {
        setEditingOrderId(prevId => (prevId === orderId ? null : orderId));
        setParentError(null); // Clear parent errors when opening/closing edit
        setParentSuccess(null);
    };

    const handleDeleteOrder = async (orderId, orderUserEmail) => { // Added orderUserEmail for confirm message
        if (!window.confirm(`Сигурни ли сте, че искате да изтриете тази поръчка с точки (${orderId.substring(0,8)}...) за потребител ${orderUserEmail}?`)) return;
        setParentLoading(true); setParentError(null); setParentSuccess(null);
        try {
            // API endpoint for deleting a specific pointsorder
            const response = await fetch(`/api/pointsorders/${orderId}`, { method: 'DELETE' });
            if (!response.ok) {
                const result = await response.json().catch(() => ({}));
                throw new Error(result.message || "Грешка при изтриване на поръчката.");
            }
            const result = await response.json();
            if (onPackageDelete) {
                onPackageDelete(orderId); // Notify parent to remove from its list
            }
            setParentSuccess(result.message || "Поръчката е изтрита успешно.");
        } catch (err) {
            console.error("Error deleting points order:", err);
            setParentError(err.message);
        } finally {
            setParentLoading(false);
        }
    };

    const inputClassName = "w-full bg-gray-700 border-gray-600 px-3 py-2 rounded-md text-white text-sm placeholder-gray-400 focus:ring-1 focus:ring-accent focus:border-transparent";
    const labelClassName = "block text-xs font-medium text-gray-300 mb-1";

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="manage-user-select" className={labelClassName}>Избери потребител:</label>
                <select
                    id="manage-user-select"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className={`${inputClassName} mb-4 appearance-none`}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                >
                    <option value="">-- Моля, изберете потребител --</option>
                    {(profilesList || []).map(p => <option key={p.id} value={p.id}>{p.fullname} ({p.email})</option>)}
                </select>
            </div>

            {selectedUserId && userPackages.length === 0 &&
                <p className="text-gray-400 text-center py-4">Няма закупени пакети или заредени точки за този потребител.</p>
            }

            {userPackages.map(order => (
                <div key={order.id} className="bg-gray-700/40 p-3 sm:p-4 rounded-lg border border-gray-600/80 shadow">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2">
                        <div>
                            <p className="text-xs text-gray-400">ID Поръчка: <span className="font-mono text-gray-300">{order.id.substring(0,8)}...</span></p>
                            <p className="text-xs text-gray-400">Дата: {new Date(order.created_at).toLocaleDateString('bg-BG', {day:'2-digit', month:'short', year:'numeric'})}</p>
                        </div>
                        <div className="flex gap-2 mt-2 sm:mt-0">
                            <ShadButton variant="outline" size="sm" className="text-xs h-7 px-2.5 border-blue-500/70 text-blue-300 hover:bg-blue-500/20" onClick={() => handleToggleEdit(order.id)}>
                                <Save size={14} className="mr-1"/> {editingOrderId === order.id ? "Скрий Редакция" : "Редактирай Пакет"}
                            </ShadButton>
                             <ShadButton variant="destructive" size="sm" className="text-xs h-7 px-2.5 bg-red-700/80 hover:bg-red-600 text-red-100 border-red-600" onClick={() => handleDeleteOrder(order.id, order.profiles?.email || order.user)}>
                                <Trash2 size={14} className="mr-1"/> Изтрий
                            </ShadButton>
                        </div>
                    </div>
                    <div className="text-xs text-gray-300 grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-1 border-t border-gray-600/50 pt-2">
                        <span>Монтаж: <strong className="text-white">{order.editingPoints || 0}</strong>т.</span>
                        <span>Запис: <strong className="text-white">{order.recordingPoints || 0}</strong>т.</span>
                        <span>Дизайн: <strong className="text-white">{order.designPoints || 0}</strong>т.</span>
                        <span>Консултации: <strong className="text-white">{order.consultingPoints || 0}</strong>т.</span> {/* <<<< NEW */}
                        <span>Валидност: <strong className="text-white">{order.lifespan}</strong> дни</span>
                        <span>Цена: <strong className="text-white">{order.price}</strong>лв</span>
                        <span>Статус: <strong className={`font-semibold ${order.status === 'Активен' ? 'text-green-400' : 'text-yellow-400'}`}>{order.status}</strong></span>
                    </div>
                    {order.description && <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-600/30 italic">Бележки: {order.description}</p>}

                    {editingOrderId === order.id && (
                        <EditableUserPackageForm
                            pkgOrder={order}
                            onSave={onPackageUpdate} // Changed from handleSaveOrderUpdate
                            onCancel={() => setEditingOrderId(null)}
                            setParentError={setParentError}
                            setParentSuccess={setParentSuccess}
                            setParentLoading={setParentLoading}
                        />
                    )}
                </div>
            ))}
            <style jsx>{` /* ... same styles ... */ `}</style>
        </div>
    );
}