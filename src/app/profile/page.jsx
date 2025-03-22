import React from "react";
import { getSession } from "@/utils/lib";
import { redirect } from "next/navigation";
import Profile from "@/pages/Profile";
import Navbar from "@/components/navbars/Navbar";

export default async function page() {
	const session = await getSession();
	let user;

	if (!session) {
		redirect("/");
	} else {
		user = session.user;
	}

	return (
		<>
			<Navbar />
			<Profile user={user} />
		</>
	);
}
