"use client";

import React from "react";
import { motion } from "framer-motion";

export default function Transition({
	children,
	direction,
	blur = 0,
	delay = 0,
	className,
}) {
	let xValue = 0;
	let yValue = 0;

	if (direction === "left") {
		xValue = -50;
	} else if (direction === "right") {
		xValue = 50;
	}

	if (direction === "up") {
		yValue = -50;
	} else if (direction === "down") {
		yValue = 50;
	}

	return (
		<motion.div
			animate={{ opacity: 1, x: 0, y: 0, filter: "blur(0px)" }}
			initial={{
				opacity: 0,
				x: xValue,
				y: yValue,
				filter: `blur(${blur}px)`,
			}}
			transition={{
				duration: 0.7,
				ease: [0.25, 0.8, 0.5, 1],
				delay: delay,
			}}
			className={className}
		>
			{children}
		</motion.div>
	);
}
