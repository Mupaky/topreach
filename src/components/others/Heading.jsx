import React from "react";
import { Oswald } from "next/font/google";
import clsx from "clsx";

const oswald = Oswald({ subsets: ["cyrillic"] });

export default function Heading({ text, subtext }) {
	return (
		<>
			<div className="relative w-max">
				<h1 className="text-3xl md:text-5xl font-[800] w-max z-[1] relative bg-gradient-to-b from-foreground to-neutral-400 bg-clip-text text-transparent">
					{text}
				</h1>
				<span
					className={clsx(
						"uppercase absolute z-0 top-5 left-1/2 font-[900] -translate-y-1/2 -translate-x-1/2 text-secondaryDark",
						subtext == "тикток" || subtext == "дизайн"
							? "text-[5.4rem] md:text-9xl"
							: "text-[6rem] md:text-9xl"
					)}
				>
					{subtext}
				</span>
			</div>
		</>
	);
}
