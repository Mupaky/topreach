import React from "react";
import MaxWidthWrapper from "@/components/others/MaxWidthWrapper";
import Transition from "@/components/others/Transition";

export default function Profile({ user, pointsOrders }) {
	const now = new Date();

	const activePackages = pointsOrders.filter((pkg) => {
		const expires = new Date(pkg.created_at);
		expires.setDate(expires.getDate() + pkg.lifespan);
		return expires >= now;
	});

	const expiredPackages = pointsOrders.filter((pkg) => {
		const expires = new Date(pkg.created_at);
		expires.setDate(expires.getDate() + pkg.lifespan);
		return expires < now;
	});

	const totalActivePoints = (type) =>
		activePackages.reduce((sum, p) => sum + (p[type] || 0), 0);

	const formatDate = (date) =>
		new Date(date).toLocaleDateString("bg-BG");

	return (
		<>
			{user && (
				<Transition delay={0.2} blur={3}>
					<div className="min-h-screen pt-32">
						<MaxWidthWrapper>
							<h1 className="text-3xl font-bold mb-6">Профил</h1>

							<div className="mb-10">
								<h2 className="text-2xl font-semibold mb-3">Точки (активни):</h2>
								<p>Видео монтаж: {totalActivePoints("editingPoints")} т.</p>
								<p>Видео заснемане: {totalActivePoints("recordingPoints")} т.</p>
								<p>Дизайн: {totalActivePoints("designPoints")} т.</p>
							</div>

							{/* Active packages */}
							<div className="mb-10">
								<h2 className="text-xl font-semibold mb-2">Активни пакети:</h2>
								{activePackages.map((pkg) => {
									const expires = new Date(pkg.created_at);
									expires.setDate(expires.getDate() + pkg.lifespan);
									return (
										<div key={pkg.id} className="border p-4 rounded mb-3">
											<p>Монтаж: {pkg.editingPoints} т.</p>
											<p>Заснемане: {pkg.recordingPoints} т.</p>
											<p>Дизайн: {pkg.designPoints} т.</p>
											<p>Изтича на: {formatDate(expires)}</p>
										</div>
									);
								})}
							</div>

							{/* Expired packages */}
							<div>
								<h2 className="text-xl font-semibold mb-2">Изтекли пакети:</h2>
								{expiredPackages.length > 0 ? (
									expiredPackages.map((pkg) => {
										const expiredAt = new Date(pkg.created_at);
										expiredAt.setDate(expiredAt.getDate() + pkg.lifespan);
										return (
											<div key={pkg.id} className="border p-4 rounded mb-3 bg-red-100/10">
												<p>Монтаж: {pkg.editingPoints} т.</p>
												<p>Заснемане: {pkg.recordingPoints} т.</p>
												<p>Дизайн: {pkg.designPoints} т.</p>
												<p>Изтекъл на: {formatDate(expiredAt)}</p>
											</div>
										);
									})
								) : (
									<p>Няма изтекли пакети.</p>
								)}
							</div>
						</MaxWidthWrapper>
					</div>
				</Transition>
			)}
		</>
	);
}
