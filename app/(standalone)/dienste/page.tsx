"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type DienststZeile = { id: number; name: string | null };
type DienstSlot = { id: number; datum_von: string; datum_bis: string; uhrzeit_von: string; uhrzeit_bis: string; dauer_minuten: number | null; anzahl_personen: number; dienst_zeilen: DienststZeile[] };
type Dienst = { id: number; titel: string; beschreibung: string | null; aktiv: boolean; created_at: string; dienst_slots: DienstSlot[] };

type Gate = "loading" | "ok" | "no-session" | "forbidden";

function fmtDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}.${m}.${y}`;
}

export default function DienstePage() {
  const router = useRouter();
  const [gate, setGate] = useState<Gate>("loading");
  const [rows, setRows] = useState<Dienst[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const s = await fetch("/api/session", { cache: "no-store", credentials: "include" });
        const sd = await s.json().catch(() => ({}));
        const user = sd?.user ?? null;
        if (!user) return setGate("no-session");
        if (!user.isAdmin) return setGate("forbidden");
        setGate("ok");
        await load();
      } catch { setGate("no-session"); }
    })();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/dienste", { cache: "no-store" });
      const d = await r.json().catch(() => []);
      setRows(Array.isArray(d) ? d : []);
    } finally { setLoading(false); }
  }

  async function del(id: number) {
    if (!confirm("Dienst wirklich löschen? Alle Slots und Buchungen werden ebenfalls gelöscht.")) return;
    await fetch(`/api/dienste/${id}`, { method: "DELETE" });
    await load();
  }

  if (gate !== "ok") {
    const title = gate === "loading" ? "Lade…" : gate === "no-session" ? "Nicht angemeldet" : "Kein Zugriff";
    const msg = gate === "loading" ? "" : gate === "no-session"
      ? "Bitte zuerst einloggen, um die Dienste zu öffnen."
      : "Für die Dienstverwaltung ist Admin-Recht erforderlich.";
    const btnHref = gate === "no-session" ? "/" : "/dashboard";
    const btnText = gate === "no-session" ? "Zur Anmeldung" : "Zum Dashboard";
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-md w-full text-center space-y-4">
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          {msg && <p className="text-sm text-slate-600">{msg}</p>}
          {gate !== "loading" && (
            <Link href={btnHref} className="inline-flex px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition-colors">
              {btnText}
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Dienste</h1>
          <div className="flex gap-2">
            <Link href="/dienste/neu" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
              + Neuer Dienst
            </Link>
            <Link href="/dashboard" className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors">
              Zurück
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <p className="px-6 py-8 text-sm text-slate-500">Lade…</p>
          ) : rows.length === 0 ? (
            <p className="px-6 py-8 text-sm text-slate-500">Noch keine Dienste angelegt.</p>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Titel</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Zeitraum</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Slots</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Gebucht</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(d => {
                  const slots = d.dienst_slots ?? [];
                  const totalPlätze = slots.reduce((s, sl) => s + sl.anzahl_personen, 0);
                  const totalGebucht = slots.reduce((s, sl) => s + (sl.dienst_zeilen ?? []).filter(z => z.name).length, 0);
                  const daten = slots.map(sl => sl.datum_von).sort();
                  const vonBis = daten.length
                    ? daten.length === 1
                      ? fmtDate(daten[0])
                      : `${fmtDate(daten[0])} – ${fmtDate([...slots.map(sl => sl.datum_bis)].sort().at(-1)!)}`
                    : "–";
                  return (
                    <tr key={d.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="text-slate-900 font-medium">{d.titel}</p>
                        {d.beschreibung && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{d.beschreibung}</p>}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-sm">{vonBis}</td>
                      <td className="px-4 py-3 text-center text-slate-600 text-sm">{slots.length}</td>
                      <td className="px-4 py-3 text-center text-sm">
                        <span className={totalGebucht === totalPlätze && totalPlätze > 0 ? "text-red-600 font-medium" : "text-slate-600"}>
                          {totalGebucht} / {totalPlätze}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${d.aktiv ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                          {d.aktiv ? "Aktiv" : "Inaktiv"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link href={`/dienste/${d.id}`} className="text-slate-500 hover:text-blue-600 transition-colors text-base leading-none">✏️</Link>
                          <button onClick={() => del(d.id)} className="text-slate-500 hover:text-red-600 transition-colors text-base leading-none">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
