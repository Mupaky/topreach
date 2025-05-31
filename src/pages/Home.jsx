"use client";

import { useEffect, useState } from "react";
import Transition from "@/components/others/Transition";
import PointsCard from "@/components/cards/PointsCard";
import Button from "@/components/others/Button";
import MaxWidthWrapper from "@/components/others/MaxWidthWrapper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faFilm,
	faVideo,
	faPenNib,
	faCoins,
} from "@fortawesome/free-solid-svg-icons";
import { faTiktok } from "@fortawesome/free-brands-svg-icons";
import Link from "next/link";

export default function Home({ user, orders }) {
	const [editingPoints, setEditingPoints] = useState(0);
	const [recordingPoints, setRecordingPoints] = useState(0);
	const [designPoints, setDesignPoints] = useState(0);
	const firstName = user?.fullName?.split(" ")[0] || "Потребител";

	useEffect(() => {

        async function fetchPointsForType(userId, type) {
            try {
                const response = await fetch(`/api/activePoints?userId=${userId}&type=${type}`);
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`[Home Component] API Error for ${type} (status ${response.status}):`, errorText);
                    return { total: 0 };
                }
                const data = await response.json();
                return data; 
            } catch (err) {
                return { total: 0 };
            }
        }

        async function loadAllPoints() {
            if (!user?.id) {
                setEditingPoints(0); 
                setRecordingPoints(0);
                setDesignPoints(0);
                return;
            }

            const editingData = await fetchPointsForType(user.id, 'editingPoints');
            const recordingData = await fetchPointsForType(user.id, 'recordingPoints');
            const designData = await fetchPointsForType(user.id, 'designPoints');

            setEditingPoints(editingData.total || 0);
            setRecordingPoints(recordingData.total || 0);
            setDesignPoints(designData.total || 0);
        }

        loadAllPoints();

    }, [user?.id]); // Dependency array

	function formatDate(dateString) {
		const date = new Date(dateString);
		const day = String(date.getDate()).padStart(2, "0");
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const year = date.getFullYear();
		return `${day}.${month}.${year}`;
	}

	const allOrders = orders
		? Object.entries(orders)
				.flatMap(([orderType, orderArray]) =>
					orderArray.map((order) => ({ ...order, orderType }))
				)
				.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
		: [];

	const hasOrders = allOrders.length > 0;

	const icons = {
		vlogOrders: (
			<FontAwesomeIcon
				className="p-2 border rounded-lg border-accentLighter/40 text-accentLighter/90 bg-secondary/50"
				icon={faFilm}
			/>
		),
		tiktokOrders: (
			<FontAwesomeIcon
				className="p-2 border rounded-lg border-accentLighter/40 text-accentLighter/90 bg-secondary/50"
				icon={faTiktok}
			/>
		),
		recordingOrders: (
			<FontAwesomeIcon
				className="p-2 border rounded-lg border-accentLighter/40 text-accentLighter/90 bg-secondary/50"
				icon={faVideo}
			/>
		),
		thumbnailOrders: (
			<FontAwesomeIcon
				className="p-2 border rounded-lg border-accentLighter/40 text-accentLighter/90 bg-secondary/50"
				icon={faPenNib}
			/>
		),
	};

	return (
		<>
		
			{user && (
				<Transition delay={0.2}>
					<section className="min-h-screen overflow-hidden pb-10">
						<MaxWidthWrapper>
							<div className="mt-32 grid grid-cols-1 xl:grid-cols-2 gap-7 items-stretch">
								<div className="flex flex-col">
									{user.role == "admin" ? (
										<div className="flex justify-start mb-6">
										<Link href="/admin/formulas">
											<button className="px-4 py-2 bg-accent hover:bg-accentLighter text-white rounded-full shadow transition">
												Admin Dashboard
											</button>
										</Link>
										</div>
									) : false}
									<h2 className="font-[700] text-xl md:text-4xl bg-gradient-to-b from-foreground to-neutral-400 bg-clip-text text-transparent">
										{firstName &&
											`Здравейте отновно, ${firstName}!`}
									</h2>

									<div className="mt-5 w-full grid grid-cols-2 gap-2 md:gap-7">
										{editingPoints ? (
											<Transition delay={0.2}>
												<PointsCard
													points={editingPoints}
													text="Видео монтаж"
												/>
											</Transition>
										) : (
											<Transition delay={0.2}>
												<PointsCard
													points={0}
													text="Видео монтаж"
												/>
											</Transition>
										)}

										{recordingPoints ? (
											<Transition delay={0.35}>
												<PointsCard
													points={recordingPoints}
													text="Видео заснемане"
												/>
											</Transition>
										) : (
											<Transition delay={0.35}>
												<PointsCard
													points={0}
													text="Видео заснемане"
												/>
											</Transition>
										)}

										<div className="col-span-2 md:col-span-1">
											{designPoints ? (
												<Transition delay={0.5}>
													<PointsCard
														points={designPoints}
														text="Дизайн"
													/>
												</Transition>
											) : (
												<Transition delay={0.5}>
													<PointsCard
														points={0}
														text="Дизайн"
													/>
												</Transition>
											)}
										</div>

										<div className="col-span-2 md:hidden">
											<Button
												text="Купи точки"
												link="/points"
											/>
										</div>

										<Transition delay={0.65}>
											<div className="border border-secondary bg-background text-foreground rounded-3xl md:rounded-[30px] w-full h-48 p-5 hidden md:flex flex-col justify-between">
												<div className="w-10 h-10 absolute top-1/2 -translate-x-1/2 left-1/2 -translate-y-1/2 bg-gradient-to-br from-accent to-accentLighter blur-[50px] filter rounded-full" />

												<p className="text-neutral-300 font-[600]">
													Не позволявай на лимитите да
													те спрат. Вземи още точки и
													продължи напред!
												</p>
												<Button
													text="Купи точки"
													link="/points"
												/>
											</div>
										</Transition>
									</div>
									<Link href="/my-orders" className="block px-4 py-2 hover:bg-gray-700">📦 Моите поръчки</Link>
								</div>

								


								<div className="relative flex flex-col xl:col-span-2 min-h-96">
									<h2 className="font-[700] text-3xl md:text-4xl bg-gradient-to-b from-foreground to-neutral-400 bg-clip-text text-transparent">
										Поръчки (точки)
									</h2>

									<div className="border bg-background/70 backdrop-blur-sm border-secondary w-full max-h-[26rem] overflow-scroll mt-5 rounded-[30px] px-4 py-5 md:p-5 flex-1">
										{orders.pointsOrders &&
										orders.pointsOrders.length > 0 ? (
											<div className="flex flex-col gap-5">
												{orders.pointsOrders.map(
													(order, index) => (
														<Link
															key={index}
															href={`/pointsOrders/${order.id}`}
														>
															<div className="flex justify-between text-sm md:text-base items-center transition-all hover:opacity-80">
																<div className="flex gap-2 md:gap-5 items-center">
																	<FontAwesomeIcon
																		className="p-2 border rounded-lg border-accentLighter/40 text-accentLighter/90 bg-secondary/50"
																		icon={
																			faCoins
																		}
																	/>
																	<p>
																		{formatDate(
																			order.created_at
																		)}
																	</p>
																	<p>
																		{
																			order.status
																		}
																	</p>
																</div>
																<p>
																	Цена:{" "}
																	{
																		order.price
																	}{" "}
																	лв.
																</p>
															</div>
														</Link>
													)
												)}
											</div>
										) : (
											<p className="font-[600] text-neutral-400 w-max mx-auto">
												Няма направени поръчки
											</p>
										)}
									</div>
								</div>
							</div>
						</MaxWidthWrapper>
					</section>
				</Transition>
			)}
		</>
	);
}
