// app/admin/packages/AdminPackagesClient.jsx
"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/client"; // Your client-side Supabase instance
import { PlusCircle, Save, Trash2 } from "lucide-react"; // Edit, XCircle not used directly here anymore
import { BeatLoader } from "react-spinners"; // For loading states
import { Input } from "@/components/ui/input";

// This client is for any client-side Supabase interactions IF NEEDED.
// Currently, all data is passed via props initially, and mutations go via API.
// const supabase = createClient(); 
// If loadPackages is only called if initialPackages is empty, this might not be needed.

export default function AdminPackagesClient({ initialUser, initialPackages, fetchErrorMsg }) {
    const [user, setUser] = useState(initialUser);
    const [packages, setPackages] = useState(initialPackages || []);
    const [isLoading, setIsLoading] = useState(false); // Combined loading for add/update/delete
    const [error, setError] = useState(fetchErrorMsg || null);
    const [showAddPackageForm, setShowAddPackageForm] = useState(false);
    const [newPackageData, setNewPackageData] = useState({
        editingPoints: "",
        recordingPoints: "",
        designPoints: "",
        consultingPoints: "", // <<<< NEW
        price: "",
        lifespan: "",
    });
    const [isClientMounted, setIsClientMounted] = useState(false);

    useEffect(() => {
        setIsClientMounted(true);
    }, []);

    useEffect(() => {
        setUser(initialUser);
        setPackages(initialPackages || []);
        setError(fetchErrorMsg || null);

        if ((initialPackages && initialPackages.length > 0) || fetchErrorMsg) {
        } else if (isClientMounted && user?.role === 'admin' && !fetchErrorMsg) {
        }
    }, [initialUser, initialPackages, fetchErrorMsg, isClientMounted, user?.role]);


    // Optional: Client-side load if initialPackages is empty and no server error
    // async function loadPackages() {
    //     if (isLoading) return; // Prevent multiple calls if already loading
    //     setIsLoading(true);
    //     setError(null);
    //     try {
    //         const supabase = createClient(); // Create instance for this call
    //         const { data, error: fetchError } = await supabase
    //             .from("pointsPackages") // Ensure table name is correct
    //             .select("*")
    //             .order("created_at", { ascending: false });

    //         if (fetchError) throw fetchError;
    //         setPackages(data || []);
    //     } catch (err) {
    //         console.error("Client failed to fetch packages:", err.message);
    //         setError("⚠️ Грешка при зареждане на пакетите от клиента.");
    //         setPackages([]);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // }

    async function handleDeletePackage(packageId) {
        if (!packageId || isLoading) return;
        if (!window.confirm(`Сигурни ли сте, че искате да изтриете пакет с ID: ${packageId}?`)) {
            return;
        }
        setIsLoading(true); setError(null);
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
        } catch (err) {
            console.error("Failed to delete package:", err);
            setError(`Грешка при изтриване: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }

    async function updatePackage(pkgToUpdate) {
        if (isLoading) return;
        const { id: packageId, editingPoints, recordingPoints, designPoints, consultingPoints, price, lifespan } = pkgToUpdate;

        // Basic Validation
        if (!packageId || editingPoints == null || recordingPoints == null || designPoints == null || consultingPoints == null || price == null ||
            parseFloat(price) <= 0 || parseInt(editingPoints) < 0 || parseInt(recordingPoints) < 0 ||
            parseInt(designPoints) < 0 || parseInt(consultingPoints) < 0 || 
            parseInt(lifespan) <= 0) {
            alert("Моля, въведете валидни положителни стойности за всички полета на пакета.");
            return;
        }
        setIsLoading(true); setError(null);
        try {
            const response = await fetch("/api/packages", { 
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    packageId,
                    editingPoints: parseInt(editingPoints, 10),
                    recordingPoints: parseInt(recordingPoints, 10),
                    designPoints: parseInt(designPoints, 10),
                    consultingPoints: parseInt(consultingPoints, 10), // <<<< SEND NEW
                    price: parseFloat(price),
                    lifespan: parseInt(lifespan, 10),
                }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || "Failed to update package.");
            }
            // result.package should be the updated package from the API
            setPackages((prevPackages) =>
                prevPackages.map((p) =>
                    p.id === packageId ? { ...p, ...result.package } : p // Merge with existing p to keep other fields if API returns partial
                )
            );
            alert("Пакетът е обновен успешно!");
        } catch (err) {
            console.error("Failed to update package:", err);
            setError(`Грешка при обновяване: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleAddPackage() {
        if (isLoading) return;
        const { editingPoints, recordingPoints, designPoints, consultingPoints, price, lifespan } = newPackageData;

        if (!editingPoints || !recordingPoints || !designPoints || consultingPoints === '' || !price || !lifespan || // Check consultingPoints
            isNaN(parseFloat(price)) || parseFloat(price) <= 0 ||
            isNaN(parseInt(editingPoints)) || parseInt(editingPoints) < 0 ||
            isNaN(parseInt(recordingPoints)) || parseInt(recordingPoints) < 0 ||
            isNaN(parseInt(designPoints)) || parseInt(designPoints) < 0 ||
            isNaN(parseInt(consultingPoints)) || parseInt(consultingPoints) < 0 || // <<<< VALIDATE NEW
            isNaN(parseInt(lifespan)) || parseInt(lifespan) <= 0
        ) {
            alert("Моля, попълнете всички полета с валидни положителни или нула стойности (цена и валидност > 0).");
            return;
        }
        setIsLoading(true); setError(null);
        try {
            const res = await fetch("/api/packages", { // Assumes /api/packages handles POST
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    editingPoints: parseInt(editingPoints, 10),
                    recordingPoints: parseInt(recordingPoints, 10),
                    designPoints: parseInt(designPoints, 10),
                    consultingPoints: parseInt(consultingPoints, 10), // <<<< SEND NEW
                    price: parseFloat(price),
                    lifespan: parseInt(lifespan, 10),
                }),
            });
            const result = await res.json();
            if (!res.ok) {
                throw new Error(result.message || 'Възникна грешка при добавяне');
            }
            if (result.package && result.package.id) {
                setPackages((prev) => [result.package, ...prev].sort((a,b) => new Date(b.created_at) - new Date(a.created_at))); // Add and re-sort
            }
            setNewPackageData({ editingPoints: "", recordingPoints: "", designPoints: "", consultingPoints: "", price: "", lifespan: "" }); // Reset form
            setShowAddPackageForm(false);
            alert("Пакетът е добавен успешно!");
        } catch (err) {
            console.error("Error adding package:", err);
            setError(`Грешка при добавяне: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }

    const handlePackageDetailChange = (packageId, field, value) => {
        let parsedValue = value;
        // Allow 0 for points fields, but ensure price and lifespan are positive
        if (['editingPoints', 'recordingPoints', 'designPoints', 'consultingPoints'].includes(field)) {
            parsedValue = parseInt(value, 10);
            if (isNaN(parsedValue) || parsedValue < 0) parsedValue = 0; // Default to 0 if invalid or negative
        } else if (field === 'price') {
            parsedValue = parseFloat(value);
            if (isNaN(parsedValue) || parsedValue <= 0) parsedValue = 0.01; // Min price
        } else if (field === 'lifespan') {
            parsedValue = parseInt(value, 10);
            if (isNaN(parsedValue) || parsedValue <= 0) parsedValue = 1; // Min lifespan
        }

        setPackages(prevPackages =>
            prevPackages.map(pkg =>
                pkg.id === packageId ? { ...pkg, [field]: parsedValue } : pkg
            )
        );
    };

    const inputClassName = "w-full bg-gray-700 border-gray-600 px-3 py-2 rounded-md text-white text-sm placeholder-gray-400 focus:ring-2 focus:ring-accent focus:border-transparent transition-colors";
    const labelClassName = "block text-xs font-medium text-gray-400 mb-1";
    const buttonBaseClassName = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    if (!isClientMounted) {
        return <div className="text-white text-center p-10">Инициализиране на страницата...</div>;
    }
    if (!user || user.role !== 'admin') {
        return (
            <div className="text-center py-10">
                <h1 className="text-2xl font-bold text-red-500 mb-4">Достъп отказан!</h1>
                <p className="text-gray-300">Нямате необходимите права за достъп до тази страница.</p>
            </div>
        );
    }
    if (error && (!packages || packages.length === 0) && !isLoading) {
        return (
            <div className="text-center py-10">
                 <h1 className="text-2xl font-bold text-red-500 mb-4">Грешка при Зареждане</h1>
                 <p className="text-gray-300">{error}</p>
            </div>
        )
    }

    return (
        <div className="space-y-10">
            <h1 className="text-3xl font-bold text-white">Управление на Пакети с Точки (Шаблони)</h1>

            {error && (packages && packages.length > 0) && ( // Show error even if some packages are loaded
                <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-6" role="alert">
                    <p><span className="font-bold">Грешка:</span> {error}</p>
                </div>
            )}

            {/* --- Add Package Section --- */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700">
                <button
                    onClick={() => setShowAddPackageForm(!showAddPackageForm)}
                    className={`${buttonBaseClassName} bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-5 mb-6 text-sm font-semibold`}
                    disabled={isLoading}
                >
                    <PlusCircle size={18} className="mr-2" />
                    {showAddPackageForm ? "Скрий Формата" : "Добави Нов Пакет"}
                </button>

                {showAddPackageForm && (
                    <div className="border border-gray-700/50 p-6 rounded-lg mb-8 flex flex-col gap-5 bg-gray-800/50 shadow-inner">
                        <h3 className="text-xl font-semibold text-accentLighter">Форма за Нов Пакет</h3>
                        {/* Modified grid to accommodate new field, adjust as needed */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-end">
                            <div>
                                <label htmlFor="newEditingPoints" className={labelClassName}>Точки (Видео Монтаж)</label>
                                <Input id="newEditingPoints" type="number" min="0" placeholder="0" value={newPackageData.editingPoints} onChange={(e) => setNewPackageData({ ...newPackageData, editingPoints: e.target.value })} className={inputClassName} />
                            </div>
                            <div>
                                <label htmlFor="newRecordingPoints" className={labelClassName}>Точки (Видео Запис)</label>
                                <Input id="newRecordingPoints" type="number" min="0" placeholder="0" value={newPackageData.recordingPoints} onChange={(e) => setNewPackageData({ ...newPackageData, recordingPoints: e.target.value })} className={inputClassName} />
                            </div>
                            <div>
                                <label htmlFor="newDesignPoints" className={labelClassName}>Точки (Дизайн)</label>
                                <Input id="newDesignPoints" type="number" min="0" placeholder="0" value={newPackageData.designPoints} onChange={(e) => setNewPackageData({ ...newPackageData, designPoints: e.target.value })} className={inputClassName} />
                            </div>
                            <div> {/* <<<< NEW FIELD FOR CONSULTING POINTS >>>> */}
                                <label htmlFor="newConsultingPoints" className={labelClassName}>Точки (Консултации)</label>
                                <Input id="newConsultingPoints" type="number" min="0" placeholder="0" value={newPackageData.consultingPoints} onChange={(e) => setNewPackageData({ ...newPackageData, consultingPoints: e.target.value })} className={inputClassName} />
                            </div>
                            <div>
                                <label htmlFor="newPrice" className={labelClassName}>Цена (лв.)</label>
                                <Input id="newPrice" type="number" min="0.01" step="0.01" placeholder="0.00" value={newPackageData.price} onChange={(e) => setNewPackageData({ ...newPackageData, price: e.target.value })} className={inputClassName} />
                            </div>
                            <div>
                                <label htmlFor="newLifespan" className={labelClassName}>Валидност (дни)</label>
                                <Input id="newLifespan" type="number" min="1" placeholder="30" value={newPackageData.lifespan} onChange={(e) => setNewPackageData({ ...newPackageData, lifespan: e.target.value })} className={inputClassName} />
                            </div>
                            <div className="sm:col-span-2 lg:col-span-1 xl:col-span-2"> {/* Adjust span for button */}
                                <button
                                    onClick={handleAddPackage}
                                    disabled={isLoading}
                                    className={`${buttonBaseClassName} bg-green-600 hover:bg-green-700 text-white py-2.5 px-5 w-full sm:w-auto text-sm font-semibold`}
                                >
                                    {isLoading ? <BeatLoader size={8} color="white"/> : <><Save size={18} className="mr-2" /> Създай Пакет</>}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* --- Existing Packages List --- */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700">
                <h2 className="text-2xl font-semibold mb-6 text-white border-b border-gray-700 pb-3">Съществуващи Пакети (Шаблони)</h2>
                {isLoading && packages.length === 0 ? ( // Show loader if loading and no packages yet
                    <div className="flex justify-center items-center py-10">
                        <BeatLoader color="#A78BFA" size={15} />
                        <p className="text-gray-400 ml-3">Зареждане на пакети...</p>
                    </div>
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
                                        <Input id={`lifespan-${pkg.id}`} type="number" min="1" value={pkg.lifespan || ''}
                                            onChange={(e) => handlePackageDetailChange(pkg.id, 'lifespan', e.target.value)}
                                            className={`${inputClassName} w-28 text-center py-1.5`} />
                                    </div>
                                </div>
                                {/* Modified grid to accommodate new field, adjust as needed */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-end">
                                    <div>
                                        <label htmlFor={`edit-${pkg.id}`} className={labelClassName}>Видео Монтаж (т.)</label>
                                        <Input id={`edit-${pkg.id}`} type="number" min="0" value={pkg.editingPoints || '0'}
                                            onChange={(e) => handlePackageDetailChange(pkg.id, 'editingPoints', e.target.value)}
                                            className={inputClassName} />
                                    </div>
                                    <div>
                                        <label htmlFor={`rec-${pkg.id}`} className={labelClassName}>Видео Запис (т.)</label>
                                        <Input id={`rec-${pkg.id}`} type="number" min="0" value={pkg.recordingPoints || '0'}
                                            onChange={(e) => handlePackageDetailChange(pkg.id, 'recordingPoints', e.target.value)}
                                            className={inputClassName} />
                                    </div>
                                    <div>
                                        <label htmlFor={`design-${pkg.id}`} className={labelClassName}>Дизайн (т.)</label>
                                        <Input id={`design-${pkg.id}`} type="number" min="0" value={pkg.designPoints || '0'}
                                            onChange={(e) => handlePackageDetailChange(pkg.id, 'designPoints', e.target.value)}
                                            className={inputClassName} />
                                    </div>
                                    <div> {/* <<<< NEW FIELD FOR CONSULTING POINTS >>>> */}
                                        <label htmlFor={`consulting-${pkg.id}`} className={labelClassName}>Консултации (т.)</label>
                                        <Input id={`consulting-${pkg.id}`} type="number" min="0" value={pkg.consultingPoints || '0'}
                                            onChange={(e) => handlePackageDetailChange(pkg.id, 'consultingPoints', e.target.value)}
                                            className={inputClassName} />
                                    </div>
                                    <div className="lg:col-start-1"> {/* Start price on new row for lg if needed, or adjust grid above */}
                                        <label htmlFor={`price-${pkg.id}`} className={labelClassName}>Цена (лв.)</label>
                                        <Input id={`price-${pkg.id}`} type="number" min="0.01" step="0.01" value={pkg.price || ''}
                                            onChange={(e) => handlePackageDetailChange(pkg.id, 'price', e.target.value)}
                                            className={inputClassName} />
                                    </div>
                                </div>
                                <div className="flex gap-3 items-center mt-4 pt-4 border-t border-gray-700/50">
                                    <button
                                        onClick={() => updatePackage(pkg)}
                                        disabled={isLoading}
                                        className={`${buttonBaseClassName} bg-green-600 hover:bg-green-700 text-white py-2 px-4 text-xs`}
                                    >
                                        {isLoading ? <BeatLoader size={8} color="white"/> : <><Save size={16} className="mr-1.5" /> Запази</>}
                                    </button>
                                    <button
                                        onClick={() => handleDeletePackage(pkg.id)}
                                        disabled={isLoading}
                                        className={`${buttonBaseClassName} bg-red-600 hover:bg-red-700 text-white py-2 px-4 text-xs`}
                                    >
                                        {isLoading ? <BeatLoader size={8} color="white"/> : <><Trash2 size={16} className="mr-1.5" /> Изтрий</>}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : !error && !isLoading ? ( // If no error, not loading, and no packages
                    <p className="text-gray-500 py-10 text-center">Няма дефинирани пакети с точки. Започнете като добавите нов.</p>
                ) : null }
            </div>
        </div>
    );
}