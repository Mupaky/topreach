import React from "react";
import clsx from "clsx";

export default function PointsCard({ points, text }) {
	return (
		<div
			className={clsx(
				"relative overflow-hidden border border-secondary bg-background text-foreground rounded-3xl md:rounded-[30px] w-full text-3xl md:text-5xl font-[800] flex items-center justify-center",
				text == "Дизайн" ? "h-32 md:h-48" : "h-48"
			)}
		>
			<div className="w-10 h-10 absolute top-1/2 -translate-x-1/2 left-1/2 -translate-y-1/2 bg-gradient-to-br from-accent to-accentLighter blur-[50px] filter rounded-full" />

			<span className="relative">
				{points}
				<span className="text-2xl ml-1">т.</span>
			</span>
			<span className="absolute bottom-2 text-base whitespace-nowrap text-neutral-400 font-[600]">
				{text}
			</span>
		</div>
	);
}
