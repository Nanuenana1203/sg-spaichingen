import { NextRequest, NextResponse } from "next/server";
import { BASE, KEY, headers } from "../_supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// YYYY-MM-DD (UTC heute)
function todayUTC() {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// GET  /api/buchungen?email=foo@bar.de
// liefert zukünftige Buchungen (ab heutigem Datum inkl.) zu dieser E-Mail
export async function GET(req: NextRequest) {
  try {
    if (!BASE || !KEY) return NextResponse.json({ ok: false, error: "env" }, { status: 500 });
    const { searchParams } = new URL(req.url);
    const email = (searchParams.get("email") ?? "").trim();
    if (!email) return NextResponse.json({ ok: false, items: [], error: "missing email" }, { status: 400 });

    const from = todayUTC();
    const url = `${BASE}/rest/v1/bahn_buchungen`
      + `?select=id,bahn_id,datum,start_time,end_time,name,email,bahnen(name)`
      + `&email=ilike.*${encodeURIComponent(email)}*`
      + `&datum=gte.${from}`
      + `&order=datum.asc, start_time.asc`;

    const r = await fetch(url, { headers, cache: "no-store" });
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      return NextResponse.json({ ok: false, error: "upstream", detail: t }, { status: r.status });
    }
    const rows = await r.json();
    const items = (Array.isArray(rows) ? rows : []).map((x: Record<string, unknown>) => ({
      id: x.id,
      bahn_id: x.bahn_id,
      bahn_name: (x?.bahnen as { name?: string } | null)?.name ?? "",
      datum: x.datum,
      start_time: x.start_time,
      end_time: x.end_time,
      name: x.name,
      email: x.email,
    }));
    return NextResponse.json({ ok: true, items });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

// DELETE /api/buchungen?id=123&email=foo@bar.de
// löscht die Buchung mit dieser ID, nur wenn die E-Mail übereinstimmt
export async function DELETE(req: NextRequest) {
  try {
    if (!BASE || !KEY) return NextResponse.json({ ok: false, error: "env" }, { status: 500 });
    const { searchParams } = new URL(req.url);
    const idStr = (searchParams.get("id") ?? "").trim();
    const email = (searchParams.get("email") ?? "").trim();
    const id = Number(idStr);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ ok: false, error: "invalid id" }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ ok: false, error: "missing email" }, { status: 400 });
    }

    // Fetch the booking first to validate ownership via email
    const checkUrl = `${BASE}/rest/v1/bahn_buchungen?id=eq.${id}&select=id,email&limit=1`;
    const checkR = await fetch(checkUrl, { headers, cache: "no-store" });
    if (!checkR.ok) {
      return NextResponse.json({ ok: false, error: "lookup failed" }, { status: 502 });
    }
    const checkRows = await checkR.json().catch(() => []);
    const booking = Array.isArray(checkRows) ? checkRows[0] : null;

    if (!booking) {
      return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
    }

    // Validate email ownership (case-insensitive)
    if (String(booking.email ?? "").toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
    }

    const url = `${BASE}/rest/v1/bahn_buchungen?id=eq.${id}`;
    const r = await fetch(url, {
      method: "DELETE",
      headers: { ...headers, Prefer: "return=representation" },
    });

    if (!r.ok && r.status !== 204) {
      const t = await r.text().catch(() => "");
      return NextResponse.json({ ok: false, error: "delete failed", detail: t }, { status: r.status });
    }

    return NextResponse.json({ ok: true, id });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
