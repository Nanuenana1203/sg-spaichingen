import { NextResponse } from "next/server";

// Falls du bereits eine zentrale _supabase.ts nutzt, kannst du diese drei Zeilen
// durch `import { BASE, KEY, headers } from "../_supabase";` ersetzen.
const BASE = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ?? "";
const headers: Record<string,string> = { apikey: KEY, Authorization: `Bearer ${KEY}` };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/mitglieder/next?start=1000
 * Ermittelt die nächste freie Mitgliedsnummer:
 *  - nimmt alle existierenden mitgliedsnr (String/Zahl), parst als int, nimmt max+1
 *  - wenn noch keine existiert: nimmt ?start= (Default 1)
 */
export async function GET(req: Request) {
  try {
    if (!BASE || !KEY) {
      return NextResponse.json({ ok:false, error:"env" }, { status:500 });
    }

    const u = new URL(req.url);
    const startParam = Number(u.searchParams.get("start") ?? "");
    const start = Number.isFinite(startParam) && startParam > 0 ? startParam : 1;

    // Wir holen nur die Spalte mitgliedsnr; Limit großzügig, Client ermittelt max.
    const url = `${BASE}/rest/v1/mitglieder?select=mitgliedsnr&order=mitgliedsnr.asc&limit=20000`;
    const r = await fetch(url, { headers, cache:"no-store" });
    if (!r.ok) {
      return NextResponse.json({ ok:false, error:"fetch", status:r.status, detail: await r.text() }, { status:502 });
    }
    const rows = await r.json().catch(() => []) as Array<{ mitgliedsnr: string | number | null }>;

    let max = 0;
    for (const row of rows) {
      const n = typeof row.mitgliedsnr === "number"
        ? row.mitgliedsnr
        : Number(String(row.mitgliedsnr ?? "").replace(/[^0-9]/g,""));
      if (Number.isFinite(n) && n > max) max = n;
    }

    const next = max > 0 ? max + 1 : start;
    return NextResponse.json({ ok:true, next, base:max || null, startUsed: max === 0 ? start : null });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:"server", detail:String(e?.message ?? e) }, { status:500 });
  }
}
