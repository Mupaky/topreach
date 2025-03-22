import { NextResponse } from "next/server";
import { createClient } from "@/utils/client";

const supabase = createClient();

export async function PUT(req) {
    try {
        const { packageId, editingPoints, designPoints, recordingPoints, price } = await req.json();

        if (!packageId || !editingPoints || !designPoints || !recordingPoints || !price) {
            return NextResponse.json(
                { message: "Missing props." },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("pointsPackages")
            .update({
                'editingPoints': editingPoints,
                'designPoints': designPoints,
                'recordingPoints': recordingPoints,
                'price': price,
            })
            .eq('id', packageId)

        if (error) {
            throw error;
        }

        return NextResponse.json(
            { message: "Package updated successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating package:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
