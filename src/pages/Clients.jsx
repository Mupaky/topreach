import React from "react";
import MaxWidthWrapper from "@/components/others/MaxWidthWrapper";
import { Oswald } from "next/font/google";
import TransitionOnView from "@/components/others/TransitionOnView";
import ClientCard from "@/components/cards/ClientCard";

const oswald = Oswald({ subsets: ["cyrillic"] });

export default function Clients() {
	const clients = [
		{
			name: "Георги Шишков",
			link: "https://www.youtube.com/@Georgi_Shishkov",
			accomplishments: [
				"От 0 до 51 000 абоната Youtube",
				"17,000,000+ Гледания в Youtube",
				"Личен Бранд за Дрехи",
				"Много продадени курсове",
				"Лична апликация за фитнес",
				"Много продадени консултации",
				"Генериран огромен оборот (Аffiliate)",
			],
			image: 1,
		},
		{
			name: "РазЛИЧНИЯ брокер",
			link: "https://www.youtube.com/@lichen_broker",
			accomplishments: [
				"От 200 до 16 000 абоната Youtube",
				"3,500,000+ Гледания в Youtube",
				"10,750,000+ Гледания в Tik Tok",
				"Отворена Менторска Програма",
				"Направени 2 курса",
				"Много Потенциални клиенти",
			],
			image: 2,
		},
		{
			name: "НикиФит",
			link: "https://www.youtube.com/@nikfit00",
			accomplishments: [
				"От 0 до 24 000 абоната Youtube",
				"3,000,000+ Гледания в Youtube",
				"Лична Хранителна Добавка",
				"Спонсори на канала",
				"Много Потенциални клиенти",
			],
			image: 3,
		},
		{
			name: "Радослав Вълчанов",
			link: "https://www.youtube.com/@radowolf",
			accomplishments: [
				"От 0 до 5 500 абоната Youtube",
				"500,000+ Гледания в Youtube",
				"100,000 Гледаания на 3 то Видео",
				"Спонсори на канала",
			],
			image: 4,
		},
	];

	return (
		<div id="clients" className="min-h-screen bg-secondary">
			<section className="min-h-screen py-32 bg-background relative overflow-x-hidden">
				<div className="w-[30vw] h-96 absolute top-60 -right-40 bg-gradient-to-br from-[#153456] to-background blur-[100px] filter rounded-full" />

				<TransitionOnView delay={0.4}>
					<MaxWidthWrapper>
						<div className="text-center relative">
							<p className="text-base font-[600] text-neutral-400">
								/ клиенти /
							</p>
							<h2 className="text-4xl md:text-6xl font-[800] mt-2 bg-gradient-to-b from-foreground to-neutral-400 bg-clip-text text-transparent">
								Доволни клиенти
							</h2>
						</div>

						<div className="grid grid-cols-1 xl:grid-cols-2 gap-16 xl:justify-between mt-14 mx-auto">
							{clients.map((client, index) => {
								return (
									<TransitionOnView
										key={index}
										delay={0.4 + index * 0.1}
									>
										<ClientCard
											link={client.link}
											name={client.name}
											accomplishments={
												client.accomplishments
											}
											image={client.image}
										/>
									</TransitionOnView>
								);
							})}
						</div>
					</MaxWidthWrapper>
				</TransitionOnView>
			</section>
		</div>
	);
}
