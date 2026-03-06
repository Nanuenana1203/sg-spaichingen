import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { BASE, KEY, headers, requireAuth } from "../_supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PUT(req: Request) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!BASE || !KEY) return NextResponse.json({ ok: false }, { status: 500 });

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch {}

  const aktuell = String(body?.aktuell ?? "").trim();
  const neu = String(body?.neu ?? "").trim();

  if (!aktuell || !neu)
    return NextResponse.json({ ok: false, error: "MISSING_FIELDS" }, { status: 400 });
  if (neu.length < 6)
    return NextResponse.json({ ok: false, error: "TOO_SHORT" }, { status: 400 });

  // Aktuellen Hash aus DB laden
  const r = await fetch(
    `${BASE}/rest/v1/benutzer?select=id,kennwort&id=eq.${user.id}&limit=1`,
    { headers, cache: "no-store" }
  );
  const t = await r.text();
  if (!r.ok) return NextResponse.json({ ok: false, detail: t.slice(0, 400) }, { status: 502 });

  let rows: Record<string, unknown>[] = [];
  try { rows = JSON.parse(t); } catch {}
  const dbUser = rows[0];
  if (!dbUser?.kennwort)
    return NextResponse.json({ ok: false, error: "USER_NOT_FOUND" }, { status: 404 });

  // Aktuelles Kennwort prüfen
  const valid = await bcrypt.compare(aktuell, String(dbUser.kennwort));
  if (!valid)
    return NextResponse.json({ ok: false, error: "WRONG_PASSWORD" }, { status: 403 });

  // Neues Kennwort hashen und speichern
  const hash = await bcrypt.hash(neu, 12);
  const ru = await fetch(`${BASE}/rest/v1/benutzer?id=eq.${user.id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ kennwort: hash }),
    cache: "no-store",
  });
  const tu = await ru.text();
  if (!ru.ok) return NextResponse.json({ ok: false, detail: tu.slice(0, 400) }, { status: 502 });

  return NextResponse.json({ ok: true });
}
