import { NextResponse } from "next/server";
import { createServerClient } from "@/utils/supabase/server";

export async function POST(req) {
  const supabase = createServerClient();
  try {
    const body = await req.json();
    const { userId, editingPoints, recordingPoints, designPoints, lifespan, price = 0, status = "Активен", description  } = body;

    if (!userId || editingPoints === undefined || recordingPoints === undefined || designPoints === undefined || !lifespan) {
      return NextResponse.json(
        { message: "Missing required fields: userId, editingPoints, recordingPoints, designPoints, or lifespan." },
        { status: 400 }
      );
    }

    const adminLogEntry = `Добавено ръчно от администратор на ${new Date().toLocaleDateString('bg-BG')}`;

    const { data: newPackageOrder, error } = await supabase
      .from("pointsorders")
      .insert([
        {
          user: userId,
          editingPoints: parseInt(editingPoints, 10),
          recordingPoints: parseInt(recordingPoints, 10),
          designPoints: parseInt(designPoints, 10),
          lifespan: Number(lifespan),
          price: 0, 
          status: "Активен",
          created_at: new Date().toISOString(),
          description: adminLogEntry,
        },
      ])
      .select("*, profiles(id, fullname, email)")
      .single();

      if (error) {
        console.error("API POST /api/pointsorders - Supabase Insert error:", error);
        if (error.code === '42501' || error.message?.includes('violates row-level security policy')) {
            return NextResponse.json({ message: "Forbidden by RLS.", details: error.message }, { status: 403 });
        }
        return NextResponse.json(
            { message: "Database error: " + error.message },
            { status: 500 }
        );
      }

    return NextResponse.json(
      { message: "Custom package created successfully!", package: newPackageOrder }, // Return the created package
      { status: 201 }
    );
  } catch (error) {
    console.error("API POST /api/pointsorders - Server error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );   
  }
}

export async function PUT(req) {
  const supabase = createServerClient();
  try {
    const body = await req.json();
    const { packageId,
       actionType,
        pointsType,
         pointsCount,
          reason,
           lifespan,
            status,
             editingPoints,
              recordingPoints,
               designPoints,
                description 
              } = body;

    if (!packageId) {
      return NextResponse.json({ message: "Missing package ID" }, { status: 400 });
    }

    const { data: currentOrder, error: fetchError } = await supabase
      .from("pointsorders")
      .select("*")
      .eq("id", packageId)
      .single();

    if (fetchError || !currentOrder) {
      console.error("API PUT /api/pointsorders - Fetch error or order not found:", fetchError);
      return NextResponse.json({ message: "Points order not found or RLS denied access." }, { status: 404 });
    }

    let updateData = {};

    if (editingPoints !== undefined) updateData.editingPoints = parseInt(editingPoints, 10);
    if (recordingPoints !== undefined) updateData.recordingPoints = parseInt(recordingPoints, 10);
    if (designPoints !== undefined) updateData.designPoints = parseInt(designPoints, 10);
    if (lifespan !== undefined) updateData.lifespan = parseInt(lifespan, 10);
    if (status !== undefined) updateData.status = status;
    if (description !== undefined) updateData.description = description; // This will overwrite if admin edits directly

    // If admin is modifying points
    if (actionType && pointsType && pointsCount !== undefined && reason !== undefined) {
      const currentPointsValue = currentOrder[pointsType] || 0;
      const count = parseInt(pointsCount, 10);

      if (isNaN(count)) {
          return NextResponse.json({ message: "Invalid pointsCount value." }, { status: 400 });
      }

      const newPoints = actionType === "add"
          ? currentPointsValue + count
          : Math.max(0, currentPointsValue - count);

      updateData[pointsType] = newPoints;

      const now = new Date();
      const formattedDate = now.toLocaleDateString("bg-BG", { day: "2-digit", month: "2-digit", year: "numeric" });
      const actionWord = actionType === "add" ? "Добавени" : "Извадени";
      const logEntry = `\n[${formattedDate}] ${actionWord} ${count}т. (${pointsType}) - Причина: ${reason}`;
      
      // Append log only if description wasn't directly edited in this same request
      if (updateData.description === undefined) { 
           updateData.description = (currentOrder.description || "") + logEntry;
      } else {
          // If description was also set from form, append log to that new description
          updateData.description += logEntry;
      }
  }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "No valid fields to update specified." }, { status: 400 });
    }

    console.log(`API PUT /api/pointsorders - Updating order ID ${packageId} with:`, JSON.stringify(updateData, null, 2));

    // Perform the update and re-select the updated row
    const { data: updatedDbPackage, error: updateError } = await supabase
    .from("pointsorders")
    .update(updateData)
    .eq("id", packageId)
    .select("*, profiles(id, fullname, email)") // Reselect with profile info
    .single(); // Crucial to get the single updated record

if (updateError) {
    console.error(`API PUT /api/pointsorders - Supabase Update error for ID ${packageId}:`, updateError);
    if (updateError.code === '42501' || updateError.message?.includes('violates row-level security policy')) {
         return NextResponse.json({ message: "Forbidden by RLS to update.", details: updateError.message }, { status: 403 });
    }
    // PGRST116 means .single() found 0 or more than 1 row after update.
    // If 0, RLS likely prevented the update from "seeing" the row, or ID was wrong.
    if (updateError.code === 'PGRST116') {
        return NextResponse.json({ message: `Order with ID ${packageId} not found for update or RLS denied access.` }, { status: 404 });
    }
    return NextResponse.json({ message: updateError.message, details: updateError.details }, { status: 500 });
}

if (!updatedDbPackage) {
     // This should ideally be caught by PGRST116 if .single() is used
     console.error(`API PUT /api/pointsorders - No data returned for ID ${packageId} after update, though no direct Supabase error.`);
     return NextResponse.json({ message: `Order with ID ${packageId} not found after update attempt or selection failed.` }, { status: 404 });
}

console.log("API PUT /api/pointsorders - Successfully updated, returning:", JSON.stringify(updatedDbPackage, null, 2));
// Return the updated package data nested under "package" as expected by client
return NextResponse.json({ message: "Package updated successfully", package: updatedDbPackage }, { status: 200 });

} catch (error) {
console.error("API PUT /api/pointsorders - Catch block error:", error);
if (error instanceof SyntaxError) { // JSON parsing error
    return NextResponse.json({ message: "Invalid JSON in request body." }, { status: 400 });
}
return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
}
}
