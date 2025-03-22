import { NextResponse } from "next/server";
import { createClient } from "@/utils/client";

const supabase = createClient();

export async function POST(req) {
    async function fetchId(email) {
        const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

    async function updateEditingPoints(profileId, pointsToSubtract) {
        const id = profileId.id;

        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('editingPoints')
            .eq('id', id)
            .single();

        if (fetchError) {
            throw new Error(`Failed to fetch editing points: ${fetchError.message}`);
        }

        const currentPoints = profile.editingPoints;

        if (currentPoints < pointsToSubtract) {
            throw new Error('Insufficient editing points');
        }

        const newPoints = currentPoints - pointsToSubtract;

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ editingPoints: newPoints })
            .eq('id', id)

        if (updateError) {
            throw new Error(`Failed to update editing points: ${updateError.message}`);
        }

        return newPoints;
    }

    async function updateRecordingPoints(profileId, pointsToSubtract) {
        const id = profileId.id;

        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('recordingPoints')
            .eq('id', id)
            .single();

        if (fetchError) {
            throw new Error(`Failed to fetch recording points: ${fetchError.message}`);
        }

        const currentPoints = profile.recordingPoints;

        if (currentPoints < pointsToSubtract) {
            throw new Error('Insufficient recording points');
        }

        const newPoints = currentPoints - pointsToSubtract;

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ recordingPoints: newPoints })
            .eq('id', id)

        if (updateError) {
            throw new Error(`Failed to update recording points: ${updateError.message}`);
        }

        return newPoints;
    }

    async function updateDesignPoints(profileId, pointsToSubtract) {
        const id = profileId.id;

        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('designPoints')
            .eq('id', id)
            .single();

        if (fetchError) {
            throw new Error(`Failed to fetch design points: ${fetchError.message}`);
        }

        const currentPoints = profile.designPoints;

        if (currentPoints < pointsToSubtract) {
            throw new Error('Insufficient design points');
        }

        const newPoints = currentPoints - pointsToSubtract;

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ designPoints: newPoints })
            .eq('id', id)

        if (updateError) {
            throw new Error(`Failed to update design points: ${updateError.message}`);
        }

        return newPoints;
    }

    const body = await req.json();
    const id = await fetchId(body.email);
    body["user"] = id.id;
    delete body["email"];

    if (body.type == "vlog") {
        await updateEditingPoints(id, body.price);
        delete body["type"];
        const { data, error } = await supabase.from('vlogOrders').insert(body);

        if (error) {
            console.log(error);
            return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 });
        }
    }
    else if (body.type == "tiktok") {
        await updateEditingPoints(id, body.price);
        delete body["type"];
        const { data, error } = await supabase.from('tiktokOrders').insert(body);

        if (error) {
            console.log(error);
            return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 });
        }
    }
    else if (body.type == "recording") {
        await updateRecordingPoints(id, body.price);
        delete body["type"];
        const { data, error } = await supabase.from('recordings').insert(body);

        if (error) {
            console.log(error);
            return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 });
        }
    }
    else if (body.type == "thumbnail") {
        await updateDesignPoints(id, body.price);
        delete body["type"];
        const { data, error } = await supabase.from('thumbnailOrders').insert(body);

        if (error) {
            console.log(error);
            return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 });
        }
    }
    else if (body.type == "points") {
        delete body["type"];
        const { data, error } = await supabase.from('pointsOrders').insert(body);

        if (error) {
            console.log(error);
            return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 });
        }
    }

    return NextResponse.json({ message: "Поръчката беше регистрирана." });
}
