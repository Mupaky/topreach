import { NextResponse } from "next/server";
import { createClient } from "@/utils/client";

const supabase = createClient();

export async function PUT(req) {
    try {
        const { userId, pointsType, pointsCount } = await req.json();

        if (!userId || !pointsType || pointsCount === undefined) {
            return NextResponse.json(
                { message: "Missing props." },
                { status: 400 }
            );
        }

        const types = {
            "Дизайн": "designPoints",
            "Монтаж": "editingPoints",
            "Заснемане": "recordingPoints",
        };

        const type = types[pointsType];
        if (!type) {
            return NextResponse.json(
                { message: "Invalid points type." },
                { status: 400 }
            );
        }

        // Ensure pointsCount is a number
        const pointsToAdd = Number(pointsCount);
        if (isNaN(pointsToAdd) || pointsToAdd <= 0) {
            return NextResponse.json(
                { message: "Invalid points count." },
                { status: 400 }
            );
        }

        // Fetch current points
        const { data: profile, error: fetchError } = await supabase
            .from("profiles")
            .select(type)
            .eq("id", userId)
            .single();

        if (fetchError) {
            throw new Error(`Failed to fetch points: ${fetchError.message}`);
        }

        const currentPoints = profile?.[type] || 0;
        const newPointsCount = currentPoints + pointsToAdd;

        // Update the correct column dynamically
        const { error } = await supabase
            .from("profiles")
            .update({ [type]: newPointsCount }) // Fix here
            .eq("id", userId);

        if (error) {
            throw new Error(`Update failed: ${error.message}`);
        }

        return NextResponse.json(
            { message: "Points updated successfully", newPointsCount },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating points:", error);
        return NextResponse.json(
            { message: "Internal Server Error", error: error.message },
            { status: 500 }
        );
    }
}
