import React from "react";
import SignUpForm from "@/components/forms/SignUpForm";
import GuestNavbar from "@/components/navbars/GuestNavbar";
import { getSession } from "@/utils/lib";
import { redirect } from "next/navigation";
import Transition from "@/components/others/Transition";

export default async function Page() {
	const session = await getSession();

	if (session) {
		redirect("/home");
	}

	return (
		<>
			<section className="min-h-screen w-screen bg-background">
				<GuestNavbar />
				<div className="py-24 flex justify-center items-center h-full relative">
					<div className="w-96 h-96 absolute -top-20 -left-20 bg-gradient-to-br from-[#153456] to-background blur-[100px] filter rounded-full" />

					<Transition
						blur={5}
						delay={0.2}
						className="w-full md:w-max"
					>
						{/* <SignUpForm /> */}
					</Transition>
				</div>
			</section>
		</>
	);
}
