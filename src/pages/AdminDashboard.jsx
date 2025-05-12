"use client";
import React, { useState } from "react";
import MaxWidthWrapper from "@/components/others/MaxWidthWrapper";
import Link from "next/link";
import AddPoints from "@/components/forms/AddPoints";
import AddCustomPackage from "@/components/forms/AddCustomPackage";
import ManageUserPackages from "@/components/forms/ManageUserPackages";

export default function AdminDashboard({
	vlogOrdersData,
	tiktokOrdersData,
	thumbnailOrdersData,
	recordingOrdersData,
	profilesData,
	pointsOrdersData,
	packagesData,
}) {
	// --- State Initialization ---
	const [vlogOrders, setVlogOrders] = useState(vlogOrdersData || []);
	const [tiktokOrders, setTiktokOrders] = useState(tiktokOrdersData || []);
	const [thumbnailOrders, setThumbnailOrders] = useState(thumbnailOrdersData || []);
	const [recordingOrders, setRecordingOrders] = useState(recordingOrdersData || []);
	const [pointsOrders, setPointsOrders] = useState(pointsOrdersData || []);
	const [packages, setPackages] = useState(packagesData || []);

	// State for the "Add Package" form
	const [showAddPackageForm, setShowAddPackageForm] = useState(false);
	const [newPackageData, setNewPackageData] = useState({
		editingPoints: "",
		recordingPoints: "",
		designPoints: "",
		price: "",
		lifespan: "",
	});

	// --- Derived Data / Helpers ---
	const profiles = (profilesData || []).reduce((acc, item) => {
		acc[item.id] = item.fullname;
		return acc;
	}, {});

		// --- API Interaction Functions ---

    // ... (updateOrderStatus, updatePackage, handleAddPackage functions remain the same) ...

    // Function to delete a package
	async function handleDeletePackage(packageId) {
        if (!packageId) return;

        // Ask for confirmation
        if (!window.confirm(`Сигурни ли сте, че искате да изтриете пакет с ID: ${packageId}? Тази операция е необратима.`)) {
            return; // Stop if the user cancels
        }

        try {
            const response = await fetch("/api/packages", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ packageId }), // Send ID in the body
			});

            const result = await response.json(); // Attempt to parse JSON, even for errors

			if (!response.ok) {
                // Use message from API response if available, otherwise provide default
				throw new Error(result.message || `Failed to delete package. Status: ${response.status}`);
			}

            // Update UI state by removing the deleted package
            setPackages((prevPackages) => prevPackages.filter((pkg) => pkg.id !== packageId));

            alert(result.message || "Пакетът е изтрит успешно!"); // Use success message from API if provided

        } catch (error) {
            console.error("Failed to delete package:", error);
            alert(`Грешка при изтриване на пакет: ${error.message}`);
        }
    }

	// Function to format the date
	function formatDate(dateString) {
		try {
			const date = new Date(dateString);
			if (isNaN(date.getTime())) {
				// Handle invalid date string
				return "Invalid Date";
			}
			const day = String(date.getDate()).padStart(2, "0");
			const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
			const year = date.getFullYear();
			return `${day}.${month}.${year}`;
		} catch (error) {
			console.error("Error formatting date:", dateString, error);
			return "Error Date";
		}
	}

	// Function to update the order status
	async function updateOrderStatus(orderId, newStatus, type) {
		if (!orderId || !newStatus || !type) return; // Basic guard clause

		let setStateFunction;
		switch (type) {
			case "vlogOrders": setStateFunction = setVlogOrders; break;
			case "tiktokOrders": setStateFunction = setTiktokOrders; break;
			case "thumbnailOrders": setStateFunction = setThumbnailOrders; break;
			case "recordings": setStateFunction = setRecordingOrders; break;
			case "pointsOrders": setStateFunction = setPointsOrders; break;
			default: console.error("Invalid order type for update:", type); return;
		}

		try {
			const response = await fetch("/api/orders", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ orderId, newStatus, type }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to update order status");
			}

			// Update the UI optimistically or based on response
			setStateFunction((prevOrders) =>
				prevOrders.map((order) =>
					order.id === orderId ? { ...order, status: newStatus } : order
				)
			);
		} catch (error) {
			console.error("Failed to update order status:", error);
			alert(`Грешка при обновяване на статус: ${error.message}`);
		}
	}

	// Function to update an existing package
	async function updatePackage(
		packageId,
		editingPoints,
		recordingPoints,
		designPoints,
		price,
		lifespan
	) {
        // Basic Validation
        if (!packageId || editingPoints == null || recordingPoints == null || designPoints == null || price == null || parseFloat(price) <= 0 || parseInt(editingPoints) < 0 || parseInt(recordingPoints) < 0 || parseInt(designPoints) < 0) {
            alert("Моля, въведете валидни положителни стойности за точките и цената.");
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

            // Update UI state
			setPackages((prevPackages) =>
				prevPackages.map((pkg) =>
					pkg.id === packageId
						? { ...pkg, editingPoints, recordingPoints, designPoints, price } // Use the state values before parsing for UI consistency if needed
						: pkg
				)
			);
            alert("Пакетът е обновен успешно!");

		} catch (error) {
			console.error("Failed to update package:", error);
            alert(`Грешка при обновяване на пакет: ${error.message}`);
		}
	}

	// Function to add a new package
	async function handleAddPackage() {
		const { editingPoints, recordingPoints, designPoints, price, lifespanDays } = newPackageData;

		// Basic client-side validation
		if (
			!editingPoints || !recordingPoints || !designPoints || !price ||
            isNaN(parseFloat(price)) || parseFloat(price) <= 0 ||
            isNaN(parseInt(editingPoints)) || parseInt(editingPoints) < 0 ||
            isNaN(parseInt(recordingPoints)) || parseInt(recordingPoints) < 0 ||
            isNaN(parseInt(designPoints)) || parseInt(designPoints) < 0 ||
			isNaN(parseInt(lifespanDays)) || parseInt(lifespanDays) <= 0
		) {
			alert("Моля, попълнете всички полета с валидни положителни стойности (точките може да са 0).");
			return;
		}

		const now = new Date();
		const lifespan = new Date(now.getTime() + parseInt(lifespanDays, 10) * 24 * 60 * 60 * 1000).toISOString();

		try {
			const res = await fetch("/api/packages", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				// Send parsed numbers to the API as expected by the backend
				body: JSON.stringify({
					editingPoints: parseInt(editingPoints, 10),
					recordingPoints: parseInt(recordingPoints, 10),
					designPoints: parseInt(designPoints, 10),
					price: parseFloat(price),
					lifespan: parseInt(lifespanDays, 10),
				}),
			});

			const result = await res.json();

			if (!res.ok) {
                // Use the error message from the backend if available
				alert(`Грешка при добавяне: ${result.message || 'Възникна грешка'}`);
				console.error("Error response from API:", result);
				return;
			}

			// Success – Add the new package to UI state
            // Ensure the package returned from API has the correct structure
			if (result.package && result.package.id) {
                setPackages((prev) => [...prev, result.package]);
            } else {
                console.warn("API did not return a valid package object:", result);
                 // Potentially fetch packages again if API response is unreliable
            }


			// Reset form and hide it
			setNewPackageData({
				editingPoints: "",
				recordingPoints: "",
				designPoints: "",
				price: "",
				lifespan: "",
			});
			setShowAddPackageForm(false);
            alert("Пакетът е добавен успешно!");

		} catch (error) {
			console.error("Error adding package:", error);
			alert("Възникна неочаквана грешка при създаването на пакета.");
		}
	}


	// --- Sorting (Memoize if performance becomes an issue) ---
	const sortedVlogOrders = [...vlogOrders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
	const sortedTiktokOrders = [...tiktokOrders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
	const sortedThumbnailOrders = [...thumbnailOrders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
	const sortedRecordingOrders = [...recordingOrders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
	const sortedPointsOrders = [...pointsOrders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
	const sortedProfiles = [...(profilesData || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));


	// --- Render ---
	return (
		<section className="min-h-screen overflow-hidden pb-10 relative">
			{/* Background Gradient */}
			<div className="w-96 h-96 -z-10 absolute -top-20 -left-20 bg-gradient-to-br from-accent/40 to-background blur-[100px] filter rounded-full" />

			<MaxWidthWrapper>
				<div className="mt-32 grid grid-cols-1"> {/* Changed to grid-cols-1 for stacking */}
					{/* The Admin Dashboard */}
					<div className="flex justify-start mb-6">
					<Link href="/admin/formulas">
						<button className="px-4 py-2 bg-accent hover:bg-accentLighter text-white rounded-full shadow transition">
							Admin Dashboard
						</button>
					</Link>
					</div>

					{/* Vlog orders dashboard */}
					<h2 className="text-xl md:text-3xl font-[700] mb-5">
						Поръчки (видео монтаж влог)
					</h2>
					<div className="overflow-x-auto border border-secondary bg-background text-foreground rounded-3xl md:rounded-[30px] min-h-56 w-full p-5 mb-10">
						{/* Table Header */}
						<div className="border-b pb-2 border-secondary text-accentLighter flex justify-between items-center gap-5">
							<div className="flex gap-3 md:gap-10 items-center min-w-max">
								<p className="w-12 md:w-16">ID</p>
								<p className="w-20 md:w-24">Дата</p>
								<p className="w-16 md:w-20">Цена</p>
								<p className="flex-1">Клиент</p>
							</div>
							<div className="min-w-[120px] mr-2">
								<p>Статус</p>
							</div>
						</div>
						{/* Table Body */}
						<div className="flex flex-col gap-3 mt-3">
							{sortedVlogOrders.length > 0 ? (
								sortedVlogOrders.map((item) => (
									<div key={item.id} className="flex items-center gap-5 justify-between border-b border-secondary pb-3">
										<Link
											className="flex gap-3 md:gap-10 items-center w-full hover:text-accentLighter text-xs md:text-base whitespace-nowrap"
											href={`/vlogOrders/${item.id}`}
											target="_blank"
                                            rel="noopener noreferrer" // Good practice for target="_blank"
										>
											<div className="w-12 md:w-16 truncate">{item.id}</div>
											<div className="w-20 md:w-24">{formatDate(item.created_at)}</div>
											<div className="w-16 md:w-20">{item.price} т.</div>
											<div className="flex-1 truncate">{profiles[item.user] || 'N/A'}</div>
										</Link>
										<select
											value={item.status}
											onChange={(e) => updateOrderStatus(item.id, e.target.value, "vlogOrders")}
											className="border rounded-lg px-2 py-1 bg-background text-foreground border-secondary min-w-[120px]"
                                            aria-label={`Статус за поръчка ${item.id}`}
										>
											<option value="В обработка">В обработка</option>
											<option value="Завършена">Завършена</option>
											<option value="Отказана">Отказана</option>
										</select>
									</div>
								))
							) : (
								<p>Няма поръчки на видео монтаж на влог</p>
							)}
						</div>
					</div>

					{/* Tiktok orders dashboard */}
					<h2 className="text-xl md:text-3xl font-[700] mb-5 mt-10">
						Поръчки (видео монтаж тикток)
					</h2>
                    <div className="overflow-x-auto border border-secondary bg-background text-foreground rounded-3xl md:rounded-[30px] min-h-56 w-full p-5 mb-10">
						{/* Table Header */}
						<div className="border-b pb-2 border-secondary text-accentLighter flex justify-between items-center gap-5">
							<div className="flex gap-3 md:gap-10 items-center min-w-max">
								<p className="w-12 md:w-16">ID</p>
								<p className="w-20 md:w-24">Дата</p>
								<p className="w-16 md:w-20">Цена</p>
								<p className="flex-1">Клиент</p>
							</div>
							<div className="min-w-[120px] mr-2">
								<p>Статус</p>
							</div>
						</div>
						{/* Table Body */}
						<div className="flex flex-col gap-3 mt-3">
							{sortedTiktokOrders.length > 0 ? (
								sortedTiktokOrders.map((item) => (
									<div key={item.id} className="flex items-center gap-5 justify-between border-b border-secondary pb-3">
										<Link
											className="flex gap-3 md:gap-10 items-center w-full hover:text-accentLighter text-xs md:text-base whitespace-nowrap"
											href={`/tiktokOrders/${item.id}`}
											target="_blank"
                                            rel="noopener noreferrer"
										>
											<div className="w-12 md:w-16 truncate">{item.id}</div>
											<div className="w-20 md:w-24">{formatDate(item.created_at)}</div>
											<div className="w-16 md:w-20">{item.price} т.</div>
											<div className="flex-1 truncate">{profiles[item.user] || 'N/A'}</div>
										</Link>
										<select
											value={item.status}
											onChange={(e) => updateOrderStatus(item.id, e.target.value, "tiktokOrders")}
											className="border rounded-lg px-2 py-1 bg-background text-foreground border-secondary min-w-[120px]"
                                            aria-label={`Статус за поръчка ${item.id}`}
										>
											<option value="В обработка">В обработка</option>
											<option value="Завършена">Завършена</option>
											<option value="Отказана">Отказана</option>
										</select>
									</div>
								))
							) : (
								<p>Няма поръчки на видео монтаж на тикток</p>
							)}
						</div>
					</div>


					{/* Thumbnail orders dashboard */}
					<h2 className="text-xl md:text-3xl font-[700] mb-5 mt-10">
						Поръчки (thumbnail дизайн)
					</h2>
					<div className="overflow-x-auto border border-secondary bg-background text-foreground rounded-3xl md:rounded-[30px] min-h-56 w-full p-5 mb-10">
						{/* Table Header */}
						<div className="border-b pb-2 border-secondary text-accentLighter flex justify-between items-center gap-5">
							<div className="flex gap-3 md:gap-10 items-center min-w-max">
								<p className="w-12 md:w-16">ID</p>
								<p className="w-20 md:w-24">Дата</p>
								<p className="w-16 md:w-20">Цена</p>
								<p className="flex-1">Клиент</p>
							</div>
							<div className="min-w-[120px] mr-2">
								<p>Статус</p>
							</div>
						</div>
						{/* Table Body */}
						<div className="flex flex-col gap-3 mt-3">
							{sortedThumbnailOrders.length > 0 ? (
								sortedThumbnailOrders.map((item) => (
									<div key={item.id} className="flex items-center gap-5 justify-between border-b border-secondary pb-3">
										<Link
											className="flex gap-3 md:gap-10 items-center w-full hover:text-accentLighter text-xs md:text-base whitespace-nowrap"
											href={`/thumbnailOrders/${item.id}`}
											target="_blank"
                                            rel="noopener noreferrer"
										>
											<div className="w-12 md:w-16 truncate">{item.id}</div>
											<div className="w-20 md:w-24">{formatDate(item.created_at)}</div>
											<div className="w-16 md:w-20">{item.price} т.</div>
											<div className="flex-1 truncate">{profiles[item.user] || 'N/A'}</div>
										</Link>
										<select
											value={item.status}
											onChange={(e) => updateOrderStatus(item.id, e.target.value, "thumbnailOrders")}
											className="border rounded-lg px-2 py-1 bg-background text-foreground border-secondary min-w-[120px]"
                                            aria-label={`Статус за поръчка ${item.id}`}
										>
											<option value="В обработка">В обработка</option>
											<option value="Завършена">Завършена</option>
											<option value="Отказана">Отказана</option>
										</select>
									</div>
								))
							) : (
								<p>Няма поръчки на дизайн на thumbnail</p>
							)}
						</div>
					</div>


					{/* Recording orders dashboard */}
					<h2 className="text-xl md:text-3xl font-[700] mb-5 mt-10">
						Поръчки (запис)
					</h2>
					<div className="overflow-x-auto border border-secondary bg-background text-foreground rounded-3xl md:rounded-[30px] min-h-56 w-full p-5 mb-10">
						{/* Table Header */}
						<div className="border-b pb-2 border-secondary text-accentLighter flex justify-between items-center gap-5">
							<div className="flex gap-3 md:gap-10 items-center min-w-max">
								<p className="w-12 md:w-16">ID</p>
								<p className="w-20 md:w-24">Дата</p>
								<p className="w-16 md:w-20">Цена</p>
								<p className="flex-1">Клиент</p>
							</div>
							<div className="min-w-[120px] mr-2">
								<p>Статус</p>
							</div>
						</div>
						{/* Table Body */}
						<div className="flex flex-col gap-3 mt-3">
							{sortedRecordingOrders.length > 0 ? (
								sortedRecordingOrders.map((item) => (
									<div key={item.id} className="flex items-center gap-5 justify-between border-b border-secondary pb-3">
										<Link
											className="flex gap-3 md:gap-10 items-center w-full hover:text-accentLighter text-xs md:text-base whitespace-nowrap"
											href={`/recordingOrders/${item.id}`}
											target="_blank"
                                            rel="noopener noreferrer"
										>
											<div className="w-12 md:w-16 truncate">{item.id}</div>
											<div className="w-20 md:w-24">{formatDate(item.created_at)}</div>
											<div className="w-16 md:w-20">{item.price} т.</div>
											<div className="flex-1 truncate">{profiles[item.user] || 'N/A'}</div>
										</Link>
										<select
											value={item.status}
											onChange={(e) => updateOrderStatus(item.id, e.target.value, "recordings")}
											className="border rounded-lg px-2 py-1 bg-background text-foreground border-secondary min-w-[120px]"
                                            aria-label={`Статус за поръчка ${item.id}`}
										>
											<option value="Приета">Приета</option>
											<option value="Завършена">Завършена</option>
											<option value="Отказана">Отказана</option>
										</select>
									</div>
								))
							) : (
								<p>Няма поръчки за запис</p> // Corrected placeholder text
							)}
						</div>
					</div>

					{/* Add points dashboard */}
					<h2 className="text-xl md:text-3xl font-[700] mb-5 mt-10">
						Зареди точки
					</h2>
					<div className="mb-10"> {/* Added margin-bottom */}
                        <AddPoints sortedProfiles={sortedProfiles} pointsOrdersData={pointsOrdersData} />
                    </div>

					{/* Add custom package dashboard */}
					<h2 className="text-xl md:text-3xl font-[700] mb-5 mt-10">
						Добави персонален пакет
					</h2>
					<div className="mb-10">
						<AddCustomPackage sortedProfiles={sortedProfiles} />
					</div>

					{/* Manage user packages */}
					<h2 className="text-xl md:text-3xl font-[700] mb-5 mt-10">
						Управление на пакети на потребители
					</h2>
					<div className="mb-10">
						<ManageUserPackages sortedProfiles={sortedProfiles} pointsOrdersData={pointsOrdersData} />
					</div>

				</div> {/* End main grid */}
			</MaxWidthWrapper>
		</section>
	);
}