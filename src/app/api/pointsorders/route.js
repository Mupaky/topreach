import { createClient } from "@/utils/client";

const supabase = createClient();

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, editingPoints, recordingPoints, designPoints, lifespan } = body;

    if (!userId || editingPoints === undefined || recordingPoints === undefined || designPoints === undefined || !lifespan) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        { status: 400 }
      );
    }

    // Format today's date in BG format
    const now = new Date();
    const formattedDate = now.toLocaleDateString("bg-BG", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const adminLogEntry = `Добавено ръчно от администратор на ${new Date().toLocaleDateString('bg-BG')}`;

    const { data, error } = await supabase
      .from("pointsorders")
      .insert([
        {
          user: userId,
          editingPoints,
          recordingPoints,
          designPoints,
          lifespan: Number(lifespan),
          price: 0, 
          status: "Активен",
          created_at: new Date().toISOString(),
          description: adminLogEntry, // <= Set the admin note
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Insert error:", error);
      return new Response(
        JSON.stringify({ message: "Database error: " + error.message }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ message: "Custom package created successfully!", package: data }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Server error:", error);
    return new Response(
      JSON.stringify({ message: "Server error", error: error.message }),
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { packageId, actionType, pointsType, pointsCount, reason, lifespan, status } = body;

    if (!packageId) {
      return new Response(JSON.stringify({ message: "Missing package ID" }), { status: 400 });
    }

    const { data: pointsOrder, error: fetchError } = await supabase
      .from("pointsorders")
      .select("*")
      .eq("id", packageId)
      .single();

    if (fetchError || !pointsOrder) {
      return new Response(JSON.stringify({ message: "Points order not found" }), { status: 404 });
    }

    let updateData = {};

    if (lifespan !== undefined) updateData.lifespan = lifespan;
    if (status !== undefined) updateData.status = status;

    // If admin is modifying points
    if (actionType && pointsType && pointsCount && reason) {
      const currentPoints = pointsOrder[pointsType] || 0;
      const newPoints = actionType === "add"
        ? currentPoints + pointsCount
        : Math.max(0, currentPoints - pointsCount);

      updateData[pointsType] = newPoints;

      const now = new Date();
      const formattedDate = now.toLocaleDateString("bg-BG", { day: "2-digit", month: "2-digit", year: "numeric" });
      const actionWord = actionType === "add" ? "Добавени" : "Извадени";
      const logEntry = `\n[${formattedDate}] ${actionWord} ${pointsCount} т. (${pointsType}) - Причина: ${reason}`;

      updateData.description = pointsOrder.description ? pointsOrder.description + logEntry : logEntry;
    }

    if (Object.keys(updateData).length === 0) {
      return new Response(JSON.stringify({ message: "No valid fields to update." }), { status: 400 });
    }

    const { error: updateError } = await supabase
      .from("pointsorders")
      .update(updateData)
      .eq("id", packageId);

    if (updateError) {
      return new Response(JSON.stringify({ message: updateError.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ message: "Package updated successfully" }), { status: 200 });

  } catch (error) {
    console.error("Server error:", error);
    return new Response(JSON.stringify({ message: "Server error", error: error.message }), { status: 500 });
  }
}
