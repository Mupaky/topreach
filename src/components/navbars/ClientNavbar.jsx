"use client";

import React, { useState, useEffect } from "react";
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
import { createClient } from "@/utils/client";
import Transition from "../others/Transition";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSortDown } from "@fortawesome/free-solid-svg-icons";
import TopReachLogo from "../../../public/topreachlogo.png";
import Image from "next/image";

const supabase = createClient();

const oswald = Oswald({ subsets: ["cyrillic"] });

function getInitials(fullName) {
    if (!fullName || typeof fullName !== 'string' || fullName.trim() === "") {
        return "U"; // Default initial if name is invalid or empty
    }
	const names = fullName.trim().split(" ");
    const validNames = names.filter(name => name.length > 0); // Filter out empty strings from split

	if (validNames.length === 0) {
        return "U";
    }
	if (validNames.length === 1) {
		return validNames[0][0].toUpperCase();
	}
	return validNames[0][0].toUpperCase() + (validNames[1][0]?.toUpperCase() || ""); // Handle if only one name part after filtering
}

export default function ClientNavbar({ session: initialUserSession }) { // Renamed prop for clarity
    const [currentSession, setCurrentSession] = useState(initialUserSession); // Use a different name for state
    const router = useRouter();

    useEffect(() => {
        // This effect now only syncs the prop to state, redirection handled below
        setCurrentSession(initialUserSession);
    }, [initialUserSession]);

    // Effect for redirection if custom session becomes null
    // This assumes that if initialUserSession is null, you want to redirect.
    // However, this component might be used on pages where a session isn't required.
    // Consider if this redirect is always appropriate for all uses of Navbar.
    useEffect(() => {
        if (currentSession === null) { // If our custom session state is null
            // router.push("/"); // Redirecting here might be too aggressive if Navbar is on public pages
            console.log("[ClientNavbar] Custom session is null.");
        }
    }, [currentSession, router]);


	const handleLogout = async () => {
        try {
            console.log("[ClientNavbar] Initiating logout...");
            // Step 1: Call your API to clear the custom 'jose' session cookie
            const customLogoutRes = await fetch("/api/logout", { method: "POST" });
            if (!customLogoutRes.ok) {
                const errorData = await customLogoutRes.json().catch(() => ({ message: "Unknown API logout error" }));
                console.error("Failed to log out from custom session API:", customLogoutRes.status, errorData.message);
                // Continue to Supabase logout even if custom fails, but log the error
            } else {
                console.log("[ClientNavbar] Custom session logout API call successful.");
            }

            // Step 2: Sign out from Supabase client-side
            console.log("[ClientNavbar] Attempting Supabase signOut...");
            const { error: supabaseSignOutError } = await supabase.auth.signOut();

            if (supabaseSignOutError) {
                console.error("Failed to sign out from Supabase:", supabaseSignOutError.message);
            } else {
                console.log("[ClientNavbar] Supabase signOut successful.");
            }

            // Regardless of individual logout successes, update UI and redirect
            setCurrentSession(null); // Clear local custom session state immediately
            console.log("[ClientNavbar] Pushing to '/' and refreshing router.");
            router.push("/");       // Redirect to home
            router.refresh();     // Force re-run of Server Components on the new page

            // Optional: Slightly delay alert to allow router actions to initiate
            // setTimeout(() => alert("Вие излязохте успешно!"), 100);

        } catch (error) { // Catch errors from fetch itself or other unexpected issues
            console.error("Logout error (main catch block):", error);
            alert("Възникна неочаквана грешка при излизане.");
        }
    };

	return (
		<header className="py-6 z-10 absolute top-0 left-0 right-0">
			<Transition delay={0.2}>
				<MaxWidthWrapper>
					<Dialog> {/* Consider if Dialog is always needed or only around logout parts */}
						<div className="flex justify-between items-center">
							<Link href={currentSession && currentSession.user ? "/home" : "/"}> {/* Conditional home link */}
								<Image
									className="max-h-10 w-auto opacity-90 hover:opacity-70 transition-all duration-300"
									src={TopReachLogo}
									alt="Top Reach"
								/>
							</Link>

							<nav className="flex gap-7 items-center">
                                {/* Conditional rendering for logged-in user links */}
                                {currentSession && currentSession.user && (
                                    <>
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
                                    </>
                                )}
                                {/* User Avatar Dropdown (always visible, content changes) */}
								<DropdownMenu>
									<DropdownMenuTrigger>
										<Avatar>
											<AvatarImage src={null} />
											<AvatarFallback className="text-foreground bg-secondary font-[700] uppercase border-2 border-accentLighter/40 hover:border-accentLighter/70 transition-all duration-300">
                                                {/* CORRECTED: Use currentSession */}
												{currentSession && currentSession.user
													? getInitials(
															currentSession.user.fullName
													  )
													: "U"} {/* Default if no session or user */}
											</AvatarFallback>
										</Avatar>
									</DropdownMenuTrigger>
                                    {/* Only render DropdownMenuContent if there's a user session */}
                                    {currentSession && currentSession.user && (
									    <DropdownMenuContent className="bg-background p-3 text-foreground border-secondary mt-6 mr-6 w-full md:w-48 rounded-2xl">
										    <DropdownMenuItem className="inner-navbar-link">
											    <Link href="/profile">Профил</Link>
										    </DropdownMenuItem>
										    <div className=""> {/* This div seems stylistically driven */}
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
										    </div>
										    <div className="w-full h-px bg-neutral-700 my-2"></div>
										    <DropdownMenuItem className="inner-navbar-link text-red-500">
											    <DialogTrigger className="w-full text-start">
												    Изход
											    </DialogTrigger>
										    </DropdownMenuItem>
									    </DropdownMenuContent>
                                    )}
								</DropdownMenu>
							</nav>
						</div>

                        {/* Logout Confirmation Dialog - only relevant if user is logged in */}
                        {currentSession && currentSession.user && (
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
										    <button
											    className="btn-red"
											    onClick={handleLogout} 
                                                // Consider adding disabled={isLoadingLogoutState} if you add such a state
										    >
											    Изход
										    </button>
									    </span>
								    </DialogDescription>
							    </DialogHeader>
						    </DialogContent>
                        )}
					</Dialog>
				</MaxWidthWrapper>
			</Transition>
		</header>
	);

}
