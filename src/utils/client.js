import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
    const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseURL || !supabaseKey) {
        throw new Error("Missing Supabase environment variables.");
    }

    return createBrowserClient(
        supabaseURL,
        supabaseKey
    )
}