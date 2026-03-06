import { NextResponse } from "next/server";
import { BASE, KEY, headers, requireAuth } from "../../_supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Slot löschen (Zeilen werden per CASCADE mitgelöscht) */
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!user.isAdmin) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  if (!BASE || !KEY) return NextResponse.json({ ok: false }, { status: 500 });

  const { id } = await ctx.params;
  const r = await fetch(`${BASE}/rest/v1/dienst_slots?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers,
    cache: "no-store",
  });
  const t = await r.text();
  if (!r.ok) return NextResponse.json({ ok: false, detail: t.slice(0, 400) }, { status: 502 });
  return NextResponse.json({ ok: true });
}
