import { NextResponse } from "next/server";

const BASE = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ?? "";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ItemIn = {
  id: number;               // artikel_id
  artnr?: string | null;    // optional vom Client
  bezeichnung?: string;     // optional vom Client
  qty: number;
  preis: number;
};

export async function POST(req: Request) {
  try {
    if (!BASE || !KEY) {
      return NextResponse.json({ ok:false, error:"Server env fehlt" }, { status:500 });
    }

    const body = await req.json();
    const {
      mitglied_id,
      mitglied_nummer,
      mitglied_name,
      benutzer_id,
      benutzer_name,
      items,
    }: {
      mitglied_id?: number | null;
      mitglied_nummer?: string | null;
      mitglied_name?: string | null;
      benutzer_id?: number | null;
      benutzer_name?: string | null;
      items: ItemIn[];
    } = body ?? {};

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ ok:false, error:"Warenkorb leer" }, { status:400 });
    }

    // optional: Artikel-Stammdaten nachladen, falls nicht mitgesendet
    const needLookup = items.some(i => i.artnr == null || i.bezeichnung == null);
    let artikelMap: Record<number,{artnr:string|null; bezeichnung:string|null}> = {};
    if (needLookup) {
      const ids = [...new Set(items.map(i => i.id))];
      const url = `${BASE}/rest/v1/artikel?id=in.(${ids.join(",")})&select=id,artnr,bezeichnung`;
      const res = await fetch(url, { headers: { apikey: KEY, Authorization:`Bearer ${KEY}` }});
      const data = res.ok ? await res.json() : [];
      for (const a of data) artikelMap[a.id] = { artnr: a.artnr ?? null, bezeichnung: a.bezeichnung ?? null };
    }

    const heute   = new Date();
    const datum   = heute.toISOString().slice(0,10);
    const uhrzeit = heute.toTimeString().slice(0,8);

    const rows = items.map(i => {
      const stammdaten = artikelMap[i.id] ?? {};
      const artnr       = i.artnr ?? stammdaten.artnr ?? null;
      const bezeichnung = i.bezeichnung ?? stammdaten.bezeichnung ?? null;
      const menge       = Number(i.qty) || 0;
      const einzelpreis = Number(i.preis) || 0;
      const gesamtpreis = Number((menge * einzelpreis).toFixed(2));

      return {
        datum,
        uhrzeit,
        mitglied_id:       mitglied_id ?? null,
        mitglied_nummer:   mitglied_nummer ?? null,
        mitglied_name:     mitglied_name ?? null,
        artikel_id:        i.id,
        artikel_nummer:    artnr,
        artikel_bezeichnung: bezeichnung,
        menge,
        einzelpreis,
        gesamtpreis,
        benutzer_id:       benutzer_id ?? null,
        benutzer_name:     benutzer_name ?? null,
      };
    });

    const ins = await fetch(`${BASE}/rest/v1/kasse`, {
      method: "POST",
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify(rows),
    });

    if (!ins.ok) {
      const msg = await ins.text();
      return NextResponse.json({ ok:false, error: msg || "Insert fehlgeschlagen" }, { status:500 });
    }

    return NextResponse.json({ ok:true, count: rows.length });
  } catch (err:any) {
    return NextResponse.json({ ok:false, error: err?.message ?? "Serverfehler" }, { status:500 });
  }
}
