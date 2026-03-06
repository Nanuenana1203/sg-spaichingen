import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

const BASE = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const headers: Record<string,string> = { apikey: KEY, Authorization: `Bearer ${KEY}` };

function firstOfMonth(d: Date) { return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)); }
function firstOfNextMonth(d: Date) { return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1)); }
function ymd(date: Date) { const y=date.getUTCFullYear();const m=String(date.getUTCMonth()+1).padStart(2,"0");const d=String(date.getUTCDate()).padStart(2,"0");return `${y}-${m}-${d}`; }
const fmtEUR = (n: number) => new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR"}).format(n??0);
function hhmm(s: string|null) { if (!s) return ""; const m = /^(\d{2}:\d{2})/.exec(s); return m ? m[1] : s; }

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

async function getMembersCurrentMonth(now: Date) {
  if (!BASE || !KEY) return 0;
  const start = ymd(firstOfMonth(now));
  const url = `${BASE}/rest/v1/mitglieder?select=id&created_at=gte.${start}&limit=1`;
  const res = await fetch(url,{headers:{...headers,Prefer:"count=exact"},cache:"no-store"});
  const r = res.headers.get("content-range");
  return Number(r?.split("/")?.[1] ?? 0);
}

type BahnBuchung = { bahn_name: string; bahn_nummer: string|null; start_time: string|null; end_time: string|null; name: string|null };

async function getTodayBuchungen(today: Date): Promise<BahnBuchung[]> {
  if (!BASE || !KEY) return [];
  const datum = ymd(today);
  const url = `${BASE}/rest/v1/bahn_buchungen?select=start_time,end_time,name,bahnen(nummer,name)&datum=eq.${datum}&order=start_time.asc`;
  const res = await fetch(url, { headers, cache: "no-store" });
  const rows = await res.json().catch(() => []);
  return (Array.isArray(rows) ? rows : []).map((x: any) => ({
    bahn_name: x.bahnen?.name ?? "–",
    bahn_nummer: x.bahnen?.nummer ?? null,
    start_time: x.start_time,
    end_time: x.end_time,
    name: x.name,
  }));
}

async function getEinnahmenUndAusgabenMonat(now: Date) {
  if (!BASE || !KEY) return { einnahmen:0, ausgaben:0 };
  const startCur  = ymd(firstOfMonth(now));
  const startNext = ymd(firstOfNextMonth(now));
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

function Stat({ title, value, subtitle, accent }: { title: string; value: string; subtitle?: string; accent: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 border-l-4 ${accent}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
    </div>
  );
}

export default async function Page() {
  const today = new Date();

  const [
    artikelCount,
    mitgliederCount,
    mitgliederCurrentMonth,
    kassenstand,
    lastPos,
    lastNeg,
    einAus,
    todayBuchungen,
  ] = await Promise.all([
    countTable("artikel"),
    countTable("mitglieder"),
    getMembersCurrentMonth(today),
    getSaldoQuick(),
    getLastPositiveBooking(),
    getLastNegativeBooking(),
    getEinnahmenUndAusgabenMonat(today),
    getTodayBuchungen(today),
  ]);

  const { einnahmen, ausgaben } = einAus;
  const lastEinnahmeStr = lastPos == null ? "Letzte Einnahme: –" : `Letzte Einnahme: +${fmtEUR(lastPos)}`;
  const lastAusgabeStr  = lastNeg == null ? "Letzte Ausgabe: –"  : `Letzte Ausgabe: ${fmtEUR(lastNeg)}`;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Stat title="Artikel" value={String(artikelCount)} subtitle="gesamt" accent="border-l-blue-400" />
        <Stat title="Mitglieder" value={String(mitgliederCount)} subtitle={`+${mitgliederCurrentMonth} im aktuellen Monat`} accent="border-l-green-400" />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Stat title="Kassenstand" value={fmtEUR(kassenstand)} accent="border-l-violet-400" />
        <Stat title="Einnahmen (Monat)" value={fmtEUR(einnahmen)} subtitle={lastEinnahmeStr} accent="border-l-emerald-400" />
        <Stat title="Ausgaben (Monat)" value={fmtEUR(ausgaben)} subtitle={lastAusgabeStr} accent="border-l-red-400" />
      </div>

      {/* Heutige Bahnbuchungen */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-sky-400">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Bahnbuchungen heute</h2>
          <span className="text-xs text-slate-400">{today.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}</span>
        </div>
        {todayBuchungen.length === 0 ? (
          <p className="px-6 py-4 text-sm text-slate-400">Keine Buchungen für heute.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {todayBuchungen.map((b, i) => (
              <div key={i} className="px-6 py-3 flex items-center gap-4">
                <span className="text-xs font-semibold text-slate-500 w-28 shrink-0">
                  {hhmm(b.start_time)}{b.end_time ? ` – ${hhmm(b.end_time)}` : ""}
                </span>
                <span className="text-sm font-medium text-slate-800">
                  {b.bahn_nummer ? `Bahn ${b.bahn_nummer} · ` : ""}{b.bahn_name}
                </span>
                {b.name && (
                  <span className="ml-auto text-sm text-slate-500">{b.name}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400">Live-Daten ohne Cache (force-dynamic)</p>
    </div>
  );
}
