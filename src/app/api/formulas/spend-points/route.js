// app/api/formulas/spend-points/route.js
import { NextResponse } from "next/server";
import { getSession } from "@/utils/lib"; 
import { createServerClient } from '@/utils/supabase/server'; 

export async function POST(req) {
    const supabase = createServerClient();

    const sessionData = await getSession();

    if (!sessionData || !sessionData.user || !sessionData.user.id) { 
        console.error("SERVER LOG: No custom session found or user/user.id missing in session.");
        return NextResponse.json({ message: "Authentication required or session invalid." }, { status: 401 });
    }

    const currentUser = sessionData.user;
    const currentUserId = currentUser.id; 

    try {
        const body = await req.json();
        const {
            pointsToSpend,
            pointsType,
            formulaId,
            formulaName,
            filledValues,
            formulaFields
        } = body;

        if (!pointsType || !formulaId || !formulaName || pointsToSpend === undefined) { 
            return NextResponse.json(
                { message: "Missing required fields: pointsToSpend, pointsType, formulaId, or formulaName." },
                { status: 400 }
            );
        }

        if (typeof pointsToSpend !== 'number' || pointsToSpend < 0) {
             return NextResponse.json(
                { message: "Points to spend must be a non-negative number." },
                { status: 400 }
            );
        }

        
        if (pointsToSpend > 0) { // Only deduct if there's an actual cost
            const now = new Date();
            const { data: activePackages, error: fetchError } = await supabase
                .from("pointsorders")
                .select("*")
                .eq("user", currentUserId) //
                .eq("status", "Активен")
                .gt(pointsType, 0) // Only packages that have points of the required type
                .order("created_at", { ascending: true }); // Oldest first

            if (fetchError) {
                console.error("SERVER LOG: Error fetching active packages for deduction:", fetchError);
                return NextResponse.json({ message: "Грешка в базата данни при извличане на пакети с точки." }, { status: 500 });
            }

            const validPackages = activePackages.filter(pkg => {
                if (!pkg.created_at || typeof pkg.lifespan !== 'number') return false; // Basic sanity check
                const createdAt = new Date(pkg.created_at);
                const expiryDate = new Date(new Date(createdAt).setDate(createdAt.getDate() + pkg.lifespan));
                return expiryDate >= now;
            });

            if ((!validPackages || validPackages.length === 0) && pointsToSpend > 0) {
                return NextResponse.json({ message: `Нямате активни и валидни пакети с ${pointsType} за покриване на разхода.` }, { status: 400 });
            }

            let totalAvailablePointsInValidPackages = 0;
            validPackages.forEach(pkg => totalAvailablePointsInValidPackages += (pkg[pointsType] || 0));

            if (pointsToSpend > 0 && totalAvailablePointsInValidPackages < pointsToSpend) {
                return NextResponse.json(
                    { message: `Нямате достатъчно ${pointsType} (налични в активни пакети: ${totalAvailablePointsInValidPackages}, нужни: ${pointsToSpend}).` },
                    { status: 400 }
                );
            }

            let pointsRemainingToDeduct = pointsToSpend;
            for (const pkg of validPackages) {
                if (pointsRemainingToDeduct <= 0) break;

                const pointsInThisPackage = pkg[pointsType] || 0;
                const pointsToDeductFromThisPackage = Math.min(pointsRemainingToDeduct, pointsInThisPackage);

                if (pointsToDeductFromThisPackage > 0) {
                    const newPointAmountForType = pointsInThisPackage - pointsToDeductFromThisPackage;
                    const deductionLog = `\n[${new Date().toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })}] Изразходвани ${pointsToDeductFromThisPackage}т. (${pointsType}) за формула "${formulaName}".`;
                    const newDescription = (pkg.description || "") + deductionLog;

                    const { error: updateError } = await supabase
                        .from("pointsorders")
                        .update({
                            [pointsType]: newPointAmountForType,
                            description: newDescription
                        })
                        .eq("id", pkg.id);

                    if (updateError) {
                        console.error(`SERVER LOG: Error updating package ${pkg.id}:`, updateError);
                        return NextResponse.json({ message: "Грешка при обновяване на точките в пакет. Моля, свържете се с администратор." }, { status: 500 });
                    }
                    pointsRemainingToDeduct -= pointsToDeductFromThisPackage;
                }
            }
            if (pointsRemainingToDeduct > 0) {
                console.error(`SERVER LOG: Mismatch in point deduction. Remaining to deduct: ${pointsRemainingToDeduct} after processing all packages.`);
                return NextResponse.json({ message: "Възникна грешка при изчисляване на точките. Моля, опитайте отново или се свържете с администратор." }, { status: 500 });
            }
        }

        const orderRecord = {
            user_id: currentUserId,
            formula_id_used: formulaId,
            formula_name_used: formulaName,
            points_type_charged: pointsType,
            total_points_cost: pointsToSpend,
            status: "Обработва се", // Initial status
            order_details: {
                fields: Object.entries(filledValues).map(([key, value]) => {
                  const fieldMeta = formulaFields.find(f => f.key === key); // You need to pass formulaFields from frontend
                  const label = fieldMeta?.label || key;
                  const type = fieldMeta?.type;
                  const cost = (() => {
                    if (type === 'yesno' || type === 'checkbox') return value ? fieldMeta?.costYes || 0 : fieldMeta?.costNo || 0;
                    if (type === 'number' && value === 0 && fieldMeta?.costIfZero !== undefined) return fieldMeta.costIfZero;
                    if (type === 'number') return Number(value) * (fieldMeta?.cost || 0);
                    if (type === 'dropdown') {
                      const opt = fieldMeta?.options?.find(o => o.value === value);
                      return opt?.cost || 0;
                    }
                    return fieldMeta?.cost || 0;
                  })();
                  const display = typeof value === 'boolean' ? (value ? "Да" : "Не") : String(value);
                  return { key, label, value, display, cost };
                })
              },
            // created_at and updated_at will be set by default by the DB
        };

        console.log("SERVER LOG: Attempting to insert into formulaOrders:", JSON.stringify(orderRecord, null, 2));

        const { data: newFormulaOrder, error: insertOrderError } = await supabase
            .from("formulaorders")
            .insert([orderRecord]) // Use array for insert
            .select()
            .single();

        if (insertOrderError) {
            console.error("SERVER LOG: Error creating formula order record:", insertOrderError);
            console.error("SERVER LOG: Supabase insert error details:", JSON.stringify(insertOrderError, null, 2));

            return NextResponse.json({ message: "Точките са изразходвани, но възникна грешка при записване на поръчката. Моля, свържете се с администратор." }, { status: 500 });
        }

        return NextResponse.json(
            {
                message: `Поръчка #${newFormulaOrder.id} е създадена успешно! ${pointsToSpend > 0 ? `${pointsToSpend} ${pointsType} са изразходвани.` : ''}`,
                order: newFormulaOrder
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("SERVER LOG: Unhandled server error in /api/formulas/spend-points:", error);
        return NextResponse.json({ message: "Сървърна грешка.", error: error.message }, { status: 500 });
    }
}