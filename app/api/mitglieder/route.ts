import { NextResponse } from "next/server";
import { BASE, KEY, headers, requireAuth } from "../_supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Liste (immer alle Mitglieder, sortiert nach Name) */
export async function GET() {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  if (!BASE || !KEY)
    return NextResponse.json({ ok: false, where: "env" }, { status: 500 });

  const url =
    `${BASE}/rest/v1/mitglieder` +
    `?select=id,mitgliedsnr,name,strasse,landkz,plz,ort,preisgruppe,ausweisnr,geburtsdatum,mitglied,gesperrt` +
    `&order=name.asc`;

  const r = await fetch(url, { headers, cache: "no-store" });
  const t = await r.text();

  if (!r.ok)
    return NextResponse.json(
      { ok: false, where: "select", status: r.status, detail: t.slice(0, 400) },
      { status: 502 }
    );

  try {
    return NextResponse.json(JSON.parse(t));
  } catch {
    return NextResponse.json([]);
  }
}

/** Neues Mitglied anlegen */
export async function POST(req: Request) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!user.isAdmin) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  if (!BASE || !KEY)
    return NextResponse.json({ ok: false, where: "env" }, { status: 500 });

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {}

  const payload = {
    mitgliedsnr:
      body?.mitgliedsnr == null || body?.mitgliedsnr === ""
        ? null
        : String(body.mitgliedsnr),
    name: String(body?.name ?? "").trim(),
    strasse: body?.strasse ?? null,
    landkz: String(body?.landkz ?? "D").trim() || "D",
    plz: body?.plz ?? null,
    ort: body?.ort ?? null,
    preisgruppe:
      body?.preisgruppe == null || body?.preisgruppe === ""
        ? null
        : Number(body.preisgruppe),
    ausweisnr: body?.ausweisnr ?? null,
    mitglied: body?.mitglied === undefined ? true : !!body?.mitglied,
    gesperrt: !!body?.gesperrt,
  };

  if (!payload.name)
    return NextResponse.json({ ok: false, error: "MISSING_FIELDS" }, { status: 400 });

  const insUrl = `${BASE}/rest/v1/mitglieder`;
  const r = await fetch(insUrl, {
    method: "POST",
    headers: { ...headers, Prefer: "return=representation" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const t = await r.text();

  if (!r.ok)
    return NextResponse.json(
      { ok: false, where: "insert", status: r.status, detail: t.slice(0, 400) },
      { status: 502 }
    );

  try {
    const rows = JSON.parse(t);
    return NextResponse.json({ ok: true, mitglied: Array.isArray(rows) ? rows[0] : rows });
  } catch {
    return NextResponse.json({ ok: true, raw: t });
  }
}
