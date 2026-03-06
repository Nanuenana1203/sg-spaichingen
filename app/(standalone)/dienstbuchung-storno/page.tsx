"use client";

import { useState } from "react";
import Link from "next/link";

type Zeile = {
  id: number;
  nummer: number;
  name: string;
  telefon: string | null;
  datum: string | null;
  buchung_von: string | null;
  buchung_bis: string | null;
  gebucht_am: string | null;
  dienst_slots: {
    id: number;
    datum_von: string;
    datum_bis: string;
    uhrzeit_von: string;
    uhrzeit_bis: string;
    dienste: { id: number; titel: string } | null;
  } | null;
};

function fmtDate(d: string | null) {
  if (!d) return "–";
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" });
}
function fmtTime(t: string | null) { return t ? t.slice(0, 5) : "–"; }
function fmtTs(ts: string | null) {
  if (!ts) return "";
  return new Date(ts).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const inp = "px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

export default function DienstStornoPage() {
  const [name, setName] = useState("");
  const [items, setItems] = useState<Zeile[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [freigabeId, setFreigabeId] = useState<number | null>(null);

  async function suchen(e?: React.FormEvent) {
    e?.preventDefault();
    setMsg(""); setItems([]);
    if (!name.trim()) { setMsg("Bitte Namen eingeben."); return; }
    setLoading(true);
    try {
      const r = await fetch(`/api/dienst-storno-public?name=${encodeURIComponent(name.trim())}`, { cache: "no-store" });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || d?.ok === false) { setMsg("Fehler beim Laden."); return; }
      const list: Zeile[] = Array.isArray(d.items) ? d.items : [];
      if (!list.length) setMsg("Keine Buchungen für diesen Namen gefunden.");
      setItems(list);
    } catch { setMsg("Fehler beim Laden."); }
    finally { setLoading(false); }
  }

  async function freigeben(id: number) {
    if (!confirm("Diese Buchung wirklich freigeben?")) return;
    setFreigabeId(id); setMsg("");
    try {
      const r = await fetch(`/api/dienst-storno-public?id=${id}`, { method: "DELETE" });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || d?.ok === false) { setMsg("Freigabe fehlgeschlagen."); return; }
      setItems(cur => cur.filter(z => z.id !== id));
      if (items.length === 1) setMsg("Alle Buchungen freigegeben.");
    } catch { setMsg("Freigabe fehlgeschlagen."); }
    finally { setFreigabeId(null); }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Dienst stornieren</h1>
          <Link href="/dienstbuchung" className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors">
            Zurück
          </Link>
        </div>

        {/* Suche */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <p className="text-sm text-slate-500 mb-4">
            Namen eingeben, um alle dazugehörigen Dienst-Buchungen zu finden und ggf. freizugeben.
          </p>
          <form onSubmit={suchen} className="flex gap-3">
            <input
              className={inp + " flex-1"}
              placeholder="Name suchen…"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Suchen…" : "Suchen"}
            </button>
          </form>
        </div>

        {/* Meldung */}
        {msg && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            {msg}
          </div>
        )}

        {/* Ergebnisse */}
        {items.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <p className="text-sm font-medium text-slate-700">
                {items.length} Buchung{items.length !== 1 ? "en" : ""} gefunden
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Dienst</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Datum</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Uhrzeit</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Telefon</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Gebucht am</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(z => (
                    <tr key={z.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-slate-800">
                          {z.dienst_slots?.dienste?.titel ?? "–"}
                        </p>
                        {z.dienst_slots && !z.datum && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            {fmtDate(z.dienst_slots.datum_von)}
                            {z.dienst_slots.datum_von !== z.dienst_slots.datum_bis
                              ? ` – ${fmtDate(z.dienst_slots.datum_bis)}`
                              : ""}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{fmtDate(z.datum)}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {z.buchung_von ? `${fmtTime(z.buchung_von)} – ${fmtTime(z.buchung_bis)}` : "–"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-800">{z.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{z.telefon ?? "–"}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">{fmtTs(z.gebucht_am)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => freigeben(z.id)}
                          disabled={freigabeId === z.id}
                          className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {freigabeId === z.id ? "…" : "Freigeben"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
