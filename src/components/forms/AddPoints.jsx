"use client";

import React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AddPoints({ sortedProfiles }) {
	const [pointsData, setPointsData] = useState({});
	const pointTypes = ["Дизайн", "Монтаж", "Заснемане"];
	const router = useRouter();

	const handleChange = (userId, field, value) => {
		setPointsData((prev) => ({
			...prev,
			[userId]: {
				...prev[userId],
				[field]: field === "points" ? Number(value) : value,
			},
		}));
	};

	const handleSubmit = async (userId) => {
		const { points, type } = pointsData[userId] || {};

		if (!points || !type) {
			alert("Моля, въведете точки и изберете тип.");
			return;
		}

		try {
			// Send update request to the server
			await fetch("/api/points", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId,
					pointsType: type,
					pointsCount: points,
				}),
			});

			router.refresh();
		} catch (error) {
			console.error("Failed to update points.", error);
		}
	};

	return (
		<div className="overflow-x-hidden col-span-2 overflow-y-scroll border border-secondary bg-background text-foreground rounded-3xl md:rounded-[30px] min-h-56 w-full p-5">
			<div className="border-b pb-2 border-secondary text-accentLighter flex justify-between gap-5">
				<div className="flex gap-7 md:gap-10">
					<p>Клиент</p>
				</div>
				<div className="mr-5 flex gap-7 md:gap-10">
					<p>Тип точки</p>
					<p>Брой</p>
					<p>Зареди</p>
				</div>
			</div>

			<div className="flex flex-col gap-3 mt-3">
				{sortedProfiles && sortedProfiles.length > 0 ? (
					sortedProfiles.map((item) => (
						<div
							key={item.id}
							className="flex items-center gap-5 justify-between border-b border-secondary pb-3 overflow-scroll"
						>
							<div
								className="flex gap-5 w-max hover:text-accentLighter"
								target="_blank"
							>
								<div>
									<span className="whitespace-nowrap">
										{item.fullname}
									</span>
									<div className="flex gap-2 md:gap-3 flex-col md:flex-row">
										<p>Д: {item.designPoints || 0} т.</p>
										<p>M: {item.editingPoints || 0} т.</p>
										<p>З: {item.recordingPoints || 0} т.</p>
									</div>
								</div>
							</div>

							<div className="flex gap-5">
								<select
									value={pointsData[item.id]?.type || ""}
									onChange={(e) =>
										handleChange(
											item.id,
											"type",
											e.target.value
										)
									}
									className="border rounded-lg px-2 py-1 bg-background text-foreground border-secondary"
								>
									<option value="" disabled>
										Избери тип
									</option>
									{pointTypes.map((type) => (
										<option key={type} value={type}>
											{type}
										</option>
									))}
								</select>
								<input
									type="number"
									value={pointsData[item.id]?.points || ""}
									onChange={(e) =>
										handleChange(
											item.id,
											"points",
											e.target.value
										)
									}
									className="border border-secondary rounded-xl py-2 px-3 bg-background"
								/>

								<button
									onClick={() => handleSubmit(item.id)}
									className="border border-accentLighter/20 rounded-full py-2 px-3 hover:opacity-70"
								>
									Зареди
								</button>
							</div>
						</div>
					))
				) : (
					<p>Няма поръчки на дизайн на thumbnail</p>
				)}
			</div>
		</div>
	);
}
