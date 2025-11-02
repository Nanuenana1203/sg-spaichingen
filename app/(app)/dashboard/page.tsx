import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

const BASE = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ?? "";
const headers: Record<string,string> = { apikey: KEY, Authorization: `Bearer ${KEY}` };

function firstOfMonth(d: Date) { return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)); }
function firstOfNextMonth(d: Date) { return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1)); }
function ymd(date: Date) { const y=date.getUTCFullYear();const m=String(date.getUTCMonth()+1).padStart(2,"0");const d=String(date.getUTCDate()).padStart(2,"0");return `${y}-${m}-${d}`;}
const today = new Date();
const fmtEUR = (n: number) => new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR"}).format(n??0);

async function countTable(t: string, f = "") {
  if (!BASE || !KEY) return 0;
  const url = `${BASE}/rest/v1/${t}?select=id&limit=1${f}`;
  const res = await fetch(url,{headers:{...headers,Prefer:"count=exact"},cache:"no-store"});
  const r = res.headers.get("content-range");
  return Number(r?.split("/")?.[1] ?? 0);
}

async function getSaldoQuick(): Promise<number> {
  if (!BASE || !KEY) return 0;
  const url = `${BASE}/rest/v1/kasse_saldo?id=eq.1&select=saldo`;
  const res = await fetch(url,{headers,cache:"no-store"});
  const rows = (await res.json().catch(()=>[])) as Array<{saldo:number}>;
  return Number(rows?.[0]?.saldo ?? 0);
}

async function getLastPositiveBooking(): Promise<number|null> {
  if (!BASE || !KEY) return null;
  const url = `${BASE}/rest/v1/kasse?select=gesamtpreis&id=gt.0&gesamtpreis=gt.0&order=id.desc&limit=1`;
  const res = await fetch(url,{headers,cache:"no-store"});
  const j = await res.json().catch(()=>[]);
  return j?.[0]?.gesamtpreis ?? null;
}

async function getLastNegativeBooking(): Promise<number|null> {
  if (!BASE || !KEY) return null;
  const url = `${BASE}/rest/v1/kasse?select=gesamtpreis&id=gt.0&gesamtpreis=lt.0&order=id.desc&limit=1`;
  const res = await fetch(url,{headers,cache:"no-store"});
  const j = await res.json().catch(()=>[]);
  return j?.[0]?.gesamtpreis ?? null;
}

async function getMembersCurrentMonth() {
  if (!BASE || !KEY) return 0;
  const start = ymd(firstOfMonth(today));
  const url = `${BASE}/rest/v1/mitglieder?select=id&created_at=gte.${start}&limit=1`;
  const res = await fetch(url,{headers:{...headers,Prefer:"count=exact"},cache:"no-store"});
  const r = res.headers.get("content-range");
  return Number(r?.split("/")?.[1] ?? 0);
}

async function getEinnahmenUndAusgabenMonat() {
  if (!BASE || !KEY) return { einnahmen:0, ausgaben:0 };
  const startCur = ymd(firstOfMonth(today));
  const startNext = ymd(firstOfNextMonth(today));
  const url = `${BASE}/rest/v1/kasse?select=gesamtpreis,datum&datum=gte.${startCur}&datum=lt.${startNext}`;
  const res = await fetch(url,{headers,cache:"no-store"});
  const rows = (await res.json().catch(()=>[])) as Array<{gesamtpreis:number|string|null}>;
  let einnahmen = 0, ausgaben = 0;
  for (const r of rows) {
    const val = Number(r.gesamtpreis ?? 0);
    if (val > 0) einnahmen += val;
    if (val < 0) ausgaben += Math.abs(val);
  }
  return { einnahmen, ausgaben };
}

function Stat({ title, value, subtitle, color }: { title: string; value: string; subtitle?: string; color: string }) {
  return (
    <div className={`rounded-2xl p-6 shadow-md text-white ${color}`}>
      <p className="text-sm font-medium opacity-90">{title}</p>
      <p className="mt-3 text-3xl font-extrabold tracking-tight">{value}</p>
      {subtitle ? <p className="mt-2 text-sm opacity-80">{subtitle}</p> : null}
    </div>
  );
}

export default async function Page() {
  const [
    artikelCount,
    mitgliederCount,
    mitgliederCurrentMonth,
    kassenstand,
    lastPos,
    lastNeg,
    einAus,
  ] = await Promise.all([
    countTable("artikel"),
    countTable("mitglieder"),
    getMembersCurrentMonth(),
    getSaldoQuick(),
    getLastPositiveBooking(),
    getLastNegativeBooking(),
    getEinnahmenUndAusgabenMonat(),
  ]);

  const { einnahmen, ausgaben } = einAus;
  const lastEinnahmeStr = lastPos == null ? "Letzte Einnahme: –" : `Letzte Einnahme: +${fmtEUR(lastPos)}`;
  const lastAusgabeStr  = lastNeg == null ? "Letzte Ausgabe: –"  : `Letzte Ausgabe: ${fmtEUR(lastNeg)}`;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Stat title="Artikel" value={String(artikelCount)} subtitle="gesamt" color="bg-blue-500" />
        <Stat title="Mitglieder" value={String(mitgliederCount)} subtitle={`+${mitgliederCurrentMonth} im aktuellen Monat`} color="bg-green-500" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Stat title="Kassenstand" value={fmtEUR(kassenstand)} color="bg-purple-500" />
        <Stat title="Einnahmen (Monat)" value={fmtEUR(einnahmen)} subtitle={lastEinnahmeStr} color="bg-emerald-500" />
        <Stat title="Ausgaben (Monat)" value={fmtEUR(ausgaben)} subtitle={lastAusgabeStr} color="bg-red-500" />
      </div>

      <p className="text-xs text-slate-400">Live-Daten ohne Cache (force-dynamic)</p>
    </div>
  );
}
