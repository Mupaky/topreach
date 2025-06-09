// app/api/createOrder/route.js
import { NextResponse } from "next/server";
import { createServerClient } from "@/utils/supabase/server"; 
import { getSession } from "@/utils/lib"; 
export async function POST(req) {
    const supabase = createServerClient();
    const customSession  = await getSession();

    if (!customSession || !customSession.user || !customSession.user.id) {
        console.error("API spend-points: No custom session or user ID missing.");
        return NextResponse.json({ message: "Authentication required or session invalid." }, { status: 401 });
    }
    const requesterSupabaseId = customSession.user.id;
    const loggedInUserRole = customSession.user.role;


    try {
        const body = await req.json();
        const {
            userId,
            price,
            editingPoints,
            recordingPoints,
            designPoints,
            consultingPoints, 
            lifespan,
            status = "Чака плащане", 
        } = body;

        if (requesterSupabaseId !== userId && loggedInUserRole !== 'admin') {
            console.warn(`API /createOrder: Requester ${requesterSupabaseId} trying to buy for ${userId}. Forbidden.`);
            return NextResponse.json({ message: "You can only purchase packages for yourself." }, { status: 403 });
        }

        if (userId === undefined || price === undefined || 
            editingPoints === undefined || recordingPoints === undefined || 
            designPoints === undefined || consultingPoints === undefined || 
            lifespan === undefined) {
            return NextResponse.json(
                { message: "Missing required fields for points order creation." },
                { status: 400 }
            );
        }

        const descParts = [];
        if (editingPoints > 0) descParts.push(`Видео монтаж: ${editingPoints}т.`);
        if (recordingPoints > 0) descParts.push(`Видео заснемане: ${recordingPoints}т.`);
        if (designPoints > 0) descParts.push(`Дизайн: ${designPoints}т.`);
        if (consultingPoints > 0) descParts.push(`Консултации: ${consultingPoints}т.`);
        if (price) descParts.push(`Цена: ${price}лв.`);
        if (lifespan) descParts.push(`Валидност: ${lifespan} дни.`);
        const autoDescription = descParts.length > 0 ? descParts.join(" | ") : "Закупуване на пакет точки";


        const orderToInsert = {
            user: userId,
            price: parseFloat(price) || 0,
            editingPoints: parseInt(editingPoints, 10) || 0,
            recordingPoints: parseInt(recordingPoints, 10) || 0,
            designPoints: parseInt(designPoints, 10) || 0,
            consultingPoints: parseInt(consultingPoints, 10) || 0,
            lifespan: parseInt(lifespan, 10),
            status: status,
            description: autoDescription,
        };

        console.log("API /createOrder: Attempting to insert pointsorder:", JSON.stringify(orderToInsert, null, 2));

        const { data: newPointsOrder, error: insertError } = await supabase
            .from("pointsorders")
            .insert([orderToInsert])
            .select("id, user, price, status, created_at, editingPoints, recordingPoints, designPoints, consultingPoints, lifespan") // Select all relevant fields
            .single();

        if (insertError) {
            console.error("API /createOrder - Supabase Insert error:", JSON.stringify(insertError, null, 2));
            if (insertError.code === '42501' || insertError.message?.includes('violates row-level security policy')) {
                return NextResponse.json({ message: "RLS: Забранено създаването на тази поръчка.", details: insertError.message }, { status: 403 });
            }
            return NextResponse.json(
                { message: "База данни: " + insertError.message, details: insertError.details },
                { status: 500 }
            );
        }
        if (!newPointsOrder) {
            console.error("API /createOrder - No data returned after pointsorder insert (unexpected).");
            return NextResponse.json({ message: "Неуспешно извличане на създадената поръчка." }, { status: 500 });
        }

        console.log("API /createOrder: Points order created successfully:", newPointsOrder.id);
        return NextResponse.json(
            { message: "Поръчката за точки е създадена успешно!", order: newPointsOrder },
            { status: 201 }
        );

    } catch (error) {
        console.error("API /createOrder - Catch block error:", error);
        if (error instanceof SyntaxError) {
            return NextResponse.json({ message: "Невалидно тяло на заявката (JSON)." }, { status: 400 });
        }
        return NextResponse.json({ message: "Сървърна грешка при създаване на поръчка.", error: error.message }, { status: 500 });
    }
}