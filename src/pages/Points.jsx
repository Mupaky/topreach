// pages/Points.jsx (This is a client component)
"use client";

import React from "react";
import Transition from "@/components/others/Transition";
import BuyPointsCard from "@/components/cards/BuyPointsCard";
import MaxWidthWrapper from "@/components/others/MaxWidthWrapper";

export default function Points({ data, email, name, userId, fetchError }) { // Added fetchError prop
	return (
		<Transition delay={0.2}>
			<section className="min-h-screen py-44 md:py-64 bg-background text-foreground">
				<MaxWidthWrapper>
					<div>
						<div className="relative">
							<div className="w-96 h-96 absolute -top-20 left-1/2 -translate-x-1/2 bg-gradient-to-br from-accent/70 to-background blur-[100px] filter rounded-full -z-10" />

							<h1 className="hidden md:flex md:absolute top-0 left-1/2 -translate-y-[60%] -translate-x-1/2 mx-auto w-max text-6xl md:text-8xl font-[800] bg-gradient-to-b from-foreground to-neutral-400 bg-clip-text text-transparent z-0">
								КУПИ ТОЧКИ
							</h1>
							<h1 className="md:hidden mx-auto w-max text-5xl font-[800] mb-5 relative bg-gradient-to-b from-foreground to-neutral-400 bg-clip-text text-transparent">
								КУПИ ТОЧКИ
							</h1>

                            {fetchError && (
                                <p className="col-span-full text-center text-red-500 py-4">{fetchError}</p>
                            )}

							<div className="z-[2] w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
								{data && data.length > 0 ? (
									data.map((item) => {
										return (
											<BuyPointsCard
												key={item.id}
                                                packageId={item.id} // Good to pass if API needs it
												price={item.price}
												points={{
													editingPoints: item.editingPoints || 0,
													designPoints: item.designPoints || 0,
													recordingPoints: item.recordingPoints || 0,
                                                    consultingPoints: item.consultingPoints || 0, // <<< ADDED
												}}
												lifespan={item.lifespan}
												email={email} // For notification perhaps
												userId={userId} // For creating the pointsorder record
												name={name}   // For notification
											/>
										);
									})
                                ) : !fetchError ? (
                                    <p className="col-span-full text-center text-neutral-400 py-10">В момента няма налични пакети за закупуване.</p>
                                ) : null}
							</div>
							<p className="col-span-1 md:col-span-2 xl:col-span-3 text-balance text-center text-neutral-300 text-xs md:text-sm mt-8">
								След завършването на вашата поръчка на
								точков пакет, ще ви бъде изпратен имейл за
								нейното потвърждение, с подробна информация
								относно нейното заплащане и изпълнение.
							</p>
						</div>
					</div>
				</MaxWidthWrapper>
			</section>
		</Transition>
	);
}