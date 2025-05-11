import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "./client";

const supabase = createClient();

const secretKey = process.env.JWT_SECRET_KEY;
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime('1w')
        .sign(key);
}

export async function decrypt(input) {
    const { payload } = await jwtVerify(input, key, {
        algorithms: ["HS256"]
    });

    return payload;
}

export async function login({ fullName, email, editingPoints, recordingPoints, designPoints, role }) {
    // Get the user
    const user = { fullName, email, editingPoints, recordingPoints, designPoints, role: role ? "admin" : "user" };

    // Create the session
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const session = await encrypt({ user, expires });

    // Save the session in a cookie
    const cookieStore = await cookies();
    cookieStore.set("session", session, { expires, httpOnly: true });
}

export async function logout() {
    // Destroy the session
    const cookieStore = await cookies();
    cookieStore.set("session", "", { expires: new Date(0) });
}

export async function getSession() {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    if (!session) return null;
    return await decrypt(session);
}

export async function updateSession(request) {
    const session = request.cookies.get("session")?.value;
    if (!session) return;

    // Refresh the session so it doesn't expire
    const parsed = await decrypt(session);
    parsed.expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
        .from('profiles')
        .select()
        .eq('email', parsed.user.email)
        .single();;

    parsed.user.editingPoints = data.editingPoints;
    parsed.user.recordingPoints = data.recordingPoints;
    parsed.user.designPoints = data.designPoints;
    parsed.user.role = data.role;
    parsed.user.id = data.id;

    const res = NextResponse.next();
    res.cookies.set({
        name: "session",
        value: await encrypt(parsed),
        httpOnly: true,
        expires: parsed.expires,
    });

    return res;
}