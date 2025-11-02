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

/* Helpers */
function numOrNull(v: any): number | null {
  if (v === "" || v == null) return null;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}
function toBool(v: any): boolean {
  if (v === true) return true;
  if (v === false) return false;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    return s === "1" || s === "true" || s === "t" || s === "yes";
  }
  return false;
}

/* Liste */
export async function GET() {
  if (!BASE || !KEY) return NextResponse.json({ ok:false, where:"env" }, { status:500 });
  const url =
    `${BASE}/rest/v1/artikel` +
    `?select=id,artnr,bezeichnung,kachel,preis1,preis2,preis3,preis4,preis5,preis6,preis7,preis8,preis9` +
    `&order=artnr.asc.nullsfirst`;
  const r = await fetch(url, { headers, cache: "no-store" });
  const text = await r.text();
  if (!r.ok) return NextResponse.json({ ok:false, where:"select", status:r.status, detail:text.slice(0,400) }, { status:502 });
  try { return NextResponse.json(JSON.parse(text)); } catch { return NextResponse.json([]); }
}

/* Anlegen */
export async function POST(req: Request) {
  if (!BASE || !KEY) return NextResponse.json({ ok:false, where:"env" }, { status:500 });

  let body: any = {};
  try { body = await req.json(); } catch {}

  const artnr       = (body?.artnr == null || body?.artnr === "") ? null : String(body.artnr);
  const bezeichnung = String(body?.bezeichnung ?? "").trim();

  if (!bezeichnung) {
    return NextResponse.json({ ok:false, error:"MISSING_FIELDS" }, { status:400 });
  }

  const payload: any = {
    bezeichnung,
    preis1: numOrNull(body?.preis1),
    preis2: numOrNull(body?.preis2),
    preis3: numOrNull(body?.preis3),
    preis4: numOrNull(body?.preis4),
    preis5: numOrNull(body?.preis5),
    preis6: numOrNull(body?.preis6),
    preis7: numOrNull(body?.preis7),
    preis8: numOrNull(body?.preis8),
    preis9: numOrNull(body?.preis9),
    kachel: toBool(body?.kachel),
  };
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