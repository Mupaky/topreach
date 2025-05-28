"use client";

import React from "react";
import { useState } from "react";
import Link from "next/link";
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
import { useRouter } from "next/navigation";
import { Oswald } from "next/font/google";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightToBracket } from "@fortawesome/free-solid-svg-icons";
import { BeatLoader } from "react-spinners";

const oswald = Oswald({ subsets: ["cyrillic"] });

const formSchema = z.object({
	email: z.string().email("Невалиден имейл адрес."),
	password: z.string(),
});

export default function LoginForm() {
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	async function onSubmit(values) {
		setLoading(true);

		const data = {
			email: values.email,
			password: values.password,
		};

		try {
			const response = await fetch("/api/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const { message } = await response.json();
				setError(message || "Грешка по време на вход.");
				setLoading(false);
				return;
			}

			router.push("/home");
			router.refresh();
		} catch (err) {
			setLoading(false);
			setError("Грешка. Моля опитайте по-късно.");
		}
	}

	return (
		<div className="md:bg-background flex md:w-[70vw] xl:w-[50vw] md:border md:border-secondary px-10 py-12 rounded-3xl">
			<div className="w-full">
				<div className="flex flex-col items-center gap-3">
					<div className="bg-secondary rounded-lg aspect-square w-max text-center mx-auto border-2 border-accentLighter/20 text-accentLighter p-4">
						<FontAwesomeIcon size="2xl" icon={faRightToBracket} />
					</div>

					<h1 className="text-3xl md:text-4xl mb-10 md:mb-5 font-[800]">
						Вход
					</h1>
				</div>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
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
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="md:text-lg font-[700]">
										Парола
									</FormLabel>
									<FormControl>
										<Input
											type="password"
											placeholder="Въведете парола"
											{...field}
											className="input-field"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="flex flex-col items-center gap-5 w-max mx-auto">
							<p className="font-medium">
								Нямате акаунт?{" "}
								<Link
									className="text-accent border-b-2 border-accent"
									href="/auth/signup"
								>
									Регистрация
								</Link>
							</p>

							<button
								disabled={loading}
								className={`${oswald.className} text-accentLighter border-2 border-accentLighter/20 hover:border-accentLighter/40 bg-accentLighter/10
        						transition-all duration-500 flex gap-1 items-center px-5 py-3 rounded-full hover:shadow-lg hover:shadow-accentLighter/20 whitespace-nowrap uppercase`}
								type="submit"
							>
								<span className="text-center">
									{!loading ? (
										"Влез в акаунта си"
									) : (
										<BeatLoader color="#fff" size={10} />
									)}
								</span>
							</button>

							<p className="text-red-500 h-1">{error}</p>
						</div>
					</form>
				</Form>
			</div>
		</div>
	);
}
