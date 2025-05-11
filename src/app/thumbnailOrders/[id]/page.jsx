import { getSession } from "@/utils/lib";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/client";
import Navbar from "@/components/navbars/Navbar";
import ThumbnailOrderView from "@/pages/ThumbnailOrderView";

const supabase = createClient();

export default async function page({ params }) {
	const id = (await params).id;
	const session = await getSession();
	let user, order;

	if (!session) {
		redirect("/");
	} else {
		user = session.user;

		const { data: userData, error } = await supabase
			.from("profiles")
			.select("id")
			.eq("email", user.email)
			.single();

		if (error) {
			throw new Error(`Failed to fetch user id: ${error.message}`);
		}

		const { data, error: fetchError } = await supabase
			.from("thumbnailOrders")
			.select()
			.eq("id", id)
			.single();

		if (fetchError) {
			throw new Error(`Failed to fetch order: ${fetchError.message}`);
		}

		if (
			data.user != userData.id &&
			user.role != "admin"
		) {
			redirect("/home");
		}

		order = data;
	}

	return (
		<>
			<Navbar />
			<ThumbnailOrderView data={order} />
		</>
	);
}
