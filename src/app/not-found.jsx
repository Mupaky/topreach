"use client";

import React from "react";
import Heading from "@/components/others/Heading";
import Button from "@/components/others/Button";
import MaxWidthWrapper from "@/components/others/MaxWidthWrapper";
import Transition from "@/components/others/Transition";

export default function NotFound() {
	return (
		<Transition delay={0.3}>
			<div className="min-h-screen">
				<MaxWidthWrapper>
					<div className="h-screen flex justify-center items-center">
						<div className="flex flex-col gap-14">
							<Heading
								text={"Нищо не е открито"}
								subtext={"404"}
							/>

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
