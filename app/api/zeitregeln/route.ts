import { NextResponse } from "next/server";
import { BASE, KEY, headers, requireAuth } from "../_supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** LISTE: Zeitregeln inkl. zugehöriger Bahn (nummer, name) */
export async function GET() {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  if (!BASE || !KEY) return NextResponse.json({ ok: false, where: "env" }, { status: 500 });

  const url =
    `${BASE}/rest/v1/bahn_regeln` +
    `?select=id,weekday,start_time,end_time,slot_minutes,aktiv,` +
    `bahn:bahn_id(id,nummer,name)` +
    `&order=weekday.asc&order=start_time.asc`;

  const r = await fetch(url, { headers, cache: "no-store" });
  const data = await r.json().catch(() => []);

  const out = Array.isArray(data) ? data.map((row: Record<string, unknown>) => ({
    id: row.id,
    weekday: row.weekday,
    weekday_name: ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"][Number(row.weekday) || 0],
    start_time: row.start_time ?? "",
    end_time: row.end_time ?? "",
    slot_minutes: row.slot_minutes ?? null,
    aktiv: !!row.aktiv,
    bahn: row.bahn ?? null,
  })) : [];

  return NextResponse.json(out, { status: r.ok ? 200 : r.status });
}

/** ANLEGEN: eine oder mehrere Regeln (für alle Bahnen oder Auswahl) */
export async function POST(req: Request) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!user.isAdmin) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  if (!BASE || !KEY) return NextResponse.json({ ok: false, where: "env" }, { status: 500 });
  const body = await req.json().catch(() => null) as {
    weekday: number;
    start_time: string;
    end_time: string;
    slot_minutes: number;
    aktiv: boolean;
    alle_bahnen?: boolean;
    bahn_ids?: number[];
  } | null;

  if (!body) return NextResponse.json({ ok: false, message: "invalid body" }, { status: 400 });

  let ids: number[] = Array.isArray(body.bahn_ids) ? body.bahn_ids : [];
  if (body.alle_bahnen) {
    const allUrl = `${BASE}/rest/v1/bahnen?select=id`;
    const rr = await fetch(allUrl, { headers, cache: "no-store" });
    const arr = await rr.json().catch(() => []);
    ids = Array.isArray(arr) ? arr.map((x: { id: unknown }) => x.id).filter((x): x is number => typeof x === "number") : [];
  }
  if (!ids.length) {
    return NextResponse.json({ ok: false, message: "no bahn_ids" }, { status: 400 });
  }

  const rows = ids.map(id => ({
    bahn_id: id,
    weekday: body.weekday,
    start_time: body.start_time,
    end_time: body.end_time,
    slot_minutes: body.slot_minutes,
    aktiv: body.aktiv ?? true,
  }));

  const insUrl = `${BASE}/rest/v1/bahn_regeln`;
  const r = await fetch(insUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(rows),
  });

  const res = await r.json().catch(() => null);
  return NextResponse.json({ ok: r.ok, data: res }, { status: r.ok ? 201 : r.status });
}

/** LÖSCHEN einzelner Regeln */
export async function DELETE(req: Request) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!user.isAdmin) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  if (!BASE || !KEY) return NextResponse.json({ ok: false, where: "env" }, { status: 500 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, message: "id missing" }, { status: 400 });

  const url = `${BASE}/rest/v1/bahn_regeln?id=eq.${encodeURIComponent(id)}`;
  const r = await fetch(url, { method: "DELETE", headers });
  return NextResponse.json({ ok: r.ok }, { status: r.ok ? 200 : r.status });
}
