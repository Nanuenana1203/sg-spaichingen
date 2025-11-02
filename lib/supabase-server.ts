import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

let _client: SupabaseClient | null = null;

// Lazy init: verhindert Fehler beim Build, falls ENV noch nicht geladen ist
export function supabaseServer(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || anon;

  if (!url || !service) {
    throw new Error("Supabase-Umgebungsvariablen fehlen (URL/KEY).");
  }

  _client = createClient(url, service, { auth: { persistSession: false } });
  return _client;
}
