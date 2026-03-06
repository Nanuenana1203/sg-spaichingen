import { NextResponse } from "next/server";
import { BASE, KEY, headers } from "../_supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Öffentlich: aktive Dienste mit Slots — keine Namen oder Telefonnummern */
export async function GET() {
  if (!BASE || !KEY) return NextResponse.json([], { status: 200 });

  // Dienste + Slots laden
  const url =
    `${BASE}/rest/v1/dienste` +
    `?select=id,titel,beschreibung,aktiv,created_at,dienst_slots(id,datum_von,datum_bis,uhrzeit_von,uhrzeit_bis,dauer_minuten,anzahl_personen)` +
    `&aktiv=eq.true` +
    `&order=created_at.desc`;

  const r = await fetch(url, { headers, cache: "no-store" });
  const t = await r.text();
  if (!r.ok) return NextResponse.json([], { status: 200 });

  let dienste: Record<string, unknown>[] = [];
  try { dienste = JSON.parse(t); } catch { return NextResponse.json([]); }

  // Pro Slot: Anzahl gebuchter Zeilen nachladen (ohne Namen preiszugeben)
  const slotIds = dienste.flatMap((d: Record<string, unknown>) =>
    ((d.dienst_slots as Record<string, unknown>[]) ?? []).map((s: Record<string, unknown>) => s.id)
  );

  let buchungenMap: Record<number, number> = {};
  if (slotIds.length > 0) {
    const bUrl =
      `${BASE}/rest/v1/dienst_zeilen` +
      `?select=dienst_slot_id` +
      `&dienst_slot_id=in.(${slotIds.join(",")})` +
      `&name=not.is.null`;
    const rb = await fetch(bUrl, { headers, cache: "no-store" });
    const tb = await rb.text();
    try {
      const rows: { dienst_slot_id: number }[] = JSON.parse(tb);
      for (const row of rows) {
        buchungenMap[row.dienst_slot_id] = (buchungenMap[row.dienst_slot_id] ?? 0) + 1;
      }
    } catch {}
  }

  // Slots um anzahl_gebucht ergänzen — keine Personendaten
  const result = dienste.map((d: Record<string, unknown>) => ({
    ...d,
    dienst_slots: ((d.dienst_slots as Record<string, unknown>[]) ?? []).map((s: Record<string, unknown>) => ({
      ...s,
      anzahl_gebucht: buchungenMap[s.id as number] ?? 0,
      dienst_zeilen: [], // keine Personendaten im öffentlichen Bereich
    })),
  }));

  return NextResponse.json(result);
}
