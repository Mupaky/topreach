import React from "react";
import MaxWidthWrapper from "@/components/others/MaxWidthWrapper";
import Transition from "@/components/others/Transition";

export default function ThumbnailOrderView({ data }) {
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
								Поръчка за дизайн на Thumbnail #{data.id}
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
										Цена:
									</h2>

									<p className="text-lg font-[600]">
										{data.price} т.
									</p>
								</div>

								<div className="h-px bg-secondary col-span-2 lg:col-span-4" />

								<div className="flex flex-col gap-3">
									<h2 className="font-[600] text-neutral-400">
										Услуга:
									</h2>

									<p className="text-lg font-[600]">
										{
											{
												standardThumbnail:
													"Standard Thumbnail",
												premiumThumbnail:
													"Premium Thumbnail",
											}[data.service]
										}
									</p>
								</div>

								<div className="flex flex-col gap-3 lg:col-span-3">
									<h2 className="font-[600] text-neutral-400">
										Допълнителна услуга:
									</h2>

									<p className="text-lg font-[600]">
										{
											{
												"2TestThumbnails":
													"2 x Test Thumbnails",
												"3TestThumbnails":
													"3 x Test Thumbnails",
												null: "Не",
											}[data.additionalService]
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
