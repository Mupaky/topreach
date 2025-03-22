import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilm, faVideo, faPenNib } from "@fortawesome/free-solid-svg-icons";
import Button from "../others/Button";
import clsx from "clsx";

export default function ServiceCard({
	heading,
	iconValue,
	body,
	link,
	className,
}) {
	const icons = {
		editing: <FontAwesomeIcon icon={faFilm} />,
		recording: <FontAwesomeIcon icon={faVideo} />,
		design: <FontAwesomeIcon icon={faPenNib} />,
	};

	return (
		<div
			className={clsx(
				"bg-secondaryDark bg-opacity-30 backdrop-blur-sm rounded-lg p-7 border border-secondary text-center flex flex-col justify-between gap-5 col-span-1",
				className
			)}
		>
			<div className="text-4xl p-3 bg-secondary rounded-lg aspect-square w-max text-center mx-auto border-2 border-accentLighter/20 text-accentLighter">
				{icons[iconValue]}
			</div>

			<h3 className="text-xl lg:text-2xl font-[700] text-balance">
				{heading}
			</h3>

			<p className="text-balance text-sm lg:text-base">{body}</p>

			<div className="w-max mx-auto">
				<Button text="Започни сега" link={link} />
			</div>
		</div>
	);
}
