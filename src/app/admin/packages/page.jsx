// app/admin/packages/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/dashboard/AdminLayout";
import { createClient } from "@/utils/client";
import { PlusCircle, Edit, Trash2, Save, XCircle } from "lucide-react"; // Icons

const supabase = createClient();

export default function AdminPackagesPage() {
    const [packages, setPackages] = useState([]);
    const [isLoadingPackages, setIsLoadingPackages] = useState(true);
    const [error, setError] = useState(null);
    const [showAddPackageForm, setShowAddPackageForm] = useState(false);
    const [newPackageData, setNewPackageData] = useState({
        editingPoints: "",
        recordingPoints: "",
        designPoints: "",
        price: "",
        lifespan: "",
    });

    useEffect(() => {
        async function loadPackages() {
            setIsLoadingPackages(true);
            setError(null);
            const { data, error: fetchError } = await supabase
                .from("pointsPackages")
                .select("*")
                .order("created_at", { ascending: false });

            if (fetchError) {
                console.error("Failed to fetch packages:", fetchError.message);
                setError("⚠️ Грешка при зареждане на пакетите.");
                setPackages([]);
            } else {
                setPackages(data || []);
            }
            setIsLoadingPackages(false);
        }
        loadPackages();
    }, []);

    async function handleDeletePackage(packageId) {
        if (!packageId) return;
        if (!window.confirm(`Сигурни ли сте, че искате да изтриете пакет с ID: ${packageId}? Тази операция е необратима.`)) {
            return;
        }
        try {
            const response = await fetch("/api/packages", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ packageId }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || `Failed to delete package.`);
            }
            setPackages((prevPackages) => prevPackages.filter((pkg) => pkg.id !== packageId));
            alert(result.message || "Пакетът е изтрит успешно!");
            setError(null); // Clear previous errors on success
        } catch (error) {
            console.error("Failed to delete package:", error);
            setError(`Грешка при изтриване: ${error.message}`);
            // alert(`Грешка при изтриване на пакет: ${error.message}`); // Alert might be redundant if error state is shown
        }
    }

    async function updatePackage(pkg) { // Pass the whole package object
        const { id: packageId, editingPoints, recordingPoints, designPoints, price, lifespan } = pkg;

        if (!packageId || editingPoints == null || recordingPoints == null || designPoints == null || price == null || parseFloat(price) <= 0 || parseInt(editingPoints) < 0 || parseInt(recordingPoints) < 0 || parseInt(designPoints) < 0 || parseInt(lifespan) <= 0) {
            alert("Моля, въведете валидни положителни стойности за всички полета на пакета.");
            return;
        }
        try {
            const response = await fetch("/api/packages", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    packageId,
                    editingPoints: parseInt(editingPoints, 10),
                    recordingPoints: parseInt(recordingPoints, 10),
                    designPoints: parseInt(designPoints, 10),
                    price: parseFloat(price),
                    lifespan: parseInt(lifespan, 10),
                }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || "Failed to update package.");
            }
            setPackages((prevPackages) =>
                prevPackages.map((p) =>
                    p.id === packageId ? { ...result.package } : p
                )
            );
            alert("Пакетът е обновен успешно!");
            setError(null);
        } catch (error) {
            console.error("Failed to update package:", error);
            setError(`Грешка при обновяване: ${error.message}`);
            // alert(`Грешка при обновяване на пакет: ${error.message}`);
        }
    }

    async function handleAddPackage() {
        const { editingPoints, recordingPoints, designPoints, price, lifespan } = newPackageData;
        if (!editingPoints || !recordingPoints || !designPoints || !price || !lifespan ||
            isNaN(parseFloat(price)) || parseFloat(price) <= 0 ||
            isNaN(parseInt(editingPoints)) || parseInt(editingPoints) < 0 ||
            isNaN(parseInt(recordingPoints)) || parseInt(recordingPoints) < 0 ||
            isNaN(parseInt(designPoints)) || parseInt(designPoints) < 0 ||
            isNaN(parseInt(lifespan)) || parseInt(lifespan) <= 0
        ) {
            alert("Моля, попълнете всички полета с валидни положителни стойности.");
            return;
        }
        try {
            const res = await fetch("/api/packages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    editingPoints: parseInt(editingPoints, 10),
                    recordingPoints: parseInt(recordingPoints, 10),
                    designPoints: parseInt(designPoints, 10),
                    price: parseFloat(price),
                    lifespan: parseInt(lifespan, 10),
                }),
            });
            const result = await res.json();
            if (!res.ok) {
                setError(`Грешка при добавяне: ${result.message || 'Възникна грешка'}`);
                // alert(`Грешка при добавяне: ${result.message || 'Възникна грешка'}`);
                return;
            }
            if (result.package && result.package.id) {
                setPackages((prev) => [result.package, ...prev]);
            }
            setNewPackageData({ editingPoints: "", recordingPoints: "", designPoints: "", price: "", lifespan: "" });
            setShowAddPackageForm(false);
            alert("Пакетът е добавен успешно!");
            setError(null);
        } catch (error) {
            console.error("Error adding package:", error);
            setError("Неочаквана грешка при създаване на пакета.");
            // alert("Възникна неочаквана грешка при създаването на пакета.");
        }
    }

    const handlePackageDetailChange = (packageId, field, value) => {
        let parsedValue = value;
        if (field !== 'price') { // Points and lifespan should be integers
            parsedValue = parseInt(value, 10);
            if (isNaN(parsedValue)) parsedValue = field === 'lifespan' ? 1 : 0; // Default if parsing fails
        } else { // Price can be float
            parsedValue = parseFloat(value);
            if (isNaN(parsedValue)) parsedValue = 0.01;
        }
         // Ensure non-negative for points, positive for lifespan/price
        if ((field === 'lifespan' || field === 'price') && parsedValue <= 0) {
            parsedValue = field === 'lifespan' ? 1 : 0.01;
        } else if (field !== 'price' && parsedValue < 0) {
            parsedValue = 0;
        }


        setPackages(prevPackages =>
            prevPackages.map(pkg =>
                pkg.id === packageId ? { ...pkg, [field]: parsedValue } : pkg
            )
        );
    };

    // Consistent input styling
    const inputClassName = "w-full bg-gray-700 border-gray-600 px-3 py-2 rounded-md text-white text-sm placeholder-gray-400 focus:ring-2 focus:ring-accent focus:border-transparent transition-colors";
    const labelClassName = "block text-xs font-medium text-gray-400 mb-1";
    const buttonBaseClassName = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";


    return (
        <AdminLayout>
            <div className="space-y-10">
                <h1 className="text-3xl font-bold text-white">Управление на Пакети с Точки</h1>

                {error && (
                    <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-6" role="alert">
                        <p><span className="font-bold">Грешка:</span> {error}</p>
                    </div>
                )}

                {/* --- Add Package Section --- */}
                <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700">
                    <button
                        onClick={() => setShowAddPackageForm(!showAddPackageForm)}
                        className={`${buttonBaseClassName} bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-5 mb-6 text-sm font-semibold`}
                    >
                        <PlusCircle size={18} className="mr-2" />
                        {showAddPackageForm ? "Скрий Формата" : "Добави Нов Пакет"}
                    </button>

                    {showAddPackageForm && (
                        <div className="border border-gray-700/50 p-6 rounded-lg mb-8 flex flex-col gap-5 bg-gray-800/50 shadow-inner">
                            <h3 className="text-xl font-semibold text-accentLighter">Форма за Нов Пакет</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-end">
                                <div>
                                    <label htmlFor="newEditingPoints" className={labelClassName}>Точки (Видео)</label>
                                    <input id="newEditingPoints" type="number" min="0" placeholder="0" value={newPackageData.editingPoints} onChange={(e) => setNewPackageData({ ...newPackageData, editingPoints: e.target.value })} className={inputClassName} />
                                </div>
                                <div>
                                    <label htmlFor="newRecordingPoints" className={labelClassName}>Точки (Запис)</label>
                                    <input id="newRecordingPoints" type="number" min="0" placeholder="0" value={newPackageData.recordingPoints} onChange={(e) => setNewPackageData({ ...newPackageData, recordingPoints: e.target.value })} className={inputClassName} />
                                </div>
                                <div>
                                    <label htmlFor="newDesignPoints" className={labelClassName}>Точки (Дизайн)</label>
                                    <input id="newDesignPoints" type="number" min="0" placeholder="0" value={newPackageData.designPoints} onChange={(e) => setNewPackageData({ ...newPackageData, designPoints: e.target.value })} className={inputClassName} />
                                </div>
                                <div>
                                    <label htmlFor="newPrice" className={labelClassName}>Цена (лв.)</label>
                                    <input id="newPrice" type="number" min="0.01" step="0.01" placeholder="0.00" value={newPackageData.price} onChange={(e) => setNewPackageData({ ...newPackageData, price: e.target.value })} className={inputClassName} />
                                </div>
                                <div>
                                    <label htmlFor="newLifespan" className={labelClassName}>Валидност (дни)</label>
                                    <input id="newLifespan" type="number" min="1" placeholder="30" value={newPackageData.lifespan} onChange={(e) => setNewPackageData({ ...newPackageData, lifespan: e.target.value })} className={inputClassName} />
                                </div>
                                <div className="sm:col-span-2 lg:col-span-1"> {/* Button alignment */}
                                    <button
                                        onClick={handleAddPackage}
                                        className={`${buttonBaseClassName} bg-green-600 hover:bg-green-700 text-white py-2.5 px-5 w-full sm:w-auto text-sm font-semibold`}
                                    >
                                        <Save size={18} className="mr-2" />
                                        Създай Пакет
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {/* --- End Add Package Section --- */}


                {/* --- Existing Packages List --- */}
                <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700">
                    <h2 className="text-2xl font-semibold mb-6 text-white border-b border-gray-700 pb-3">Съществуващи Пакети</h2>
                    {isLoadingPackages ? (
                        <p className="text-gray-400 py-10 text-center">Зареждане на пакети...</p>
                    ) : packages.length > 0 ? (
                        <div className="space-y-8">
                            {packages.map((pkg) => (
                                <div key={pkg.id} className="flex flex-col gap-5 border border-gray-700/80 bg-gray-800/50 p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                                    <div className="flex flex-wrap justify-between items-start gap-x-4 gap-y-2 border-b border-gray-700/50 pb-3 mb-3">
                                        <p className="text-md font-semibold text-accentLighter">
                                            Пакет ID: <span className="font-mono text-xs text-gray-400 align-middle">{pkg.id}</span>
                                        </p>
                                        <div className="text-sm text-gray-400">
                                            <label htmlFor={`lifespan-${pkg.id}`} className={labelClassName}>Валидност (дни)</label>
                                            <input id={`lifespan-${pkg.id}`} type="number" min="1" value={pkg.lifespan}
                                                onChange={(e) => handlePackageDetailChange(pkg.id, 'lifespan', e.target.value)}
                                                className={`${inputClassName} w-28 text-center py-1.5`} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-end">
                                        <div>
                                            <label htmlFor={`edit-${pkg.id}`} className={labelClassName}>Видео (т.)</label>
                                            <input id={`edit-${pkg.id}`} type="number" min="0" value={pkg.editingPoints}
                                                onChange={(e) => handlePackageDetailChange(pkg.id, 'editingPoints', e.target.value)}
                                                className={inputClassName} />
                                        </div>
                                        <div>
                                            <label htmlFor={`rec-${pkg.id}`} className={labelClassName}>Запис (т.)</label>
                                            <input id={`rec-${pkg.id}`} type="number" min="0" value={pkg.recordingPoints}
                                                onChange={(e) => handlePackageDetailChange(pkg.id, 'recordingPoints', e.target.value)}
                                                className={inputClassName} />
                                        </div>
                                        <div>
                                            <label htmlFor={`design-${pkg.id}`} className={labelClassName}>Дизайн (т.)</label>
                                            <input id={`design-${pkg.id}`} type="number" min="0" value={pkg.designPoints}
                                                onChange={(e) => handlePackageDetailChange(pkg.id, 'designPoints', e.target.value)}
                                                className={inputClassName} />
                                        </div>
                                        <div>
                                            <label htmlFor={`price-${pkg.id}`} className={labelClassName}>Цена (лв.)</label>
                                            <input id={`price-${pkg.id}`} type="number" min="0.01" step="0.01" value={pkg.price}
                                                onChange={(e) => handlePackageDetailChange(pkg.id, 'price', e.target.value)}
                                                className={inputClassName} />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 items-center mt-4 pt-4 border-t border-gray-700/50">
                                        <button
                                            onClick={() => updatePackage(pkg)} // Pass the whole pkg object
                                            className={`${buttonBaseClassName} bg-green-600 hover:bg-green-700 text-white py-2 px-4 text-xs`}
                                        >
                                            <Save size={16} className="mr-1.5" />
                                            Запази
                                        </button>
                                        <button
                                            onClick={() => handleDeletePackage(pkg.id)}
                                            className={`${buttonBaseClassName} bg-red-600 hover:bg-red-700 text-white py-2 px-4 text-xs`}
                                        >
                                            <Trash2 size={16} className="mr-1.5" />
                                            Изтрий
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 py-10 text-center">Няма налични пакети за управление.</p>
                    )}
                </div>
                {/* --- End Existing Packages List --- */}
            </div>
            {/* Removed <style jsx global> as inputClassName is now applied directly */}
        </AdminLayout>
    );
}