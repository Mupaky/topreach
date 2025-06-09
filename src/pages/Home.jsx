// src/pages/Home.jsx
"use client";

import { useEffect, useState } from "react";
import Transition from "@/components/others/Transition";
import PointsCard from "@/components/cards/PointsCard";
import Button from "@/components/others/Button";
import { Button as ShadButton } from "@/components/ui/button";
import MaxWidthWrapper from "@/components/others/MaxWidthWrapper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFilm, faVideoCamera, faImage, faMobileScreenButton, // More specific icons
    faLightbulb, // For Consulting/Strategy
    faTools, // For general editing/production
    faChartLine, // For growth/results
    faBullhorn, // For marketing/ads
    faPlusCircle,
    faBoxOpen,
    faBrain // Keep for consulting points balance
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { BeatLoader } from "react-spinners";

export default function Home({ user }) {
    const [editingPoints, setEditingPoints] = useState(0);
    const [recordingPoints, setRecordingPoints] = useState(0);
    const [designPoints, setDesignPoints] = useState(0);
    const [consultingPoints, setConsultingPoints] = useState(0);
    const [isFetchingPoints, setIsFetchingPoints] = useState(true);

    const firstName = user?.fullName?.split(" ")[0] || "Потребител";

    useEffect(() => {
        async function fetchPointsForType(userId, type) {
            try {
                const response = await fetch(`/api/activePoints?userId=${userId}&type=${type}`);
                if (!response.ok) {
                    const errorText = await response.text(); console.error(`[Home] API Error ${type}:`, errorText); return { total: 0 };
                }
                return await response.json();
            } catch (err) { console.error(`[Home] Catch Error ${type}:`, err); return { total: 0 }; }
        }
        async function loadAllPoints() {
            if (!user?.id) {
                setEditingPoints(0); setRecordingPoints(0); setDesignPoints(0); setConsultingPoints(0);
                setIsFetchingPoints(false); return;
            }
            setIsFetchingPoints(true);
            const types = ['editingPoints', 'recordingPoints', 'designPoints', 'consultingPoints'];
            try {
                const results = await Promise.all(types.map(type => fetchPointsForType(user.id, type)));
                setEditingPoints(results[0]?.total || 0);
                setRecordingPoints(results[1]?.total || 0);
                setDesignPoints(results[2]?.total || 0);
                setConsultingPoints(results[3]?.total || 0);
            } catch (err) {
                console.error("❌ [Home] Error in loadAllPoints:", err);
                setEditingPoints(0); setRecordingPoints(0); setDesignPoints(0); setConsultingPoints(0);
            } finally { setIsFetchingPoints(false); }
        }
        if (user?.id) { loadAllPoints(); } else { setIsFetchingPoints(false); }
    }, [user?.id]);

    const serviceCategories = [
        {
            title: "Професионално Видео Заснемане",
            description: "От идея до реализация, нашият екип ще заснеме вашето събитие, продукт или влог с най-високо качество. Гъвкави слотове и опции за локация.",
            icon: faVideoCamera,
            link: "/formulas", // Example link
            linkText: "Резервирай Заснемане"
        },
        {
            title: "Видео Монтаж от Експерти",
            description: "Превърнете суровите си кадри във въздействащо видео. Предлагаме детайлна обработка, ефекти, цветови корекции и адаптиране за всяка платформа.",
            icon: faTools, // Or faFilm / faMagic
            link: "/formulas?category=editing", // Example link to formula page filtered for editing
            linkText: "Към Услугите за Монтаж"
        },
        {
            title: "Дизайн на Thumbnails & Графики",
            description: "Привлечете повече кликове с уникални и професионално изработени thumbnails. Предлагаме стандартни, премиум и A/B тестови варианти.",
            icon: faImage, // Or faPenNib
            link: "/formulas?category=design", // Example link
            linkText: "Дизайнерски Услуги"
        },
        {
            title: "TikTok & Shorts Видеа",
            description: "Създайте ангажиращо съдържание за къси формати. От базови субтитри до сложни видеа с motion graphics, които грабват вниманието.",
            icon: faMobileScreenButton, // More specific than faTiktok from brands
            link: "/formulas?category=tiktok", // Example link
            linkText: "Създай TikTok Видео"
        },
        {
            title: "Стратегически Консултации",
            description: "Нуждаете се от насоки за вашето видео съдържание? Възползвайте се от нашия опит за стратегия, оптимизация и растеж на вашия канал.",
            icon: faLightbulb, // Or faBrain
            link: "/formulas?category=consulting", // Example link
            linkText: "Заяви Консултация"
        }
    ];

    const pointsData = [
        { points: editingPoints, text: "Видео монтаж", icon: faFilm, delay: 0.2 },
        { points: recordingPoints, text: "Видео заснемане", icon: faVideoCamera, delay: 0.3 },
        { points: designPoints, text: "Дизайн", icon: faImage, delay: 0.4 },
        { points: consultingPoints, text: "Консултации", icon: faBrain, delay: 0.5 },
    ];


    return (
        <>
            {user && (
                <Transition delay={0.1} blur={0}>
                    <section className="min-h-screen bg-background text-foreground overflow-hidden pb-16 pt-28 md:pt-36">
                        <MaxWidthWrapper className="space-y-12 md:space-y-20">

                            {/* Hero/Welcome Section */}
                            <div className="text-center space-y-3 relative">
                                <div className="w-full h-80 md:h-96 absolute -top-20 md:-top-24 left-1/2 -translate-x-1/2 bg-gradient-to-br from-accent/50 via-background to-background blur-[120px] filter rounded-full -z-10 opacity-70" />
                                {user.role === "admin" && (
                                    <div className="mb-8">
                                        <Link href="/admin/formulas">
                                            <ShadButton variant="default" className="bg-accent hover:bg-accentLighter text-white rounded-full shadow-lg transition-colors duration-300 px-8 py-3 text-base font-semibold">
                                                Админ Панел
                                            </ShadButton>
                                        </Link>
                                    </div>
                                )}
                                <h1 className="font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
                                    {firstName ? `Здравейте, ${firstName}!` : "Добре дошли в TopReach!"}
                                </h1>
                                <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto">
                                    Ние превръщаме вашите идеи във въздействащи видеа, които разширяват аудиторията и увеличават продажбите.
                                </p>
                            </div>

                            {/* Points Balances Section */}
                            <div className="w-full">
                                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-100 mb-6 text-center sm:text-left">Вашият Баланс Точки</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                    {pointsData.map((pData) => (
                                        <Transition key={pData.text} delay={pData.delay}>
                                            <PointsCard
                                                points={isFetchingPoints ? <BeatLoader size={10} color="#8B5CF6"/> : pData.points}
                                                text={pData.text}
                                                icon={pData.icon}
                                            />
                                        </Transition>
                                    ))}
                                </div>
                                <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                                     <Link href="/points">
                                        <ShadButton size="lg" className="bg-accent hover:bg-accentLighter text-white font-semibold px-8 py-3 text-base rounded-lg shadow-lg w-full sm:w-auto">
                                            <FontAwesomeIcon icon={faPlusCircle} className="mr-2" /> Купи още Точки
                                        </ShadButton>
                                    </Link>
                                    <Link href="/my-orders">
                                        <ShadButton variant="outline" size="lg" className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 font-semibold px-8 py-3 text-base rounded-lg w-full sm:w-auto">
                                            <FontAwesomeIcon icon={faBoxOpen} className="mr-2" /> Моите Поръчки
                                        </ShadButton>
                                    </Link>
                                </div>
                            </div>

                            {/* Services Overview Section */}
                            <div className="pt-10 border-t border-gray-700/50">
                                <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-100 mb-10 md:mb-12">
                                    Нашите Услуги
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                    {serviceCategories.slice(0, 3).map((service, index) => ( // Show first 3 prominently
                                        <Transition key={service.title} delay={0.2 + index * 0.1}>
                                            <div className="bg-gray-800/70 backdrop-blur-sm border border-secondary p-6 rounded-xl shadow-xl hover:shadow-accent/20 transition-shadow duration-300 flex flex-col h-full">
                                                <FontAwesomeIcon icon={service.icon} className="text-accent text-3xl mb-4" />
                                                <h3 className="text-xl font-semibold text-white mb-2">{service.title}</h3>
                                                <p className="text-sm text-neutral-400 flex-grow mb-4">{service.description}</p>
                                                <Link href={service.link || "/formulas"} className="mt-auto">
                                                    <ShadButton variant="outline" className="w-full border-accent/70 text-accentLighter hover:bg-accent/10 hover:text-accent">
                                                        {service.linkText || "Научи повече"}
                                                    </ShadButton>
                                                </Link>
                                            </div>
                                        </Transition>
                                    ))}
                                </div>
                                {/* Link to all services if more than 3 */}
                                {serviceCategories.length > 3 && (
                                     <div className="text-center mt-10">
                                        <Link href="/formulas"> {/* You'll need a /services page */}
                                            <ShadButton size="lg" className="bg-transparent border-2 border-accent text-accentLighter hover:bg-accent hover:text-white transition-all font-semibold px-10 py-3">
                                                Разгледай Всички Услуги
                                            </ShadButton>
                                        </Link>
                                    </div>
                                )}
                            </div>
                            <Transition delay={0.7}>
                                <div className="mt-12 text-center border-t border-gray-700/30 pt-12">
                                    <FontAwesomeIcon icon={faChartLine} className="text-accent text-4xl mb-4" />
                                    <h3 className="text-2xl font-semibold text-white mb-2">
                                        Готов ли си да достигнеш нови върхове?
                                    </h3>
                                    <p className="text-neutral-400 max-w-lg mx-auto mb-6">
                                        Ние сме тук, за да ти помогнем да създадеш видео съдържание, което ангажира, вдъхновява и продава.
                                    </p>
                                    <Link href="/formulas">
                                        <ShadButton size="lg" className="bg-accent hover:bg-accentLighter text-white font-bold px-10 py-3 text-lg rounded-lg shadow-xl">
                                            Започни Проект Сега
                                        </ShadButton>
                                    </Link>
                                </div>
                            </Transition>

						</MaxWidthWrapper>
					</section>
				</Transition>
			)}
		</>
	);
}