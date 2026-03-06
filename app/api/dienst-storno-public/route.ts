import { NextResponse } from "next/server";
import { BASE, KEY, headers } from "../_supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Öffentlich: Buchungen nach Name suchen */
export async function GET(req: Request) {
  if (!BASE || !KEY) return NextResponse.json({ ok: false }, { status: 500 });

  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name")?.trim() ?? "";
  if (!name) return NextResponse.json({ ok: false, error: "MISSING_NAME" }, { status: 400 });

  const url =
    `${BASE}/rest/v1/dienst_zeilen` +
    `?select=id,nummer,name,telefon,datum,buchung_von,buchung_bis,gebucht_am,dienst_slots(id,datum_von,datum_bis,uhrzeit_von,uhrzeit_bis,dienste(id,titel))` +
    `&name=ilike.${encodeURIComponent(`*${name}*`)}` +
    `&order=gebucht_am.desc`;

  const r = await fetch(url, { headers, cache: "no-store" });
  const t = await r.text();
  if (!r.ok) return NextResponse.json({ ok: false, detail: t.slice(0, 400) }, { status: 502 });

  try {
    return NextResponse.json({ ok: true, items: JSON.parse(t) });
  } catch {
    return NextResponse.json({ ok: true, items: [] });
  }
}

/** Öffentlich: Buchung freigeben */
export async function DELETE(req: Request) {
  if (!BASE || !KEY) return NextResponse.json({ ok: false }, { status: 500 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "MISSING_ID" }, { status: 400 });

  const r = await fetch(`${BASE}/rest/v1/dienst_zeilen?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      name: null,
      telefon: null,
      datum: null,
      buchung_von: null,
      buchung_bis: null,
      gebucht_am: null,
    }),
    cache: "no-store",
  });
  const t = await r.text();
  if (!r.ok) return NextResponse.json({ ok: false, detail: t.slice(0, 400) }, { status: 502 });
  return NextResponse.json({ ok: true });
}
