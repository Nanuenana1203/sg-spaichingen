import { NextResponse } from "next/server";
import { BASE, KEY, headers, requireAuth } from "../../_supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    if (!user) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    if (!user.isAdmin) return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

    if (!BASE || !KEY) {
      return NextResponse.json({ ok: false, error: "MISSING_SUPABASE_ENV" }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}) as Record<string, unknown>);
    const benutzerId = Number(body?.benutzerId);
    const deviceToken = String(body?.deviceToken ?? "").trim();

    if (!benutzerId || !Number.isFinite(benutzerId)) {
      return NextResponse.json({ ok: false, error: "BAD_BENUTZER_ID" }, { status: 400 });
    }
    if (!deviceToken) {
      return NextResponse.json({ ok: false, error: "NO_DEVICE_TOKEN" }, { status: 400 });
    }

    const r = await fetch(`${BASE}/rest/v1/benutzer?id=eq.${benutzerId}`, {
      method: "PATCH",
      headers: { ...headers, prefer: "return=representation" },
      body: JSON.stringify({ erlaubter_rechner_hash: deviceToken }),
      cache: "no-store",
    });

    if (!r.ok) {
      const t = await r.text().catch(() => "");
      return NextResponse.json({ ok: false, error: "DB_ERROR", detail: t }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: "SERVER_ERROR", detail: msg }, { status: 500 });
  }
}
