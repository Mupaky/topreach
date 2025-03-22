import React from "react";
import MaxWidthWrapper from "@/components/others/MaxWidthWrapper";
import Transition from "@/components/others/Transition";

export default function VlogOrderView({ data }) {
	function formatDate(dateString) {
		const date = new Date(dateString);

		const day = String(date.getDate()).padStart(2, "0");
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const year = date.getFullYear();

		return `${day}.${month}.${year}`;
	}

	return (
		<>
			{data && (
				<Transition delay={0.2} blur={3}>
					<div className="min-h-screen py-32 relative">
						<div className="w-96 h-96 absolute -top-20 -left-20 bg-gradient-to-br from-[#153456] to-background blur-[100px] filter rounded-full" />

						<MaxWidthWrapper>
							<h1 className="font-[700] text-3xl md:text-4xl bg-gradient-to-b from-foreground to-neutral-400 bg-clip-text text-transparent relative">
								Поръчка за видео монтаж на влог #{data.id}
							</h1>

							<div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-5 relative">
								<div className="flex flex-col gap-3">
									<h2 className="font-[600] text-neutral-400">
										Дата на поръчката:
									</h2>

									<p className="text-lg font-[600]">
										{formatDate(data.created_at)}
									</p>
								</div>
								<div className="flex flex-col gap-3">
									<h2 className="font-[600] text-neutral-400">
										Статус на поръчката:
									</h2>

									<p className="text-lg font-[600]">
										{data.status}
									</p>
								</div>
								<div className="flex flex-col gap-3">
									<h2 className="font-[600] text-neutral-400">
										Доставка:
									</h2>

									<p className="text-lg font-[600]">
										{data.delivery == "fast"
											? "Бърза доставка"
											: "Бавна доставка"}
									</p>
								</div>
								<div className="flex flex-col gap-3">
									<h2 className="font-[600] text-neutral-400">
										Цена:
									</h2>

									<p className="text-lg font-[600]">
										{data.price} т.
									</p>
								</div>

								<div className="h-px bg-secondary col-span-2 lg:col-span-4" />

								<div className="flex flex-col gap-3">
									<h2 className="font-[600] text-neutral-400">
										Минути суров материал:
									</h2>

									<p className="text-lg font-[600]">
										до {data.rawSourceMaterial} мин.
									</p>
								</div>
								<div className="flex flex-col gap-3">
									<h2 className="font-[600] text-neutral-400">
										Има ли история:
									</h2>

									<p className="text-lg font-[600]">
										{data.hasStory ? "Да" : "Не"}
									</p>
								</div>
								<div className="flex flex-col gap-3">
									<h2 className="font-[600] text-neutral-400">
										От нас ли е снимано:
									</h2>

									<p className="text-lg font-[600]">
										{data.shotByUs ? "Да" : "Не"}
									</p>
								</div>
								<div className="flex flex-col gap-3">
									<h2 className="font-[600] text-neutral-400">
										Сбиване на видеото:
									</h2>

									<p className="text-lg font-[600]">
										{data.videoCompression ? "Да" : "Не"}
									</p>
								</div>
								<div className="flex flex-col gap-3">
									<h2 className="font-[600] text-neutral-400">
										Ефекти ( Звукови и Музика, видео ):
									</h2>

									<p className="text-lg font-[600]">
										{
											{
												almostNone: "Почти без",
												goodEditing: "Добра обработка",
												heavyEditing: "Тежка обработка",
												animatedHeavy: "Animated heavy",
											}[data.effects]
										}
									</p>
								</div>
								<div className="flex flex-col gap-3">
									<h2 className="font-[600] text-neutral-400">
										LUT (Lookup Table):
									</h2>

									<p className="text-lg font-[600]">
										{data.lut ? "Да" : "Не"}
									</p>
								</div>

								<div className="h-px bg-secondary col-span-2 lg:col-span-4" />

								<div className="flex flex-col gap-3">
									<h2 className="font-[600] text-neutral-400">
										Локации:
									</h2>

									<p className="text-lg font-[600]">
										{data.locations}{" "}
										{data.locations == 1
											? "локация"
											: "локации"}
									</p>
								</div>
								<div className="flex flex-col gap-3">
									<h2 className="font-[600] text-neutral-400">
										Камери:
									</h2>

									<p className="text-lg font-[600]">
										{data.cameras}{" "}
										{data.cameras == 1
											? "камера"
											: "камери"}
									</p>
								</div>
								<div className="flex flex-col gap-3">
									<h2 className="font-[600] text-neutral-400">
										Микрофони:
									</h2>

									<p className="text-lg font-[600]">
										{data.microphones}{" "}
										{data.microphones == 1
											? "микрофон"
											: "микрофона"}
									</p>
								</div>

								<div className="h-px bg-secondary col-span-2 lg:col-span-4" />

								<div className="flex flex-col gap-3">
									<h2 className="font-[600] text-neutral-400">
										Готово видео:
									</h2>

									<p className="text-lg font-[600]">
										до {data.runningTime} мин.
									</p>
								</div>
								<div className="flex flex-col gap-3">
									<h2 className="font-[600] text-neutral-400">
										Интро (Хоок):
									</h2>

									<p className="text-lg font-[600]">
										{
											{
												without: "Без",
												medium: "Среден",
												premium: "Premium",
												animated:
													"Animated (Explainer)",
											}[data.intro]
										}
									</p>
								</div>

								<div className="flex flex-col gap-3">
									<h2 className="font-[600] text-neutral-400">
										Voice-over и покрития (манипулации):
									</h2>

									<p className="text-lg font-[600]">
										{data.voiceOvers ? "Да" : "Не"}
									</p>
								</div>

								{data.advertisements && (
									<div className="h-px bg-secondary col-span-4" />
								)}

								{data.advertisements &&
									data.advertisements.map((item, index) => {
										return (
											<div
												key={index}
												className="flex flex-col gap-3"
											>
												<h2 className="font-[600] text-neutral-400">
													Обработка на реклама{" "}
													{index + 1}:
												</h2>

												<p className="text-lg font-[600]">
													{
														{
															almostNone:
																"Почти без",
															goodEditing:
																"Добра обработка",
															heavyEditing:
																"Тежка обработка",
															"3D": "3D обработка",
														}[item]
													}
												</p>
											</div>
										);
									})}

								<div className="h-px bg-secondary col-span-2 lg:col-span-4" />

								<div className="flex flex-col gap-3">
									<h2 className="font-[600] text-neutral-400">
										Top Reach Интро реклама:
									</h2>

									<p className="text-lg font-[600]">
										{data.addIntroAd ? "Да" : "Не"}
									</p>
								</div>
								<div className="flex flex-col gap-3">
									<h2 className="font-[600] text-neutral-400">
										Top Reach Outro реклама:
									</h2>

									<p className="text-lg font-[600]">
										{data.addOutroAd ? "Да" : "Не"}
									</p>
								</div>
								<div className="flex flex-col gap-3">
									<h2 className="font-[600] text-neutral-400">
										Top Reach Popup реклама:
									</h2>

									<p className="text-lg font-[600]">
										{
											{
												1: "1 реклама",
												2: "2 реклами",
												3: "3 реклами",
												no: "Без",
											}[data.addPopupAd]
										}
									</p>
								</div>
							</div>
						</MaxWidthWrapper>
					</div>
				</Transition>
			)}
		</>
	);
}
