import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ?? "";

const headers: Record<string,string> = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
};

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
    if (!BASE || !KEY) return NextResponse.json({ ok:false, error:"env" }, { status:500 });
    const { searchParams } = new URL(req.url);
    const email = (searchParams.get("email") ?? "").trim();
    if (!email) return NextResponse.json({ ok:false, items:[], error:"missing email" }, { status:400 });

    const from = todayUTC();
    const url = `${BASE}/rest/v1/bahn_buchungen`
      + `?select=id,bahn_id,datum,start_time,end_time,name,email,bahnen(name)`
      + `&email=ilike.*${encodeURIComponent(email)}*`
      + `&datum=gte.${from}`
      + `&order=datum.asc, start_time.asc`;

    const r = await fetch(url, { headers, cache: "no-store" });
    if (!r.ok) {
      const t = await r.text().catch(()=> "");
      return NextResponse.json({ ok:false, error:"upstream", detail:t }, { status: r.status });
    }
    const rows = await r.json();
    const items = (Array.isArray(rows) ? rows : []).map((x:any)=>({
      id: x.id,
      bahn_id: x.bahn_id,
      bahn_name: x?.bahnen?.name ?? "",
      datum: x.datum,
      start_time: x.start_time,
      end_time: x.end_time,
      name: x.name,
      email: x.email,
    }));
    return NextResponse.json({ ok:true, items });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:String(e?.message ?? e) }, { status:500 });
  }
}

// DELETE /api/buchungen?id=123
// löscht die Buchung mit dieser ID
export async function DELETE(req: NextRequest) {
  try {
    if (!BASE || !KEY) return NextResponse.json({ ok:false, error:"env" }, { status:500 });
    const { searchParams } = new URL(req.url);
    const idStr = (searchParams.get("id") ?? "").trim();
    const id = Number(idStr);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ ok:false, error:"invalid id" }, { status:400 });
    }

    const url = `${BASE}/rest/v1/bahn_buchungen?id=eq.${id}`;
    const r = await fetch(url, {
      method: "DELETE",
      headers: { ...headers, Prefer: "return=representation" },
    });

    if (!r.ok && r.status !== 204) {
      const t = await r.text().catch(()=> "");
      return NextResponse.json({ ok:false, error:"delete failed", detail:t }, { status: r.status });
    }

    return NextResponse.json({ ok:true, id });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:String(e?.message ?? e) }, { status:500 });
  }
}
