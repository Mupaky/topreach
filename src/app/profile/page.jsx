import { getSession } from "@/utils/lib";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/client";
import Navbar from "@/components/navbars/Navbar";
import Profile from "@/pages/Profile";

const supabase = createClient();

export default async function page() {
	const session = await getSession();
	if (!session) redirect("/");

	const { user } = session;
	console.log("Session user:", session.user); // ✅ Log this

	const { data: pointsOrders, error: pointOrdersError } = await supabase
		.from("pointsorders")
		.select("*")
		.eq("user", user.id);

	console.log("Fetched point orders:", pointsOrders);
	if (pointOrdersError) {
		console.error("Error fetching point orders:", pointOrdersError.message);
	  }

	return (
		<>
			<Navbar />
			<Profile user={user} pointsOrders={pointsOrders || []} />
		</>
	);
}
