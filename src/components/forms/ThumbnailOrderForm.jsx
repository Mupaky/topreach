"use client";

import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Oswald } from "next/font/google";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenNib } from "@fortawesome/free-solid-svg-icons";
import { BeatLoader } from "react-spinners";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogClose,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const oswald = Oswald({ subsets: ["cyrillic"] });

const formSchema = z.object({
	service: z.string(),
	additionalService: z.string(),
});

export default function ThumbnailOrderForm({ email, points }) {
	const [error, setError] = useState(null);
	const [submitError, setSubmitError] = useState(null);
	const [loading, setLoading] = useState(false);

	const [finalPrice, setFinalPrice] = useState(0);

	const router = useRouter();

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			service: "standardThumbnail",
			additionalService: null,
		},
	});

	function calculateFinalPrice(values) {
		setSubmitError(null);

		const priceList = {
			standardThumbnail: 35,
			premiumThumbnail: 50,
		};

		let price = priceList[values.service];

		if (values.additionalService == "2TestThumbnails") {
			price *= 1.9;
		}

		if (values.additionalService == "3TestThumbnails") {
			price *= 2.5;
		}

		price /= 10;

		setFinalPrice(price);
	}

	async function submit() {
		setLoading(true);

		if (points < finalPrice) {
			setSubmitError("Нямате достатъчно точки.");
			setLoading(false);
			return;
		}

		const values = form.watch();

		const data = {
			...values,
			type: "thumbnail",
			price: finalPrice,
			email,
		};

		try {
			const response = await fetch("/api/createOrder", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const { message } = await response.json();
				setError(message || "Грешка при регистриране на поръчка.");
				setLoading(false);
				return;
			}

			router.push("/thankyou");
		} catch (err) {
			setLoading(false);
			setError("Грешка. Моля опитайте по-късно.");
		}
	}

	return (
		<Dialog>
			{/* Confirmation Dialog */}
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
							Крайна цена -{" "}
							<span className="text-accent">{finalPrice} т.</span>
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

			{/* Main Form */}
			<div className="bg-background relative flex border border-secondary px-10 py-12 rounded-3xl">
				<div className="absolute -top-6 lg:-left-6">
					<FontAwesomeIcon
						className="p-4 border rounded-xl border-accentLighter/40 text-accentLighter/90 bg-secondary/50 backdrop-blur-md"
						size="2xl"
						icon={faPenNib}
					/>
				</div>

				<div className="w-full">
					<Form {...form}>
						<form className="space-y-6">
							<FormField
								control={form.control}
								name="service"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-lg font-[700]">
											Услуга
										</FormLabel>
										<FormControl>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												<SelectTrigger className="input-field">
													<SelectValue placeholder="Изберете опция" />
												</SelectTrigger>
												<SelectContent className="bg-opacity-90 bg-background text-foreground border-accentLighter/40 backdrop-blur-sm">
													<SelectItem value="standardThumbnail">
														Standard Thumbnail
													</SelectItem>
													<SelectItem value="premiumThumbnail">
														Premium Thumbnail
													</SelectItem>
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="additionalService"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-lg font-[700]">
											Допълнителна услуга
										</FormLabel>
										<FormDescription className="font-[600] text-neutral-300 text-xs md:text-base text-balance">
											Получавате 2/3 тъмбнейла за същото
											видео с които ще може да бъде
											направен Тест с който да достигнем
											повече Click Trough Rate .
										</FormDescription>
										<FormControl>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												<SelectTrigger className="input-field">
													<SelectValue placeholder="Изберете опция" />
												</SelectTrigger>
												<SelectContent className="bg-opacity-90 bg-background text-foreground border-accentLighter/40 backdrop-blur-sm">
													<SelectItem value="2TestThumbnails">
														2 x Test Thumbnail
													</SelectItem>
													<SelectItem value="3TestThumbnails">
														3 x Test Thumbnail
													</SelectItem>
													<SelectItem value={null}>
														Не
													</SelectItem>
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="w-full">
								<DialogTrigger className="w-full">
									<div
										className={`${oswald.className} w-full text-accentLighter border-2 border-accentLighter/20 hover:border-accentLighter/40 bg-accentLighter/5
                                            transition-all duration-500 flex gap-1 items-center px-5 py-3 rounded-full hover:shadow-lg hover:shadow-accentLighter/20 justify-center uppercase font-[600]`}
										onClick={() =>
											calculateFinalPrice(
												form.getValues()
											)
										}
									>
										Преглед
									</div>
								</DialogTrigger>
							</div>

							<p className="text-red-500 h-1 text-center">
								{error}
							</p>
						</form>
					</Form>
				</div>
			</div>
		</Dialog>
	);
}
