// src/app/api/packages/route.js
import { NextResponse } from "next/server";
import { createServerClient } from '@/utils/supabase/server'; 



const supabase = createServerClient();
export async function POST(req) {
    
    console.log("POST /api/packages: Initiating request (RLS based security).");


    try {
        const body = await req.json();
        const { editingPoints, recordingPoints, designPoints, price, lifespan } = body;

        // --- Server-side Validation ---
        if (price == null || editingPoints == null || recordingPoints == null || designPoints == null) {
             console.warn("POST /api/packages validation failed: Missing details", body);
             return NextResponse.json({ message: "Missing required package details." }, { status: 400 });
        }
        const numPrice = parseFloat(price);
        const numEditing = parseInt(editingPoints, 10);
        const numRecording = parseInt(recordingPoints, 10);
        const numDesign = parseInt(designPoints, 10);

        if (isNaN(numPrice) || numPrice <= 0 || isNaN(numEditing) || numEditing < 0 || isNaN(numRecording) || numRecording < 0 || isNaN(numDesign) || numDesign < 0 ) {
             console.warn("POST /api/packages validation failed: Invalid data types/values", body);
             return NextResponse.json({ message: "Invalid data: Points must be non-negative integers, price must be a positive number." }, { status: 400 });
        }
        // --- End Validation ---

        // --- Database Insert (using shared client) ---
        // RLS policy MUST handle authorization for this INSERT operation.
        console.log("POST /api/packages: Attempting insert (relies on RLS)...");
        const { data: newPackage, error } = await supabase
            .from("pointsPackages")
            .insert({
                editingPoints: numEditing,
                recordingPoints: numRecording,
                designPoints: numDesign,
                price: numPrice,
                lifespan: lifespan,
            })
            .select() // Select the newly created row
            .single(); // Expect only one row

        if (error) {
            console.error("POST /api/packages - Error inserting package:", error);
             // Check for RLS violation specifically - this is now the primary security mechanism
            if (error.code === '42501' || error.message?.includes('violates row-level security policy') || error.message?.includes('permission denied')) {
                console.warn("POST /api/packages - RLS policy prevented insertion.");
                // Return a generic forbidden error, or the specific one if preferred
                return NextResponse.json({ message: "Forbidden: You do not have permission to create packages.", details: error.message }, { status: 403 });
            }
            // Handle other database errors
            return NextResponse.json({ message: `Database error during insert: ${error.message}` }, { status: 500 });
        }

        // --- Success ---
        console.log("POST /api/packages - Package created successfully:", newPackage);
        return NextResponse.json(
            { message: "Package created successfully", package: newPackage },
            { status: 201 } // 201 Created status code
        );

    } catch (error) {
        if (error instanceof SyntaxError) {
            console.error("POST /api/packages - Error parsing JSON body:", error);
            return NextResponse.json({ message: "Invalid request body format" }, { status: 400 });
        }
        console.error("POST /api/packages - Unexpected error in try-catch block:", error);
        return NextResponse.json(
            { message: `Internal Server Error: ${error.message}` },
            { status: 500 }
        );
    }
}


// Handle PUT request to update an existing package
// WARNING: Security relies entirely on RLS policies on the 'pointsPackages' table allowing UPDATE for the correct role.
export async function PUT(req) {
    console.log("PUT /api/packages: Initiating request (RLS based security).");

    // REMOVED: Authorization Check section (isAdmin call)

     try {
        const body = await req.json();
        console.log("PUT /api/packages - Received body:", body);
        const { packageId, editingPoints, designPoints, recordingPoints, price, lifespan } = body;

        // --- Validation ---
        if (!packageId || editingPoints == null || designPoints == null || recordingPoints == null || price == null) {
            console.error("PUT /api/packages - Validation Failed: Missing props in body:", body);
            return NextResponse.json({ message: "Missing props for update." }, { status: 400 });
        }
        const numPrice = parseFloat(price);
        const numEditing = parseInt(editingPoints, 10);
        const numRecording = parseInt(recordingPoints, 10);
        const numDesign = parseInt(designPoints, 10);
        const numLifespan = parseInt(lifespan, 10);
        if (isNaN(numLifespan) || numLifespan <= 0) {
            console.error("PUT /api/packages - Invalid lifespan value:", lifespan);
            return NextResponse.json({ message: "Invalid lifespan: must be a positive integer (in days)." }, { status: 400 });
        }
        if (isNaN(numPrice) || numPrice <= 0 || isNaN(numEditing) || numEditing < 0 || isNaN(numRecording) || numRecording < 0 || isNaN(numDesign) || numDesign < 0 ) {
            console.error("PUT /api/packages - Validation Failed: Invalid numeric data", body);
            return NextResponse.json({ message: "Invalid data: Points must be non-negative integers, price must be a positive number." }, { status: 400 });
        }
        // --- End Validation ---

        // --- Database Update (using shared client) ---
        // RLS policy MUST handle authorization for this UPDATE operation.
        console.log(`PUT /api/packages: Attempting update for package ${packageId} (relies on RLS)...`);
        const { data, error } = await supabase
            .from("pointsPackages")
            .update({
                editingPoints: numEditing,
                designPoints: numDesign,
                recordingPoints: numRecording,
                price: numPrice,
                lifespan: numLifespan,
            })
            .eq('id', packageId)
            .select() // Select the updated row
            .single(); // Expect only one row (or null if not found)

        if (error) {
            console.error(`PUT /api/packages - Error updating package ${packageId}:`, error);
            // Check for RLS violation specifically - this is now the primary security mechanism
           if (error.code === '42501' || error.message?.includes('violates row-level security policy') || error.message?.includes('permission denied')) {
               console.warn(`PUT /api/packages - RLS policy prevented update for package ${packageId}.`);
               // Return a generic forbidden error
               return NextResponse.json({ message: "Forbidden: You do not have permission to update this package.", details: error.message }, { status: 403 });
           }
           // Handle other database errors
           return NextResponse.json({ message: `Database error during update: ${error.message}` }, { status: 500 });
        }

        // Check if the update actually found a row to update
        if (!data) {
             console.warn(`PUT /api/packages - Package with ID ${packageId} not found for update.`);
             // RLS might also prevent seeing the row, resulting in 'data' being null even if the ID exists.
             // If RLS allows SELECT but denied UPDATE, the error block above should catch it.
             // If RLS denies SELECT, this 'not found' is the expected result for non-permitted users.
             return NextResponse.json({ message: `Package with ID ${packageId} not found or access denied.` }, { status: 404 });
        }

        // --- Success ---
        console.log(`PUT /api/packages - Package ${packageId} updated successfully:`, data);
        return NextResponse.json(
            { message: "Package updated successfully", package: data },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof SyntaxError) {
            console.error("PUT /api/packages - Error parsing JSON body:", error);
            return NextResponse.json({ message: "Invalid request body format" }, { status: 400 });
        }
        console.error("PUT /api/packages - Unexpected error in try-catch block:", error);
        return NextResponse.json({ message: `Internal Server Error: ${error.message}` }, { status: 500 });
    }
}

export async function DELETE(req) {
    console.log("DELETE /api/packages: Initiating request (RLS based security).");

    try {
        // Extract packageId from the request body
        const body = await req.json();
        const { packageId } = body;

        if (!packageId) {
            console.warn("DELETE /api/packages - Validation Failed: Missing packageId in body.");
            return NextResponse.json({ message: "Missing packageId in request body." }, { status: 400 });
        }

        // --- Database Delete (using shared client) ---
        // RLS policy MUST handle authorization for this DELETE operation.
        console.log(`DELETE /api/packages: Attempting delete for package ${packageId} (relies on RLS)...`);
        const { error, count } = await supabase
            .from("pointsPackages")
            .delete()
            .eq('id', packageId); // Match the package ID

        if (error) {
            console.error(`DELETE /api/packages - Error deleting package ${packageId}:`, error);
            // Check for RLS violation specifically
            if (error.code === '42501' || error.message?.includes('violates row-level security policy') || error.message?.includes('permission denied')) {
                console.warn(`DELETE /api/packages - RLS policy prevented deletion for package ${packageId}.`);
                return NextResponse.json({ message: "Forbidden: You do not have permission to delete this package.", details: error.message }, { status: 403 });
            }
            // Handle other database errors
            return NextResponse.json({ message: `Database error during delete: ${error.message}` }, { status: 500 });
        }

        // Check if any row was actually deleted
        // Note: `delete()` in supabase-js v2 might not return count reliably without specific headers/settings.
        // It's safer to check for errors above. If no error occurred, assume success if RLS allowed it.
        // Supabase might return an error if RLS denies even seeing the row for deletion.
        // if (count === 0) { // This check might be unreliable depending on version/RLS
        //     console.warn(`DELETE /api/packages - Package with ID ${packageId} not found or already deleted.`);
        //     return NextResponse.json({ message: `Package with ID ${packageId} not found.` }, { status: 404 });
        // }


        console.log(`DELETE /api/packages - Package ${packageId} deleted successfully (or did not exist).`);
        // Return 200 OK with a message, or 204 No Content if preferred
        return NextResponse.json(
            { message: "Package deleted successfully" },
            { status: 200 }
        );

    } catch (error) {
        // Handle JSON parsing errors
        if (error instanceof SyntaxError) {
            console.error("DELETE /api/packages - Error parsing JSON body:", error);
            return NextResponse.json({ message: "Invalid request body format" }, { status: 400 });
        }
        // Handle other unexpected errors
        console.error("DELETE /api/packages - Unexpected error in try-catch block:", error);
        return NextResponse.json(
            { message: `Internal Server Error: ${error.message}` },
            { status: 500 }
        );
    }
}