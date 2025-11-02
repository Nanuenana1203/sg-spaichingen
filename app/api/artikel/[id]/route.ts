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

function idNum(s: string) { const n = Number(s); return Number.isFinite(n) ? n : null; }

export async function GET(_: Request, { params }: { params: { id: string } }) {
  if (!BASE || !KEY) return NextResponse.json({ ok:false, where:"env" }, { status:500 });
  const id = idNum(params.id); if (id == null) return NextResponse.json({ ok:false, error:"BAD_ID" }, { status:400 });
  // alles laden (damit Form alle Felder füllen kann)
  const url = `${BASE}/rest/v1/artikel?id=eq.${id}&select=*`;
  const r = await fetch(url, { headers, cache:"no-store" });
  const text = await r.text();
  if (!r.ok) return NextResponse.json({ ok:false, where:"select", status:r.status, detail:text.slice(0,400) }, { status:502 });
  const rows = JSON.parse(text || "[]"); const a = rows?.[0] ?? null;
  if (!a) return NextResponse.json({ ok:false, error:"NOT_FOUND" }, { status:404 });
  return NextResponse.json({ ok:true, artikel: a });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!BASE || !KEY) return NextResponse.json({ ok:false, where:"env" }, { status:500 });
  const id = idNum(params.id); if (id == null) return NextResponse.json({ ok:false, error:"BAD_ID" }, { status:400 });

  let b: any = {}; try { b = await req.json(); } catch {}

  // nur bekannte Spalten updaten
  const toNum = (v:any)=> (v==="" || v==null) ? null : Number(String(v).replace(",", "."));
  const patch: any = {};
  if ("artnr" in b)        patch.artnr = (b.artnr===""||b.artnr==null) ? null : String(b.artnr);
  if ("bezeichnung" in b)  patch.bezeichnung = String(b.bezeichnung ?? "").trim();
  if ("preis1" in b)       patch.preis1 = toNum(b.preis1);
  if ("preis2" in b)       patch.preis2 = toNum(b.preis2);
  if ("preis3" in b)       patch.preis3 = toNum(b.preis3);
  if ("preis4" in b)       patch.preis4 = toNum(b.preis4);
  if ("preis5" in b)       patch.preis5 = toNum(b.preis5);
  if ("preis6" in b)       patch.preis6 = toNum(b.preis6);
  if ("preis7" in b)       patch.preis7 = toNum(b.preis7);
  if ("preis8" in b)       patch.preis8 = toNum(b.preis8);
  if ("preis9" in b)       patch.preis9 = toNum(b.preis9);
  if ("kachel" in b)       patch.kachel = !!b.kachel;

  if (Object.keys(patch).length === 0) return NextResponse.json({ ok:false, error:"EMPTY_PATCH" }, { status:400 });

  const url = `${BASE}/rest/v1/artikel?id=eq.${id}`;
  const r = await fetch(url, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=representation" },
    body: JSON.stringify(patch),
  });
  const text = await r.text();
  if (!r.ok) return NextResponse.json({ ok:false, where:"update", status:r.status, detail:text.slice(0,400) }, { status:502 });
  const rows = JSON.parse(text || "[]"); const a = rows?.[0] ?? null;
  return NextResponse.json({ ok:true, artikel: a });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!BASE || !KEY) return NextResponse.json({ ok:false, where:"env" }, { status:500 });
  const id = idNum(params.id); if (id == null) return NextResponse.json({ ok:false, error:"BAD_ID" }, { status:400 });
  const url = `${BASE}/rest/v1/artikel?id=eq.${id}`;
  const r = await fetch(url, { method: "DELETE", headers });
  if (!r.ok) {
    const text = await r.text();
    return NextResponse.json({ ok:false, where:"delete", status:r.status, detail:text.slice(0,400) }, { status:502 });
  }
  return NextResponse.json({ ok:true });
}
