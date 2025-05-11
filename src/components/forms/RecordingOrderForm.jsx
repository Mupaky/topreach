"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVideo } from "@fortawesome/free-solid-svg-icons";
import { BeatLoader } from "react-spinners";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogClose,
} from "@/components/ui/dialog";

export default function RecordingOrderForm({ email, points, userId }) {
	// -----------------------------
	// State for Booking and Fields
	// -----------------------------
	const [selectedDate, setSelectedDate] = useState();
	const [existingBookings, setExistingBookings] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [submitError, setSubmitError] = useState(null);

	// Selected hours
	const [selectedHours, setSelectedHours] = useState([]);

	// Additional fields
	const [overtime, setOvertime] = useState(null);
	const [popupAds, setPopupAds] = useState(false);
	const [location, setLocation] = useState("permanentSet");
	const [secondOperator, setSecondOperator] = useState(false);
	const [description, setDescription] = useState("");

	// Price
	const [finalPrice, setFinalPrice] = useState(0);

	// Dialog open state (manually controlled)
	const [dialogOpen, setDialogOpen] = useState(false);

	const router = useRouter();

	// --------------------------------
	// Fetch existing bookings per date
	// --------------------------------
	useEffect(() => {
		if (!selectedDate) return;

		(async () => {
			setLoading(true);
			setError(null);

			const dateString = format(selectedDate, "yyyy-MM-dd");
			try {
				const response = await fetch(
					`/api/fetchBookings?date=${dateString}`,
					{
						method: "GET",
						headers: { "Content-Type": "application/json" },
					}
				);

				if (!response.ok) {
					const { message } = await response.json();
					setError(message || "Грешка при извличане на резервации.");
					setLoading(false);
					return;
				}

				const data = await response.json();
				setExistingBookings(data.bookings || []);
				setLoading(false);
			} catch (err) {
				setError(err?.message || "Неуспешно извличане на резервации.");
				setLoading(false);
			}
		})();
	}, [selectedDate]);

	// --------------------------------------------------------
	// Helper: Check if a specific hour is already booked
	// --------------------------------------------------------
	const isHourBooked = (hour) => {
		return existingBookings.some((booking) => {
			return booking.startHour <= hour && hour < booking.endHour;
		});
	};

	// --------------------------------
	// Hours from 8..22 => [8..22]
	// --------------------------------
	const hoursArray = Array.from({ length: 15 }, (_, i) => i + 8);

	// ---------------------------------------------------------
	// Toggle hour selection, enforcing max 12 hours
	// ---------------------------------------------------------
	const handleHourClick = (hour) => {
		// If already booked, ignore
		if (isHourBooked(hour)) return;

		setSelectedHours((prev) => {
			// If we already selected this hour, remove it
			if (prev.includes(hour)) {
				return prev.filter((h) => h !== hour);
			} else {
				// If we've already selected 12 hours, do not add more
				if (prev.length >= 12) {
					// Optionally set an error or alert
					return prev;
				}
				// Otherwise add the newly selected hour
				return [...prev, hour].sort((a, b) => a - b);
			}
		});
	};

	// --------------------------------------------------------
	// Helper: Get how many hours are already booked for the day
	// --------------------------------------------------------
	const getBookedSlotsCount = () => {
		let count = 0;
		existingBookings.forEach((item) => {
			count += item.endHour - item.startHour;
		});
		return count;
	};

	// --------------------------------
	// Price Calculation
	// --------------------------------
	function calculateFinalPrice() {
		// Base price for hours
		const hoursPriceList = {
			0: 0,
			2: 300,
			3: 390,
			4: 480,
			5: 540,
			6: 600,
			7: 680,
			8: 760,
			9: 805,
			10: 850,
			11: 905,
			12: 960,
		};

		// Price for overtime
		const overtimePriceList = {
			null: 0,
			1: 200,
			2: 350,
			4: 600,
			6: 750,
			8: 800,
			10: 1000,
			12: 1200,
		};

		const baseHoursPrice = hoursPriceList[selectedHours.length] ?? 0;
		const otPrice = overtimePriceList[overtime] ?? 0;

		let price = baseHoursPrice + otPrice;

		// 10% discount if popupAds is true
		if (popupAds === true || popupAds === "true") {
			price *= 0.9;
		}

		// 45% discount if location == "adSet" => price *= 0.55
		if (location === "adSet") {
			price *= 0.55;
		}

		// If second operator is true => multiply by 1.7
		if (secondOperator === true || secondOperator === "true") {
			price *= 1.7;
		}

		price /= 10;

		setFinalPrice(Math.round(price));
	}

	// -----------------------------------------------------
	// Validate hours before opening dialog
	// -----------------------------------------------------
	function handleOpenDialog() {
		setError(null);

		// 1. Check at least 2 slots
		if (selectedHours.length < 2) {
			setError("Моля изберете поне 2 слота.");
			return;
		}

		// 2. Check consecutive hours
		const consecutive = selectedHours.every((h, index, arr) => {
			if (index === 0) return true;
			return h === arr[index - 1] + 1;
		});

		if (!consecutive) {
			setError("Слотовете трябва да са последователни.");
			return;
		}

		// Passed validation => calculate price, open dialog
		calculateFinalPrice();
		setDialogOpen(true);
	}

	// --------------------------------
	// Submit booking
	// --------------------------------
	async function submit() {
		setError(null);

		// Check the user has enough points
		if (points < finalPrice) {
			setSubmitError("Нямате достатъчно точки.");
			setLoading(false);
			return;
		}

		const dateString = format(selectedDate, "yyyy-MM-dd");
		const startHour = Math.min(...selectedHours);
		const endHour = Math.max(...selectedHours) + 1;

		const data = {
			type: "recording",
			userId,
			date: dateString,
			startHour,
			endHour,
			overtime,
			popupAds,
			location,
			secondOperator,
			description,
			price: finalPrice,
		};

		try {
			setLoading(true);
			const response = await fetch("/api/createOrder", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			setLoading(false);

			if (!response.ok) {
				const { message } = await response.json();
				setError(message || "Грешка при регистриране на поръчка.");
				return;
			}

			router.push("/thankyou");
		} catch (err) {
			setLoading(false);
			setError("Грешка. Моля опитайте по-късно.");
		}
	}

	// -----------------------------------------------------
	// JSX Return
	// -----------------------------------------------------
	return (
		<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
			{/* -------------------- Dialog Content -------------------- */}
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
							{/* Close dialog without action */}
							<DialogClose asChild className="w-max">
								<button className="btn">Назад</button>
							</DialogClose>
							{/* Confirm booking */}
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

			{/* -------------------- Main Form Content -------------------- */}
			<div className="space-y-6 relative border border-secondary bg-background/80 p-10 rounded-3xl">
				{/* Icon */}
				<div className="absolute -top-6 lg:-left-6">
					<FontAwesomeIcon
						className="p-4 border rounded-xl border-accentLighter/40 text-accentLighter/90 bg-secondary/50 backdrop-blur-md"
						size="2xl"
						icon={faVideo}
					/>
				</div>

				<h1 className="text-xl md:text-2xl font-bold">
					Резервирайте вашата сесия за запис
				</h1>

				{/* Calendar */}
				<div>
					<Calendar
						mode="single"
						selected={selectedDate}
						onSelect={setSelectedDate}
						disabled={{ before: new Date() }}
						classNames={{
							day: "h-full w-full",
							day_selected:
								"bg-background font-bold border border-accentLighter/40",
							day_today:
								"bg-background font-bold border border-accentLighter/20",
						}}
					/>
				</div>

				{selectedDate && (
					<div className="mt-4">
						<h2 className="text-xl font-bold mb-5">
							Избери часове за{" "}
							{format(selectedDate, "dd.MM.yyyy")} (мин. 2 часа)
						</h2>

						{/* Hours Selection */}
						<div
							className={`gap-2 mt-2 transition-all grid grid-cols-2 md:flex md:flex-wrap ${
								loading && "blur-md filter"
							}`}
						>
							{hoursArray.map((hour) => {
								const booked = isHourBooked(hour);
								const selected = selectedHours.includes(hour);
								return (
									<button
										key={hour}
										onClick={() => handleHourClick(hour)}
										disabled={booked}
										className={`font-[600] border rounded-xl px-4 py-3 transition-all duration-300 text-sm md:text-base w-full md:w-max
                      ${
							booked
								? "cursor-not-allowed opacity-40"
								: "hover:border-accentLighter/80"
						}
                      ${
							selected && !booked
								? "border-accent bg-secondary"
								: "border-accentLighter/40 bg-secondaryDark"
						}
                    `}
									>
										{hour}:00 - {hour + 1}:00
									</button>
								);
							})}
						</div>

						{/* If user has selected all possible hours, show Overtime */}
						{selectedHours.length ===
							15 - getBookedSlotsCount() && (
							<div>
								<h2 className="text-xl font-bold my-5">
									Искаш ли overtime?
								</h2>
								<Select
									onValueChange={(value) =>
										setOvertime(
											value ? Number(value) : null
										)
									}
									value={overtime ? String(overtime) : ""}
								>
									<SelectTrigger className="input-field">
										<SelectValue placeholder="Изберете опция" />
									</SelectTrigger>
									<SelectContent className="bg-opacity-90 bg-background text-foreground border-accentLighter/40 backdrop-blur-sm">
										<SelectItem value="">Не</SelectItem>
										<SelectItem value="1">1 час</SelectItem>
										<SelectItem value="2">
											2 часа
										</SelectItem>
										<SelectItem value="4">
											4 часа
										</SelectItem>
										<SelectItem value="6">
											6 часа
										</SelectItem>
										<SelectItem value="8">
											8 часа
										</SelectItem>
										<SelectItem value="10">
											10 часа
										</SelectItem>
										<SelectItem value="12">
											12 часа
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						)}

						{/* Pop-up Ads */}
						<div>
							<h2 className="text-xl font-bold my-5">
								Желаеш ли да има pop up реклами през 15-30
								минути?
								<span className="text-accentLighter">
									{" "}
									(10% намаление)
								</span>
							</h2>
							<Select
								onValueChange={(value) =>
									setPopupAds(value === "true")
								}
								value={popupAds ? "true" : "false"}
							>
								<SelectTrigger className="input-field">
									<SelectValue placeholder="Изберете опция" />
								</SelectTrigger>
								<SelectContent className="bg-opacity-90 bg-background text-foreground border-accentLighter/40 backdrop-blur-sm">
									<SelectItem value="true">Да</SelectItem>
									<SelectItem value="false">Не</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Location */}
						<div>
							<h2 className="text-xl font-bold my-5">
								Къде ще се снима?
							</h2>
							<Select
								onValueChange={setLocation}
								value={location}
							>
								<SelectTrigger className="input-field">
									<SelectValue placeholder="Изберете опция" />
								</SelectTrigger>
								<SelectContent className="bg-opacity-90 bg-background text-foreground border-accentLighter/40 backdrop-blur-sm">
									<SelectItem value="permanentSet">
										Постоянен Сет (студио)
									</SelectItem>
									<SelectItem value="remoteSet">
										Remote Сет (студио)
									</SelectItem>
									<SelectItem value="adSet">
										Рекламен Сет (Top Reach)
									</SelectItem>
									<SelectItem value="sofia">
										София (до 25 км)
									</SelectItem>
									<SelectItem value="other">
										Друго място (25+ км)
									</SelectItem>
								</SelectContent>
							</Select>

							{location == "other" && (
								<p className="mt-5">
									При поръчка на заснемане на разстояние от 25
									км или повече от София е необходимо да се
									заплати от момента на тръгване до момента на
									пребиране в София.
								</p>
							)}
						</div>

						{/* Second Operator */}
						<div>
							<h2 className="text-xl font-bold my-5">
								Желаеш ли втори оператор?
							</h2>
							<Select
								onValueChange={(value) =>
									setSecondOperator(value === "true")
								}
								value={secondOperator ? "true" : "false"}
							>
								<SelectTrigger className="input-field">
									<SelectValue placeholder="Изберете опция" />
								</SelectTrigger>
								<SelectContent className="bg-opacity-90 bg-background text-foreground border-accentLighter/40 backdrop-blur-sm">
									<SelectItem value="true">Да</SelectItem>
									<SelectItem value="false">Не</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Description Field */}
						<div className="mt-5">
							<h2 className="text-xl font-bold my-3">
								Информация за проекта
							</h2>
							<Textarea
								placeholder="Въведи информация"
								value={description}
								className="input-field"
								onChange={(e) => setDescription(e.target.value)}
							/>
						</div>

						{/* Instead of a DialogTrigger, we do a manual button that validates and opens the dialog */}
						<button
							onClick={handleOpenDialog}
							className="mt-4 text-accentLighter border-2 border-accentLighter/20
                hover:border-accentLighter/40 bg-accentLighter/5
                transition-all duration-500 flex gap-1 items-center px-5 py-3
                rounded-full hover:shadow-lg hover:shadow-accentLighter/20
                w-full font-[600]"
						>
							<span className="text-center w-full">
								{loading ? (
									<BeatLoader color="#fff" size={10} />
								) : (
									"Преглед"
								)}
							</span>
						</button>

						{error && (
							<p className="text-red-500 font-[600] mt-5 text-center">
								{error}
							</p>
						)}
					</div>
				)}
			</div>
		</Dialog>
	);
}
