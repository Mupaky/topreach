import { getSession } from "@/utils/lib";
import { redirect } from "next/navigation";
import GuestNavbar from "@/components/navbars/GuestNavbar";
import Hero from "@/pages/Hero";
import Services from "@/pages/Services";
import Clients from "@/pages/Clients";
import CTA from "@/pages/CTA";

export default async function Page() {
	const session = await getSession();

	if (session) {
		redirect("/home");
	}

	return (
		<>
			<GuestNavbar />

			<div className="bg-background relative overflow-hidden">
				<div className="w-96 h-96 absolute -top-20 -left-20 bg-gradient-to-br from-[#153456] to-background blur-[100px] filter rounded-full" />

				<div className="w-96 h-96 absolute top-52 -right-44 bg-gradient-to-l from-[#153456] to-background blur-[100px] filter rounded-full" />

				<Hero />
			</div>

			<Services />
			<Clients />

			<div className="pt-10 pb-24">
				<CTA />
			</div>
		</>
	);
}
