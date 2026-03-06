import { NextResponse } from "next/server";
import { BASE, KEY, headers, requireAuth } from "../_supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!BASE || !KEY) return NextResponse.json({ ok:false, error:"env" }, { status:500 });
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") ?? new Date().toISOString().slice(0,10);
  const to   = searchParams.get("to")   ?? from;

  const url = `${BASE}/rest/v1/bahn_buchungen?select=datum,bahn_id,start_time,end_time,name,email,bahnen(name)&datum=gte.${from}&datum=lte.${to}&order=datum.asc,start_time.asc`;
  const r = await fetch(url, { headers });
  if (!r.ok) return NextResponse.json({ ok:false, error: await r.text() }, { status: r.status });
  const data = await r.json();
  return NextResponse.json(data);
}
