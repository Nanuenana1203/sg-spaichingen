import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BASE, KEY, headers, toBool } from "../_supabase";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const c = await cookies();
    const raw = c.get("sgs_user")?.value ?? "";
    if (!raw) return NextResponse.json({ user: null });

    let cookieId: number | null = null;
    try {
      const j = JSON.parse(raw);
      if (j && typeof j.id === "number") cookieId = j.id;
    } catch {}

    if (!cookieId) return NextResponse.json({ user: null });

    if (!BASE || !KEY) {
      // env not configured — fall back to cookie data only (dev mode)
      const j = JSON.parse(raw);
      return NextResponse.json({
        user: { id: j.id, name: j.name ?? "", isAdmin: toBool(j.isAdmin) },
      });
    }

    // Validate user against DB and read fresh isAdmin value
    const url = `${BASE}/rest/v1/benutzer?id=eq.${cookieId}&select=id,name,istadmin&limit=1`;
    const r = await fetch(url, { headers, cache: "no-store" });
    if (!r.ok) return NextResponse.json({ user: null });

    const rows = await r.json().catch(() => []);
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row) return NextResponse.json({ user: null });

    const user = {
      id: row.id as number,
      name: row.name as string,
      isAdmin: toBool(row.istadmin),
    };

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
