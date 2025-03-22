import { updateSession } from "./utils/lib";

export async function middleware(request) {
    return await updateSession(request);
}