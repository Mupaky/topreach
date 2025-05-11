import { getSession } from "@/utils/lib";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbars/Navbar";
import Home from "@/pages/Home";
import { createClient } from "@/utils/client";
import AdminDashboard from "@/pages/AdminDashboard";

const supabase = createClient();

export default async function Page() {
	const session = await getSession();
	let user, orders;

	let vlogOrders,
		tiktokOrders,
		thumbnailOrders,
		recordingOrders,
		profiles,
		pointsOrders,
		packages;

	if (!session) {
		console.log("❌ No session found. Redirecting to /");
		redirect("/");
	} else {
		user = session.user;

		if (user.role == "admin") {

			console.log("🔐 Admin access granted");

			const { data: vlogOrdersData, error: fetchErrorVlog } =
				await supabase.from("vlogOrders").select();

			if (fetchErrorVlog) {
				throw new Error(
					`Failed to fetch vlog orders: ${fetchErrorVlog.message}`
				);
			}

			const { data: tiktokOrdersData, error: fetchErrorTiktok } =
				await supabase.from("tiktokOrders").select();

			if (fetchErrorTiktok) {
				throw new Error(
					`Failed to fetch tiktok orders: ${fetchErrorTiktok.message}`
				);
			}

			const { data: thumbnailOrdersData, error: fetchErrorThumbnail } =
				await supabase.from("thumbnailOrders").select();

			if (fetchErrorThumbnail) {
				throw new Error(
					`Failed to fetch thumbnail orders: ${fetchErrorThumbnail.message}`
				);
			}

			const { data: recordingOrdersData, error: fetchErrorRecording } =
				await supabase.from("recordings").select();

			if (fetchErrorRecording) {
				throw new Error(
					`Failed to fetch recording orders: ${fetchErrorRecording.message}`
				);
			}

			const { data: profilesData, error: fetchErrorProfiles } =
				await supabase.from("profiles").select();

			if (fetchErrorProfiles) {
				throw new Error(
					`Failed to fetch profiles: ${fetchErrorProfiles.message}`
				);
			}

			const { data: pointsData, error: fetchErrorPoints } = await supabase
				.from("pointsorders")
				.select("*");

			if (fetchErrorProfiles) {
				throw new Error(
					`Failed to fetch points orders: ${fetchErrorPoints.message}`
				);
			}

			const { data: packagesData, error: fetchErrorPackages } =
				await supabase.from("pointsPackages").select();

			if (fetchErrorPackages) {
				throw new Error(
					`Failed to fetch points packages: ${fetchErrorPackages.message}`
				);
			}

			vlogOrders = vlogOrdersData;
			tiktokOrders = tiktokOrdersData;
			thumbnailOrders = thumbnailOrdersData;
			recordingOrders = recordingOrdersData;
			profiles = profilesData;
			pointsOrders = pointsData;
			packages = packagesData;
		} else {

			console.log("👤 Regular user detected:", user.email);

			const { data, error: fetchError } = await supabase
				.from("profiles")
				.select("id")
				.eq("email", user.email)
				.single();

			if (fetchError) {
				throw new Error(
					`Failed to fetch user id: ${fetchError.message}`
				);
			}

			const id = data.id;

			const { data: vlogOrders, error: vlogFetchError } = await supabase
				.from("vlogOrders")
				.select("id, created_at, price, status")
				.eq("user", id);

			if (vlogFetchError) {
				throw new Error(
					`Failed to fetch vlog orders: ${vlogFetchError.message}`
				);
			}

			const { data: tiktokOrders, error: tiktokFetchError } =
				await supabase
					.from("tiktokOrders")
					.select("id, created_at, price, status")
					.eq("user", id);

			if (tiktokFetchError) {
				throw new Error(
					`Failed to fetch tiktok orders: ${tiktokFetchError.message}`
				);
			}

			const { data: thumbnailOrders, error: thumbnailFetchError } =
				await supabase
					.from("thumbnailOrders")
					.select("id, created_at, price, status")
					.eq("user", id);

			if (thumbnailFetchError) {
				throw new Error(
					`Failed to fetch thumbnail orders: ${thumbnailFetchError.message}`
				);
			}

			const { data: recordingOrders, error: recordingFetchError } =
				await supabase
					.from("recordings")
					.select("id, created_at, price, status")
					.eq("user", id);

			if (thumbnailFetchError) {
				throw new Error(
					`Failed to fetch recording orders: ${recordingFetchError.message}`
				);
			}

			const { data: pointsOrders, error: pointsFetchError } =
				await supabase
					.from("pointsorders")
					.select("id, created_at, price, status")
					.eq("user", id);

			if (thumbnailFetchError) {
				throw new Error(
					`Failed to fetch points orders: ${pointsFetchError.message}`
				);
			}

			orders = {
				vlogOrders: vlogOrders || [],
				tiktokOrders: tiktokOrders || [],
				thumbnailOrders: thumbnailOrders || [],
				recordingOrders: recordingOrders || [],
				pointsOrders: pointsOrders || [],
			  };
		}
	}

	return (
		<>
			<Navbar />
			{user.role == "admin" ? (
				<AdminDashboard
					vlogOrdersData={vlogOrders}
					tiktokOrdersData={tiktokOrders}
					thumbnailOrdersData={thumbnailOrders}
					recordingOrdersData={recordingOrders}
					profilesData={profiles}
					pointsOrdersData={pointsOrders}
					packagesData={packages}
				/>
			) : (
				<Home user={user} orders={orders} />
			)}
		</>
	);
}
