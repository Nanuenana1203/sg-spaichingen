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

async function getParams(p: any): Promise<{ id: string }> {
  return p?.then ? await p : p;
}

function normTime(v: unknown): string | undefined {
  if (typeof v !== "string" || !v) return undefined;
  // "19:00" -> "19:00:00", sonst unverändert lassen
  return /^\d{2}:\d{2}$/.test(v) ? v + ":00" : v;
}

function num(v: unknown): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

// GET eine Regel (inkl. Bahn-Infos)
export async function GET(_req: Request, ctx: { params: any }) {
  if (!BASE || !KEY) return NextResponse.json({ ok:false, where:"env" }, { status:500 });
  const { id } = await getParams(ctx.params);
  const url = `${BASE}/rest/v1/bahn_regeln?id=eq.${encodeURIComponent(id)}&select=id,weekday,start_time,end_time,slot_minutes,aktiv,bahn_id,bahnen(id,nummer,name)&limit=1`;
  const r = await fetch(url, { headers, cache: "no-store" });
  const data = await r.json().catch(() => []);
  const row = Array.isArray(data) && data.length ? data[0] : null;
  return NextResponse.json(row, { status: r.ok ? 200 : r.status });
}

// PATCH Regel aktualisieren
export async function PATCH(req: Request, ctx: { params: any }) {
  if (!BASE || !KEY) return NextResponse.json({ ok:false, where:"env" }, { status:500 });
  const { id } = await getParams(ctx.params);
  const body = await req.json().catch(() => ({} as any));

  // In der Bearbeiten-Maske ändern wir bahn_id NICHT.
  const payload: Record<string, any> = {
    weekday:    typeof body.weekday === "number" ? body.weekday : undefined,
    start_time: normTime(body.start_time),
    end_time:   normTime(body.end_time),
    slot_minutes: num(body.slot_minutes),
    aktiv:      typeof body.aktiv === "boolean" ? body.aktiv : undefined,
  };

  // undefined-Felder entfernen, damit Supabase kein 400 wirft
  Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

  const url = `${BASE}/rest/v1/bahn_regeln?id=eq.${encodeURIComponent(id)}`;
  const r = await fetch(url, { method: "PATCH", headers, body: JSON.stringify(payload) });
  const data = await r.json().catch(() => []);
  return NextResponse.json(data, { status: r.ok ? 200 : r.status });
}

// DELETE Regel löschen
export async function DELETE(_req: Request, ctx: { params: any }) {
  if (!BASE || !KEY) return NextResponse.json({ ok:false, where:"env" }, { status:500 });
  const { id } = await getParams(ctx.params);
  const url = `${BASE}/rest/v1/bahn_regeln?id=eq.${encodeURIComponent(id)}`;
  const r = await fetch(url, { method: "DELETE", headers });
  return NextResponse.json({ ok: r.ok }, { status: r.ok ? 200 : r.status });
}
