import { NextResponse } from "next/server";

const BASE = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ?? "";

const headers: Record<string,string> = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET: Liste
export async function GET() {
  if (!BASE || !KEY) return NextResponse.json({ ok:false, where:"env" }, { status:500 });
  const url = `${BASE}/rest/v1/bahnen?select=id,nummer,name&order=nummer.asc&order=name.asc`;
  const r = await fetch(url, { headers, cache:"no-store" });
  const data = await r.json().catch(()=>[]);
  return NextResponse.json(Array.isArray(data)?data:[], { status: r.ok ? 200 : r.status });
}

// POST: Neu anlegen
export async function POST(req: Request) {
  if (!BASE || !KEY) return NextResponse.json({ ok:false, where:"env" }, { status:500 });
  const b = await req.json().catch(()=>({}));
  const payload = {
    nummer: typeof b.nummer === "string" ? b.nummer.trim() : null,
    name:   typeof b.name   === "string" ? b.name.trim()   : null,
  };
  if (!payload.name) return NextResponse.json({ ok:false, msg:"missing name" }, { status:400 });

  const r = await fetch(`${BASE}/rest/v1/bahnen`, {
    method:"POST",
    headers:{ ...headers, Prefer:"return=representation" },
    body: JSON.stringify(payload),
  });
  const data = await r.json().catch(()=>[]);
  const row = Array.isArray(data) && data.length ? data[0] : null;
  return NextResponse.json(row, { status: r.ok ? 201 : r.status });
}
