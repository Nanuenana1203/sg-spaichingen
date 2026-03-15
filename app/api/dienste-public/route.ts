import { NextResponse } from "next/server";
import { BASE, KEY, headers } from "../_supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Öffentlich: aktive Dienste mit Slots — Namen sichtbar, keine Telefonnummern */
export async function GET() {
  if (!BASE || !KEY) return NextResponse.json([], { status: 200 });

  // Dienste + Slots + Zeilen laden (ohne telefon)
  const url =
    `${BASE}/rest/v1/dienste` +
    `?select=id,titel,beschreibung,event,kategorie,aktiv,created_at,dienst_slots(id,datum_von,datum_bis,uhrzeit_von,uhrzeit_bis,dauer_minuten,anzahl_personen,dienst_zeilen(id,nummer,name,datum,buchung_von,buchung_bis))` +
    `&aktiv=eq.true` +
    `&order=created_at.desc`;

  const r = await fetch(url, { headers, cache: "no-store" });
  const t = await r.text();
  if (!r.ok) return NextResponse.json([], { status: 200 });

  let dienste: Record<string, unknown>[] = [];
  try { dienste = JSON.parse(t); } catch { return NextResponse.json([]); }

  // anzahl_gebucht pro Slot berechnen und Slots anreichern
  const result = dienste.map((d: Record<string, unknown>) => ({
    ...d,
    dienst_slots: ((d.dienst_slots as Record<string, unknown>[]) ?? []).map((s: Record<string, unknown>) => {
      const zeilen = (s.dienst_zeilen as Record<string, unknown>[]) ?? [];
      return {
        ...s,
        anzahl_gebucht: zeilen.filter(z => z.name).length,
        dienst_zeilen: zeilen, // Namen enthalten, kein telefon
      };
    }),
  }));

  return NextResponse.json(result);
}
