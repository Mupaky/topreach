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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import Button from "../others/Button";
import Transition from "../others/Transition";
import TopReachLogo from "../../../public/topreachlogo.png";
import Image from "next/image";

const oswald = Oswald({ subsets: ["cyrillic"] });

export default function GuestNavbar() {
	return (
		<header className="py-6 absolute z-50 top-0 left-0 right-0">
			<Transition delay={0.2}>
				<MaxWidthWrapper>
					<div className="flex justify-between items-center">
						<Link href="/">
							<Image
								className="max-h-10 w-auto opacity-90 hover:opacity-70 transition-all duration-300"
								src={TopReachLogo}
								alt="Top Reach"
							/>
						</Link>

						<div className="flex">
							<nav className="hidden md:flex gap-7 items-center">
								<Link className="navbar-link" href="/aboutus">
									За нас
								</Link>

								<Link className="navbar-link" href="/#clients">
									Клиенти
								</Link>

								<Link className="navbar-link" href="/contacts">
									Контакти
								</Link>

								<div className="ml-2">
									<Button
										text="Работи с нас"
										link="/auth/login"
										style="arrow"
									/>
								</div>
							</nav>

							<nav className="flex md:hidden items-center">
								<DropdownMenu>
									<DropdownMenuTrigger className="flex gap-2 items-center navbar-link">
										<FontAwesomeIcon
											className="w-5 scale-150"
											icon={faBars}
										/>
									</DropdownMenuTrigger>
									<DropdownMenuContent className="bg-background p-5 text-foreground border-secondary mt-4 mr-5 rounded-2xl flex flex-col gap-7">
										<Link
											className="navbar-link"
											href="/aboutus"
										>
											За нас
										</Link>

										<Link
											className="navbar-link"
											href="/#clients"
										>
											Клиенти
										</Link>

										<Link
											className="navbar-link"
											href="/contacts"
										>
											Контакти
										</Link>
									</DropdownMenuContent>
								</DropdownMenu>
							</nav>
						</div>
					</div>
				</MaxWidthWrapper>
			</Transition>
		</header>
	);
}
