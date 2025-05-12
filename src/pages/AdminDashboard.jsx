"use client";
import React, { useState } from "react";
import MaxWidthWrapper from "@/components/others/MaxWidthWrapper";
import Link from "next/link";

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


	// --- Derived Data / Helpers ---
	const profiles = (profilesData || []).reduce((acc, item) => {
		acc[item.id] = item.fullname;
		return acc;
	}, {});


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

	// --- Sorting (Memoize if performance becomes an issue) ---
	const sortedVlogOrders = [...vlogOrders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
	const sortedTiktokOrders = [...tiktokOrders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
	const sortedThumbnailOrders = [...thumbnailOrders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
	const sortedRecordingOrders = [...recordingOrders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

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

					

				</div> {/* End main grid */}
			</MaxWidthWrapper>
		</section>
	);
}