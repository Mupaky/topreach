// app/api/admin/adjust-user-points/route.js
import { NextResponse } from "next/server";
import { createServerClient } from "@/utils/supabase/server";
import { getSession } from "@/utils/lib";

export async function POST(req) {
    const customSession = await getSession();
    if (!customSession?.user?.role || customSession.user.role !== 'admin') { // Stricter check
        return NextResponse.json({ message: "Forbidden: Admin access required." }, { status: 403 });
    }
    const supabase = createServerClient();

    try {
        const { packageOrderId, actionType, pointsType, pointsCount, reason /*, userId */ } = await req.json();
        // userId from body can be used for an extra validation against packageOrderId's owner if desired

        if (!packageOrderId || !actionType || !pointsType || pointsCount === undefined || !reason) {
            return NextResponse.json({ message: "Missing required fields: packageOrderId, actionType, pointsType, pointsCount, or reason." }, { status: 400 });
        }
        const count = parseInt(pointsCount, 10);
        if (isNaN(count) || count <= 0) {
            return NextResponse.json({ message: "Points count must be a positive number." }, { status: 400 });
        }
        const validPointTypes = ['editingPoints', 'recordingPoints', 'designPoints', 'consultingPoints'];
        if (!validPointTypes.includes(pointsType)) {
            return NextResponse.json({ message: "Invalid points type specified." }, { status: 400 });
        }

        // Fetch the existing package order to adjust
        // RLS (admin can see all) will apply based on the supabase client's context (should be admin)
        const { data: existingOrder, error: fetchError } = await supabase
            .from("pointsorders")
            .select(`*, ${pointsType}, description, user`) // Select all and ensure specific pointsType is there
            .eq("id", packageOrderId)
            .single();

        if (fetchError || !existingOrder) {
            console.error("Adjust Points API - Existing package not found or fetch error for ID:", packageOrderId, fetchError);
            return NextResponse.json({ message: `Пакет/Поръчка с ID ${packageOrderId} не е намерена или нямате достъп.` }, { status: 404 });
        }

        // Optional: Validate if `userId` from body matches `existingOrder.user` if `userId` is passed
        // if (userId && existingOrder.user !== userId) {
        //     return NextResponse.json({ message: "User ID mismatch with selected package." }, { status: 400 });
        // }


        const currentPoints = Number(existingOrder[pointsType]) || 0;
        let newPointsTotal;

        if (actionType === 'add') {
            newPointsTotal = currentPoints + count;
        } else if (actionType === 'subtract') { // Changed to 'subtract' to match AddPoints form
            newPointsTotal = Math.max(0, currentPoints - count);
            if (currentPoints < count) {
                console.warn(`Adjust Points API: Attempted to subtract ${count} ${pointsType}, but only ${currentPoints} available in package ${packageOrderId}. Setting to 0.`);
            }
        } else {
            return NextResponse.json({ message: "Invalid action type." }, { status: 400 });
        }
        
        const actionWord = actionType === 'add' ? "Добавени" : "Извадени";
        const logEntry = `\n[${new Date().toLocaleDateString('bg-BG', {day:'2-digit',month:'2-digit',year:'numeric'})}] ${actionWord} ${count}т. (${pointsType}) от админ. Причина: ${reason}`;

        const updatePayload = {
            [pointsType]: newPointsTotal,
            description: (existingOrder.description || "") + logEntry
            // Optionally update 'status' if points become 0, e.g., to 'Използван'
            // status: newPointsTotal === 0 && pointsType !== 'lifespan' ? 'Използван' : existingOrder.status
        };

        console.log(`Adjust Points API - Updating package ${packageOrderId} with:`, updatePayload);

        const { data: updatedOrder, error: updateErr } = await supabase
            .from("pointsorders")
            .update(updatePayload)
            .eq("id", packageOrderId)
            .select("*, profiles(id, fullname, email)") // Return with profile for parent update
            .single();

        if (updateErr) {
            console.error("Adjust Points API - Update error:", updateErr);
            throw updateErr;
        }
        if (!updatedOrder) {
            throw new Error("Failed to retrieve updated order after changes.");
        }

        const updateMessage = `Точките в пакет ID ${packageOrderId} са обновени успешно.`;
        return NextResponse.json({ message: updateMessage, updatedOrder: updatedOrder });

    } catch (err) {
        console.error("API /admin/adjust-user-points Error:", err);
        const errorMessage = err.message || "Сървърна грешка при корекция на точки.";
        const errorStatus = err.status || (err.code && typeof err.code === 'string' && err.code.startsWith('PGRST') ? 400 : 500);
        return NextResponse.json({ message: errorMessage, details: err.details }, { status: errorStatus });
    }
}