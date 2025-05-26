"use client";

import React from "react";
import MaxWidthWrapper from "../others/MaxWidthWrapper";
import { Oswald } from "next/font/google";
import Link from "next/link";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogClose,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import Transition from "../others/Transition";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSortDown } from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";
import TopReachLogo from "../../../public/topreachlogo.png";
import Image from "next/image";

const oswald = Oswald({ subsets: ["cyrillic"] });

function getInitials(fullName) {
	const names = fullName.split(" ");

	if (names.length == 1) {
		return names[0][0];
	}

	return names[0][0] + names[1][0];
}

export default function ClientNavbar(userSession) {
	const [session, setSession] = useState(userSession.session);
	const router = useRouter();

	useEffect(() => {
		if (session == null) {
			router.push("/");
		}
	}, [session, router]);

	const handleLogout = async () => {
		try {
			const res = await fetch("/api/logout", { method: "POST" });
			if (res.ok) {
				setSession(null);
				router.push("/");
			} else {
				console.error("Failed to log out");
			}
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	return (
		<header className="py-6 z-10 absolute top-0 left-0 right-0">
			<Transition delay={0.2}>
				<MaxWidthWrapper>
					<Dialog>
						<div className="flex justify-between items-center">
							<Link href="/home">
								<Image
									className="max-h-10 w-auto opacity-90 hover:opacity-70 transition-all duration-300"
									src={TopReachLogo}
									alt="Top Reach"
								/>
							</Link>

							<nav className="flex gap-7 items-center">
								<Link
									className="navbar-link hidden md:block"
									href="/points"
								>
									Купи точки
								</Link>

								<DropdownMenu>
									<DropdownMenuTrigger className="hidden md:flex gap-2 navbar-link">
										Услуги{" "}
										<FontAwesomeIcon icon={faSortDown} />
									</DropdownMenuTrigger>
									<DropdownMenuContent className="bg-background p-3 text-foreground border-secondary mt-6  rounded-2xl">
										<DropdownMenuItem className="inner-navbar-link">
											<Link href="/formulas">
												Направи поръчка
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem className="inner-navbar-link">
												<Link href="/points">
													Купи точки
												</Link>
											</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>

								<DropdownMenu>
									<DropdownMenuTrigger>
										<Avatar>
											<AvatarImage src={null} />
											<AvatarFallback className="text-foreground bg-secondary font-[700] uppercase border-2 border-accentLighter/40 hover:border-accentLighter/70 transition-all duration-300">
												{session == null
													? ""
													: getInitials(
															session.user
																.fullName
														)}
											</AvatarFallback>
										</Avatar>
									</DropdownMenuTrigger>
									<DropdownMenuContent className="bg-background p-3 text-foreground border-secondary mt-6 mr-6 w-full md:w-48 rounded-2xl">
										<DropdownMenuItem className="inner-navbar-link">
											<Link href="/profile">Профил</Link>
										</DropdownMenuItem>
										<div className="">
											<DropdownMenuItem className="inner-navbar-link">
												<Link href="/formulas">
													Направи поръчка
												</Link>
											</DropdownMenuItem>

											<DropdownMenuItem className="inner-navbar-link">
												<Link href="/points">
													Купи точки
												</Link>
											</DropdownMenuItem>
											{/* <DropdownMenuItem className="inner-navbar-link">
												<Link href="/subscriptions">
													Абонамент(Subscription)
												</Link>
											</DropdownMenuItem> */}
										</div>
										<div className="w-full h-px bg-neutral-700 my-2"></div>
										<DropdownMenuItem className="inner-navbar-link text-red-500">
											<DialogTrigger className="w-full text-start">
												Изход
											</DialogTrigger>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</nav>
						</div>

						<DialogContent
							className="bg-background border-secondary"
							onCloseAutoFocus={(e) => e.preventDefault()}
						>
							<DialogHeader>
								<DialogTitle className="text-xl font-[700]">
									Изход
								</DialogTitle>
								<DialogDescription className="pt-2 flex flex-col gap-7 text-base font-[600] text-neutral-300">
									Сигурни ли сте, че искате да излезете?
									<span className="flex gap-3 ml-auto">
										<DialogClose asChild className="w-max">
											<button className="btn">
												Назад
											</button>
										</DialogClose>
										<DialogClose asChild className="w-max">
											<button
												className="btn-red"
												onClick={handleLogout}
											>
												Изход
											</button>
										</DialogClose>
									</span>
								</DialogDescription>
							</DialogHeader>
						</DialogContent>
					</Dialog>
				</MaxWidthWrapper>
			</Transition>
		</header>
	);
}
