import { NextResponse } from "next/server";
import { BASE, KEY, headers, requireAuth } from "../_supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Einen Dienst-Slot buchen: sucht freie Zeile und belegt sie */
export async function POST(req: Request) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!BASE || !KEY) return NextResponse.json({ ok: false }, { status: 500 });

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch {}

  const slot_id = body?.slot_id ? Number(body.slot_id) : null;
  const name = body?.name ? String(body.name).trim() : "";
  const telefon = body?.telefon ? String(body.telefon).trim() : "";
  const datum = body?.datum ? String(body.datum) : null;
  const buchung_von = body?.buchung_von ? String(body.buchung_von) : null;
  const buchung_bis = body?.buchung_bis ? String(body.buchung_bis) : null;

  if (!slot_id || !name || !telefon)
    return NextResponse.json({ ok: false, error: "MISSING_FIELDS" }, { status: 400 });

  // Freie Zeile suchen
  const findUrl =
    `${BASE}/rest/v1/dienst_zeilen` +
    `?dienst_slot_id=eq.${slot_id}&name=is.null&order=nummer.asc&limit=1`;

  const rf = await fetch(findUrl, { headers, cache: "no-store" });
  const tf = await rf.text();
  if (!rf.ok) return NextResponse.json({ ok: false, detail: tf.slice(0, 400) }, { status: 502 });

  let zeilen: Record<string, unknown>[] = [];
  try { zeilen = JSON.parse(tf); } catch {}
  if (!zeilen.length)
    return NextResponse.json({ ok: false, error: "AUSGEBUCHT" }, { status: 409 });

  const zeile_id = zeilen[0].id;

  // Zeile belegen
  const patch: Record<string, unknown> = {
    name,
    telefon,
    gebucht_am: new Date().toISOString(),
  };
  if (datum) patch.datum = datum;
  if (buchung_von) patch.buchung_von = buchung_von;
  if (buchung_bis) patch.buchung_bis = buchung_bis;

  const rb = await fetch(`${BASE}/rest/v1/dienst_zeilen?id=eq.${zeile_id}&name=is.null`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(patch),
    cache: "no-store",
  });
  const tb = await rb.text();
  if (!rb.ok) return NextResponse.json({ ok: false, detail: tb.slice(0, 400) }, { status: 502 });

  return NextResponse.json({ ok: true });
}
