"use client";

import React from "react";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Oswald } from "next/font/google";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMessage } from "@fortawesome/free-solid-svg-icons";
import { BeatLoader } from "react-spinners";
import { Textarea } from "../ui/textarea";
import clsx from "clsx";

const oswald = Oswald({ subsets: ["cyrillic"] });

const formSchema = z.object({
	name: z.string(),
	email: z.string().email("Невалиден имейл адрес."),
	subject: z.string(),
	description: z.string(),
});

export default function ContactForm() {
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);
	const [successMessage, setSuccessMessage] = useState("");

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			email: "",
			subject: "",
			message: "",
		},
	});

	async function onSubmit() {
		setLoading(true);

		const values = form.watch();

		const sendData = {
			email: values.email,
			name: values.name,
			subject: values.subject,
			message: values.message,
		};

		try {
			const response = await fetch("/api/send", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(sendData),
			});

			const data = await response.json();

			if (response.ok) {
				try {
					const receiveResponse = await fetch("/api/receive", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(sendData),
					});

					if (!receiveResponse.ok) {
						console.error(
							"Error in /api/receive:",
							receiveResponse.statusText
						);
						setLoading(false);
					} else {
						setLoading(false);
						setSuccessMessage("Получихме вашето запитване.");
					}
				} catch (error) {
					console.error("Error sending to /api/receive:", error);
					setLoading(false);
				}
			} else {
				setError(data.message || "Грешка по време на вход.");
				setLoading(false);
			}
		} catch (err) {
			setLoading(false);
			setError("Грешка. Моля опитайте по-късно.");
		}
	}

	return (
		<div className="xl:bg-background flex md:w-[70vw] xl:w-[50vw] md:border md:border-secondary md:px-10 py-12 rounded-3xl">
			<div className="w-full">
				<div className="flex flex-col items-center gap-3">
					<div className="bg-secondary rounded-lg aspect-square w-max text-center mx-auto border-2 border-accentLighter/20 text-accentLighter p-4">
						<FontAwesomeIcon size="2xl" icon={faMessage} />
					</div>
				</div>

				<h2 className="text-3xl md:text-4xl mb-10 md:mb-5 font-[800] text-center bg-gradient-to-br from-foreground to-neutral-400 bg-clip-text text-transparent text-balance mt-5">
					Изпрати запитване
				</h2>

				<Form {...form}>
					<form className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="md:text-lg font-[700]">
										Име и Фамилия
									</FormLabel>
									<FormControl>
										<Input
											placeholder="Име и Фамилия"
											{...field}
											className="input-field"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="md:text-lg font-[700]">
										Email
									</FormLabel>
									<FormControl>
										<Input
											placeholder="Въведете имейл"
											{...field}
											className="input-field"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="subject"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="md:text-lg font-[700]">
										Тема
									</FormLabel>
									<FormControl>
										<Input
											placeholder="Въведете тема на запитването"
											{...field}
											className="input-field"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="message"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="md:text-lg font-[700]">
										Съобшение
									</FormLabel>
									<FormControl>
										<Textarea
											className="input-field"
											placeholder="Въведи съобщение"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex flex-col items-center gap-5 w-max mx-auto">
							<button
								disabled={loading}
								className={`${oswald.className} text-accentLighter border-2 border-accentLighter/20 hover:border-accentLighter/40 bg-accentLighter/10
        						transition-all duration-500 flex gap-1 items-center px-5 py-3 rounded-full hover:shadow-lg hover:shadow-accentLighter/20 whitespace-nowrap uppercase`}
								type="submit"
								onClick={() => onSubmit()}
							>
								<span className="text-center">
									{!loading ? (
										"Изпрати запитване"
									) : (
										<BeatLoader color="#fff" size={10} />
									)}
								</span>
							</button>

							<p className="text-red-500 h-1">{error}</p>

							<p
								className={clsx(
									"text-green-500 font-[600] bg-green-500/10 px-3 py-2 rounded-xl border-2 border-green-500",
									!successMessage && "hidden"
								)}
							>
								{successMessage}
							</p>
						</div>
					</form>
				</Form>
			</div>
		</div>
	);
}
