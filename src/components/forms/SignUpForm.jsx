"use client";

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
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { BeatLoader } from "react-spinners";

const oswald = Oswald({ subsets: ["cyrillic"] });

const formSchema = z
	.object({
		fullName: z
			.string()
			.min(2, "Името ви трябва да е поне 2 букви.")
			.max(50, "Името ви не може да е повече от 50 букви."),
		email: z.string().email("Невалиден имейл адрес."),
		password: z
			.string()
			.min(6, "Паролата ви трябва да е поне 6 символа.")
			.max(100, "Паролата ви не може да е повече от 100 символа."),
		confirmPassword: z.string().min(6, "Паролите не съвпадат."),
	})
	.refine((data) => data.password === data.confirmPassword, {
		path: ["confirmPassword"],
		message: "Паролите не съвпадат.",
	});

export default function SignUpForm() {
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			fullName: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	async function onSubmit(values) {
		setLoading(true);

		const data = {
			fullName: values.fullName,
			email: values.email,
			password: values.password,
		};

		try {
			const firstResponse = await fetch("/api/fetchUser", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: data.email }),
			});

			if (firstResponse.ok) {
				const { user } = await firstResponse.json();

				if (user) {
					setError("Вече съществува акаунт с този имейл.");
					setLoading(false);
					return;
				}
			}

			const secondResponse = await fetch("/api/signup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			if (!secondResponse.ok) {
				const { message } = await secondResponse.json();
				setError(message || "An error occurred during sign-up.");
				setLoading(false);
				return;
			}

			router.push("/home");
		} catch (err) {
			setLoading(false);
			setError("Грешка. Моля опитайте по-късно");
		}
	}

	return (
		<div className="md:bg-background flex md:w-[70vw] xl:w-[50vw] md:border md:border-secondary px-10 py-12 rounded-3xl">
			<div className="w-full">
				<div className="flex flex-col items-center gap-3">
					<div className="bg-secondary rounded-lg aspect-square w-max text-center mx-auto border-2 border-accentLighter/20 text-accentLighter p-4">
						<FontAwesomeIcon
							className=""
							size="2xl"
							icon={faUser}
						/>
					</div>

					<h1 className="text-3xl md:text-4xl mb-10 md:mb-5 font-[800]">
						Регистрация
					</h1>
				</div>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						<FormField
							control={form.control}
							name="fullName"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="md:text-lg font-[700]">
										Име и фамилия
									</FormLabel>
									<FormControl>
										<Input
											placeholder="Въведете име и фамилия"
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
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
							<FormField
								control={form.control}
								name="confirmPassword"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="md:text-background md:text-lg font-[700]">
											Потвърдете Парола
										</FormLabel>
										<FormControl>
											<Input
												type="password"
												placeholder="Въведете паролата пак"
												{...field}
												className="input-field"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className="flex flex-col items-center gap-3 w-max mx-auto">
							<p className="font-medium">
								Вече имате акаунт?{" "}
								<Link
									className="text-accent border-b-2 border-accent"
									href="/auth/login"
								>
									Вход
								</Link>
							</p>

							<button
								disabled={loading}
								className={`${oswald.className} text-accentLighter border-2 border-accentLighter/20 hover:border-accentLighter/40 bg-accentLighter/10
        transition-all duration-500 flex gap-1 items-center px-5 py-3 rounded-full hover:shadow-lg hover:shadow-accentLighter/20 whitespace-nowrap uppercase`}
								type="submit"
							>
								<span className="text-center w-full">
									{!loading ? (
										"Създай акаунт"
									) : (
										<BeatLoader color="#fff" size={10} />
									)}
								</span>
							</button>

							<p className="text-red-500">{error}</p>
						</div>
					</form>
				</Form>
			</div>
		</div>
	);
}
