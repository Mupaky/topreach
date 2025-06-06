import React from "react";
import Navbar from "@/components/navbars/Navbar";
import { getSession } from "@/utils/lib";
import { redirect } from "next/navigation";
import Points from "@/pages/Points";
// import { createClient } from "@/utils/client";
import { createServerClient } from '@/utils/supabase/server';



export default async function page() {
	const supabase = createServerClient();
	const session = await getSession();
	let user, data;

	if (!session) {
		redirect("/");
	} else {
		user = session.user;

		const { data: packagesData, error: fetchError } = await supabase
			.from("pointsPackages")
			.select();
		console.log("Fetched pointsPackages:", packagesData);

		if (fetchError) {
			throw new Error(
				`Failed to fetch points packages: ${fetchError.message}`
			);
		}

		data = packagesData;
	}

	return (
		<>
			<Points data={data} email={user.email} name={user.fullName} userId={user.id} />
		</>
	);
}
