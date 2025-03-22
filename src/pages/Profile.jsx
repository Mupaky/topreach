import React from "react";
import MaxWidthWrapper from "@/components/others/MaxWidthWrapper";
import Transition from "@/components/others/Transition";

export default function Profile({ user }) {
	function getInitials(fullName) {
		const names = fullName.split(" ");

		if (names.length == 1) {
			return names[0][0];
		}

		return names[0][0] + names[1][0];
	}

	return (
		<>
			{user && (
				<Transition delay={0.2} blur={3}>
					<div className="min-h-screen pt-32">
						<MaxWidthWrapper>
							<div>
								<div className="w-full h-52 bg-gradient-to-br from-secondaryDark to-secondary border border-secondary hidden lg:block" />

								<div className="mb-7 lg:mb-0 mx-auto sm:mx-0 lg:-translate-y-1/2 lg:translate-x-1/2 text-foreground bg-secondaryDark font-[700] uppercase border-2 border-accentLighter/40 hover:border-accentLighter/70 rounded-full w-max p-5 text-7xl aspect-square flex justify-center items-center">
									{getInitials(user.fullName)}
								</div>

								<div className="lg:-mt-5 px-5 flex flex-col lg:flex-row gap-10 lg:gap-52">
									<div className="flex flex-col gap-4">
										<h2 className="bg-gradient-to-b from-foreground to-neutral-400 bg-clip-text text-transparent text-3xl font-[600] mb-2 whitespace-nowrap">
											Лични данни:
										</h2>

										<p className="font-[500] text-xl">
											<span className="text-neutral-400 text-base mr-2">
												Име:
											</span>{" "}
											{user.fullName}
										</p>

										<p className="font-[500] text-xl">
											<span className="text-neutral-400 text-base mr-2">
												Email:
											</span>{" "}
											{user.email}
										</p>
									</div>

									<div className="flex flex-col gap-4">
										<h2 className="bg-gradient-to-b from-foreground to-neutral-400 bg-clip-text text-transparent text-3xl font-[600] mb-2 whitespace-nowrap">
											Точки:
										</h2>

										<p className="font-[500] text-xl">
											<span className="text-neutral-400 text-base mr-2">
												Видео монтаж:
											</span>{" "}
											{user.editingPoints} т.
										</p>

										<p className="font-[500] text-xl">
											<span className="text-neutral-400 text-base mr-2">
												Видео заснемане:
											</span>{" "}
											{user.recordingPoints} т.
										</p>

										<p className="font-[500] text-xl">
											<span className="text-neutral-400 text-base mr-2">
												Дизайн:
											</span>{" "}
											{user.designPoints} т.
										</p>
									</div>
								</div>
							</div>
						</MaxWidthWrapper>
					</div>
				</Transition>
			)}
		</>
	);
}
