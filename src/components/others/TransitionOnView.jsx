"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function TransitionOnView({
	children,
	direction,
	blur = 0,
	delay = 0,
}) {
	let xValue = 0;
	let yValue = 0;

	if (direction === "left") xValue = -50;
	if (direction === "right") xValue = 50;
	if (direction === "up") yValue = -50;
	if (direction === "down") yValue = 50;

	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-50px 0px" });

	return (
		<motion.div
			ref={ref}
			initial={{
				opacity: 0,
				x: xValue,
				y: yValue,
				filter: `blur(${blur}px)`,
			}}
			animate={
				isInView ? { opacity: 1, x: 0, y: 0, filter: "blur(0px)" } : {}
			}
			transition={{
				duration: 0.7,
				ease: [0.25, 0.8, 0.5, 1],
				delay: delay,
			}}
		>
			{children}
		</motion.div>
	);
}
