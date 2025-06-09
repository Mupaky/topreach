// src/app/api/packages/route.js
import { NextResponse } from "next/server";
import { createServerClient } from '@/utils/supabase/server';
import { getSession } from "@/utils/lib"; // Your custom session utility

export async function POST(req) {
    const supabase = createServerClient(); // Moved inside handler

    // Admin Authentication Check using your custom session
    const customSession = await getSession();
    if (!customSession || !customSession.user || customSession.user.role !== 'admin') {
        console.warn("POST /api/packages: Admin check failed via custom session.");
        return NextResponse.json({ message: "Forbidden: Admin privileges required." }, { status: 403 });
    }
    console.log(`POST /api/packages: Admin authenticated: ${customSession.user.email}`);

    try {
        const body = await req.json();
        const { editingPoints, recordingPoints, designPoints, consultingPoints, price, lifespan } = body;

        // --- Server-side Validation ---
        if (price == null || editingPoints == null || recordingPoints == null || designPoints == null || consultingPoints == null || lifespan == null) {
             console.warn("POST /api/packages validation failed: Missing details", body);
             return NextResponse.json({ message: "Липсват задължителни полета." }, { status: 400 });
        }

        const numPrice = parseFloat(price);
        const numEditing = parseInt(editingPoints, 10);
        const numRecording = parseInt(recordingPoints, 10);
        const numDesign = parseInt(designPoints, 10);
        const numConsultingPoints = parseInt(consultingPoints, 10); // <<< PARSE consultingPoints
        const numLifespan = parseInt(lifespan, 10);

        if (isNaN(numPrice) || numPrice <= 0 ||
            isNaN(numEditing) || numEditing < 0 ||
            isNaN(numRecording) || numRecording < 0 ||
            isNaN(numDesign) || numDesign < 0 ||
            isNaN(numConsultingPoints) || numConsultingPoints < 0 || // <<< VALIDATE consultingPoints
            isNaN(numLifespan) || numLifespan <= 0) {
             console.warn("POST /api/packages validation failed: Invalid data types/values", { ...body, parsed: { numPrice, numEditing, numRecording, numDesign, numConsultingPoints, numLifespan} });
             return NextResponse.json({ message: "Невалидни данни: Точките трябва да са 0 или повече, цената и валидността трябва да са по-големи от 0." }, { status: 400 });
        }
        // --- End Validation ---

        console.log("POST /api/packages: Attempting insert with data:", { numEditing, numRecording, numDesign, numConsultingPoints, numPrice, numLifespan });
        // RLS policy on "pointsPackages" for INSERT will apply here based on admin's Supabase JWT context
        const { data: newPackage, error } = await supabase
            .from("pointsPackages") // Ensure this is your correct table name
            .insert({
                editingPoints: numEditing,
                recordingPoints: numRecording,
                designPoints: numDesign,
                consultingPoints: numConsultingPoints, // <<< USE PARSED VALUE
                price: numPrice,
                lifespan: numLifespan,
                // created_at is usually handled by DB
            })
            .select("id, created_at, editingPoints, recordingPoints, designPoints, consultingPoints, price, lifespan") // Select all fields including new one
            .single();

        if (error) {
            console.error("POST /api/packages - Error inserting package:", JSON.stringify(error, null, 2));
            if (error.code === '42501' || error.message?.includes('violates row-level security policy')) {
                console.warn("POST /api/packages - RLS policy prevented insertion.");
                return NextResponse.json({ message: "RLS: Забранено създаването на пакет.", details: error.message }, { status: 403 });
            }
            return NextResponse.json({ message: `База данни: ${error.message}`, details: error.details }, { status: 500 });
        }
        if (!newPackage) {
            console.error("POST /api/packages - No data returned after insert, though no direct Supabase error.");
            return NextResponse.json({ message: "Неуспешно извличане на създадения пакет." }, { status: 500 });
        }

        console.log("POST /api/packages - Package created successfully:", newPackage);
        return NextResponse.json(
            { message: "Пакетът е създаден успешно!", package: newPackage },
            { status: 201 }
        );

    } catch (error) {
        if (error instanceof SyntaxError) {
            console.error("POST /api/packages - Error parsing JSON body:", error);
            return NextResponse.json({ message: "Невалиден формат на заявката." }, { status: 400 });
        }
        console.error("POST /api/packages - Unexpected error:", error);
        return NextResponse.json(
            { message: `Сървърна грешка: ${error.message}` },
            { status: 500 }
        );
    }
}

export async function PUT(req) {
    const supabase = createServerClient(); // Moved inside handler

    const customSession = await getSession();
    if (!customSession || !customSession.user || customSession.user.role !== 'admin') {
        return NextResponse.json({ message: "Forbidden: Admin privileges required." }, { status: 403 });
    }
    // console.log(`PUT /api/packages: Admin authenticated: ${customSession.user.email}`);

     try {
        const body = await req.json();
        // console.log("PUT /api/packages - Received body:", body);
        const { packageId, editingPoints, designPoints, recordingPoints, consultingPoints, price, lifespan } = body; // Added consultingPoints

        // --- Validation ---
        if (!packageId || editingPoints == null || designPoints == null || recordingPoints == null || consultingPoints == null || price == null || lifespan == null) { // Added consultingPoints
            console.error("PUT /api/packages - Validation Failed: Missing props in body:", body);
            return NextResponse.json({ message: "Липсват задължителни полета за обновяване." }, { status: 400 });
        }
        const numPrice = parseFloat(price);
        const numEditing = parseInt(editingPoints, 10);
        const numRecording = parseInt(recordingPoints, 10);
        const numDesign = parseInt(designPoints, 10);
        const numConsultingPoints = parseInt(consultingPoints, 10); // <<< PARSE
        const numLifespan = parseInt(lifespan, 10);

        if (isNaN(numLifespan) || numLifespan <= 0) {
            return NextResponse.json({ message: "Невалидна стойност за валидност (трябва да е положително число)." }, { status: 400 });
        }
        if (isNaN(numPrice) || numPrice <= 0 ||
            isNaN(numEditing) || numEditing < 0 ||
            isNaN(numRecording) || numRecording < 0 ||
            isNaN(numDesign) || numDesign < 0 ||
            isNaN(numConsultingPoints) || numConsultingPoints < 0 // <<< VALIDATE
        ) {
            console.error("PUT /api/packages - Validation Failed: Invalid numeric data", body);
            return NextResponse.json({ message: "Невалидни данни: Точките трябва да са 0 или повече, цената и валидността трябва да са по-големи от 0." }, { status: 400 });
        }
        // --- End Validation ---

        console.log(`PUT /api/packages: Attempting update for package ${packageId} with data:`, { numEditing, numRecording, numDesign, numConsultingPoints, numPrice, numLifespan });
        const { data: updatedPackage, error } = await supabase
            .from("pointsPackages") // Ensure this is your correct table name
            .update({
                editingPoints: numEditing,
                designPoints: numDesign,
                recordingPoints: numRecording,
                consultingPoints: numConsultingPoints, // <<< INCLUDE IN UPDATE
                price: numPrice,
                lifespan: numLifespan,
            })
            .eq('id', packageId)
            .select("id, created_at, editingPoints, recordingPoints, designPoints, consultingPoints, price, lifespan") // Select all, including new field
            .single();

        if (error) {
            console.error(`PUT /api/packages - Error updating package ${packageId}:`, JSON.stringify(error, null, 2));
           if (error.code === '42501' || error.message?.includes('violates row-level security policy')) {
               return NextResponse.json({ message: "RLS: Забранено обновяването на този пакет.", details: error.message }, { status: 403 });
           }
           if (error.code === 'PGRST116') {
               return NextResponse.json({ message: `Пакет с ID ${packageId} не е намерен или RLS забрани достъп.`}, {status: 404});
           }
           return NextResponse.json({ message: `База данни: ${error.message}`, details: error.details }, { status: 500 });
        }

        if (!updatedPackage) {
             console.warn(`PUT /api/packages - Package with ID ${packageId} not found after update attempt (no data).`);
             return NextResponse.json({ message: `Пакет с ID ${packageId} не е намерен или достъпът е забранен.` }, { status: 404 });
        }

        console.log(`PUT /api/packages - Package ${packageId} updated successfully:`, updatedPackage);
        return NextResponse.json(
            { message: "Пакетът е обновен успешно!", package: updatedPackage },
            { status: 200 }
        );
    } catch (error) {
        // ... (your existing catch block) ...
        if (error instanceof SyntaxError) {
            return NextResponse.json({ message: "Невалиден формат на заявката." }, { status: 400 });
        }
        console.error("PUT /api/packages - Unexpected error:", error);
        return NextResponse.json({ message: `Сървърна грешка: ${error.message}` }, { status: 500 });
    }
}

export async function DELETE(req) {
    const supabase = createServerClient(); // Moved inside handler

    const customSession = await getSession();
    if (!customSession || !customSession.user || customSession.user.role !== 'admin') {
        return NextResponse.json({ message: "Forbidden: Admin privileges required." }, { status: 403 });
    }
    // console.log(`DELETE /api/packages: Admin authenticated: ${customSession.user.email}`);

    try {
        const body = await req.json();
        const { packageId } = body;

        if (!packageId) {
            return NextResponse.json({ message: "Missing packageId in request body." }, { status: 400 });
        }

        console.log(`DELETE /api/packages: Attempting delete for package ${packageId}`);
        const { error, count } = await supabase // `count` might not be reliable with RLS or .delete()
            .from("pointsPackages") // Ensure this is your correct table name
            .delete()
            .eq('id', packageId);

        if (error) {
            console.error(`DELETE /api/packages - Error deleting package ${packageId}:`, JSON.stringify(error, null, 2));
            if (error.code === '42501' || error.message?.includes('violates row-level security policy')) {
                return NextResponse.json({ message: "RLS: Забранено изтриването на този пакет.", details: error.message }, { status: 403 });
            }
            // If RLS prevents seeing the row, delete might not error but also not delete.
            // If error.code is for 'foreign_key_violation' (23503), it means this package is referenced elsewhere.
            return NextResponse.json({ message: `База данни: ${error.message}`, details: error.details }, { status: 500 });
        }

        // It's hard to reliably check `count` from .delete() especially with RLS.
        // If no error, assume RLS allowed it and it was deleted if it existed.
        console.log(`DELETE /api/packages - Package ${packageId} delete command executed.`);
        return NextResponse.json(
            { message: "Пакетът е изтрит успешно (или не е съществувал)." },
            { status: 200 }
        );

    } catch (error) {
        // ... (your existing catch block) ...
        if (error instanceof SyntaxError) {
            return NextResponse.json({ message: "Невалиден формат на заявката." }, { status: 400 });
        }
        console.error("DELETE /api/packages - Unexpected error:", error);
        return NextResponse.json({ message: `Сървърна грешка: ${error.message}` }, { status: 500 });
    }
}