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

// Liste
export async function GET() {
  if (!BASE || !KEY) return NextResponse.json({ ok:false, where:"env" }, { status:500 });
  const url = `${BASE}/rest/v1/artikel?select=id,artnr,bezeichnung,preis1&order=artnr.asc.nullsfirst`;
  const r = await fetch(url, { headers, cache:"no-store" });
  const text = await r.text();
  if (!r.ok) return NextResponse.json({ ok:false, where:"select", status:r.status, detail:text.slice(0,400) }, { status:502 });
  try { return NextResponse.json(JSON.parse(text)); } catch { return NextResponse.json([]); }
}

// Anlegen
export async function POST(req: Request) {
  if (!BASE || !KEY) return NextResponse.json({ ok:false, where:"env" }, { status:500 });

  let body: any = {};
  try { body = await req.json(); } catch {}

  const artnr       = (body?.artnr == null || body?.artnr === "") ? null : String(body.artnr);
  const bezeichnung = String(body?.bezeichnung ?? "").trim();
  const preis1      = (body?.preis1 == null || body?.preis1 === "") ? null : Number(body.preis1);

  if (!bezeichnung) {
    return NextResponse.json({ ok:false, error:"MISSING_FIELDS" }, { status:400 });
  }

  const payload: any = { bezeichnung, preis1 };
  if (artnr !== null) payload.artnr = artnr;

  const insUrl = `${BASE}/rest/v1/artikel`;
  const r = await fetch(insUrl, {
    method: "POST",
    headers: { ...headers, Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });
  const text = await r.text();
  if (!r.ok) return NextResponse.json({ ok:false, where:"insert", status:r.status, detail:text.slice(0,400) }, { status:502 });
  let rows: any[] = []; try { rows = JSON.parse(text); } catch {}
  const rec = Array.isArray(rows) ? rows[0] : rows;
  return NextResponse.json({ ok:true, artikel: rec });
}
