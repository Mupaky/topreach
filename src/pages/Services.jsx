import React from "react";
import MaxWidthWrapper from "@/components/others/MaxWidthWrapper";
import ServiceCard from "@/components/cards/ServiceCard";
import { Oswald } from "next/font/google";
import TransitionOnView from "@/components/others/TransitionOnView";
import clsx from "clsx";

const oswald = Oswald({ subsets: ["cyrillic"] });

// To-do:
// - add href to landing link

export default function Services() {
	const services = [
		{
			iconValue: "editing",
			heading: "Видео монтаж",
			body: "Създаваме впечатляващи видеа чрез професионален монтаж, които разказват вашата история и ангажират аудиторията.",
			link: "/auth/signup",
		},
		{
			iconValue: "recording",
			heading: "Видео заснемане",
			body: "Заснемаме висококачествени видеа за събития, реклами и презентации с внимание към всеки детайл.",
			link: "/auth/signup",
		},
		{
			iconValue: "design",
			heading: "Дизайн",
			body: "Дизайни, които привличат внимание – от лога до уеб и графични проекти, съобразени с вашия бранд.",
			link: "/auth/signup",
		},
	];

	return (
		<div className="min-h-screen">
			<TransitionOnView delay={0.2}>
				<section className="min-h-screen py-32 bg-background rounded-t-2xl relative">
					<div className="w-[30vw] h-96 absolute -left-20 bg-gradient-to-br from-[#153456] to-background blur-[100px] filter rounded-full" />

					<MaxWidthWrapper>
						<div className="flex flex-col gap-4 relative">
							<p className="text-base font-[600] text-neutral-400">
								/ услуги /
							</p>

							<h2 className="text-4xl md:text-6xl font-[800] bg-gradient-to-b from-foreground to-neutral-400 bg-clip-text text-transparent">
								Нашите услуги
							</h2>

							<p className="hidden md:block text-balance mt-2 max-w-6xl">
								Нашият екип от опитни професионалисти предлага
								индивидуален подход и внимателно изработени
								решения, съобразени с вашите уникални нужди и
								цели. Доверете се на нашия опит за успешни
								резултати.
							</p>

							<p className="md:hidden text-balance mt-2 max-w-6xl">
								Нашият екип от опитни професионалисти предлага
								индивидуален подход и внимателно изработени
								решения, съобразени с вашите нужди и цели.
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 mt-10 relative">
							{services.map((service, index) => {
								return (
									<ServiceCard
										key={index}
										iconValue={service.iconValue}
										heading={service.heading}
										body={service.body}
										link={service.link}
										className={clsx(
											index == 2 &&
												"col-span-1 md:col-span-2 lg:col-span-1"
										)}
									/>
								);
							})}
						</div>
					</MaxWidthWrapper>
				</section>
			</TransitionOnView>
		</div>
	);
}
