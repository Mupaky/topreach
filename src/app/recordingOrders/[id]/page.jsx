import { getSession } from "@/utils/lib";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/client";
import Navbar from "@/components/navbars/Navbar";
import RecordingOrderView from "@/pages/RecordingOrderView";

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
			.from("recordings")
			.select()
			.eq("id", id)
			.single();

		if (fetchError) {
			throw new Error(`Failed to fetch order: ${fetchError.message}`);
		}

		if (
			data.user != userData.id &&
			user.email != "topreachstudio@gmail.com"
		) {
			redirect("/home");
		}

		order = data;
	}

	return (
		<>
			<Navbar />
			<RecordingOrderView data={order} />
		</>
	);
}
