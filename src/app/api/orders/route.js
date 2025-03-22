import { NextResponse } from "next/server";
import { createClient } from "@/utils/client";

const supabase = createClient();

export async function PUT(req) {
	try {
		const { orderId, newStatus, type } = await req.json();

		if (!orderId || !newStatus) {
			return NextResponse.json(
				{ message: "Missing orderId or newStatus" },
				{ status: 400 }
			);
		}

		const { data, error } = await supabase
            .from(type)
            .update({'status': newStatus})
            .eq('id', orderId)

        if (error) {
            throw error;
        }

		return NextResponse.json(
			{ message: "Order status updated successfully" },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error updating order status:", error);
		return NextResponse.json(
			{ message: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
