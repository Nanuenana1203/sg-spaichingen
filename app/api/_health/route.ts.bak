import { NextResponse } from "next/server";
export const runtime = "nodejs";
const BASE = process.env.SUPABASE_URL ?? "";
const KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const headers: Record<string,string> = { apikey: KEY, Authorization:`Bearer ${KEY}`, "Content-Type":"application/json" };
export async function GET() {
  const info:any = { hasBASE: !!BASE, hasKEY: !!KEY, fetchOk:false, rows:-1, err:null };
  try {
    if (!BASE || !KEY) return NextResponse.json(info, { status: 500 });
    const res  = await fetch(`${BASE}/rest/v1/benutzer?select=id&limit=1`, { headers, cache:"no-store" });
    const text = await res.text();
    info.fetchStatus = res.status;
    try { const arr = JSON.parse(text); info.rows = Array.isArray(arr) ? arr.length : -1; } catch { info.rows = -2; }
    info.fetchOk = res.ok;
    return NextResponse.json(info, { status: res.ok ? 200 : 502 });
  } catch (e:any) {
    info.err = String(e?.message ?? e);
    return NextResponse.json(info, { status: 500 });
  }
}
