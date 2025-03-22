import React from "react";
import Navbar from "@/components/navbars/Navbar";
import { getSession } from "@/utils/lib";
import { redirect } from "next/navigation";
import ThumbnailOrder from "@/pages/ThumbnailOrder";

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
			<ThumbnailOrder user={user} />
		</>
	);
}
