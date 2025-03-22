"use client";

import React, { useState } from "react";
import MaxWidthWrapper from "@/components/others/MaxWidthWrapper";
import Link from "next/link";
import AddPoints from "@/components/forms/AddPoints";

export default function AdminDashboard({
	vlogOrdersData,
	tiktokOrdersData,
	thumbnailOrdersData,
	recordingOrdersData,
	profilesData,
	pointsOrdersData,
	packagesData,
}) {
	const [vlogOrders, setVlogOrders] = useState(vlogOrdersData || []);
	const [tiktokOrders, setTiktokOrders] = useState(tiktokOrdersData || []);
	const [thumbnailOrders, setThumbnailOrders] = useState(
		thumbnailOrdersData || []
	);
	const [recordingOrders, setRecordingOrders] = useState(
		recordingOrdersData || []
	);
	const [pointsOrders, setPointsOrders] = useState(pointsOrdersData || []);
	const [packages, setPackages] = useState(packagesData || []);

	const profiles = (profilesData || []).reduce((acc, item) => {
		acc[item.id] = item.fullname;
		return acc;
	}, {});

	// Function to format the date
	function formatDate(dateString) {
		const date = new Date(dateString);
		const day = String(date.getDate()).padStart(2, "0");
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const year = date.getFullYear();
		return `${day}.${month}.${year}`;
	}

	// Function to update the order status
	async function updateOrderStatus(orderId, newStatus, type) {
		try {
			// Send update request to the server
			await fetch("/api/orders", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ orderId, newStatus, type }),
			});

			// Update the UI
			if (type === "vlogOrders") {
				setVlogOrders((prevOrders) =>
					prevOrders.map((order) =>
						order.id === orderId
							? { ...order, status: newStatus }
							: order
					)
				);
			} else if (type === "tiktokOrders") {
				setTiktokOrders((prevOrders) =>
					prevOrders.map((order) =>
						order.id === orderId
							? { ...order, status: newStatus }
							: order
					)
				);
			} else if (type === "thumbnailOrders") {
				setThumbnailOrders((prevOrders) =>
					prevOrders.map((order) =>
						order.id === orderId
							? { ...order, status: newStatus }
							: order
					)
				);
			} else if (type === "recordings") {
				setRecordingOrders((prevOrders) =>
					prevOrders.map((order) =>
						order.id === orderId
							? { ...order, status: newStatus }
							: order
					)
				);
			} else if (type === "pointsOrders") {
				setPointsOrders((prevOrders) =>
					prevOrders.map((order) =>
						order.id === orderId
							? { ...order, status: newStatus }
							: order
					)
				);
			}
		} catch (error) {
			console.error("Failed to update order status", error);
		}
	}

	async function updatePackage(
		packageId,
		editingPoints,
		recordingPoints,
		designPoints,
		price
	) {
		try {
			// Send update request to the server
			await fetch("/api/packages", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					packageId,
					editingPoints,
					recordingPoints,
					designPoints,
					price,
				}),
			});

			setPackages((prevPackages) =>
				prevPackages.map((pkg) =>
					pkg.id === packageId
						? {
								...pkg,
								editingPoints,
								recordingPoints,
								designPoints,
								price,
							}
						: pkg
				)
			);
		} catch (error) {
			console.error("Failed to update package.", error);
		}
	}

	// Sort orders by date (newest first) with safety checks
	const sortedVlogOrders = (vlogOrders || []).sort(
		(a, b) => new Date(b.created_at) - new Date(a.created_at)
	);

	const sortedTiktokOrders = (tiktokOrders || []).sort(
		(a, b) => new Date(b.created_at) - new Date(a.created_at)
	);

	const sortedThumbnailOrders = (thumbnailOrders || []).sort(
		(a, b) => new Date(b.created_at) - new Date(a.created_at)
	);

	const sortedRecordingOrders = (recordingOrders || []).sort(
		(a, b) => new Date(b.created_at) - new Date(a.created_at)
	);

	const sortedPointsOrders = (pointsOrders || []).sort(
		(a, b) => new Date(b.created_at) - new Date(a.created_at)
	);

	const sortedProfiles = (profilesData || []).sort(
		(a, b) => new Date(b.created_at) - new Date(a.created_at)
	);

	return (
		<section className="min-h-screen overflow-hidden pb-10 relative">
			<div className="w-96 h-96 -z-10 absolute -top-20 -left-20 bg-gradient-to-br from-accent/40 to-background blur-[100px] filter rounded-full" />

			<MaxWidthWrapper>
				<div className="mt-32 grid grid-cols-2">
					{/* Vlog orders dashboard */}

					<h2 className="text-xl col-span-2 md:text-3xl font-[700] mb-5">
						Поръчки (видео монтаж влог)
					</h2>

					<div className="overflow-scroll md:overflow-x-hidden col-span-2 overflow-y-scroll border border-secondary bg-background text-foreground rounded-3xl md:rounded-[30px] min-h-56 w-full p-5">
						<div className="border-b pb-2 border-secondary text-accentLighter flex justify-between gap-5">
							<div className="flex gap-7 md:gap-10">
								<p>ID</p>
								<p>Дата</p>
								<p>Цена</p>
								<p>Клиент</p>
							</div>
							<div className="mr-5">
								<p>Статус</p>
							</div>
						</div>

						<div className="flex flex-col gap-3 mt-3">
							{sortedVlogOrders && sortedVlogOrders.length > 0 ? (
								sortedVlogOrders.map((item) => (
									<div
										key={item.id}
										className="flex items-center gap-5 justify-between border-b border-secondary pb-3"
									>
										<Link
											className="flex gap-3 md:gap-5 w-max hover:text-accentLighter text-xs md:text-base whitespace-nowrap"
											href={`/vlogOrders/${item.id}`}
											target="_blank"
										>
											<div>{item.id}</div>
											<div>
												{formatDate(item.created_at)}
											</div>
											<div>{item.price} т.</div>
											<div>{profiles[item.user]}</div>
										</Link>
										<select
											value={item.status}
											onChange={(e) =>
												updateOrderStatus(
													item.id,
													e.target.value,
													"vlogOrders"
												)
											}
											className="border rounded-lg px-2 py-1 bg-background text-foreground border-secondary"
										>
											<option value="В обработка">
												В обработка
											</option>
											<option value="Завършена">
												Завършена
											</option>
											<option value="Отказана">
												Отказана
											</option>
										</select>
									</div>
								))
							) : (
								<p>Няма поръчки на видео монтаж на влог</p>
							)}
						</div>
					</div>

					{/* Tiktok orders dashboard */}

					<h2 className="text-xl col-span-2 md:text-3xl font-[700] mb-5 mt-10">
						Поръчки (видео монтаж тикток)
					</h2>

					<div className="overflow-scroll md:overflow-x-hidden col-span-2 overflow-y-scroll border border-secondary bg-background text-foreground rounded-3xl md:rounded-[30px] min-h-56 w-full p-5">
						<div className="border-b pb-2 border-secondary text-accentLighter flex justify-between gap-5">
							<div className="flex gap-7 md:gap-10">
								<p>ID</p>
								<p>Дата</p>
								<p>Цена</p>
								<p>Клиент</p>
							</div>
							<div className="mr-5">
								<p>Статус</p>
							</div>
						</div>

						<div className="flex flex-col gap-3 mt-3">
							{sortedTiktokOrders &&
							sortedTiktokOrders.length > 0 ? (
								sortedTiktokOrders.map((item) => (
									<div
										key={item.id}
										className="flex items-center gap-5 justify-between border-b border-secondary pb-3"
									>
										<Link
											className="flex gap-3 md:gap-5 w-max hover:text-accentLighter text-xs md:text-base whitespace-nowrap"
											href={`/tiktokOrders/${item.id}`}
											target="_blank"
										>
											<div>{item.id}</div>
											<div>
												{formatDate(item.created_at)}
											</div>
											<div>{item.price} т.</div>
											<div>{profiles[item.user]}</div>
										</Link>
										<select
											value={item.status}
											onChange={(e) =>
												updateOrderStatus(
													item.id,
													e.target.value,
													"tiktokOrders"
												)
											}
											className="border rounded-lg px-2 py-1 bg-background text-foreground border-secondary"
										>
											<option value="В обработка">
												В обработка
											</option>
											<option value="Завършена">
												Завършена
											</option>
											<option value="Отказана">
												Отказана
											</option>
										</select>
									</div>
								))
							) : (
								<p>Няма поръчки на видео монтаж на тикток</p>
							)}
						</div>
					</div>

					{/* Thumbnail orders dashboard */}

					<h2 className="text-xl col-span-2 md:text-3xl font-[700] mb-5 mt-10">
						Поръчки (thumbnail дизайн)
					</h2>

					<div className="overflow-scroll md:overflow-x-hidden col-span-2 overflow-y-scroll border border-secondary bg-background text-foreground rounded-3xl md:rounded-[30px] min-h-56 w-full p-5">
						<div className="border-b pb-2 border-secondary text-accentLighter flex justify-between gap-5">
							<div className="flex gap-7 md:gap-10">
								<p>ID</p>
								<p>Дата</p>
								<p>Цена</p>
								<p>Клиент</p>
							</div>
							<div className="mr-5">
								<p>Статус</p>
							</div>
						</div>

						<div className="flex flex-col gap-3 mt-3">
							{sortedThumbnailOrders &&
							sortedThumbnailOrders.length > 0 ? (
								sortedThumbnailOrders.map((item) => (
									<div
										key={item.id}
										className="flex items-center gap-5 justify-between border-b border-secondary pb-3"
									>
										<Link
											className="flex gap-3 md:gap-5 w-max hover:text-accentLighter text-xs md:text-base whitespace-nowrap"
											href={`/thumbnailOrders/${item.id}`}
											target="_blank"
										>
											<div>{item.id}</div>
											<div>
												{formatDate(item.created_at)}
											</div>
											<div>{item.price} т.</div>
											<div>{profiles[item.user]}</div>
										</Link>
										<select
											value={item.status}
											onChange={(e) =>
												updateOrderStatus(
													item.id,
													e.target.value,
													"thumbnailOrders"
												)
											}
											className="border rounded-lg px-2 py-1 bg-background text-foreground border-secondary"
										>
											<option value="В обработка">
												В обработка
											</option>
											<option value="Завършена">
												Завършена
											</option>
											<option value="Отказана">
												Отказана
											</option>
										</select>
									</div>
								))
							) : (
								<p>Няма поръчки на дизайн на thumbnail</p>
							)}
						</div>
					</div>

					{/* Recording orders dashboard */}

					<h2 className="text-xl col-span-2 md:text-3xl font-[700] mb-5 mt-10">
						Поръчки (запис)
					</h2>

					<div className="overflow-scroll md:overflow-x-hidden col-span-2 overflow-y-scroll border border-secondary bg-background text-foreground rounded-3xl md:rounded-[30px] min-h-56 w-full p-5">
						<div className="border-b pb-2 border-secondary text-accentLighter flex justify-between gap-5">
							<div className="flex gap-7 md:gap-10">
								<p>ID</p>
								<p>Дата</p>
								<p>Цена</p>
								<p>Клиент</p>
							</div>
							<div className="mr-5">
								<p>Статус</p>
							</div>
						</div>

						<div className="flex flex-col gap-3 mt-3">
							{sortedRecordingOrders &&
							sortedRecordingOrders.length > 0 ? (
								sortedRecordingOrders.map((item) => (
									<div
										key={item.id}
										className="flex items-center gap-5 justify-between border-b border-secondary pb-3"
									>
										<Link
											className="flex gap-3 md:gap-5 w-max hover:text-accentLighter text-xs md:text-base whitespace-nowrap"
											href={`/recordingOrders/${item.id}`}
											target="_blank"
										>
											<div>{item.id}</div>
											<div>
												{formatDate(item.created_at)}
											</div>
											<div>{item.price} т.</div>
											<div>{profiles[item.user]}</div>
										</Link>
										<select
											value={item.status}
											onChange={(e) =>
												updateOrderStatus(
													item.id,
													e.target.value,
													"recordings"
												)
											}
											className="border rounded-lg px-2 py-1 bg-background text-foreground border-secondary"
										>
											<option value="Приета">
												Приета
											</option>
											<option value="Завършена">
												Завършена
											</option>
											<option value="Отказана">
												Отказана
											</option>
										</select>
									</div>
								))
							) : (
								<p>Няма поръчки на дизайн на thumbnail</p>
							)}
						</div>
					</div>

					{/* Points orders dashboard */}

					<h2 className="text-xl col-span-2 md:text-3xl font-[700] mb-5 mt-10">
						Поръчки (точки)
					</h2>

					<div className="overflow-scroll md:overflow-x-hidden col-span-2 overflow-y-scroll border border-secondary bg-background text-foreground rounded-3xl md:rounded-[30px] min-h-56 w-full p-5">
						<div className="border-b pb-2 border-secondary text-accentLighter flex justify-between gap-5">
							<div className="flex gap-7 md:gap-10">
								<p>ID</p>
								<p>Дата</p>
								<p>Цена</p>
								<p>Клиент</p>
							</div>
							<div className="mr-5">
								<p>Статус</p>
							</div>
						</div>

						<div className="flex flex-col gap-3 mt-3">
							{sortedPointsOrders &&
							sortedPointsOrders.length > 0 ? (
								sortedPointsOrders.map((item) => (
									<div
										key={item.id}
										className="flex items-center gap-5 justify-between border-b border-secondary pb-3"
									>
										<Link
											className="flex gap-3 md:gap-5 w-max hover:text-accentLighter text-xs md:text-base whitespace-nowrap"
											href={`/pointsOrders/${item.id}`}
											target="_blank"
										>
											<div>{item.id}</div>
											<div>
												{formatDate(item.created_at)}
											</div>
											<div>{item.price} лв.</div>
											<div>{profiles[item.user]}</div>
										</Link>
										<select
											value={item.status}
											onChange={(e) =>
												updateOrderStatus(
													item.id,
													e.target.value,
													"pointsOrders"
												)
											}
											className="border rounded-lg px-2 py-1 bg-background text-foreground border-secondary"
										>
											<option value="Получена">
												Получена
											</option>
											<option value="Завършена">
												Завършена
											</option>
											<option value="Отказана">
												Отказана
											</option>
											<option value="Платена">
												Платена
											</option>
										</select>
									</div>
								))
							) : (
								<p>Няма поръчки на дизайн на thumbnail</p>
							)}
						</div>
					</div>

					{/* Add points dashboard */}

					<h2 className="text-xl col-span-2 md:text-3xl font-[700] mb-5 mt-10">
						Зареди точки
					</h2>

					<AddPoints sortedProfiles={sortedProfiles} />

					{/* Packages dashboard */}
					<h2 className="text-xl col-span-2 md:text-3xl font-[700] mb-5 mt-10">
						Пакети
					</h2>
					<div className="overflow-x-hidden col-span-2 overflow-y-scroll border border-secondary bg-background text-foreground rounded-3xl md:rounded-[30px] min-h-56 w-full p-5">
						<div className="flex flex-col gap-5 mt-3">
							{packages && packages.length > 0 ? (
								packages.map((pkg) => (
									<div
										key={pkg.id}
										className="flex flex-col gap-5 border-b border-secondary pb-5"
									>
										<div className="flex justify-between">
											<p className="text-lg font-[600]">
												Пакет: {pkg.id}
											</p>
											<p>Цена: {pkg.price} лв.</p>
										</div>
										<div className="grid md:grid-cols-3 gap-3 overflow-x-scroll">
											<div>
												<p className="mb-2">
													Точки (Видео монтаж)
												</p>
												<input
													type="number"
													value={pkg.editingPoints}
													onChange={(e) =>
														setPackages(
															(prevPackages) =>
																prevPackages.map(
																	(p) =>
																		p.id ===
																		pkg.id
																			? {
																					...p,
																					editingPoints:
																						e
																							.target
																							.value,
																				}
																			: p
																)
														)
													}
													className="border rounded-lg px-2 py-1 bg-background text-foreground border-secondary"
												/>
											</div>
											<div>
												<p className="mb-2">
													Точки (запис)
												</p>
												<input
													type="number"
													value={pkg.recordingPoints}
													onChange={(e) =>
														setPackages(
															(prevPackages) =>
																prevPackages.map(
																	(p) =>
																		p.id ===
																		pkg.id
																			? {
																					...p,
																					recordingPoints:
																						e
																							.target
																							.value,
																				}
																			: p
																)
														)
													}
													className="border rounded-lg px-2 py-1 bg-background text-foreground border-secondary"
												/>
											</div>
											<div>
												<p className="mb-2">
													Точки (дизайн)
												</p>
												<input
													type="number"
													value={pkg.designPoints}
													onChange={(e) =>
														setPackages(
															(prevPackages) =>
																prevPackages.map(
																	(p) =>
																		p.id ===
																		pkg.id
																			? {
																					...p,
																					designPoints:
																						e
																							.target
																							.value,
																				}
																			: p
																)
														)
													}
													className="border rounded-lg px-2 py-1 bg-background text-foreground border-secondary"
												/>
											</div>
											<div>
												<p className="mb-2">Цена</p>
												<input
													type="number"
													value={pkg.price}
													onChange={(e) =>
														setPackages(
															(prevPackages) =>
																prevPackages.map(
																	(p) =>
																		p.id ===
																		pkg.id
																			? {
																					...p,
																					price: e
																						.target
																						.value,
																				}
																			: p
																)
														)
													}
													className="border rounded-lg px-2 py-1 bg-background text-foreground border-secondary"
												/>
											</div>
										</div>
										<button
											onClick={() =>
												updatePackage(
													pkg.id,
													pkg.editingPoints,
													pkg.recordingPoints,
													pkg.designPoints,
													pkg.price
												)
											}
											className="border border-accentLighter/20 rounded-full py-2 mt-3 hover:opacity-70"
										>
											Запази промените
										</button>
									</div>
								))
							) : (
								<p>Няма пакети</p>
							)}
						</div>
					</div>
				</div>
			</MaxWidthWrapper>
		</section>
	);
}
