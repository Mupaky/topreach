import React from "react";
import Button from "@/components/others/Button";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretRight } from "@fortawesome/free-solid-svg-icons";
import Transition from "@/components/others/Transition";

export default function Hero() {
	return (
		<section className="h-screen flex items-center px-5">
			<div className="relative flex flex-col gap-4 md:gap-7 mx-auto w-min md:p-10 rounded-2xl text-center md:text-start">
				{/* Heading text */}
				<Transition direction="left" delay={0.2}>
					{/* Desktop */}
					<h1 className="text-6xl xl:text-8xl font-[800] hidden md:flex flex-col w-max">
						<span className="bg-gradient-to-b from-foreground to-neutral-400 bg-clip-text text-transparent">
							Развий и{" "}
							<span className="text-gradient">монетизирай</span>{" "}
						</span>
						<span className="bg-gradient-to-b from-foreground to-neutral-400 bg-clip-text text-transparent">
							социалните си мрежи
							<span className="text-accentLighter">.</span>
						</span>
					</h1>
					{/* Mobile */}
					<h1 className="flex flex-col md:hidden font-[800] text-5xl">
						<span className="">Развий и</span>
						<span className="text-gradient">монетизирай</span>
						<span className="">социалните</span>
						<span className="">
							си мрежи
							<span className="text-accentLighter ml-1">.</span>
						</span>
					</h1>
				</Transition>

				{/* Body text */}
				<Transition direction="left" delay={0.2}>
					{/* Desktop */}
					<h2 className="hidden md:flex font-[600] text-foreground text-sm lg:text-lg text-balance">
						Научи доказани стратегии и практически подходи за
						изграждане на успешен бранд в социалните мрежи, който не
						само привлича внимание, но и генерира печалби.
					</h2>
					{/* Mobile */}
					<h2 className="md:hidden font-[600] text-foreground mt-2 text-sm mb-5 text-balance">
						Научи доказани стратегии и практически за изграждане на
						успешен бранд.
					</h2>
				</Transition>

				{/* CTA button and text */}
				<div className="flex flex-col mx-auto lg:mx-0 lg:flex-row items-center gap-4 w-max">
					<Transition direction="left" delay={0.3} blur={3}>
						<div className="w-max">
							<Button
								text="Запази час за консултация"
								link="/contacts"
							/>
						</div>
					</Transition>

					<Transition direction="left" delay={0.4}>
						<Link href="#clients">
							<div className="flex items-center">
								<Image
									src="/client3.webp"
									width={500}
									height={500}
									alt="Client 3"
									className="rounded-full border-4 border-background h-16 w-16"
								/>
								<Image
									src="/client2.webp"
									width={500}
									height={500}
									alt="Client 2"
									className="rounded-full border-4 border-background h-16 w-16 -ml-8"
								/>
								<Image
									src="/client1.webp"
									width={500}
									height={500}
									alt="Client 1"
									className="rounded-full border-4 border-background h-16 w-16 -ml-8"
								/>

								<p className="ml-2 text-foregroundLighter flex items-center gap-1 hover:text-foreground transition-all duration-300">
									<span className="font-[600] whitespace-nowrap text-sm md:text-base">
										Доволни клиенти
									</span>{" "}
									<FontAwesomeIcon icon={faCaretRight} />
								</p>
							</div>
						</Link>
					</Transition>
				</div>
			</div>
		</section>
	);
}
