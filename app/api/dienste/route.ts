import { NextResponse } from "next/server";
import { BASE, KEY, headers, requireAuth } from "../_supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Liste aller Dienste mit Slots und Zeilen */
export async function GET() {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!BASE || !KEY) return NextResponse.json({ ok: false }, { status: 500 });

  const url =
    `${BASE}/rest/v1/dienste` +
    `?select=id,titel,event,kategorie,aktiv,created_at,dienst_slots(id,datum_von,datum_bis,uhrzeit_von,uhrzeit_bis,dauer_minuten,anzahl_personen,dienst_zeilen(id,nummer,name,telefon,datum,buchung_von,buchung_bis,gebucht_am))` +
    `&order=created_at.desc`;

  const r = await fetch(url, { headers, cache: "no-store" });
  const t = await r.text();
  if (!r.ok) return NextResponse.json({ ok: false, detail: t.slice(0, 400) }, { status: 502 });
  try { return NextResponse.json(JSON.parse(t)); } catch { return NextResponse.json([]); }
}

/** Neuen Dienst anlegen */
export async function POST(req: Request) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!user.isAdmin) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  if (!BASE || !KEY) return NextResponse.json({ ok: false }, { status: 500 });

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch {}

  const titel = String(body?.titel ?? "").trim();
  if (!titel) return NextResponse.json({ ok: false, error: "MISSING_TITEL" }, { status: 400 });

  const payload = {
    titel,
    event: body?.event ? String(body.event).trim() : null,
    kategorie: body?.kategorie ? String(body.kategorie).trim() : null,
    aktiv: body?.aktiv === false ? false : true,
  };

  const r = await fetch(`${BASE}/rest/v1/dienste`, {
    method: "POST",
    headers: { ...headers, Prefer: "return=representation" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const t = await r.text();
  if (!r.ok) return NextResponse.json({ ok: false, detail: t.slice(0, 400) }, { status: 502 });

  try {
    const rows = JSON.parse(t);
    return NextResponse.json({ ok: true, dienst: Array.isArray(rows) ? rows[0] : rows });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
