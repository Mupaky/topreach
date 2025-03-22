"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Oswald } from "next/font/google";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilm } from "@fortawesome/free-solid-svg-icons";
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
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
	rawSourceMaterial: z.string(),
	hasStory: z.string(),
	shotByUs: z.string(),
	videoCompression: z.string(),
	effects: z.string(),
	lut: z.string(),
	locations: z.number().min(0, "Локациите не могат да бъдат по-малко от 0."),
	cameras: z.number().min(0, "Камерите не могат да бъдат по-малко от 0."),
	microphones: z
		.number()
		.min(0, "Микрофоните не могат да бъдат по-малко от 0."),
	runningTime: z.string(),
	intro: z.string(),
	voiceOvers: z.string(),
	advertisements: z
		.array(z.enum(["almostNone", "goodEditing", "heavyEditing", "3D"]))
		.default([]),

	addIntroAd: z.string(),
	addOutroAd: z.string(),
	addPopupAd: z.string(),
	delivery: z.string(),
});

export default function VlogOrderForm({ email, points }) {
	const [error, setError] = useState(null);
	const [submitError, setSubmitError] = useState(null);
	const [loading, setLoading] = useState(false);

	const [finalPrice, setFinalPrice] = useState(0);
	const [hoursOfWork, setHoursOfWork] = useState(0);

	const router = useRouter();

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			rawSourceMaterial: "15",
			hasStory: "yes",
			shotByUs: "no",
			videoCompression: "yes",
			effects: "goodEditing",
			lut: "yes",
			locations: 1,
			cameras: 1,
			microphones: 1,
			runningTime: "10",
			intro: "without",
			voiceOvers: "yes",
			advertisements: [],
			addIntroAd: "no",
			addOutroAd: "no",
			addPopupAd: "no",
			delivery: "slow",
		},
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "advertisements",
	});

	const adPriceMap = {
		almostNone: 0,
		goodEditing: 15,
		heavyEditing: 30,
		"3D": 75,
	};

	const lutValue = form.watch("lut");

	useEffect(() => {
		const currentCameras = form.getValues("cameras");
		const currentLocations = form.getValues("locations");

		if (lutValue === "no") {
			if (currentCameras !== 0 || currentLocations !== 0) {
				form.setValue("cameras", 0);
				form.setValue("locations", 0);
			}
		} else if (lutValue === "yes") {
			if (currentCameras === 0 && currentLocations === 0) {
				form.setValue("cameras", 1);
				form.setValue("locations", 1);
			}
		}
	}, [lutValue, form]);

	function calculateFinalPrice(values) {
		setSubmitError(null);

		const data = {
			...values,
			locations: Number(values.locations),
			cameras: Number(values.cameras),
			microphones: Number(values.microphones),
		};

		let price = 0;

		const priceList = {
			effects: {
				almostNone: 5,
				goodEditing: 10,
				heavyEditing: 30,
				animatedHeavy: 75,
			},
			lut: { yes: 15, no: 0 },
			intro: { without: 0, medium: 60, premium: 150, animated: 240 },
			addIntroAd: { yes: -90, no: 0 },
			addOutroAd: { yes: -75, no: 0 },
			addPopupAd: { 1: -15, 2: -30, 3: -45, no: 0 },
		};

		for (const [key, valueMapping] of Object.entries(priceList)) {
			if (key === "runningTime" || key === "effects") continue;
			const selectedValue = data[key];
			if (valueMapping[selectedValue] !== undefined) {
				price += valueMapping[selectedValue];
			}
		}

		// Effects depend on runningTime
		price += Number(data.runningTime) * priceList.effects[data.effects];

		// Has a story
		if (data.hasStory === "no") {
			price += Number(data.rawSourceMaterial) * 0.5;
		}

		// Shot by us
		if (data.shotByUs === "no") {
			price += Number(data.rawSourceMaterial);
		}

		// Raw source material cost
		price += Number(data.rawSourceMaterial);

		// Locations & Cameras
		price += data.locations * 15 + data.cameras * 15;

		// Microphones (extra for additional mics beyond 1)
		if (data.microphones > 1) {
			price +=
				(data.microphones - 1) * (Number(data.rawSourceMaterial) / 2);
		}

		// Voice-overs
		if (data.voiceOvers === "yes") {
			price += Number(data.runningTime) * 2;
		}

		// Video compression
		if (data.videoCompression === "yes") {
			price += Number(data.rawSourceMaterial) * 3.5;
		}

		// Dynamic advertisements cost
		data.advertisements.forEach((adValue) => {
			price += adPriceMap[adValue] || 0;
		});

		// Hours of Work
		setHoursOfWork(price / 60);

		// Delivery Speed
		if (data.delivery === "fast") {
			price *= 1.5;
		}

		price /= 10;

		setFinalPrice(price);
	}

	// 5) Submit Handler
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
			type: "vlog",
			price: finalPrice,
			hoursOfWork,
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
						icon={faFilm}
					/>
				</div>

				<div className="w-full">
					<Form {...form}>
						<form className="space-y-6">
							{/* Raw Material & Story */}
							<div className="grid md:grid-cols-2 gap-5">
								<FormField
									control={form.control}
									name="rawSourceMaterial"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-lg font-[700]">
												Минути суров материал
											</FormLabel>
											<FormControl>
												<Select
													onValueChange={
														field.onChange
													}
													defaultValue={field.value}
												>
													<SelectTrigger className="input-field">
														<SelectValue placeholder="Изберете опция" />
													</SelectTrigger>
													<SelectContent className="bg-opacity-90 bg-background text-foreground border-accentLighter/40 backdrop-blur-sm">
														<SelectItem value="15">
															До 15 минути
														</SelectItem>
														<SelectItem value="30">
															До 30 минути
														</SelectItem>
														<SelectItem value="60">
															До 60 минути
														</SelectItem>
														<SelectItem value="90">
															До 90 минути
														</SelectItem>
														<SelectItem value="120">
															До 120 минути
														</SelectItem>
														<SelectItem value="150">
															До 150 минути
														</SelectItem>
														<SelectItem value="180">
															До 180 минути
														</SelectItem>
														<SelectItem value="210">
															До 210 минути
														</SelectItem>
														<SelectItem value="260">
															До 260 минути
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
									name="hasStory"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-lg font-[700]">
												Има ли история
											</FormLabel>
											<FormControl>
												<Select
													onValueChange={
														field.onChange
													}
													defaultValue={field.value}
												>
													<SelectTrigger className="input-field">
														<SelectValue placeholder="Изберете опция" />
													</SelectTrigger>
													<SelectContent className="bg-opacity-90 bg-background text-foreground border-accentLighter/40 backdrop-blur-sm">
														<SelectItem value="yes">
															Да
														</SelectItem>
														<SelectItem value="no">
															Не
														</SelectItem>
													</SelectContent>
												</Select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* Shot by us & Compression */}
							<div className="grid md:grid-cols-2 gap-5">
								<FormField
									control={form.control}
									name="shotByUs"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-lg font-[700]">
												От нас ли е снимано
											</FormLabel>
											<FormControl>
												<Select
													onValueChange={
														field.onChange
													}
													defaultValue={field.value}
												>
													<SelectTrigger className="input-field">
														<SelectValue placeholder="Изберете опция" />
													</SelectTrigger>
													<SelectContent className="bg-opacity-90 bg-background text-foreground border-accentLighter/40 backdrop-blur-sm">
														<SelectItem value="yes">
															Да
														</SelectItem>
														<SelectItem value="no">
															Не
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
									name="videoCompression"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-lg font-[700]">
												Сбиване на видеото
											</FormLabel>
											<FormControl>
												<Select
													onValueChange={
														field.onChange
													}
													defaultValue={field.value}
												>
													<SelectTrigger className="input-field">
														<SelectValue placeholder="Изберете опция" />
													</SelectTrigger>
													<SelectContent className="bg-opacity-90 bg-background text-foreground border-accentLighter/40 backdrop-blur-sm">
														<SelectItem value="yes">
															Да
														</SelectItem>
														<SelectItem value="no">
															Не
														</SelectItem>
													</SelectContent>
												</Select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* Effects & LUT */}
							<div className="grid md:grid-cols-2 gap-5">
								<FormField
									control={form.control}
									name="effects"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-lg font-[700]">
												Ефекти ( Звукови и Музика, видео
												)
											</FormLabel>
											<FormControl>
												<Select
													onValueChange={
														field.onChange
													}
													defaultValue={field.value}
												>
													<SelectTrigger className="input-field">
														<SelectValue placeholder="Изберете опция" />
													</SelectTrigger>
													<SelectContent className="bg-opacity-90 bg-background text-foreground border-accentLighter/40 backdrop-blur-sm">
														<SelectItem value="almostNone">
															Почти без
														</SelectItem>
														<SelectItem value="goodEditing">
															Добра обработка
														</SelectItem>
														<SelectItem value="heavyEditing">
															Тежка обработка
														</SelectItem>
														<SelectItem value="animatedHeavy">
															Animated heavy
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
									name="lut"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-lg font-[700]">
												LUT (Lookup Table)
											</FormLabel>
											<FormControl>
												<Select
													onValueChange={
														field.onChange
													}
													defaultValue={field.value}
												>
													<SelectTrigger className="input-field">
														<SelectValue placeholder="Изберете опция" />
													</SelectTrigger>
													<SelectContent className="bg-opacity-90 bg-background text-foreground border-accentLighter/40 backdrop-blur-sm">
														<SelectItem value="yes">
															Да
														</SelectItem>
														<SelectItem value="no">
															Не
														</SelectItem>
													</SelectContent>
												</Select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* Locations, Cameras, Microphones */}
							<div className="grid grid-cols-3 gap-5">
								<FormField
									control={form.control}
									name="locations"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="md:text-lg font-[700]">
												Локации
											</FormLabel>
											<FormControl>
												<Input
													disabled={lutValue === "no"}
													placeholder="Въведете брой"
													{...field}
													className="input-field"
													onChange={(e) =>
														field.onChange(
															Number(
																e.target.value
															) || 1
														)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="cameras"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="md:text-lg font-[700]">
												Камери
											</FormLabel>
											<FormControl>
												<Input
													disabled={lutValue === "no"}
													placeholder="Въведете брой"
													{...field}
													className="input-field"
													onChange={(e) =>
														field.onChange(
															Number(
																e.target.value
															) || 1
														)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="microphones"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="md:text-lg font-[700]">
												Микрофони
											</FormLabel>
											<FormControl>
												<Input
													placeholder="Въведете брой"
													{...field}
													className="input-field"
													onChange={(e) =>
														field.onChange(
															Number(
																e.target.value
															) || 1
														)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* Running Time & Intro */}
							<div className="grid md:grid-cols-2 gap-5">
								<FormField
									control={form.control}
									name="runningTime"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-lg font-[700]">
												Готово видео
											</FormLabel>
											<FormControl>
												<Select
													onValueChange={
														field.onChange
													}
													defaultValue={field.value}
												>
													<SelectTrigger className="input-field">
														<SelectValue placeholder="Изберете опция" />
													</SelectTrigger>
													<SelectContent className="bg-opacity-90 bg-background text-foreground border-accentLighter/40 backdrop-blur-sm">
														<SelectItem value="10">
															До 10 минути
														</SelectItem>
														<SelectItem value="20">
															До 20 минути
														</SelectItem>
														<SelectItem value="35">
															До 35 минути
														</SelectItem>
														<SelectItem value="50">
															До 50 минути
														</SelectItem>
														<SelectItem value="70">
															До 70 минути
														</SelectItem>
														<SelectItem value="90">
															До 90 минути
														</SelectItem>
														<SelectItem value="120">
															До 120 минути
														</SelectItem>
														<SelectItem value="150">
															До 150 минути
														</SelectItem>
														<SelectItem value="180">
															До 180 минути
														</SelectItem>
														<SelectItem value="210">
															До 210 минути
														</SelectItem>
														<SelectItem value="240">
															До 240 минути
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
									name="intro"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-lg font-[700]">
												Интро (Хоок)
											</FormLabel>
											<FormControl>
												<Select
													onValueChange={
														field.onChange
													}
													defaultValue={field.value}
												>
													<SelectTrigger className="input-field">
														<SelectValue placeholder="Изберете опция" />
													</SelectTrigger>
													<SelectContent className="bg-opacity-90 bg-background text-foreground border-accentLighter/40 backdrop-blur-sm">
														<SelectItem value="without">
															Без
														</SelectItem>
														<SelectItem value="medium">
															Среден
														</SelectItem>
														<SelectItem value="premium">
															Premium
														</SelectItem>
														<SelectItem value="animated">
															Animated (Explainer)
														</SelectItem>
													</SelectContent>
												</Select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* Voice Overs */}
							<FormField
								control={form.control}
								name="voiceOvers"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-lg font-[700]">
											Voice-over и покрития (манипулации)
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
													<SelectItem value="yes">
														Да
													</SelectItem>
													<SelectItem value="no">
														Не
													</SelectItem>
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* DYNAMIC ADS SECTION */}
							<div className="h-px w-full bg-secondary"></div>
							<p className="text-lg md:text-2xl text-accentLighter font-[700]">
								Обработка на реклами (динамично)
							</p>

							{/* Map through dynamic fields */}
							{fields.map((fieldItem, index) => (
								<div
									key={fieldItem.id}
									className="flex items-end gap-3"
								>
									{/* Each array item is stored at advertisements[index] */}
									<FormField
										control={form.control}
										name={`advertisements.${index}`}
										render={({ field }) => (
											<FormItem className="flex-1">
												<FormLabel className="text-lg font-[700]">
													Реклама {index + 1}
												</FormLabel>
												<FormControl>
													<Select
														onValueChange={
															field.onChange
														}
														defaultValue={
															field.value
														}
													>
														<SelectTrigger className="input-field">
															<SelectValue placeholder="Ниво на обработка" />
														</SelectTrigger>
														<SelectContent className="bg-opacity-90 bg-background text-foreground border-accentLighter/40 backdrop-blur-sm">
															<SelectItem value="almostNone">
																Почти без
															</SelectItem>
															<SelectItem value="goodEditing">
																Добра обработка
															</SelectItem>
															<SelectItem value="heavyEditing">
																Тежка обработка
															</SelectItem>
															<SelectItem value="3D">
																3D
															</SelectItem>
														</SelectContent>
													</Select>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<button
										type="button"
										onClick={() => remove(index)}
										className="btn-red"
									>
										Премахни
									</button>
								</div>
							))}

							{/* Button to add a new advertisement */}
							<button
								type="button"
								onClick={() => append("almostNone")}
								className="btn bg-secondaryDark text-background hover:bg-accent transition-all font-[600]"
							>
								Добави реклама
							</button>

							{/* Top Reach Ads */}
							<div className="h-px w-full bg-secondary"></div>
							<p className="text-lg md:text-2xl text-accentLighter font-[700]">
								Добави Top Reach реклама
							</p>

							<div className="grid md:grid-cols-3 gap-5">
								<FormField
									control={form.control}
									name="addIntroAd"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-lg font-[700]">
												Интро реклама
											</FormLabel>
											<FormControl>
												<Select
													onValueChange={
														field.onChange
													}
													defaultValue={field.value}
												>
													<SelectTrigger className="input-field">
														<SelectValue placeholder="Изберете опция" />
													</SelectTrigger>
													<SelectContent className="bg-opacity-90 bg-background text-foreground border-accentLighter/40 backdrop-blur-sm">
														<SelectItem value="yes">
															Да
														</SelectItem>
														<SelectItem value="no">
															Не
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
									name="addOutroAd"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-lg font-[700]">
												Outro реклама
											</FormLabel>
											<FormControl>
												<Select
													onValueChange={
														field.onChange
													}
													defaultValue={field.value}
												>
													<SelectTrigger className="input-field">
														<SelectValue placeholder="Изберете опция" />
													</SelectTrigger>
													<SelectContent className="bg-opacity-90 bg-background text-foreground border-accentLighter/40 backdrop-blur-sm">
														<SelectItem value="yes">
															Да
														</SelectItem>
														<SelectItem value="no">
															Не
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
									name="addPopupAd"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-lg font-[700]">
												Popup реклама
											</FormLabel>
											<FormControl>
												<Select
													onValueChange={
														field.onChange
													}
													defaultValue={field.value}
												>
													<SelectTrigger className="input-field">
														<SelectValue placeholder="Изберете опция" />
													</SelectTrigger>
													<SelectContent className="bg-opacity-90 bg-background text-foreground border-accentLighter/40 backdrop-blur-sm">
														<SelectItem value="1">
															1
														</SelectItem>
														<SelectItem value="2">
															2
														</SelectItem>
														<SelectItem value="3">
															3
														</SelectItem>
														<SelectItem value="no">
															Не
														</SelectItem>
													</SelectContent>
												</Select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{/* Delivery & Preview */}
							<div className="h-px w-full bg-secondary"></div>
							<div className="grid md:grid-cols-2 gap-5 items-end w-full">
								<div className="w-full">
									<FormField
										control={form.control}
										name="delivery"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-lg font-[700]">
													Доставка
												</FormLabel>
												<FormControl>
													<Select
														onValueChange={
															field.onChange
														}
														defaultValue={
															field.value
														}
													>
														<SelectTrigger className="input-field">
															<SelectValue placeholder="Изберете опция" />
														</SelectTrigger>
														<SelectContent className="bg-opacity-90 bg-background text-foreground border-accentLighter/40 backdrop-blur-sm">
															<SelectItem value="fast">
																Бърза доставка
															</SelectItem>
															<SelectItem value="slow">
																Бавна доставка
															</SelectItem>
														</SelectContent>
													</Select>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

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
