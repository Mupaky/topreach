"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogClose,
} from "@/components/ui/dialog";
import { useState } from "react";
import { BeatLoader } from "react-spinners";
import { useRouter } from "next/navigation";

export default function BuyPointsCard({ price, points, email, name, lifespan, userId }) {
	const [submitError, setSubmitError] = useState(null);
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	async function submit() {
		setLoading(true);

		const data = {
			type: "points",
			price: price,
			email,
			userId,
			editingPoints: points.editingPoints,
			designPoints: points.designPoints,
			recordingPoints: points.recordingPoints,
			lifespan,
			status: "Активен",
		};

		try {
			const response = await fetch("/api/createOrder", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const { message } = await response.json();
				setSubmitError(
					message || "Грешка при регистриране на поръчка."
				);
				setLoading(false);
				return;
			}

			try {
				const response = await fetch("/api/pointsFeedback", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						name,
						editingPoints: points.editingPoints,
						designPoints: points.designPoints,
						recordingPoints: points.recordingPoints,
						price,
						email,
					}),
				});

				const data = await response.json();

				if (response.ok) {
					router.push("/thankyou");
				} else {
					setSubmitError(
						data.message || "Грешка. Моля опитайте по-късно."
					);
					setLoading(false);
				}
			} catch (err) {
				setLoading(false);
				setSubmitError("Грешка. Моля опитайте по-късно.");
			}
		} catch (err) {
			setLoading(false);
			setSubmitError("Грешка. Моля опитайте по-късно.");
		}
	}

	return (
		<Dialog>
			<DialogContent
				className="bg-background border-secondary"
				onCloseAutoFocus={(e) => e.preventDefault()}
			>
				<DialogHeader>
					<DialogTitle className="text-lg text-neutral-300">
						Сигурни ли сте, че искате да поръчате?
					</DialogTitle>
					<DialogDescription className="pt-2 flex flex-col gap-2 text-base font-[600]">
						<span className="text-xl font-[700] text-foreground">
							Цена -{" "}
							<span className="text-accent">{price} лв.</span>
						</span>

						<span className="flex flex-col gap-2 mt-2 text-neutral-300">
							<span>
								Видео монтаж - {points.editingPoints} т.
							</span>
							<span>
								Видео заснемане - {points.recordingPoints} т.
							</span>
							<span>Дизайн - {points.designPoints} т.</span>
							<span>Валидност на пакета: <span className="text-foreground font-medium">{lifespan} дни</span></span>
						</span>

						<span className="text-red-500">{submitError}</span>

						<span className="flex gap-3 ml-auto">
							<DialogClose asChild className="w-max">
								<button className="btn">Назад</button>
							</DialogClose>
							<DialogClose asChild className="w-max">
								<button
									onClick={async (e) => {
										e.preventDefault();
										await submit();
									}}
									className="px-5 py-3 bg-accent hover:bg-accentLighter transition-all duration-300 font-[600] rounded-full text-sm flex justify-center items-center w-36 text-foreground"
								>
									{!loading ? (
										"Поръчай"
									) : (
										<BeatLoader color="#fff" size={10} />
									)}
								</button>
							</DialogClose>
						</span>
					</DialogDescription>
				</DialogHeader>
			</DialogContent>

			<div className="rounded-3xl min-h-64 w-full border border-secondary overflow-hidden bg-background md:bg-background/50 backdrop-blur-[7px]">
				<div className="p-7 border-b border-secondary bg-transparent">
					<p className="text-4xl font-[800] bg-gradient-to-b from-foreground to-neutral-400 bg-clip-text text-transparent">
						{price} лв.
					</p>
				</div>

				<div className="p-7">
					<div className="mb-7 flex flex-col gap-3 text-base lg:text-lg">
						<p className="font-[500] flex items-center gap-2">
							<FontAwesomeIcon
								className="text-accent"
								icon={faCheckCircle}
							/>
							Видео монтаж - {points.editingPoints} т.
						</p>

						<p className="font-[500] flex items-center gap-2">
							<FontAwesomeIcon
								className="text-accent"
								icon={faCheckCircle}
							/>
							Видео заснемане - {points.recordingPoints} т.
						</p>

						<p className="font-[500] flex items-center gap-2">
							<FontAwesomeIcon
								className="text-accent"
								icon={faCheckCircle}
							/>
							Дизайн - {points.designPoints} т.
						</p>
					</div>

					<p className="font-[500] flex items-center gap-2 text-sm text-muted-foreground">
						<FontAwesomeIcon className="text-accent" icon={faCheckCircle} />
						Валидност: {lifespan} дни
					</p>


					<DialogTrigger className="w-full">
						<div
							className="text-accentLighter border-2 border-accentLighter/20 hover:border-accentLighter/40 bg-accentLighter/5
        transition-all duration-500 px-5 py-3 rounded-full hover:shadow-lg hover:shadow-accentLighter/20"
						>
							<span className="w-max mx-auto">Поръчай</span>
						</div>
					</DialogTrigger>
				</div>
			</div>
		</Dialog>
	);
}
