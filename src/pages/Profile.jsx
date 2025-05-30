// pages/Profile.jsx
"use client";

import React, { useState, useEffect } from "react";
import MaxWidthWrapper from "@/components/others/MaxWidthWrapper";
import Transition from "@/components/others/Transition";
import { Eye, EyeOff, Save } from "lucide-react";

// --- ChangePasswordForm (can be a separate component or inline) ---
function ChangePasswordForm({ userEmail, userId }) { // Pass userEmail or userId to identify the user
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
        setError(null);
        setSuccess(null);

        if (!currentPassword) {
            setError("Моля, въведете текущата си парола.");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setError("Новите пароли не съвпадат.");
            return;
        }
        if (newPassword.length < 6) { // Your own password policy
            setError("Паролата трябва да е поне 6 символа.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/change-password', { // NEW API ENDPOINT
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // We need a way to identify the user for the API.
                    // If your custom session cookie is sent, the API can decrypt it.
                    // Or pass user identifier if API needs it explicitly and can verify ownership.
                    // For this example, let's assume API uses the custom session cookie.
                    currentPassword,
                    newPassword,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Грешка при смяна на паролата.");
            }

            setSuccess(result.message || "Паролата е сменена успешно!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");

        } catch (err) {
            console.error("Password change error:", err);
            setError(err.message || "Възникна неочаквана грешка.");
        }
        setIsLoading(false);
    };
    
    const inputClassName = "w-full bg-gray-800 border-gray-700 px-4 py-2.5 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-accent focus:border-transparent transition-colors";
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
                    <input type={showCurrentPassword ? "text" : "password"} id="currentPasswordProf" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className={inputClassName} />
                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-200">
                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>
            <div>
                <label htmlFor="newPasswordProf" className={labelClassName}>Нова Парола</label>
                <div className="relative">
                    <input type={showNewPassword ? "text" : "password"} id="newPasswordProf" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className={inputClassName} />
                     <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-200">
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>
            <div>
                <label htmlFor="confirmNewPasswordProf" className={labelClassName}>Потвърди Нова Парола</label>
                <div className="relative">
                    <input type={showConfirmPassword ? "text" : "password"} id="confirmNewPasswordProf" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required className={inputClassName} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-200">
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>
            <button type="submit" disabled={isLoading} className={buttonClassName}>
                {isLoading ? "Запазване..." : <><Save size={16} className="mr-1.5" /> Смени Паролата</>}
            </button>
        </form>
    );
}
// --- End ChangePasswordForm ---


export default function Profile({ user: initialUser, pointsOrders: initialPointsOrders, initialError }) {
    const [user, setUser] = useState(initialUser);
    const [pointsOrders, setPointsOrders] = useState(initialPointsOrders || []);
    const [error, setError] = useState(initialError || null);
    const [isClientMounted, setIsClientMounted] = useState(false);

    useEffect(() => {
        setIsClientMounted(true);
    }, []);

    useEffect(() => {
        setUser(initialUser);
        setPointsOrders(initialPointsOrders || []);
        setError(initialError || null);
    }, [initialUser, initialPointsOrders, initialError]);


	const now = new Date();

	const activePackages = (pointsOrders || []).filter((pkg) => {
        if (!pkg.created_at || typeof pkg.lifespan !== 'number') return false;
		const createdAt = new Date(pkg.created_at);
        const expires = new Date(createdAt.getTime()); // Clone date
		expires.setDate(createdAt.getDate() + pkg.lifespan);
		return expires >= now && pkg.status === "Активен"; // Ensure status is active
	  });
	  
	  const expiredOrUsedPackages = (pointsOrders || []).filter((pkg) => {
        if (!pkg.created_at || typeof pkg.lifespan !== 'number') return true; // Default to expired if data is bad
		const createdAt = new Date(pkg.created_at);
        const expires = new Date(createdAt.getTime()); // Clone date
		expires.setDate(createdAt.getDate() + pkg.lifespan);
		return expires < now || pkg.status !== "Активен"; // Expired OR not active status
	  });

	const totalActivePoints = (type) =>
		activePackages.reduce((sum, p) => sum + (Number(p[type]) || 0), 0);

	const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        try {
            return new Date(dateStr).toLocaleDateString("bg-BG", { day: '2-digit', month: 'short', year: 'numeric' });
        } catch {
            return "Invalid Date";
        }
    }

    const cardBaseClass = "bg-gray-800 border border-gray-700 p-4 md:p-6 rounded-xl shadow-lg";
    const titleClass = "text-xl md:text-2xl font-semibold text-accentLighter mb-4 border-b border-gray-700 pb-2";
    const pointTextClass = "text-gray-300";
    const packageItemClass = "border-b border-gray-700/50 py-3 last:border-b-0";


    if (!isClientMounted) {
        return <div className="min-h-screen pt-32 text-center text-white">Зареждане на профил...</div>;
    }

	if (!user) { // Should have been caught by server redirect, but good fallback
		return (
            <div className="min-h-screen pt-32 text-center text-red-400">
                Грешка: Потребителските данни не са заредени. Моля, опитайте да влезете отново.
            </div>
        );
	}
    if (error && (!pointsOrders || pointsOrders.length === 0)) {
        return (
            <div className="min-h-screen pt-32 text-center text-red-400">
                <h1 className="text-2xl font-bold mb-2">Грешка при Зареждане</h1>
                <p>{error}</p>
            </div>
        );
    }

	return (
		<Transition delay={0.2} blur={0}>
			<div className="min-h-screen pt-24 md:pt-32 pb-16 text-foreground"> {/* Added pb-16 for bottom padding */}
				<MaxWidthWrapper>
                    <div className="text-center mb-10 md:mb-12">
                        <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                            Моят Профил
                        </h1>
                        <p className="text-gray-400 mt-2">Здравей, {user.fullName || user.email}!</p>
                    </div>

                    {/* Display general error if data also loaded */}
                    {error && (pointsOrders && pointsOrders.length > 0) && (
                        <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-6" role="alert">
                            <p><span className="font-bold">Грешка:</span> {error}</p>
                        </div>
                    )}

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                        {/* Column 1: Active Points & Change Password */}
                        <div className="lg:col-span-1 space-y-6 md:space-y-8">
                            <div className={cardBaseClass}>
                                <h2 className={titleClass}>Активни Точки</h2>
                                <div className="space-y-2">
                                    <p className={pointTextClass}>Видео монтаж: <span className="font-semibold text-white">{totalActivePoints("editingPoints")}</span> т.</p>
                                    <p className={pointTextClass}>Видео заснемане: <span className="font-semibold text-white">{totalActivePoints("recordingPoints")}</span> т.</p>
                                    <p className={pointTextClass}>Дизайн: <span className="font-semibold text-white">{totalActivePoints("designPoints")}</span> т.</p>
                                </div>
                            </div>
                            <ChangePasswordForm userId={user.id} /> {/* user.id should be Supabase auth.users.id */}
                        </div>

                        {/* Column 2: Packages (Active & Expired) */}
                        <div className="lg:col-span-2 space-y-6 md:space-y-8">
                            <div className={cardBaseClass}>
                                <h2 className={titleClass}>Активни Пакети</h2>
                                {activePackages.length > 0 ? (
                                    activePackages.map((pkg) => {
                                        const expires = new Date(pkg.created_at);
                                        expires.setDate(new Date(pkg.created_at).getDate() + pkg.lifespan);
                                        return (
                                            <div key={pkg.id} className={packageItemClass}>
                                                <p className="font-medium text-white">Пакет ID: <span className="text-xs font-mono text-gray-400">{pkg.id?.substring(0,8)}...</span></p>
                                                <p className={pointTextClass}>Монтаж: {pkg.editingPoints}т., Заснемане: {pkg.recordingPoints}т., Дизайн: {pkg.designPoints}т.</p>
                                                <p className="text-sm text-green-400">Валиден до: {formatDate(expires)}</p>
                                                <p className="text-xs text-gray-500">Закупен: {formatDate(pkg.created_at)}, Цена: {pkg.price}лв, Статус: {pkg.status}</p>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-gray-500">Нямате активни пакети.</p>
                                )}
                            </div>

                            <div className={cardBaseClass}>
                                <h2 className={titleClass}>Изтекли/Използвани Пакети</h2>
                                {expiredOrUsedPackages.length > 0 ? (
                                    expiredOrUsedPackages.map((pkg) => {
                                        const createdAtDate = new Date(pkg.created_at);
                                        const expiredAt = new Date(createdAtDate.getTime());
                                        expiredAt.setDate(createdAtDate.getDate() + pkg.lifespan);
                                        return (
                                            <div key={pkg.id} className={`${packageItemClass} opacity-70`}>
                                                <p className="font-medium text-gray-400">Пакет ID: <span className="text-xs font-mono">{pkg.id?.substring(0,8)}...</span></p>
                                                <p className="text-gray-500">Монтаж: {pkg.editingPoints}т., Заснемане: {pkg.recordingPoints}т., Дизайн: {pkg.designPoints}т.</p>
                                                <p className="text-sm text-red-400">Статус: {pkg.status} (Изтекъл/Използван на {formatDate(expiredAt)})</p>
                                                <p className="text-xs text-gray-600">Закупен: {formatDate(pkg.created_at)}</p>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-gray-500">Няма изтекли или използвани пакети.</p>
                                )}
                            </div>
                        </div>
                    </div>
				</MaxWidthWrapper>
			</div>
		</Transition>
	);
}