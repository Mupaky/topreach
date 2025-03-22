import React from "react";
import Image from "next/image";
import Client1 from "../../../public/client1.jpg";
import Client2 from "../../../public/client2.jpg";
import Client3 from "../../../public/client3.jpg";
import Client4 from "../../../public/client4.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default function ClientCard({ name, accomplishments, image, link }) {
	const images = {
		1: Client1,
		2: Client2,
		3: Client3,
		4: Client4,
	};

	return (
		<div className="flex flex-col gap-7 w-max mx-auto">
			<Link
				href={link}
				target="_blank"
				className="border border-accentLighter/20 bg-secondaryDark/30 p-3 rounded-3xl hover:scale-[1.02] transition-all duration-500 hover:shadow-2xl hover:shadow-accent/20"
			>
				<Image
					className="h-96 w-80 object-cover rounded-2xl"
					src={images[image]}
					alt="client image"
				/>
			</Link>

			<div className="my-auto">
				<h3 className="text-3xl font-[800] bg-clip-text bg-gradient-to-r from-accent to-accentLighter text-transparent">
					{name}
				</h3>

				<div className="flex flex-col gap-2 mt-4">
					{accomplishments.map((item, index) => {
						return (
							<p
								key={index}
								className="font-[500] cursor-default"
							>
								<FontAwesomeIcon
									className="mr-2 text-accent"
									size="lg"
									icon={faCheckCircle}
								/>
								{item}
							</p>
						);
					})}
				</div>
			</div>
		</div>
	);
}
