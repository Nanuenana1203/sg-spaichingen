import { NextResponse } from "next/server";
import { BASE, KEY, headers } from "../_supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Body = {
  bahn_id: number;
  name: string;
  email: string;
  datum: string;     // YYYY-MM-DD
  startzeit: string; // HH:MM
};

export async function POST(req: Request) {
  if (!BASE || !KEY) return NextResponse.json({ ok:false, error:"env" }, { status:500 });
  const body = await req.json() as Body;

  if (!body?.bahn_id || !body?.name || !body?.email || !body?.datum || !body?.startzeit) {
    return NextResponse.json({ ok:false, error:"missing fields" }, { status:400 });
  }

  // Wochentag wie in DB: getUTCDay() => 0=So..6=Sa
  const d = new Date(`${body.datum}T00:00:00Z`);
  const weekday = d.getUTCDay();

  const regelnUrl = `${BASE}/rest/v1/bahn_regeln?select=slot_minutes&bahn_id=eq.${body.bahn_id}&weekday=eq.${weekday}&aktiv=eq.true&limit=1`;
  const rReg = await fetch(regelnUrl, { headers, cache:"no-store" });
  const regeln = rReg.ok ? await rReg.json() : [];
  const slotMin: number = regeln?.[0]?.slot_minutes ?? 60;

  const start = new Date(`1970-01-01T${body.startzeit}:00Z`);
  const end   = new Date(start.getTime() + slotMin*60000);
  const pad = (n:number)=> String(n).padStart(2,"0");
  const endStr = `${pad(end.getUTCHours())}:${pad(end.getUTCMinutes())}:00`;

  // Doppelbuchung verhindern
  const chkUrl = `${BASE}/rest/v1/bahn_buchungen?select=id&bahn_id=eq.${body.bahn_id}&datum=eq.${body.datum}&start_time=eq.${body.startzeit}:00&end_time=eq.${endStr}`;
  const chk = await fetch(chkUrl, { headers, cache:"no-store" });
  if (!chk.ok) return NextResponse.json({ ok:false, error: await chk.text() }, { status: chk.status });
  const exists = await chk.json();
  if (Array.isArray(exists) && exists.length>0) {
    return NextResponse.json({ ok:false, error:"Bereits gebucht" }, { status:409 });
  }

  // Insert
  const insUrl = `${BASE}/rest/v1/bahn_buchungen`;
  const ins = await fetch(insUrl, {
    method: "POST",
    headers: { ...headers, "Content-Type":"application/json" },
    body: JSON.stringify({
      bahn_id: body.bahn_id,
      datum: body.datum,
      start_time: `${body.startzeit}:00`,
      end_time: endStr,
      name: body.name.trim(),
      email: body.email.trim(),
    })
  });

  if (!ins.ok) {
    const err = await ins.text();
    return NextResponse.json({ ok:false, error: err || "insert failed" }, { status: 400 });
  }

  // Vergangene Buchungen im Hintergrund löschen (fire-and-forget)
  const today = new Date().toISOString().slice(0, 10);
  void fetch(`${BASE}/rest/v1/bahn_buchungen?datum=lt.${today}`, {
    method: "DELETE",
    headers,
  });

  return NextResponse.json({ ok:true });
}
