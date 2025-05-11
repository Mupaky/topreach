// utils/client.js - MODIFIED TO BE A SERVICE ROLE CLIENT
import { createClient as _createGenericClient } from '@supabase/supabase-js';

export function createServerClient() { // This now creates a SERVICE ROLE client
    const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE; // USE SERVICE KEY

    if (!supabaseURL || !serviceKey) {
        throw new Error("Missing Supabase URL or SERVICE ROLE KEY for server client.");
    }

    return _createGenericClient (supabaseURL, serviceKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        }
    });
}