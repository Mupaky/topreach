// app/api/formulas/spend-points/route.js
import { NextResponse } from "next/server";
import { getSession } from "@/utils/lib";
import { createServerClient } from '@/utils/supabase/server';

export async function POST(req) {
    const supabase = createServerClient();
    const customSessionData = await getSession(); // Your custom jose session

    if (!customSessionData || !customSessionData.user || !customSessionData.user.id) {
        console.error("API spend-points: No custom session or user ID missing.");
        return NextResponse.json({ message: "Authentication required or session invalid." }, { status: 401 });
    }

    const currentUserId = customSessionData.user.id; // ID from your custom session, should be Supabase auth_user_id

    try {
        const body = await req.json();
        const {
            pointsCostBreakdown, // <<<< NEW: Expecting this
            formulaId,
            formulaName,
            filledValues,
            formulaFields
        } = body;

        // --- NEW VALIDATION ---
        if (!pointsCostBreakdown || typeof pointsCostBreakdown !== 'object' || Object.keys(pointsCostBreakdown).length === 0) {
            console.error("API spend-points: Missing or invalid pointsCostBreakdown.", body);
            return NextResponse.json(
                { message: "Missing or invalid pointsCostBreakdown." },
                { status: 400 }
            );
        }
        if (!formulaId || !formulaName) {
            console.error("API spend-points: Missing formulaId or formulaName.", body);
            return NextResponse.json(
                { message: "Missing formulaId or formulaName." },
                { status: 400 }
            );
        }
        // --- END NEW VALIDATION ---

        let totalPointsSpentAcrossTypes = 0;
        const pointTypesToDeduct = Object.keys(pointsCostBreakdown).filter(type => pointsCostBreakdown[type] > 0);

        console.log(`API spend-points: User ${currentUserId} attempting to spend:`, JSON.stringify(pointsCostBreakdown, null, 2));

        // --- Loop through each point type in the breakdown and deduct ---
        for (const pointsType of pointTypesToDeduct) {
            const pointsToSpendForThisType = pointsCostBreakdown[pointsType];

            if (typeof pointsToSpendForThisType !== 'number' || pointsToSpendForThisType < 0) {
                console.error(`API spend-points: Invalid pointsToSpendForThisType for ${pointsType}:`, pointsToSpendForThisType);
                return NextResponse.json({ message: `Invalid points amount for ${pointsType}.` }, { status: 400 });
            }

            if (pointsToSpendForThisType === 0) {
                console.log(`API spend-points: No points to spend for type ${pointsType}. Skipping deduction.`);
                continue; // Skip if no points of this type are to be spent
            }

            console.log(`API spend-points: Processing deduction for type: ${pointsType}, amount: ${pointsToSpendForThisType}`);

            const now = new Date();
            // Fetch active packages for THIS pointsType for the user
            // RLS will apply: user must be able to see their own pointsorders
            const { data: activePackages, error: fetchError } = await supabase
                .from("pointsorders")
                .select(`id, created_at, lifespan, status, description, ${pointsType}`) // Select the specific pointsType column
                .eq("user", currentUserId)
                .eq("status", "Активен")
                .gt(pointsType, 0) // Only packages that have points of this type
                .order("created_at", { ascending: true }); // Oldest first

            if (fetchError) {
                console.error(`API spend-points: Error fetching active packages for ${pointsType}:`, fetchError);
                return NextResponse.json({ message: `Грешка при извличане на пакети за ${pointsType}.` }, { status: 500 });
            }

            const validPackagesForThisType = (activePackages || []).filter(pkg => {
                if (!pkg.created_at || typeof pkg.lifespan !== 'number') return false;
                const createdAt = new Date(pkg.created_at);
                const expiryDate = new Date(new Date(createdAt).setDate(createdAt.getDate() + pkg.lifespan));
                return expiryDate >= now;
            });

            if ((!validPackagesForThisType || validPackagesForThisType.length === 0)) {
                console.warn(`API spend-points: No active/valid packages found for ${pointsType} for user ${currentUserId}.`);
                return NextResponse.json({ message: `Нямате активни и валидни пакети с ${pointsType} за покриване на разхода.` }, { status: 400 });
            }

            let totalAvailableInValidPackagesForThisType = 0;
            validPackagesForThisType.forEach(pkg => totalAvailableInValidPackagesForThisType += (Number(pkg[pointsType]) || 0));

            if (totalAvailableInValidPackagesForThisType < pointsToSpendForThisType) {
                console.warn(`API spend-points: Insufficient points for ${pointsType}. Available: ${totalAvailableInValidPackagesForThisType}, Needed: ${pointsToSpendForThisType}`);
                return NextResponse.json(
                    { message: `Нямате достатъчно ${pointsType} (налични: ${totalAvailableInValidPackagesForThisType}, нужни: ${pointsToSpendForThisType}).` },
                    { status: 400 }
                );
            }

            let pointsRemainingToDeductForThisType = pointsToSpendForThisType;
            for (const pkg of validPackagesForThisType) {
                if (pointsRemainingToDeductForThisType <= 0) break;

                const pointsInThisPackageOfType = Number(pkg[pointsType]) || 0;
                const pointsToDeductFromThisPackage = Math.min(pointsRemainingToDeductForThisType, pointsInThisPackageOfType);

                if (pointsToDeductFromThisPackage > 0) {
                    const newPointAmountForType = pointsInThisPackageOfType - pointsToDeductFromThisPackage;
                    const deductionLog = `\n[${new Date().toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })}] Изразходвани ${pointsToDeductFromThisPackage}т. (${pointsType}) за формула "${formulaName}".`;
                    const newDescription = (pkg.description || "") + deductionLog;

                    const { error: updateError } = await supabase
                        .from("pointsorders")
                        .update({
                            [pointsType]: newPointAmountForType, // Dynamic column update
                            description: newDescription
                        })
                        .eq("id", pkg.id);

                    if (updateError) {
                        console.error(`API spend-points: Error updating package ${pkg.id} for ${pointsType}:`, updateError);
                        // This is a critical error, might need rollback logic for already deducted points from other types
                        return NextResponse.json({ message: `Грешка при обновяване на ${pointsType} в пакет. Моля, свържете се с администратор.` }, { status: 500 });
                    }
                    pointsRemainingToDeductForThisType -= pointsToDeductFromThisPackage;
                    totalPointsSpentAcrossTypes += pointsToDeductFromThisPackage; // Track overall spent points
                }
            }
            if (pointsRemainingToDeductForThisType > 0) {
                console.error(`API spend-points: Mismatch in point deduction for ${pointsType}. Remaining: ${pointsRemainingToDeductForThisType}`);
                // Critical error, indicates miscalculation or data issue
                return NextResponse.json({ message: `Възникна грешка при изчисляване на ${pointsType}. Моля, свържете се с администратор.` }, { status: 500 });
            }
            console.log(`API spend-points: Successfully deducted ${pointsToSpendForThisType} of ${pointsType}.`);
        } // End of loop for pointsType in pointsCostBreakdown


        // --- Create the formulaorders record ---
        const orderRecord = {
            user_id: currentUserId, // Ensure this column name matches your formulaorders table
            formula_id_used: formulaId,
            formula_name_used: formulaName,
            // Store the breakdown of points charged
            points_cost_breakdown: pointsCostBreakdown, // NEW: Storing the breakdown
            // total_points_cost: totalPointsSpentAcrossTypes, // Optionally store the sum if needed, or derive from breakdown
            status: "Обработва се",
            order_details: { // Your existing order_details structure
                fields: filledValues && formulaFields ? Object.entries(filledValues).map(([key, value]) => {
                  const fieldMeta = formulaFields.find(f => f.key === key);
                  const label = fieldMeta?.label || key;
                  // ... (your existing cost calculation logic for order_details if needed here for logging)
                  const display = typeof value === 'boolean' ? (value ? "Да" : "Не") : String(value);
                  return { key, label, value, display /*, cost: fieldCostForDisplay */ };
                }) : []
              },
            // created_at by DB default
        };

        console.log("API spend-points: Attempting to insert into formulaorders:", JSON.stringify(orderRecord, null, 2));

        const { data: newFormulaOrder, error: insertOrderError } = await supabase
            .from("formulaorders")
            .insert([orderRecord])
            .select()
            .single();

        if (insertOrderError) {
            console.error("API spend-points: Error creating formula order record:", insertOrderError);
            // This is also critical - points were deducted but order creation failed. Needs robust handling/rollback.
            return NextResponse.json({ message: "Точките са изразходвани, но възникна грешка при записване на поръчката. Моля, свържете се с администратор." }, { status: 500 });
        }

        console.log("API spend-points: Formula order created successfully:", newFormulaOrder.id);
        return NextResponse.json(
            {
                message: `Поръчка #${newFormulaOrder.id} е създадена успешно! Точките са изразходвани съгласно разбивката.`,
                order: newFormulaOrder
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("API spend-points: Unhandled server error:", error);
        if (error instanceof SyntaxError) { // JSON parsing error from req.json()
            return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
        }
        return NextResponse.json({ message: "Сървърна грешка при обработка на поръчката.", error: error.message }, { status: 500 });
    }
}