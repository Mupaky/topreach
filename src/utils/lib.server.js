// src/utils/lib.server.js
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { createServerClient } from "./supabase/server";

const secretKey = process.env.JWT_SECRET_KEY;
if (!secretKey) {
  throw new Error("Missing JWT_SECRET_KEY in environment variables");
}

const key = new TextEncoder().encode(secretKey);

/**
 * Encrypts a payload into a JWT token
 * @param {Object} payload
 * @returns {Promise<string>} JWT token
 */
export async function encrypt(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // 1 week
    .sign(key);
}

/**
 * Decrypts a JWT token
 * @param {string} token
 * @returns {Promise<Object>} Decoded payload
 */
export async function decrypt(token) {
  const { payload } = await jwtVerify(token, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

/**
 * Fetches the session from cookies (server-side)
 * @returns {Promise<Object|null>}
 */
export async function getSession() {
  const cookieStore = cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;

  try {
    const session = await decrypt(token);
    return session;
  } catch (err) {
    console.error("Invalid session token:", err);
    return null;
  }
}

/**
 * Updates session token with refreshed user info
 * @param {Object} request - NextRequest object
 * @returns {Promise<NextResponse>} Updated response with refreshed cookie
 */
export async function updateSession(request) {
  const cookie = request.cookies.get("session")?.value;
  if (!cookie) return;

  const parsed = await decrypt(cookie);
  parsed.expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Extend session

  const supabase = createServerClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, role, editingPoints, recordingPoints, designPoints")
    .eq("email", parsed.user.email)
    .single();

  if (!profile || error) {
    console.error("Failed to fetch profile:", error);
    return null;
  }

  parsed.user = {
    ...parsed.user,
    ...profile,
  };

  const token = await encrypt(parsed);

  const res = NextResponse.next();
  res.cookies.set("session", token, {
    httpOnly: true,
    expires: parsed.expires,
  });

  return res;
}
