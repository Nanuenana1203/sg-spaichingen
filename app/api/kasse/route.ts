import { NextResponse } from "next/server";
import { BASE, KEY, headers, requireAuth } from "../_supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  if (!BASE || !KEY) {
    return NextResponse.json({ ok: false, message: "Missing Supabase environment variables" }, { status: 500 });
  }

  const url = `${BASE}/rest/v1/kasse?select=*&limit=10&order=id.desc`;
  const r = await fetch(url, { headers, cache: "no-store" });
  const text = await r.text();

  if (!r.ok) {
    return NextResponse.json({ ok: false, message: "Upstream error" }, { status: 502 });
  }

  let data: unknown[] = [];
  try { data = JSON.parse(text); } catch {}

  return NextResponse.json({ ok: true, data });
}
