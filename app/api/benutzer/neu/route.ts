import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { BASE, KEY, headers, requireAuth, toBool } from "../../_supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!user.isAdmin) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  if (!BASE || !KEY) return NextResponse.json({ ok: false, where: "env" }, { status: 500 });

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch {}

  const name     = String(body?.name ?? body?.p_name ?? "").trim();
  const plain    = String(body?.kennwort ?? body?.password ?? body?.p_password ?? "").trim();
  const email    = (body?.email ?? null) ? String(body.email).trim() : null;
  const istadmin = toBool(body?.istadmin ?? body?.isAdmin ?? false);

  if (!name || !plain) return NextResponse.json({ ok: false, error: "MISSING_FIELDS" }, { status: 400 });

  // Name unique?
  const existsUrl = `${BASE}/rest/v1/benutzer?select=id&name=eq.${encodeURIComponent(name)}&limit=1`;
  const er = await fetch(existsUrl, { headers, cache: "no-store" });
  const arr = await er.json().catch(() => []);
  if (Array.isArray(arr) && arr[0]) return NextResponse.json({ ok: false, error: "DUPLICATE_NAME" }, { status: 409 });

  const kennwort = await bcrypt.hash(plain, 10);

  const insUrl = `${BASE}/rest/v1/benutzer`;
  const payload = { name, email, istadmin, kennwort };

  const r = await fetch(insUrl, {
    method: "POST",
    headers: { ...headers, Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });

  const text = await r.text();
  if (!r.ok) return NextResponse.json({ ok: false, where: "insert", status: r.status, detail: text.slice(0, 400) }, { status: 502 });
  let rows: unknown[] = []; try { rows = JSON.parse(text); } catch {}
  const newUser = Array.isArray(rows) ? rows[0] : rows;
  return NextResponse.json({ ok: true, user: newUser });
}
