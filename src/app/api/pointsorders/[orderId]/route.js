// app/api/pointsorders/[orderId]/route.js
import { NextResponse } from "next/server";
import { createServerClient } from "@/utils/supabase/server";
import { getSession } from "@/utils/lib";

// PUT handler to update an existing pointsorder
export async function PUT(req, { params }) {
    const customSession = await getSession();
    if (!customSession?.user?.role === 'admin') {
        return NextResponse.json({ message: "Forbidden: Admin access required." }, { status: 403 });
    }
    const supabase = createServerClient();
    const { orderId } = params;
    if (!orderId) return NextResponse.json({ message: "Order ID required." }, { status: 400 });

    try {
        const body = await req.json();
        // Destructure all updatable fields including consultingPoints
        const { editingPoints, recordingPoints, designPoints, consultingPoints, lifespan, status, description } = body;

        const updateData = {};
        if (editingPoints !== undefined) updateData.editingPoints = parseInt(editingPoints,10) || 0;
        if (recordingPoints !== undefined) updateData.recordingPoints = parseInt(recordingPoints,10) || 0;
        if (designPoints !== undefined) updateData.designPoints = parseInt(designPoints,10) || 0;
        if (consultingPoints !== undefined) updateData.consultingPoints = parseInt(consultingPoints,10) || 0; // <<<< NEW
        if (lifespan !== undefined) updateData.lifespan = parseInt(lifespan,10);
        if (status !== undefined) updateData.status = status;
        if (description !== undefined) updateData.description = description;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ message: "No fields to update." }, { status: 400 });
        }

        const { data: updatedOrder, error } = await supabase
            .from("pointsorders")
            .update(updateData)
            .eq("id", orderId)
            .select("*, profiles(id, fullname, email)") // Return full updated order with profile
            .single();

        if (error) throw error;
        if (!updatedOrder) return NextResponse.json({ message: "Order not found or update failed." }, { status: 404 });

        return NextResponse.json({ message: "Поръчката е обновена успешно.", order: updatedOrder }); // 'order' key for consistency
    } catch (err) {
        console.error(`API PUT /pointsorders/${orderId} Error:`, err);
        return NextResponse.json({ message: err.message || "Сървърна грешка." }, { status: 500 });
    }
}

// DELETE handler to delete a pointsorder
export async function DELETE(req, { params }) {
    const customSession = await getSession();
    if (!customSession?.user?.role === 'admin') {
        return NextResponse.json({ message: "Forbidden: Admin access required." }, { status: 403 });
    }
    const supabase = createServerClient();
    const { orderId } = params;
    if (!orderId) return NextResponse.json({ message: "Order ID required." }, { status: 400 });

    try {
        const { error } = await supabase
            .from("pointsorders")
            .delete()
            .eq("id", orderId);

        if (error) throw error;
        return NextResponse.json({ message: "Поръчката е изтрита успешно." });
    } catch (err) {
        console.error(`API DELETE /pointsorders/${orderId} Error:`, err);
        return NextResponse.json({ message: err.message || "Сървърна грешка." }, { status: 500 });
    }
}