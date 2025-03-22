import React from "react";
import GuestNavbar from "@/components/navbars/GuestNavbar";
import Link from "next/link";
import MaxWidthWrapper from "@/components/others/MaxWidthWrapper";
import CTA from "@/pages/CTA";
import Transition from "@/components/others/Transition";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPhone } from "@fortawesome/free-solid-svg-icons";
import {
	faFacebookF,
	faYoutube,
	faInstagram,
} from "@fortawesome/free-brands-svg-icons";
import ContactForm from "@/components/forms/ContactForm";

export default function page() {
	return (
		<>
			<GuestNavbar />

			<Transition delay={0.2} blur={5}>
				<div className="min-h-screen pt-20 pb-32 overflow-hidden">
					<MaxWidthWrapper>
						<div className="mt-32 relative">
							<div className="w-96 h-96 absolute -top-20 left-1/2 -translate-x-1/2 bg-gradient-to-br from-[#153456] to-background blur-[100px] filter rounded-full" />

							<h1 className="text-center text-6xl font-[700] bg-gradient-to-br from-foreground to-neutral-400 bg-clip-text text-transparent relative">
								Контакти
							</h1>

							<div className="mt-5 flex gap-3 w-max mx-auto relative text-neutral-400">
								<Link href="/" className="hover:underline">
									Начало
								</Link>
								<span className="text-foreground">/</span>
								<p>Контакти</p>
							</div>
						</div>

						<div className="flex flex-col xl:flex-row gap-16 mt-52 mb-52 relative">
							<div className="flex flex-col gap-8 my-auto text-center xl:text-start">
								<h2 className="text-3xl lg:text-5xl font-[700] bg-gradient-to-br from-foreground to-neutral-400 bg-clip-text text-transparent text-balance text-center xl:text-start">
									Свържи се с Top Reach
									<span className="text-accent/80">.</span>
								</h2>

								<p className="text-balance text-neutral-300 text-sm md:text-base">
									Нашият екип е винаги на разположение да ти
									съдейства с всичко необходимо, за да
									превърнеш своята мечта в реалност! Ще
									отговорим на всичките ти въпроси, ще ти
									помогнем да избереш най-добрите услуги за
									твоя бизнес и ще изградим силно онлайн
									присъствие за теб!
								</p>

								<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 gap-7 mx-auto xl:mx-0">
									<Link
										href=""
										className="flex gap-2 items-center hover:underline"
									>
										<FontAwesomeIcon
											className="border-2 border-accentLighter/40 aspect-square p-3 rounded-full text-accentLighter/90 text-lg"
											icon={faEnvelope}
										/>

										<span className="text-foreground/90">
											topreachbg@gmail.com
										</span>
									</Link>

									<Link
										href="https://www.facebook.com/TopReachStudio"
										className="flex gap-2 items-center hover:underline"
										target="_blank"
									>
										<FontAwesomeIcon
											className="border-2 border-accentLighter/40 aspect-square p-3 rounded-full text-accentLighter/90 text-lg"
											icon={faFacebookF}
										/>

										<span className="text-foreground/90">
											Top Reach
										</span>
									</Link>

									<Link
										href="https://www.instagram.com/topreachstudio/"
										className="flex gap-2 items-center hover:underline"
										target="_blank"
									>
										<FontAwesomeIcon
											className="border-2 border-accentLighter/40 aspect-square p-3 rounded-full text-accentLighter/90 text-lg"
											icon={faInstagram}
										/>

										<span className="text-foreground/90">
											@topreachstudio
										</span>
									</Link>

									<Link
										href="https://www.youtube.com/@TopReachStudio"
										className="flex gap-2 items-center hover:underline"
										target="_blank"
									>
										<FontAwesomeIcon
											className="border-2 border-accentLighter/40 aspect-square p-3 rounded-full text-accentLighter/90 text-lg"
											icon={faYoutube}
										/>

										<span className="text-foreground/90">
											@TopReachStudio
										</span>
									</Link>
								</div>
							</div>

							<div className="xl:w-full mx-auto xl:mx-0">
								<ContactForm />
							</div>
						</div>

						<CTA />
					</MaxWidthWrapper>
				</div>
			</Transition>
		</>
	);
}
