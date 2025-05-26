import { NextResponse } from "next/server";
import { createServerClient } from "@/utils/supabase/server";

const supabase = createServerClient ();


export async function POST(req) {
    const body = await req.json();

    async function deductPointsFromPackages(userId, pointType, amountToDeduct) {
        if (!["editingPoints", "recordingPoints", "designPoints"].includes(pointType)) {
            throw new Error(`Невалиден тип точки: ${pointType}`);
        }

        // Fetch all user's packages
        const { data: pointPackages, error } = await supabase
            .from("pointsorders")
            .select("*")
            .eq("user", userId);

        if (error || !pointPackages) {
            throw new Error("Неуспешно извличане на точковите пакети.");
        }

        const now = new Date();

        // Filter for valid and active packages and sort by soonest expiring
        const sortedPackages = pointPackages
            .map(pkg => {
                const createdAt = new Date(pkg.created_at);
                const expiration = new Date(createdAt.getTime() + pkg.lifespan * 24 * 60 * 60 * 1000);
                return { ...pkg, expiration };
            })
            .filter(pkg => pkg.expiration > now && pkg[pointType] > 0)
            .sort((a, b) => a.expiration - b.expiration);

        let remaining = amountToDeduct;

        for (const pkg of sortedPackages) {
            if (remaining <= 0) break;

            const available = pkg[pointType];
            const toUse = Math.min(remaining, available);
            const newValue = available - toUse;

            const { error: updateError } = await supabase
                .from("pointsorders")
                .update({ [pointType]: newValue })
                .eq("id", pkg.id);

            if (updateError) {
                throw new Error(`Грешка при обновяване на пакет: ${updateError.message}`);
            }

            remaining -= toUse;
        }

        if (remaining > 0) {
            throw new Error(`Недостатъчно точки за ${pointType}. Нужни: ${amountToDeduct}`);
        }
    }

    const pointTypeMap = {
		vlog: "editingPoints",
		tiktok: "editingPoints",
		recording: "recordingPoints",
		thumbnail: "designPoints"
	};
    

    if (body.type === "points") {
        if (!body.userId) {
        return NextResponse.json(
            { message: "Липсва userId за точковата поръчка." },
            { status: 400 }
        );
    }

        body.user = body.userId;
		delete body.userId;
		delete body.type;
        delete body.email;

		if (!body.lifespan || isNaN(parseInt(body.lifespan))) {
			return NextResponse.json(
				{ message: "Missing or invalid lifespan for points package." },
				{ status: 400 }
			);
		}

		body.lifespan = parseInt(body.lifespan, 10);

        //Add info to description field
        const descParts = [];

        if (body.editingPoints) descParts.push(`Видео монтаж: ${body.editingPoints}т`);
        if (body.recordingPoints) descParts.push(`Видео заснемане: ${body.recordingPoints}т`);
        if (body.designPoints) descParts.push(`Дизайн: ${body.designPoints}т`);
        if (body.price) descParts.push(`Цена: ${body.price}лв`);
        if (body.lifespan) descParts.push(`Валидност: ${body.lifespan} дни`);
        body.description = descParts.join(" | ");

		const { error } = await supabase.from("pointsorders").insert(body);

		if (error) {
            console.error("❌ Error inserting pointsorder:", error); // ⬅️ Log it
			return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 });
		}
        console.log("✅ Successfully inserted pointsorder", body); // ⬅️ Add success log too
	} else {
		const pointType = pointTypeMap[body.type];

		if (!pointType) {
			return NextResponse.json({ message: "Невалиден тип поръчка." }, { status: 400 });
		}

		try {
			await deductPointsFromPackages(body.userId, pointType, body.price);
		} catch (err) {
			return NextResponse.json({ message: err.message }, { status: 400 });
		}

		const tableMap = {
			vlog: "vlogOrders",
			tiktok: "tiktokOrders",
			recording: "recordings",
			thumbnail: "thumbnailOrders"
		};

		const tableName = tableMap[body.type];
        body.user = body.userId;
        delete body.userId;
		delete body.type;

        // if there is need to initialize more field add them below
        if (!body.status) {
            body.status = "Приета";
        }

		const { error } = await supabase.from(tableName).insert(body);

		if (error) {
			return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 });
		}
	}

	return NextResponse.json({ message: "Поръчката беше регистрирана." });
}
