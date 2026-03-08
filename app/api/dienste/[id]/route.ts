import { NextResponse } from "next/server";
import { BASE, KEY, headers, requireAuth } from "../../_supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Einzelnen Dienst mit Slots und Zeilen laden */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!BASE || !KEY) return NextResponse.json({ ok: false }, { status: 500 });

  const { id } = await ctx.params;
  const url =
    `${BASE}/rest/v1/dienste` +
    `?select=id,titel,event,kategorie,aktiv,created_at,dienst_slots(id,datum_von,datum_bis,uhrzeit_von,uhrzeit_bis,dauer_minuten,anzahl_personen,dienst_zeilen(id,nummer,name,gebucht_am))` +
    `&id=eq.${encodeURIComponent(id)}&limit=1`;

  const r = await fetch(url, { headers, cache: "no-store" });
  const t = await r.text();
  if (!r.ok) return NextResponse.json({ ok: false, detail: t.slice(0, 400) }, { status: 502 });

  let rows: unknown[] = []; try { rows = JSON.parse(t); } catch {}
  if (!Array.isArray(rows) || !rows[0])
    return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

/** Dienst aktualisieren */
export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!user.isAdmin) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  if (!BASE || !KEY) return NextResponse.json({ ok: false }, { status: 500 });

  const { id } = await ctx.params;
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch {}

  const row: Record<string, unknown> = {};
  if (body?.titel !== undefined) row.titel = String(body.titel).trim();
  if (body?.event !== undefined) row.event = body.event ? String(body.event).trim() : null;
  if (body?.kategorie !== undefined) row.kategorie = body.kategorie ? String(body.kategorie).trim() : null;
  if (body?.aktiv !== undefined) row.aktiv = !!body.aktiv;

  const r = await fetch(`${BASE}/rest/v1/dienste?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(row),
    cache: "no-store",
  });
  const t = await r.text();
  if (!r.ok) return NextResponse.json({ ok: false, detail: t.slice(0, 400) }, { status: 502 });
  return NextResponse.json({ ok: true });
}

/** Dienst löschen */
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!user.isAdmin) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  if (!BASE || !KEY) return NextResponse.json({ ok: false }, { status: 500 });

  const { id } = await ctx.params;
  const r = await fetch(`${BASE}/rest/v1/dienste?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers,
    cache: "no-store",
  });
  const t = await r.text();
  if (!r.ok) return NextResponse.json({ ok: false, detail: t.slice(0, 400) }, { status: 502 });
  return NextResponse.json({ ok: true });
}
