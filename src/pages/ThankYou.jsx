"use client";

import React from "react";
import Heading from "@/components/others/Heading";
import Button from "@/components/others/Button";
import MaxWidthWrapper from "@/components/others/MaxWidthWrapper";
import Transition from "@/components/others/Transition";

export default function ThankYou() {
	return (
		<Transition delay={0.3}>
			<div className="min-h-screen">
				<MaxWidthWrapper>
					<div className="h-screen flex justify-center items-center">
						<div className="flex flex-col gap-14">
							<div className="hidden lg:block">
								<Heading
									text={"Благодарим ви за поръчката"}
									subtext={"Благодарим "}
								/>
							</div>

							<h1 className="lg:hidden text-4xl md:text-5xl text-center text-balance font-[700] bg-gradient-to-b from-foreground to-neutral-400 bg-clip-text text-transparent">
								Благодарим ви за поръчката
							</h1>

							<div className="w-max mx-auto">
								<Button
									text={"Върнете се обратно"}
									link={"/home"}
								/>
							</div>
						</div>
					</div>
				</MaxWidthWrapper>
			</div>
		</Transition>
	);
}
