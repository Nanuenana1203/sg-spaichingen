import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BASE = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ?? "";

const headers: Record<string,string> = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
};

export async function POST(req: Request) {
  if (!BASE || !KEY) return NextResponse.json({ ok:false, where:"env" }, { status:500 });

  const c = await cookies();
  let u: any = null;
  try { u = JSON.parse(c.get("sgs_user")?.value || "null"); } catch {}

  if (!u?.id) {
    return NextResponse.json({ ok:false, where:"auth", error:"NO_SESSION" }, { status:401 });
  }

  let body: any = {};
  try { body = await req.json(); } catch {}
  const rawAmount = Number(body?.amount ?? 0);
  const purpose   = String(body?.purpose ?? "").trim();

  // Nur 0 verbieten, alles andere erlauben (inkl. negativ/positiv)
  if (!Number.isFinite(rawAmount) || Object.is(rawAmount, 0)) {
    return NextResponse.json({ ok:false, error:"INVALID_AMOUNT" }, { status:400 });
  }

  // IMMER Vorzeichen umkehren: +X => -X, -X => +X
  const signedAmount = -rawAmount;

  const payload = [{
    artikel_nummer: "ENTNAHME",
    artikel_bezeichnung: purpose || "Kassenentnahme",
    menge: 1,
    gesamtpreis: signedAmount,
    benutzer_id: u.id,
    benutzer_name: u.name ?? "",
    datum: new Date().toISOString(),
  }];

  const url = `${BASE}/rest/v1/kasse`;
  const r = await fetch(url, {
    method: "POST",
    headers: { ...headers, Prefer: "return=representation" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const text = await r.text();
  if (!r.ok) {
    return NextResponse.json({ ok:false, where:"insert", status:r.status, detail:text.slice(0,400) }, { status:502 });
  }

  let rows: any[] = [];
  try { rows = JSON.parse(text); } catch {}

  return NextResponse.json({ ok:true, rows });
}
