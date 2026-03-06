import { NextResponse } from "next/server";
import { BASE, KEY, headers } from "../_supabase";

function isoDow(d: Date) {
  const g = d.getDay(); // 0=So..6=Sa
  return g === 0 ? 7 : g; // 1=Mo..7=So
}

export async function GET(req: Request) {
  try {
    const u = new URL(req.url);
    const month = (u.searchParams.get("month") ?? "").trim(); // YYYY-MM

    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ ok: false, error: "bad-month" }, { status: 400 });
    }
    if (!BASE || !KEY) {
      return NextResponse.json({ ok: false, error: "env" }, { status: 500 });
    }

    // Regeln holen (Sonntag kann in DB als 0 gespeichert sein)
    const url = `${BASE}/rest/v1/bahn_regeln?select=weekday,aktiv,bahn_id`;
    const r = await fetch(url, { headers, cache: "no-store" });
    const data = await r.json().catch(() => []);

    const rows = Array.isArray(data) ? data : [];
    const actives = rows.filter(
      (x: any) => x?.aktiv === true || typeof x?.aktiv === "undefined"
    );

    // 0 (Sonntag) -> 7 ummappen, damit einheitlich 1..7 (Mo..So)
    const allowed = new Set<number>(
      actives
        .map((x: any) => {
          const raw = Number(x?.weekday);
          if (!Number.isFinite(raw)) return NaN;
          return raw === 0 ? 7 : raw; // 0 -> 7 (Sonntag)
        })
        .filter((n: number) => Number.isFinite(n) && n >= 1 && n <= 7)
    );

    const [y, m] = month.split("-").map((n) => Number(n));
    const daysInMonth = new Date(y, m, 0).getDate(); // m ist 1-basiert
    const days: string[] = [];
    const mm = String(m).padStart(2, "0");

    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(y, m - 1, d);
      const wd = isoDow(dt); // 1..7 (Mo..So)
      if (allowed.has(wd)) {
        days.push(`${y}-${mm}-${String(d).padStart(2, "0")}`);
      }
    }

    return NextResponse.json({ ok: true, month, days });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "server", detail: (err as Error)?.message },
      { status: 500 }
    );
  }
}
