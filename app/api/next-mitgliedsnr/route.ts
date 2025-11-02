import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BASE = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ?? "";

const headers: Record<string,string> = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
};

export async function GET() {
  if (!BASE || !KEY) {
    return NextResponse.json({ ok:false, error:"env" }, { status:500 });
  }

  try {
    // Startwert optional aus app_settings lesen
    let startFrom = 1;
    try {
      const r0 = await fetch(`${BASE}/rest/v1/app_settings?select=value&key=eq.mitglied_start&limit=1`, { headers, cache:"no-store" });
      if (r0.ok) {
        const a = await r0.json().catch(() => []);
        const v = Array.isArray(a) && a[0]?.value != null ? Number(a[0].value) : NaN;
        if (Number.isFinite(v) && v >= 1) startFrom = v;
      }
    } catch {}

    // Höchste vorhandene numerische Mitgliedsnummer ermitteln
    const r1 = await fetch(`${BASE}/rest/v1/mitglieder?select=mitgliedsnr&order=id.desc&limit=1000`, { headers, cache:"no-store" });
    const rows = r1.ok ? await r1.json().catch(() => []) : [];
    const nums = (Array.isArray(rows) ? rows : [])
      .map((x:any) => String(x?.mitgliedsnr ?? "").trim())
      .filter((s:string) => /^[0-9]+$/.test(s))
      .map((s:string) => Number(s))
      .filter((n:number) => Number.isFinite(n));

    const maxNum = nums.length ? Math.max(...nums) : 0;
    const nr = Math.max(startFrom, maxNum + 1);

    return NextResponse.json({ ok:true, nr });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:"server", detail:String(e?.message ?? e) }, { status:500 });
  }
}
