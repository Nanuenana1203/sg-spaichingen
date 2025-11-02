import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BASE = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ?? "";

const headers: Record<string,string> = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
};

export async function GET(req: Request) {
  if (!BASE || !KEY) return NextResponse.json({ ok:false, where:"env" }, { status:500 });

  const { searchParams } = new URL(req.url);
  const from = (searchParams.get("from") || "").trim();       // YYYY-MM-DD
  const to   = (searchParams.get("to")   || "").trim();       // YYYY-MM-DD
  const mid  = (searchParams.get("mitglied_id") || "").trim();

  const parts: string[] = [];
  parts.push(`${BASE}/rest/v1/kasse?select=*`);
  if (from) parts.push(`datum=gte.${from}T00:00:00.000Z`);
  if (to)   parts.push(`datum=lte.${to}T23:59:59.999Z`);
  if (mid)  parts.push(`mitglied_id=eq.${encodeURIComponent(mid)}`);
  parts.push(`order=datum.asc`);

  const url = parts.join("&");

  const r = await fetch(url, { headers, cache:"no-store" });
  const text = await r.text();
  if (!r.ok) {
    return NextResponse.json({ ok:false, where:"select", status:r.status, detail:text.slice(0,400) }, { status:502 });
  }

  let rows: any[] = [];
  try { rows = JSON.parse(text); } catch {}

  return NextResponse.json({ ok:true, rows });
}
