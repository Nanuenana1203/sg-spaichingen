import { NextResponse } from "next/server";
import { BASE, KEY, headers, requireAuth } from "../../_supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function normTime(v: unknown): string | undefined {
  if (typeof v !== "string" || !v) return undefined;
  return /^\d{2}:\d{2}$/.test(v) ? v + ":00" : v;
}

function num(v: unknown): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

// GET eine Regel (inkl. Bahn-Infos)
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  if (!BASE || !KEY) return NextResponse.json({ ok: false, where: "env" }, { status: 500 });
  const { id } = await ctx.params;
  const url = `${BASE}/rest/v1/bahn_regeln?id=eq.${encodeURIComponent(id)}&select=id,weekday,start_time,end_time,slot_minutes,aktiv,bahn_id,bahnen(id,nummer,name)&limit=1`;
  const r = await fetch(url, { headers, cache: "no-store" });
  const data = await r.json().catch(() => []);
  const row = Array.isArray(data) && data.length ? data[0] : null;
  return NextResponse.json(row, { status: r.ok ? 200 : r.status });
}

// PATCH Regel aktualisieren
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!user.isAdmin) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  if (!BASE || !KEY) return NextResponse.json({ ok: false, where: "env" }, { status: 500 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({})) as Record<string, unknown>;

  const payload: Record<string, unknown> = {
    weekday:      typeof body.weekday === "number" ? body.weekday : undefined,
    start_time:   normTime(body.start_time),
    end_time:     normTime(body.end_time),
    slot_minutes: num(body.slot_minutes),
    aktiv:        typeof body.aktiv === "boolean" ? body.aktiv : undefined,
  };

  Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

  const url = `${BASE}/rest/v1/bahn_regeln?id=eq.${encodeURIComponent(id)}`;
  const r = await fetch(url, { method: "PATCH", headers, body: JSON.stringify(payload) });
  const data = await r.json().catch(() => []);
  return NextResponse.json(data, { status: r.ok ? 200 : r.status });
}

// DELETE Regel löschen
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!user.isAdmin) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  if (!BASE || !KEY) return NextResponse.json({ ok: false, where: "env" }, { status: 500 });
  const { id } = await ctx.params;
  const url = `${BASE}/rest/v1/bahn_regeln?id=eq.${encodeURIComponent(id)}`;
  const r = await fetch(url, { method: "DELETE", headers });
  return NextResponse.json({ ok: r.ok }, { status: r.ok ? 200 : r.status });
}
