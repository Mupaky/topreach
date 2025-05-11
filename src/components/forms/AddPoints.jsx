"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddPoints({ sortedProfiles, pointsOrdersData }) {
	const [selectedUser, setSelectedUser] = useState("");
	const [userPackages, setUserPackages] = useState([]);
	const [selectedPackage, setSelectedPackage] = useState("");
	const [pointType, setPointType] = useState("");
	const [actionType, setActionType] = useState("");
	const [pointsCount, setPointsCount] = useState(0);
	const [reason, setReason] = useState("");
	const router = useRouter();

	useEffect(() => {
		console.log("Selected User:", selectedUser);
		console.log("All Points Orders Data:", pointsOrdersData);
	  
		if (selectedUser && pointsOrdersData?.length > 0) {
		  const userPoints = pointsOrdersData.filter(
			(order) => order.user === selectedUser
		  );
		  console.log("Filtered Packages for User:", userPoints);
		  setUserPackages(userPoints);
		  setSelectedPackage("");
		}
	  }, [selectedUser, pointsOrdersData]);

	const handleSubmit = async () => {
		let missingFields = [];
		if (!selectedUser) missingFields.push("Потребител");
		if (!selectedPackage) missingFields.push("Пакет");
		if (!pointType) missingFields.push("Тип точки");
		if (!actionType) missingFields.push("Действие");
		if (!pointsCount || pointsCount <= 0) missingFields.push("Брой точки");
		if (!reason) missingFields.push("Причина");

		if (missingFields.length > 0) {
			alert(`Моля, попълнете следните полета: ${missingFields.join(", ")}`);
			return;
		}

		try {
			await fetch("/api/pointsorders", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId: selectedUser,
					packageId: selectedPackage,
					pointsType: pointType,
					actionType,
					pointsCount: Number(pointsCount),
					reason,
				}),
			});

			alert("Точките са обновени успешно!");
			router.refresh();
			setSelectedUser("");
			setSelectedPackage("");
			setPointType("");
			setActionType("");
			setPointsCount(0);
			setReason("");
		} catch (error) {
			console.error("Грешка при обновяване на точки:", error);
			alert("Възникна грешка при обработката.");
		}
	};

	return (
		<div className="flex flex-col gap-5 border p-5 rounded-xl bg-background border-secondary">
			<h2 className="text-2xl font-bold mb-2">Добави/Извади точки</h2>

			{/* User dropdown */}
			<select
				value={selectedUser}
				onChange={(e) => setSelectedUser(e.target.value)}
				className="border rounded-lg p-2 bg-background text-foreground border-secondary"
			>
				<option value="">Избери потребител</option>
				{sortedProfiles.map((profile) => (
					<option key={profile.id} value={profile.id}>
						{profile.fullname}
					</option>
				))}
			</select>

			{/* Package dropdown */}
			{selectedUser && (
				<select
					value={selectedPackage}
					onChange={(e) => setSelectedPackage(e.target.value)}
					className="border rounded-lg p-2 bg-background text-foreground border-secondary"
				>
					<option value="">Избери пакет</option>
					{userPackages.map((pkg) => (
						<option key={pkg.id} value={pkg.id}>
							ID: {pkg.id} | Видео: {pkg.editingPoints}т | Запис: {pkg.recordingPoints}т | Дизайн: {pkg.designPoints}т | Валидност: {pkg.lifespan} дни
						</option>
					))}
				</select>
			)}

			{/* Action */}
			<select
				value={actionType}
				onChange={(e) => setActionType(e.target.value)}
				className="border rounded-lg p-2 bg-background text-foreground border-secondary"
			>
				<option value="">Избери действие</option>
				<option value="add">Добави точки</option>
				<option value="remove">Премахни точки</option>
			</select>

			{/* Points type */}
			<select
				value={pointType}
				onChange={(e) => setPointType(e.target.value)}
				className="border rounded-lg p-2 bg-background text-foreground border-secondary"
			>
				<option value="">Избери тип точки</option>
				<option value="editingPoints">Монтаж</option>
				<option value="recordingPoints">Заснемане</option>
				<option value="designPoints">Дизайн</option>
			</select>

			{/* Points count */}
			<input
				type="number"
				min="1"
				value={pointsCount}
				onChange={(e) => setPointsCount(e.target.value)}
				placeholder="Брой точки"
				className="border rounded-lg p-2 bg-background text-foreground border-secondary"
			/>

			{/* Reason */}
			<input
				type="text"
				value={reason}
				onChange={(e) => setReason(e.target.value)}
				placeholder="Причина за промяната"
				className="border rounded-lg p-2 bg-background text-foreground border-secondary"
			/>

			{/* Submit */}
			<button
				onClick={handleSubmit}
				className="mt-4 p-2 bg-accent hover:bg-accentLighter text-white rounded-lg"
			>
				Запази промените
			</button>
		</div>
	);
}
