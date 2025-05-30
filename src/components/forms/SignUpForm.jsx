// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import {
// 	Form,
// 	FormControl,
// 	FormField,
// 	FormItem,
// 	FormLabel,
// 	FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { useRouter } from "next/navigation";
// import { Oswald } from "next/font/google";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faUser, faUserPlus } from "@fortawesome/free-solid-svg-icons";
// import { BeatLoader } from "react-spinners";

// const oswald = Oswald({ subsets: ["cyrillic"] });

// const formSchema = z
// 	.object({
// 		fullName: z
// 			.string()
// 			.min(2, "Името ви трябва да е поне 2 букви.")
// 			.max(50, "Името ви не може да е повече от 50 букви."),
// 		email: z.string().email("Невалиден имейл адрес."),
// 		password: z
// 			.string()
// 			.min(6, "Паролата ви трябва да е поне 6 символа.")
// 			.max(100, "Паролата ви не може да е повече от 100 символа."),
// 		confirmPassword: z.string().min(6, "Паролите не съвпадат."),
// 	})
// 	.refine((data) => data.password === data.confirmPassword, {
// 		path: ["confirmPassword"],
// 		message: "Паролите не съвпадат.",
// 	});

// export default function SignUpForm() {
// 	const [error, setError] = useState(null);
// 	const [loading, setLoading] = useState(false);
// 	const router = useRouter();

// 	const form = useForm({
// 		resolver: zodResolver(formSchema),
// 		defaultValues: {
// 			fullName: "",
// 			email: "",
// 			password: "",
// 			confirmPassword: "",
// 			role: "user", 
// 		},
// 	});

// 	async function onSubmit(values) {
// 		setLoading(true);

// 		const data = {
// 			fullName: values.fullName,
// 			email: values.email,
// 			password: values.password,
// 		};

// 		try {
// 			const firstResponse = await fetch("/api/fetchUser", {
// 				method: "POST",
// 				headers: { "Content-Type": "application/json" },
// 				body: JSON.stringify({ email: data.email }),
// 			});

// 			if (firstResponse.ok) {
// 				const { user } = await firstResponse.json();

// 				if (user) {
// 					setError("Вече съществува акаунт с този имейл.");
// 					setLoading(false);
// 					return;
// 				}
// 			}

// 			const secondResponse = await fetch("/api/signup", {
// 				method: "POST",
// 				headers: { "Content-Type": "application/json" },
// 				body: JSON.stringify(data),
// 			});

// 			if (!secondResponse.ok) {
// 				const { message } = await secondResponse.json();
// 				setError(message || "An error occurred during sign-up.");
// 				setLoading(false);
// 				return;
// 			}

// 			router.push("/home");
// 		} catch (err) {
// 			setLoading(false);
// 			setError("Грешка. Моля опитайте по-късно");
// 		}
// 	}

// 	return (
// 		<div className="md:bg-background flex md:w-[70vw] xl:w-[50vw] md:border md:border-secondary px-10 py-12 rounded-3xl">
// 			<div className="w-full">
// 				<div className="flex flex-col items-center gap-3">
// 					<div className="bg-secondary rounded-lg aspect-square w-max text-center mx-auto border-2 border-accentLighter/20 text-accentLighter p-4">
// 						<FontAwesomeIcon
// 							className=""
// 							size="2xl"
// 							icon={faUser}
// 						/>
// 					</div>

// 					<h1 className="text-3xl md:text-4xl mb-10 md:mb-5 font-[800]">
// 						Регистрация
// 					</h1>
// 				</div>
// 				<Form {...form}>
// 					<form
// 						onSubmit={form.handleSubmit(onSubmit)}
// 						className="space-y-4"
// 					>
// 						<FormField
// 							control={form.control}
// 							name="fullName"
// 							render={({ field }) => (
// 								<FormItem>
// 									<FormLabel className="md:text-lg font-[700]">
// 										Име и фамилия
// 									</FormLabel>
// 									<FormControl>
// 										<Input
// 											placeholder="Въведете име и фамилия"
// 											{...field}
// 											className="input-field"
// 										/>
// 									</FormControl>
// 									<FormMessage />
// 								</FormItem>
// 							)}
// 						/>
// 						<FormField
// 							control={form.control}
// 							name="email"
// 							render={({ field }) => (
// 								<FormItem>
// 									<FormLabel className="md:text-lg font-[700]">
// 										Email
// 									</FormLabel>
// 									<FormControl>
// 										<Input
// 											placeholder="Въведете имейл"
// 											{...field}
// 											className="input-field"
// 										/>
// 									</FormControl>
// 									<FormMessage />
// 								</FormItem>
// 							)}
// 						/>
// 						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
// 							<FormField
// 								control={form.control}
// 								name="password"
// 								render={({ field }) => (
// 									<FormItem>
// 										<FormLabel className="md:text-lg font-[700]">
// 											Парола
// 										</FormLabel>
// 										<FormControl>
// 											<Input
// 												type="password"
// 												placeholder="Въведете парола"
// 												{...field}
// 												className="input-field"
// 											/>
// 										</FormControl>
// 										<FormMessage />
// 									</FormItem>
// 								)}
// 							/>
// 							<FormField
// 								control={form.control}
// 								name="confirmPassword"
// 								render={({ field }) => (
// 									<FormItem>
// 										<FormLabel className="md:text-background md:text-lg font-[700]">
// 											Потвърдете Парола
// 										</FormLabel>
// 										<FormControl>
// 											<Input
// 												type="password"
// 												placeholder="Въведете паролата пак"
// 												{...field}
// 												className="input-field"
// 											/>
// 										</FormControl>
// 										<FormMessage />
// 									</FormItem>
// 								)}
// 							/>
// 						</div>
// 						<div className="flex flex-col items-center gap-3 w-max mx-auto">
// 							<p className="font-medium">
// 								Вече имате акаунт?{" "}
// 								<Link
// 									className="text-accent border-b-2 border-accent"
// 									href="/auth/login"
// 								>
// 									Вход
// 								</Link>
// 							</p>

// 							<button
// 								disabled={loading}
// 								className={`${oswald.className} text-accentLighter border-2 border-accentLighter/20 hover:border-accentLighter/40 bg-accentLighter/10
//         transition-all duration-500 flex gap-1 items-center px-5 py-3 rounded-full hover:shadow-lg hover:shadow-accentLighter/20 whitespace-nowrap uppercase`}
// 								type="submit"
// 							>
// 								<span className="text-center w-full">
// 									{!loading ? (
// 										"Създай акаунт"
// 									) : (
// 										<BeatLoader color="#fff" size={10} />
// 									)}
// 								</span>
// 							</button>

// 							<p className="text-red-500">{error}</p>
// 						</div>
// 					</form>
// 				</Form>
// 			</div>
// 		</div>
// 	);
// }
// components/forms/SignUpForm.jsx
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
} from "@/components/ui/form"; // Assuming these are shadcn/ui components
import { Input } from "@/components/ui/input";
import {
    Select,                    
    SelectContent,             
    SelectItem,                
    SelectTrigger,           
    SelectValue,              
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Oswald } from "next/font/google";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faUserPlus } from "@fortawesome/free-solid-svg-icons"; // Added faUserPlus for admin
import { BeatLoader } from "react-spinners";

const oswald = Oswald({ subsets: ["cyrillic"] });

const formSchema = z
    .object({
        fullName: z
            .string()
            .min(2, "Името трябва да е поне 2 букви.")
            .max(50, "Името не може да е повече от 50 букви."),
        email: z.string().email("Невалиден имейл адрес."),
        password: z
            .string()
            .min(6, "Паролата трябва да е поне 6 символа.")
            .max(100, "Паролата не може да е повече от 100 символа."),
        confirmPassword: z.string().min(6, "Моля, потвърдете паролата."),
        // Optional: Add a role field if admin can set roles during creation
        role: z.enum(["user", "admin"]).optional(), // Example
    })
    .refine((data) => data.password === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "Паролите не съвпадат.",
    });

// Added isAdminCreating prop
export default function SignUpForm({ isAdminCreating = false, onSuccess }) {
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
            role: "user", // Default role if you add it
        },
    });

    async function onSubmit(values) {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        const payload = {
            fullName: values.fullName,
            email: values.email,
            password: values.password,
            role: values.role, // If you add role selection
        };

        // Determine API endpoint based on mode
        const apiEndpoint = isAdminCreating ? "/api/admin/create-user" : "/api/auth/signup";
        const successRedirect = isAdminCreating ? null : "/home"; // No redirect for admin, or to a user list

        try {
            // Step 1: Check if email exists (common for both user and admin creation)
            // This fetchUser endpoint should NOT require admin privileges itself.
            const checkEmailRes = await fetch("/api/auth/fetchUser", { // Assuming this endpoint exists
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: payload.email }),
            });

            if (checkEmailRes.ok) {
                const { user: existingUser } = await checkEmailRes.json();
                if (existingUser) {
                    setError("Вече съществува акаунт с този имейл.");
                    setLoading(false);
                    return;
                }
            } else if (checkEmailRes.status !== 404) { // 404 is OK (user not found)
                const errorData = await checkEmailRes.json().catch(() => ({}));
                console.error("Error checking email:", errorData.message || checkEmailRes.statusText);
                // Decide if this is a critical error or just proceed
            }


            // Step 2: Call the appropriate signup/create endpoint
            const signupRes = await fetch(apiEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await signupRes.json();

            if (!signupRes.ok) {
                setError(result.message || "Възникна грешка при регистрацията.");
                setLoading(false);
                return;
            }

            // Handle success
            if (isAdminCreating) {
                setSuccessMessage(result.message || `Потребител ${payload.email} е създаден успешно!`);
                form.reset(); // Reset form for admin to create another
                if (onSuccess) onSuccess(result.user || result.profile); // Callback for parent component
            } else {
                // For regular user signup, Supabase SSR client in API route handles session cookies
                // router.push() and router.refresh() will ensure new session is picked up.
                router.push(successRedirect || "/home"); // Redirect normal user
                router.refresh();
            }

        } catch (err) {
            console.error("Signup form submission error:", err);
            setError("Грешка. Моля опитайте по-късно.");
        } finally {
            setLoading(false);
        }
    }
    
    const title = isAdminCreating ? "Създай Нов Потребител" : "Регистрация";
    const submitButtonText = isAdminCreating ? "Създай Потребител" : "Създай акаунт";
    const icon = isAdminCreating ? faUserPlus : faUser;


    return (
        <div className={`md:bg-background flex w-full ${isAdminCreating ? 'md:w-full' : 'md:w-[70vw] xl:w-[50vw]'} md:border md:border-secondary px-6 sm:px-10 py-8 sm:py-12 rounded-3xl`}>
            <div className="w-full">
                <div className="flex flex-col items-center gap-3">
                    <div className="bg-secondary rounded-lg aspect-square w-max text-center mx-auto border-2 border-accentLighter/20 text-accentLighter p-4">
                        <FontAwesomeIcon size="2xl" icon={icon} />
                    </div>
                    <h1 className="text-3xl md:text-4xl mb-6 md:mb-5 font-[800] text-center text-white">
                        {title}
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
                                    <FormLabel className="md:text-lg font-[700] text-gray-300">Име и фамилия</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Въведете име и фамилия" {...field} className="input-field bg-gray-800 border-gray-700" />
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
                                    <FormLabel className="md:text-lg font-[700] text-gray-300">Имейл</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Въведете имейл" {...field} className="input-field bg-gray-800 border-gray-700" />
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
                                        <FormLabel className="md:text-lg font-[700] text-gray-300">Парола</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Въведете парола" {...field} className="input-field bg-gray-800 border-gray-700" />
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
                                        <FormLabel className="md:text-lg font-[700] text-gray-300">Потвърдете Парола</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Въведете паролата отново" {...field} className="input-field bg-gray-800 border-gray-700" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        
                        {isAdminCreating && (
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="md:text-lg font-[700] text-gray-300">Роля</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="input-field bg-gray-800 border-gray-700">
                                                    <SelectValue placeholder="Избери роля" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-gray-800 text-white border-gray-700">
                                                <SelectItem value="user">User</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="flex flex-col items-center gap-3 pt-4">
                            {!isAdminCreating && (
                                <p className="font-medium text-gray-300">
                                    Вече имате акаунт?{" "}
                                    <Link className="text-accent hover:underline" href="/auth/login">
                                        Вход
                                    </Link>
                                </p>
                            )}

                            <button
                                disabled={loading}
                                className={`${oswald.className} text-accentLighter border-2 border-accentLighter/20 hover:border-accentLighter/40 bg-accentLighter/10
                                transition-all duration-500 flex gap-1 items-center px-5 py-3 rounded-full hover:shadow-lg hover:shadow-accentLighter/20 whitespace-nowrap uppercase disabled:opacity-50`}
                                type="submit"
                            >
                                <span className="text-center w-full min-w-[150px]">
                                    {loading ? <BeatLoader color="#FFF" size={10} /> : submitButtonText}
                                </span>
                            </button>

                            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                            {successMessage && <p className="text-green-500 text-sm mt-2">{successMessage}</p>}
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}