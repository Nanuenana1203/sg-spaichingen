import { NextResponse } from "next/server";
import { BASE, KEY, headers, requireAuth } from "../_supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET: Liste
export async function GET() {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  if (!BASE || !KEY) return NextResponse.json({ ok: false, where: "env" }, { status: 500 });
  const url = `${BASE}/rest/v1/bahnen?select=id,nummer,name&order=nummer.asc&order=name.asc`;
  const r = await fetch(url, { headers, cache: "no-store" });
  const data = await r.json().catch(() => []);
  return NextResponse.json(Array.isArray(data) ? data : [], { status: r.ok ? 200 : r.status });
}

// POST: Neu anlegen
export async function POST(req: Request) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!user.isAdmin) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  if (!BASE || !KEY) return NextResponse.json({ ok: false, where: "env" }, { status: 500 });
  const b = await req.json().catch(() => ({})) as Record<string, unknown>;
  const payload = {
    nummer: typeof b.nummer === "string" ? b.nummer.trim() : null,
    name:   typeof b.name   === "string" ? b.name.trim()   : null,
  };
  if (!payload.name) return NextResponse.json({ ok: false, msg: "missing name" }, { status: 400 });

  const r = await fetch(`${BASE}/rest/v1/bahnen`, {
    method: "POST",
    headers: { ...headers, Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });
  const data = await r.json().catch(() => []);
  const row = Array.isArray(data) && data.length ? data[0] : null;
  return NextResponse.json(row, { status: r.ok ? 201 : r.status });
}
