"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

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

export default function EditArtikelPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  // Felder als Strings -> stabiler Fokus
  const [artnr, setArtnr] = useState("");
  const [bezeichnung, setBezeichnung] = useState("");
  const [preis, setPreis] = useState({
    p1: "", p2: "", p3: "",
    p4: "", p5: "", p6: "",
    p7: "", p8: "", p9: "",
  });
  const [kachel, setKachel] = useState(false);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true); setErr("");
      try {
        const r = await fetch(`/api/artikel/${id}`, { cache:"no-store" });
        const j = await r.json();
        if (!r.ok || j?.ok === false) throw new Error(j?.detail || j?.error || "Fehler beim Laden");
        const a = j.artikel ?? j;
        if (!alive) return;

        setArtnr(a.artnr ?? "");
        setBezeichnung(a.bezeichnung ?? "");
        setPreis({
          p1: fmt2(a.preis1), p2: fmt2(a.preis2), p3: fmt2(a.preis3),
          p4: fmt2(a.preis4), p5: fmt2(a.preis5), p6: fmt2(a.preis6),
          p7: fmt2(a.preis7), p8: fmt2(a.preis8), p9: fmt2(a.preis9),
        });
        setKachel(!!a.kachel);
      } catch (e:any) {
        setErr(String(e?.message ?? e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  const setP = useCallback((key: keyof typeof preis, val: string) => {
    setPreis((p) => ({ ...p, [key]: val }));
  }, [setPreis]);

  function onBlurPrice(key: keyof typeof preis) {
    setPreis(p => ({ ...p, [key]: fmt2(p[key]) }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    try {
      const body:any = {
        artnr: artnr.trim()===""? null : artnr.trim(),
        bezeichnung: bezeichnung.trim(),
        preis1: toNumOrNull(preis.p1), preis2: toNumOrNull(preis.p2), preis3: toNumOrNull(preis.p3),
        preis4: toNumOrNull(preis.p4), preis5: toNumOrNull(preis.p5), preis6: toNumOrNull(preis.p6),
        preis7: toNumOrNull(preis.p7), preis8: toNumOrNull(preis.p8), preis9: toNumOrNull(preis.p9),
        kachel
      };
      const r = await fetch(`/api/artikel/${id}`, {
        method: "PUT",
        headers: { "content-type":"application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json().catch(()=>null);
      if (!r.ok || j?.ok===false) throw new Error(j?.detail || j?.error || "Speichern fehlgeschlagen");
      router.push("/artikel");
    } catch (e:any) {
      setErr(String(e?.message ?? e));
    }
  }

  if (loading) return <div className="p-8 text-center">Lade…</div>;

  const txt = "w-full px-3 py-2 rounded-md border border-slate-300 outline-none focus:ring-2 focus:ring-slate-300";
  const num = txt + " text-right";

  return (
    <main className="p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-semibold text-center text-slate-800 mb-6">Artikel bearbeiten</h1>

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

          {/* Preise im 3er-Grid */}
          <div className="grid md:grid-cols-3 gap-4 p-4 pt-0">
            <div>
              <label className="block font-semibold mb-1">Preis 1 (€)</label>
              <input className={num} inputMode="decimal"
                value={preis.p1} onChange={e=>setP("p1", e.target.value)} onBlur={()=>onBlurPrice("p1")} />
            </div>
            <div>
              <label className="block font-semibold mb-1">Preis 2 (€)</label>
              <input className={num} inputMode="decimal"
                value={preis.p2} onChange={e=>setP("p2", e.target.value)} onBlur={()=>onBlurPrice("p2")} />
            </div>
            <div>
              <label className="block font-semibold mb-1">Preis 3 (€)</label>
              <input className={num} inputMode="decimal"
                value={preis.p3} onChange={e=>setP("p3", e.target.value)} onBlur={()=>onBlurPrice("p3")} />
            </div>

            <div>
              <label className="block font-semibold mb-1">Preis 4 (€)</label>
              <input className={num} inputMode="decimal"
                value={preis.p4} onChange={e=>setP("p4", e.target.value)} onBlur={()=>onBlurPrice("p4")} />
            </div>
            <div>
              <label className="block font-semibold mb-1">Preis 5 (€)</label>
              <input className={num} inputMode="decimal"
                value={preis.p5} onChange={e=>setP("p5", e.target.value)} onBlur={()=>onBlurPrice("p5")} />
            </div>
            <div>
              <label className="block font-semibold mb-1">Preis 6 (€)</label>
              <input className={num} inputMode="decimal"
                value={preis.p6} onChange={e=>setP("p6", e.target.value)} onBlur={()=>onBlurPrice("p6")} />
            </div>

            <div>
              <label className="block font-semibold mb-1">Preis 7 (€)</label>
              <input className={num} inputMode="decimal"
                value={preis.p7} onChange={e=>setP("p7", e.target.value)} onBlur={()=>onBlurPrice("p7")} />
            </div>
            <div>
              <label className="block font-semibold mb-1">Preis 8 (€)</label>
              <input className={num} inputMode="decimal"
                value={preis.p8} onChange={e=>setP("p8", e.target.value)} onBlur={()=>onBlurPrice("p8")} />
            </div>
            <div>
              <label className="block font-semibold mb-1">Preis 9 (€)</label>
              <input className={num} inputMode="decimal"
                value={preis.p9} onChange={e=>setP("p9", e.target.value)} onBlur={()=>onBlurPrice("p9")} />
            </div>
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
