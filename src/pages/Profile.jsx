// pages/Profile.jsx (or app/profile/ProfileClient.jsx - ensure it has "use client")
"use client";

import React, { useState, useEffect, useMemo } from "react";
import MaxWidthWrapper from "@/components/others/MaxWidthWrapper";
import Transition from "@/components/others/Transition";
import { Eye, EyeOff, Save, Edit2, Video, Palette, Brain as BrainIconLucide } from "lucide-react"; // Renamed Brain to avoid conflict
import { Input } from "@/components/ui/input";
import { Button as ShadButton } from "@/components/ui/button";
import { BeatLoader } from "react-spinners";
import { createClient } from "@/utils/client"; // For client-side Supabase operations like password change

const supabase = createClient();

// --- ChangePasswordForm Component ---
function ChangePasswordForm({ userId }) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); setSuccess(null);
        if (!currentPassword) { setError("Моля, въведете текущата си парола."); return; }
        if (newPassword !== confirmNewPassword) { setError("Новите пароли не съвпадат."); return; }
        if (newPassword.length < 6) { setError("Паролата трябва да е поне 6 символа."); return; }
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Грешка при смяна на паролата.");
            setSuccess(result.message || "Паролата е сменена успешно!");
            setCurrentPassword(""); setNewPassword(""); setConfirmNewPassword("");
        } catch (err) {
            console.error("Password change error:", err);
            setError(err.message || "Възникна неочаквана грешка.");
        }
        setIsLoading(false);
    };
    
    const inputClassName = "w-full bg-gray-700 border-gray-600 px-4 py-2.5 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-accent focus:border-transparent transition-colors";
    const labelClassName = "block text-sm font-medium text-gray-300 mb-1.5";
    const buttonClassName = "w-full flex items-center justify-center gap-2 bg-accent hover:bg-accentLighter text-white font-semibold py-2.5 px-4 rounded-lg transition duration-150 ease-in-out disabled:opacity-60";

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 md:p-8 rounded-xl shadow-xl border border-gray-700">
            <h3 className="text-xl font-semibold text-accentLighter border-b border-gray-700 pb-3 mb-6">Смяна на Парола</h3>
            {error && <p className="text-red-400 text-sm p-3 bg-red-900/30 border border-red-700 rounded-md">{error}</p>}
            {success && <p className="text-green-400 text-sm p-3 bg-green-900/30 border border-green-700 rounded-md">{success}</p>}
            <div>
                <label htmlFor="currentPasswordProf" className={labelClassName}>Текуща Парола</label>
                <div className="relative">
                    <Input type={showCurrentPassword ? "text" : "password"} id="currentPasswordProf" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className={inputClassName} />
                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-200">{showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
            </div>
            <div>
                <label htmlFor="newPasswordProf" className={labelClassName}>Нова Парола</label>
                <div className="relative">
                    <Input type={showNewPassword ? "text" : "password"} id="newPasswordProf" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className={inputClassName} />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-200">{showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
            </div>
            <div>
                <label htmlFor="confirmNewPasswordProf" className={labelClassName}>Потвърди Нова Парола</label>
                <div className="relative">
                    <Input type={showConfirmPassword ? "text" : "password"} id="confirmNewPasswordProf" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required className={inputClassName} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-200">{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
            </div>
            <ShadButton type="submit" disabled={isLoading} className={buttonClassName}>
                {isLoading ? <BeatLoader color="white" size={8}/> : <><Save size={16} className="mr-1.5" /> Смени Паролата</>}
            </ShadButton>
        </form>
    );
}
// --- End ChangePasswordForm ---


// This is your main Profile Client Component (e.g., pages/Profile.jsx or app/profile/ProfileClient.jsx)
export default function ProfileClientComponent({ user: initialUser, pointsOrders: initialPointsOrders, initialError }) {
    const [user, setUser] = useState(initialUser);
    const [pointsOrders, setPointsOrders] = useState(initialPointsOrders || []);
    const [error, setError] = useState(initialError || null);
    const [isClientMounted, setIsClientMounted] = useState(false);

    const pointTypeLabels = useMemo(() => ({
        editingPoints: "Видео Монтаж",
        recordingPoints: "Видео Заснемане",
        designPoints: "Дизайн",
        consultingPoints: "Консултации", // <<<< ADDED
    }), []);

    useEffect(() => {
        setIsClientMounted(true);
    }, []);

    useEffect(() => {
        setUser(initialUser);
        setPointsOrders(initialPointsOrders || []);
        setError(initialError || null);
    }, [initialUser, initialPointsOrders, initialError]);

	const now = new Date();

	const activePackages = useMemo(() => (pointsOrders || []).filter((pkg) => {
        if (!pkg.created_at || typeof pkg.lifespan !== 'number') return false;
		const createdAt = new Date(pkg.created_at);
        const expires = new Date(createdAt.getTime());
		expires.setDate(createdAt.getDate() + pkg.lifespan);
		return expires >= now && pkg.status === "Активен";
	}), [pointsOrders, now]);
	  
	const expiredOrUsedPackages = useMemo(() => (pointsOrders || []).filter((pkg) => {
        if (!pkg.created_at || typeof pkg.lifespan !== 'number') return true;
		const createdAt = new Date(pkg.created_at);
        const expires = new Date(createdAt.getTime());
		expires.setDate(createdAt.getDate() + pkg.lifespan);
		return expires < now || pkg.status !== "Активен";
	}), [pointsOrders, now]);

    // This function calculates total points for a given type from active packages
	const totalActivePoints = (type) =>
		activePackages.reduce((sum, p) => sum + (Number(p[type]) || 0), 0);

	const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        try {
            return new Date(dateStr).toLocaleDateString("bg-BG", { day: '2-digit', month: 'short', year: 'numeric' });
        } catch {
            return "Invalid Date";
        }
    };

    const getInitials = (fullName) => { // Moved getInitials inside for completeness
        if (!fullName || typeof fullName !== 'string' || fullName.trim() === "") return "U";
        const names = fullName.trim().split(" ");
        const validNames = names.filter(name => name.length > 0);
        if (validNames.length === 0) return "U";
        if (validNames.length === 1) return validNames[0][0].toUpperCase();
        return (validNames[0][0].toUpperCase() || "") + (validNames[1][0]?.toUpperCase() || "");
    };


    const cardBaseClass = "bg-gray-800 border border-gray-700 p-4 md:p-6 rounded-xl shadow-xl";
    const titleClass = "text-xl md:text-2xl font-semibold text-accentLighter mb-4 border-b border-gray-700 pb-3";
    const pointTextClass = "text-gray-300 flex items-center justify-between text-sm sm:text-base"; // Added justify-between
    const packageItemClass = "border-b border-gray-700/50 py-4 last:border-b-0 last:pb-0 first:pt-0";


    if (!isClientMounted) {
        return <div className="min-h-screen pt-32 text-center text-white">Зареждане на профил...</div>;
    }
	if (!user) {
		return ( <div className="min-h-screen pt-32 text-center text-red-400">Грешка: Потребителските данни не са заредени.</div> );
	}
    if (error && (!pointsOrders || pointsOrders.length === 0)) {
        return ( <div className="min-h-screen pt-32 text-center text-red-400"><h1 className="text-2xl font-bold mb-2">Грешка</h1><p>{error}</p></div> );
    }

	return (
		<Transition delay={0.2} blur={0}>
			<div className="min-h-screen pt-24 md:pt-32 pb-16 text-foreground">
				<MaxWidthWrapper>
                    <div className="text-center mb-10 md:mb-16">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-700 border-2 border-accent rounded-full flex items-center justify-center mx-auto mb-4 text-4xl sm:text-5xl font-bold text-accentLighter">
                            {user.fullName ? getInitials(user.fullName) : user.email?.[0]?.toUpperCase() || "U"}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                            Моят Профил
                        </h1>
                        <p className="text-gray-400 mt-2 text-lg">Здравей, {user.fullName || user.email}!</p>
                         <p className="text-xs text-gray-500 mt-1">ID: {user.id}</p>
                    </div>

                    {error && (pointsOrders && pointsOrders.length > 0) && (
                        <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-8" role="alert">
                            <p><span className="font-bold">Грешка:</span> {error}</p>
                        </div>
                    )}

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                        <div className="lg:col-span-1 space-y-6 md:space-y-8">
                            <div className={cardBaseClass}>
                                <h2 className={titleClass}>
                                    <BrainIconLucide size={22} className="inline mr-2.5 text-accent align-middle" /> {/* Used Lucide Brain */}
                                    Активни Точки
                                </h2>
                                <div className="space-y-2.5 text-sm sm:text-base">
                                    <p className={pointTextClass}><Edit2 size={16} className="text-gray-500 mr-2"/><span>{pointTypeLabels.editingPoints}:</span> <span className="font-semibold text-white">{totalActivePoints("editingPoints")} т.</span></p>
                                    <p className={pointTextClass}><Video size={16} className="text-gray-500 mr-2"/><span>{pointTypeLabels.recordingPoints}:</span> <span className="font-semibold text-white">{totalActivePoints("recordingPoints")} т.</span></p>
                                    <p className={pointTextClass}><Palette size={16} className="text-gray-500 mr-2"/><span>{pointTypeLabels.designPoints}:</span> <span className="font-semibold text-white">{totalActivePoints("designPoints")} т.</span></p>
                                    <p className={pointTextClass}><BrainIconLucide size={16} className="text-gray-500 mr-2"/><span>{pointTypeLabels.consultingPoints}:</span> <span className="font-semibold text-white">{totalActivePoints("consultingPoints")} т.</span></p> {/* <<<< NEWLY ADDED & STYLED */}
                                </div>
                            </div>
                            <ChangePasswordForm userId={user.id} />
                        </div>

                        <div className="lg:col-span-2 space-y-6 md:space-y-8">
                            <div className={cardBaseClass}>
                                <h2 className={titleClass}>Активни Пакети</h2>
                                {activePackages.length > 0 ? (
                                    <ul className="divide-y divide-gray-700/50">
                                    {activePackages.map((pkg) => {
                                        const expires = new Date(pkg.created_at);
                                        expires.setDate(new Date(pkg.created_at).getDate() + pkg.lifespan);
                                        return (
                                            <li key={pkg.id} className="py-3 first:pt-0 last:pb-0">
                                                <div className="flex justify-between items-center mb-1">
                                                    <p className="font-medium text-gray-200 text-sm">ID: <span className="text-xs font-mono text-gray-400">{pkg.id?.substring(0,8)}...</span></p>
                                                    <p className="text-xs text-green-400">Валиден до: {formatDate(expires)}</p>
                                                </div>
                                                <div className="text-xs text-gray-400 grid grid-cols-2 gap-x-4 gap-y-1 mt-1"> {/* Adjusted grid for points */}
                                                    {pkg.editingPoints > 0 && <p><span className="font-medium">{pointTypeLabels.editingPoints}:</span> <span className="font-semibold text-gray-200">{pkg.editingPoints}</span> т.</p>}
                                                    {pkg.recordingPoints > 0 && <p><span className="font-medium">{pointTypeLabels.recordingPoints}:</span> <span className="font-semibold text-gray-200">{pkg.recordingPoints}</span> т.</p>}
                                                    {pkg.designPoints > 0 && <p><span className="font-medium">{pointTypeLabels.designPoints}:</span> <span className="font-semibold text-gray-200">{pkg.designPoints}</span> т.</p>}
                                                    {pkg.consultingPoints > 0 && <p><span className="font-medium">{pointTypeLabels.consultingPoints}:</span> <span className="font-semibold text-gray-200">{pkg.consultingPoints}</span> т.</p>} {/* <<<< NEW */}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1.5">Закупен: {formatDate(pkg.created_at)} | Цена: {pkg.price}лв | Статус: {pkg.status}</p>
                                            </li>
                                        );
                                    })}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 text-sm">Нямате активни пакети.</p>
                                )}
                            </div>

                            <div className={cardBaseClass}>
                                <h2 className={titleClass}>Изтекли/Използвани Пакети</h2>
                                {expiredOrUsedPackages.length > 0 ? (
                                     <ul className="divide-y divide-gray-700/50">
                                    {expiredOrUsedPackages.map((pkg) => {
                                        const createdAtDate = new Date(pkg.created_at);
                                        const expiredAt = new Date(createdAtDate.getTime());
                                        expiredAt.setDate(createdAtDate.getDate() + pkg.lifespan);
                                        return (
                                            <li key={pkg.id} className="py-3 opacity-60 first:pt-0 last:pb-0"> {/* Reduced opacity more */}
                                                <div className="flex justify-between items-center mb-1">
                                                    <p className="font-medium text-gray-400 text-sm">ID: <span className="text-xs font-mono">{pkg.id?.substring(0,8)}...</span></p>
                                                    <p className="text-xs text-red-400">Статус: {pkg.status} ({formatDate(expiredAt)})</p>
                                                </div>
                                                <div className="text-xs text-gray-500 grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                                                    {pkg.editingPoints > 0 && <p>Монтаж: {pkg.editingPoints} т.</p>}
                                                    {pkg.recordingPoints > 0 && <p>Заснемане: {pkg.recordingPoints} т.</p>}
                                                    {pkg.designPoints > 0 && <p>Дизайн: {pkg.designPoints} т.</p>}
                                                    {pkg.consultingPoints > 0 && <p>Консултации: {pkg.consultingPoints} т.</p>} {/* <<<< NEW */}
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1.5">Закупен: {formatDate(pkg.created_at)}</p>
                                            </li>
                                        );
                                    })}
                                     </ul>
                                ) : (
                                    <p className="text-gray-500 text-sm">Няма изтекли или използвани пакети.</p>
                                )}
                            </div>
                        </div>
                    </div>
				</MaxWidthWrapper>
			</div>
		</Transition>
	);
}