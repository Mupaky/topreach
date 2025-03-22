import React from "react";
import GuestNavbar from "@/components/navbars/GuestNavbar";
import Link from "next/link";
import MaxWidthWrapper from "@/components/others/MaxWidthWrapper";
import Image from "next/image";
import Button from "@/components/others/Button";
import AboutImage from "../../../public/aboutus.jpg";
import CTA from "@/pages/CTA";
import Transition from "@/components/others/Transition";

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
								За нас
							</h1>

							<div className="mt-5 flex gap-3 w-max mx-auto relative text-neutral-400">
								<Link href="/" className="hover:underline">
									Начало
								</Link>
								<span className="text-foreground">/</span>
								<p>За нас</p>
							</div>
						</div>

						<div className="flex flex-col lg:flex-row gap-16 mt-52 mb-52 relative">
							<Image
								src={AboutImage}
								alt="Video editor image"
								className="lg:max-w-[40vw] rounded-xl border border-secondary shadow-2xl object-cover"
							/>

							<div className="flex flex-col gap-8 my-auto">
								<h2 className="text-3xl lg:text-5xl font-[700] bg-gradient-to-br from-foreground to-neutral-400 bg-clip-text text-transparent text-balance text-center md:text-start">
									Накратко за нас
								</h2>

								<div className="flex flex-col gap-3 text-neutral-300 text-center md:text-start">
									<p className="text-balance">
										Още от детска възраст се занимаваме с
										видео монтаж. Преди 5 години започнахме
										да продаваме собствени продукти в
										социалните мрежи чрез видеа.
										Забелязахме, че този подход работи, и
										решихме да помогнем на няколко души да
										използват своите YouTube канали за
										продажби.
									</p>

									<p className="text-balance">
										След като този модел се оказа успешен за
										двама от тях, го мултиплицирахме и
										продължихме да подпомагаме развитието на
										още канали. За нас е удоволствие не само
										да разширяваме аудиторията на тези
										канали, но и да допринасяме за
										развитието на самите бизнеси чрез
										ефективен брандинг.
									</p>
								</div>

								<div className="w-max mx-auto md:mx-0">
									<Button
										text="Започни сега"
										link="/auth/signup"
									/>
								</div>
							</div>
						</div>

						<CTA />
					</MaxWidthWrapper>
				</div>
			</Transition>
		</>
	);
}
