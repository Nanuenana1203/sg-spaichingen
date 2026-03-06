import { NextResponse } from "next/server";
import { BASE, KEY, headers, requireAuth } from "../_supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const u = await requireAuth();
  if (!u) return NextResponse.json({ ok:false, where:"auth", error:"NO_SESSION" }, { status:401 });
  if (!u.isAdmin) return NextResponse.json({ ok:false, error:"FORBIDDEN" }, { status:403 });
  if (!BASE || !KEY) return NextResponse.json({ ok:false, where:"env" }, { status:500 });

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
