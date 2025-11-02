"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

function fmt2(v: any): string {
  if (v === "" || v == null) return "";
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n.toFixed(2) : "";
}
function toNumOrNull(s: string) {
  if (!s || s.trim() === "") return null;
  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export default function NeuerArtikel() {
  const router = useRouter();
  const [artnr, setArtnr] = useState("");
  const [bezeichnung, setBezeichnung] = useState("");
  const [kachel, setKachel] = useState(false);
  const [p, setP] = useState({ p1:"",p2:"",p3:"",p4:"",p5:"",p6:"",p7:"",p8:"",p9:"" });
  const [err, setErr] = useState("");

  const setPx = (k: keyof typeof p, v:string)=> setP(prev=>({...prev,[k]:v}));
  const onBlur = (k: keyof typeof p)=> setP(prev=>({...prev,[k]:fmt2(prev[k])}));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    try {
      const body:any = {
        artnr: artnr.trim()===""? null : artnr.trim(),
        bezeichnung: bezeichnung.trim(),
        preis1: toNumOrNull(p.p1), preis2: toNumOrNull(p.p2), preis3: toNumOrNull(p.p3),
        preis4: toNumOrNull(p.p4), preis5: toNumOrNull(p.p5), preis6: toNumOrNull(p.p6),
        preis7: toNumOrNull(p.p7), preis8: toNumOrNull(p.p8), preis9: toNumOrNull(p.p9),
        kachel
      };
      const r = await fetch("/api/artikel", { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify(body) });
      const j = await r.json().catch(()=>null);
      if (!r.ok || j?.ok===false) throw new Error(j?.detail || j?.error || "Speichern fehlgeschlagen");
      router.push("/artikel");
    } catch (e:any) {
      setErr(String(e?.message ?? e));
    }
  }

  const txt = "w-full px-3 py-2 rounded-md border border-slate-300 outline-none focus:ring-2 focus:ring-slate-300";
  const num = txt + " text-right";

  return (
    <main className="p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-semibold text-center text-slate-800 mb-6">Neuer Artikel</h1>

        <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="grid md:grid-cols-2 gap-4 p-4">
            <div>
              <label className="block font-semibold mb-1">Art.-Nr.*</label>
              <input className={txt} value={artnr} onChange={e=>setArtnr(e.target.value)} placeholder="Artikelnummer" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Bezeichnung*</label>
              <input className={txt} value={bezeichnung} onChange={e=>setBezeichnung(e.target.value)} placeholder="Bezeichnung" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 p-4 pt-0">
            {[
              ["Preis 1 (€)","p1"],["Preis 2 (€)","p2"],["Preis 3 (€)","p3"],
              ["Preis 4 (€)","p4"],["Preis 5 (€)","p5"],["Preis 6 (€)","p6"],
              ["Preis 7 (€)","p7"],["Preis 8 (€)","p8"],["Preis 9 (€)","p9"],
            ].map(([label,key])=>(
              <div key={key}>
                <label className="block font-semibold mb-1">{label}</label>
                <input className={num} inputMode="decimal"
                  value={(p as any)[key]} onChange={e=>setPx(key as any, e.target.value)}
                  onBlur={()=>onBlur(key as any)} />
              </div>
            ))}
          </div>

          <div className="px-4 pb-2">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={kachel} onChange={e=>setKachel(e.target.checked)} />
              <span>Als Kachel in der Kasse anzeigen</span>
            </label>
          </div>

          {err && <div className="text-red-600 px-4 pb-3">❌ {err}</div>}

          <div className="flex gap-3 justify-start p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
            <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition">Speichern</button>
            <button type="button" onClick={()=>router.push("/artikel")} className="px-4 py-2 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800 transition">Abbrechen</button>
          </div>
        </form>
      </div>
    </main>
  );
}
