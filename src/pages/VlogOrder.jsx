"use client";

import React from "react";
import MaxWidthWrapper from "@/components/others/MaxWidthWrapper";
import Heading from "@/components/others/Heading";
import Transition from "@/components/others/Transition";
import VlogOrderForm from "@/components/forms/VlogOrderForm";
import Button from "@/components/others/Button";

export default function VlogOrder({ user }) {
	let editingPoints;

	if (user) editingPoints = user.editingPoints;

	return (
		<>
			{user && (
				<Transition delay={0.2} blur={3}>
					<div className="min-h-screen py-48 overflow-x-hidden">
						<MaxWidthWrapper>
							<div className="grid grid-cols-1 xl:grid-cols-2 gap-10 relative">
								<div className="w-96 h-96 absolute -bottom-20 md:-top-20 -right-20 bg-gradient-to-br from-[#153456] to-background blur-[100px] filter rounded-full" />

								<div className="flex flex-col gap-10 relative">
									<div className="mx-auto md:mx-0">
										<Heading
											text="Монтаж на влог"
											subtext="влог"
										/>
									</div>

									<p className="text-base md:text-xl font-[500] text-balance text-center md:text-start">
										Превърнете вашите записи в професионални
										и вдъхновяващи видеа с нашата помощ.
									</p>

									<div className="md:border border-secondary md:bg-background/80 p-10 rounded-3xl flex flex-col gap-5">
										<p className="text-xl md:text-3xl font-[700] bg-gradient-to-b from-foreground to-neutral-400 bg-clip-text text-transparent">
											Баланс -{" "}
											<span className="text-accent">
												{editingPoints
													? editingPoints
													: 0}{" "}
												т.
											</span>
										</p>

										<Button
											text="Купи точки"
											link="/points"
										/>
									</div>
								</div>

								<VlogOrderForm
									email={user.email}
									points={editingPoints}
								/>
							</div>
						</MaxWidthWrapper>
					</div>
				</Transition>
			)}
		</>
	);
}
