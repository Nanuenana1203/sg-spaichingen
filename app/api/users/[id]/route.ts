import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { BASE, KEY, headers, requireAuth, toBool } from "../../_supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function parseId(param: string | string[] | undefined) {
  const v = Array.isArray(param) ? param[0] : param;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!user.isAdmin) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  if (!BASE || !KEY) return NextResponse.json({ ok: false, where: "env" }, { status: 500 });
  const { id: idParam } = await ctx.params;
  const id = parseId(idParam);
  if (id == null) return NextResponse.json({ ok: false, error: "BAD_ID" }, { status: 400 });

  const url = `${BASE}/rest/v1/benutzer?id=eq.${id}&select=id,name,email,istadmin`;
  const r = await fetch(url, { headers, cache: "no-store" });
  const text = await r.text();
  if (!r.ok) return NextResponse.json({ ok: false, where: "select", status: r.status, detail: text.slice(0, 400) }, { status: 502 });

  let rows: unknown[] = [];
  try { rows = JSON.parse(text); } catch {}
  const fetchedUser = Array.isArray(rows) ? rows[0] : null;
  if (!fetchedUser) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ ok: true, user: fetchedUser });
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!user.isAdmin) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  if (!BASE || !KEY) return NextResponse.json({ ok: false, where: "env" }, { status: 500 });
  const { id: idParam } = await ctx.params;
  const id = parseId(idParam);
  if (id == null) return NextResponse.json({ ok: false, error: "BAD_ID" }, { status: 400 });

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch {}

  const patch: Record<string, unknown> = {};
  if (typeof body.name === "string") patch.name = body.name.trim();
  if (body.email === null || typeof body.email === "string") patch.email = body.email ?? null;
  if (typeof body.istadmin !== "undefined") patch.istadmin = toBool(body.istadmin);
  if (typeof body.kennwort === "string" && body.kennwort.trim().length > 0) {
    patch.kennwort = await bcrypt.hash(body.kennwort.trim(), 10);
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: "EMPTY_PATCH" }, { status: 400 });
  }

  const url = `${BASE}/rest/v1/benutzer?id=eq.${id}`;
  const r = await fetch(url, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=representation" },
    body: JSON.stringify(patch),
  });
  const text = await r.text();
  if (!r.ok) {
    return NextResponse.json({ ok: false, where: "update", status: r.status, detail: text.slice(0, 400) }, { status: 502 });
  }
  let rows: unknown[] = [];
  try { rows = JSON.parse(text); } catch {}
  const updatedUser = Array.isArray(rows) ? rows[0] : null;
  return NextResponse.json({ ok: true, user: updatedUser });
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!user.isAdmin) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  if (!BASE || !KEY) return NextResponse.json({ ok: false, where: "env" }, { status: 500 });
  const { id: idParam } = await ctx.params;
  const id = parseId(idParam);
  if (id == null) return NextResponse.json({ ok: false, error: "BAD_ID" }, { status: 400 });

  const url = `${BASE}/rest/v1/benutzer?id=eq.${id}`;
  const r = await fetch(url, { method: "DELETE", headers });
  if (!r.ok) {
    const text = await r.text();
    return NextResponse.json({ ok: false, where: "delete", status: r.status, detail: text.slice(0, 400) }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
