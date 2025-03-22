import React from "react";
import Button from "@/components/others/Button";

export default function CTA() {
	return (
		<div className="relative mt-40">
			<h2 className="relative text-2xl sm:text-4xl md:text-6xl font-[800] mt-2 bg-gradient-to-br from-foreground to-neutral-400 bg-clip-text text-transparent text-center mx-auto text-balance max-w-4xl">
				Вашият бранд заслужава най-доброто.
			</h2>

			<p className="text-center mt-5 text-sm md:text-lg text-balance relative">
				Ние предлагаме бързи и ефективни решения.
			</p>

			<div className="mt-5 w-max mx-auto relative">
				<Button text="Започни сега" link="/auth/signup" />
			</div>

			<div className="w-60 md:w-96 h-60 md:h-96 -z-10 absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-gradient-to-br from-accent/50 to-background blur-[100px] filter rounded-full" />
		</div>
	);
}
