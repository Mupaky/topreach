import React from "react";
import { Oswald } from "next/font/google";
import MaxWidthWrapper from "./MaxWidthWrapper";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faFacebookF } from "@fortawesome/free-brands-svg-icons";
import TopReachLogo from "../../../public/topreachlogo.png";
import Image from "next/image";

const oswald = Oswald({ subsets: ["cyrillic"] });

// To-do
// - input hrefs in links

export default function Footer() {
	return (
		<footer className="bg-background border-t border-secondary py-7">
			<MaxWidthWrapper>
				<div className="flex flex-col md:flex-row justify-between">
					<div className="text-foreground flex flex-col gap-3 mb-8 md:mb-0">
						<Image
							className="max-w-32 opacity-90"
							src={TopReachLogo}
							alt="Top Reach"
						/>

						<p className="text-sm">
							&copy; 2025 Top Reach. All rights reserved
						</p>
					</div>

					<div className="flex flex-col sm:flex-row gap-20 text-background">
						{/* <div className="flex flex-col gap-2">
							<h4 className="footer-heading">Видео услуги</h4>
							<Link className="footer-link" href="">
								Видео монтаж на влог
							</Link>
							<Link className="footer-link" href="">
								Видео монтаж на TikTok
							</Link>
							<Link className="footer-link" href="">
								Видео заснемане
							</Link>
						</div>

						<div className="flex flex-col gap-2">
							<h4 className="footer-heading">Дизайн услуги</h4>
							<Link className="footer-link" href="">
								Thumbnail дизайн
							</Link>
							<Link className="footer-link" href="">
								Лого дизайн
							</Link>
							<Link className="footer-link" href="">
								Пост дизайн
							</Link>
						</div> */}

						<div className="flex flex-col gap-2">
							<h4 className="footer-heading">Социални</h4>
							<div className="flex gap-5">
								<Link
									className="footer-icon"
									target="_blank"
									href="https://www.facebook.com/TopReachStudio"
								>
									<FontAwesomeIcon
										size="xl"
										icon={faFacebookF}
									/>
								</Link>
								<Link
									className="footer-icon"
									target="_blank"
									href="https://www.instagram.com/topreachstudio/"
								>
									<FontAwesomeIcon
										size="xl"
										icon={faInstagram}
									/>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</MaxWidthWrapper>
		</footer>
	);
}
