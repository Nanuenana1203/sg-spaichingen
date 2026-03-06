import { NextResponse } from "next/server";
import { BASE, KEY, headers, requireAuth } from "../_supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Neuen Slot anlegen + Dienstzeilen automatisch erstellen */
export async function POST(req: Request) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!user.isAdmin) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  if (!BASE || !KEY) return NextResponse.json({ ok: false }, { status: 500 });

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch {}

  const dienst_id = body?.dienst_id ? Number(body.dienst_id) : null;
  const datum_von = body?.datum_von ? String(body.datum_von) : null;
  const datum_bis = body?.datum_bis ? String(body.datum_bis) : null;
  const uhrzeit_von = body?.uhrzeit_von ? String(body.uhrzeit_von) : null;
  const uhrzeit_bis = body?.uhrzeit_bis ? String(body.uhrzeit_bis) : null;
  const anzahl_personen = body?.anzahl_personen ? Number(body.anzahl_personen) : 1;

  if (!dienst_id || !datum_von || !datum_bis || !uhrzeit_von || !uhrzeit_bis)
    return NextResponse.json({ ok: false, error: "MISSING_FIELDS" }, { status: 400 });

  const slotPayload = {
    dienst_id,
    datum_von,
    datum_bis,
    uhrzeit_von,
    uhrzeit_bis,
    dauer_minuten: body?.dauer_minuten ? Number(body.dauer_minuten) : null,
    anzahl_personen,
  };

  // Slot anlegen
  const r = await fetch(`${BASE}/rest/v1/dienst_slots`, {
    method: "POST",
    headers: { ...headers, Prefer: "return=representation" },
    body: JSON.stringify(slotPayload),
    cache: "no-store",
  });
  const t = await r.text();
  if (!r.ok) return NextResponse.json({ ok: false, detail: t.slice(0, 400) }, { status: 502 });

  let slot: Record<string, unknown> | null = null;
  try {
    const rows = JSON.parse(t);
    slot = Array.isArray(rows) ? rows[0] : rows;
  } catch {
    return NextResponse.json({ ok: false, error: "PARSE_ERROR" }, { status: 500 });
  }

  const slot_id = (slot as Record<string, unknown>)?.id;
  if (!slot_id)
    return NextResponse.json({ ok: false, error: "NO_SLOT_ID" }, { status: 500 });

  // N Dienstzeilen anlegen
  const zeilen = Array.from({ length: anzahl_personen }, (_, i) => ({
    dienst_slot_id: slot_id,
    nummer: i + 1,
  }));

  const rz = await fetch(`${BASE}/rest/v1/dienst_zeilen`, {
    method: "POST",
    headers: { ...headers, Prefer: "return=representation" },
    body: JSON.stringify(zeilen),
    cache: "no-store",
  });
  const tz = await rz.text();
  if (!rz.ok) return NextResponse.json({ ok: false, detail: tz.slice(0, 400) }, { status: 502 });

  return NextResponse.json({ ok: true, slot });
}
