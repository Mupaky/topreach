import React from "react";
import Link from "next/link";
import { Oswald } from "next/font/google";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretRight } from "@fortawesome/free-solid-svg-icons";

const oswald = Oswald({ subsets: ["cyrillic"] });

export default function Button({ text, style, link }) {
	return (
		<Link
			href={link}
			className={`${oswald.className} 
        text-accentLighter border-2 border-accentLighter/20 hover:border-accentLighter/40 bg-accentLighter/5
        transition-all duration-500 flex gap-1 items-center px-5 py-3 rounded-full hover:shadow-lg hover:shadow-accentLighter/20`}
		>
			<span className="text-base uppercase font-medium whitespace-nowrap">
				{text}
			</span>
			{style == "arrow" ? <FontAwesomeIcon icon={faCaretRight} /> : null}
		</Link>
	);
}
