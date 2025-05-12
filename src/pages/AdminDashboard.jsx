"use client";
import MaxWidthWrapper from "@/components/others/MaxWidthWrapper";
import Link from "next/link";

export default function AdminDashboard() {
	
	return (
		<section className="min-h-screen overflow-hidden pb-10 relative">
			{/* Background Gradient */}
			<div className="w-96 h-96 -z-10 absolute -top-20 -left-20 bg-gradient-to-br from-accent/40 to-background blur-[100px] filter rounded-full" />

			<MaxWidthWrapper>
				<div className="mt-32 grid grid-cols-1"> {/* Changed to grid-cols-1 for stacking */}
					{/* The Admin Dashboard */}
					<div className="flex justify-start mb-6">
					<Link href="/admin/formulas">
						<button className="px-4 py-2 bg-accent hover:bg-accentLighter text-white rounded-full shadow transition">
							Admin Dashboard
						</button>
					</Link>
					</div>
				</div> {/* End main grid */}
			</MaxWidthWrapper>
		</section>
	);
}