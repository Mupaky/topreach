"use client";

import React from "react";
import Transition from "@/components/others/Transition";
import BuyPointsCard from "@/components/cards/BuyPointsCard";
import MaxWidthWrapper from "@/components/others/MaxWidthWrapper";

export default function Points({ data, email, name, userId }) {
	return (
		<Transition delay={0.2}>
			<section className="min-h-screen py-44 md:py-64">
				<MaxWidthWrapper>
					<div>
						<div className="relative">
							<div className="w-96 h-96 absolute -top-20 left-1/2 -translate-x-1/2 bg-gradient-to-br from-accent/70 to-background blur-[100px] filter rounded-full" />

							<h1 className="hidden md:flex md:absolute top-0 left-1/2 -translate-y-[60%] -translate-x-1/2 mx-auto w-max text-6xl md:text-8xl font-[800] bg-gradient-to-b from-foreground to-neutral-400 bg-clip-text text-transparent z-0">
								КУПИ ТОЧКИ
							</h1>
							<h1 className="md:hidden mx-auto w-max text-5xl font-[800] mb-5 relative bg-gradient-to-b from-foreground to-neutral-400 bg-clip-text text-transparent">
								КУПИ ТОЧКИ
							</h1>

							<div className="z-[2] w-full grid grid-cols-1 xl:grid-cols-3 gap-3">
								{data &&
									data.map((item) => {
										return (
											<BuyPointsCard
												key={item.id}
												price={item.price}
												points={{
													editingPoints:
														item.editingPoints,
													designPoints:
														item.designPoints,
													recordingPoints:
														item.recordingPoints,
												}}
												lifespan={item.lifespan}
												email={email}
												userId={userId}
												name={name}
											/>
										);
									})}

								<p className="col-span-1 xl:col-span-3 text-balance text-center text-neutral-300 text-xs md:text-sm mt-3">
									След завършването на вашата поръчка на
									точков пакет, ще ви бъде изпратен имейл за
									нейното потвърждение, с подробна информация
									относно нейното заплащане и изпълнение.
								</p>
							</div>
						</div>
					</div>
				</MaxWidthWrapper>
			</section>
		</Transition>
	);
}
