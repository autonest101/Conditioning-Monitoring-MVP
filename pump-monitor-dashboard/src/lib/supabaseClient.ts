import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://czhwhsyztohvcnggmdqh.supabase.co";

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env
  .VITE_SUPABASE_ANON_KEY as string | undefined;

let client: SupabaseClient | null = null;

function normalizeSupabaseUrl(url: string): string {
  // Accept either:
  // - project URL: https://<ref>.supabase.co
  // - edge function URL: https://<ref>.supabase.co/functions/v1/<name>
  // and normalize to project origin.
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return url.replace(/\/functions\/v1\/.*$/, "").replace(/\/$/, "");
  }
}

const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl ?? DEFAULT_SUPABASE_URL);

if (supabaseAnonKey) {
  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
} else {
  // Supabase is optional; features depending on it will degrade gracefully
  // when environment variables are not configured.
}

export const supabase = client;

