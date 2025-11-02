import { NextResponse } from "next/server";

const BASE = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ?? "";
const headers: Record<string,string> = { apikey: KEY, Authorization: `Bearer ${KEY}` };

function pad(n:number){ return String(n).padStart(2,"0"); }
function hhmm(s?:string|null){ if(!s) return ""; const m=String(s).match(/^(\d{2}:\d{2})/); return m?m[1]:String(s); }

type Slot = { start:string; end:string; booked:boolean; by?:string };

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    if (!BASE || !KEY) return NextResponse.json({ ok:false, error:"env" }, { status:500 });

    const url = new URL(req.url);
    const date = (url.searchParams.get("date") ?? "").trim(); // YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ ok:false, error:"invalid date" }, { status:400 });
    }

    // Wochentag wie in DB (0=So..6=Sa)
    const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();

    // Bahnen laden
    const bahnenRes = await fetch(`${BASE}/rest/v1/bahnen?select=id,name,nummer&order=id.asc`, { headers, cache:"no-store" });
    const bahnenRows = await bahnenRes.json().catch(()=>[]);
    const bahnen: Record<number,{ bahn_id:number; bahn:string; slots:Slot[] }> = {};
    (Array.isArray(bahnenRows)?bahnenRows:[]).forEach((b:any)=>{
      const id = Number(b?.id);
      if (!Number.isFinite(id)) return;
      const label = String(b?.name ?? b?.nummer ?? `Bahn ${id}`);
      bahnen[id] = { bahn_id:id, bahn:label, slots:[] };
    });

    // Zeitregeln des Tages (aktiv=true)
    const regRes = await fetch(
      `${BASE}/rest/v1/bahn_regeln?select=bahn_id,weekday,start_time,end_time,slot_minutes,aktiv&weekday=eq.${weekday}&aktiv=eq.true&order=bahn_id.asc,start_time.asc`,
      { headers, cache:"no-store" }
    );
    const regeln = await regRes.json().catch(()=>[]);

    // Slots generieren
    function* genSlots(start:string, end:string, minutes:number){
      const [sh,sm]=start.split(":").map(Number);
      const [eh,em]=end.split(":").map(Number);
      let cur=sh*60+sm, stop=eh*60+em;
      while(cur<stop){
        const s=`${pad(Math.floor(cur/60))}:${pad(cur%60)}`;
        const e=`${pad(Math.floor((cur+minutes)/60))}:${pad((cur+minutes)%60)}`;
        yield { start:s, end:e };
        cur+=minutes;
      }
    }

    (Array.isArray(regeln)?regeln:[]).forEach((r:any)=>{
      const bid = Number(r?.bahn_id);
      if (!Number.isFinite(bid) || !bahnen[bid]) return;
      const start = hhmm(r?.start_time), end = hhmm(r?.end_time);
      const minutes = Number(r?.slot_minutes ?? 60);
      if (!/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end) || !Number.isFinite(minutes)) return;
      for (const s of genSlots(start, end, minutes)) {
        bahnen[bid].slots.push({ start:s.start, end:s.end, booked:false });
      }
    });

    // Tagesbuchungen holen und Slots markieren (by = Name)
    const buchRes = await fetch(
      `${BASE}/rest/v1/bahn_buchungen?select=bahn_id,start_time,name&datum=eq.${encodeURIComponent(date)}`,
      { headers, cache:"no-store" }
    );
    const buchungen = await buchRes.json().catch(()=>[]);
    (Array.isArray(buchungen)?buchungen:[]).forEach((bk:any)=>{
      const bid = Number(bk?.bahn_id);
      if (!Number.isFinite(bid) || !bahnen[bid]) return;
      const s = hhmm(bk?.start_time);
      const arr = bahnen[bid].slots;
      for(const sl of arr){
        if (sl.start===s){ sl.booked=true; sl.by = bk?.name ?? undefined; }
      }
    });

    const result = Object.values(bahnen).filter(b=>b.slots.length>0);
    return NextResponse.json({ ok:true, date, result });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:"server", detail:String(e?.message ?? e) }, { status:500 });
  }
}
