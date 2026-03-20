"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Gate = "loading" | "ok" | "no-session" | "forbidden";
type Bahn = { id: number; nummer: string | null; name: string | null };

export default function BahnenPage() {
  const [gate, setGate] = useState<Gate>("loading");
  const [rows, setRows] = useState<Bahn[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  async function delItem(id: number) {
    if (!confirm("Bahn wirklich loschen?")) return;
    await fetch(`/api/bahnen/${id}`, { method: "DELETE" });
    await load();
  }

  useEffect(() => {
    (async () => {
      try {
        const s = await fetch("/api/session", { cache: "no-store", credentials: "include" });
        const sd = await s.json().catch(() => ({}));
        const user = sd?.user ?? null;
        if (!user) return setGate("no-session");
        if (!user.isAdmin) return setGate("forbidden");
        setGate("ok");
      } catch {
        setGate("no-session");
      }
    })();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/bahnen", { cache: "no-store" });
      const data = await r.json().catch(() => []);
      setRows(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (gate === "ok") load(); }, [gate]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(b =>
      (b.nummer ?? "").toLowerCase().includes(s) ||
      (b.name ?? "").toLowerCase().includes(s)
    );
  }, [q, rows]);

  if (gate !== "ok") {
    const title = gate === "loading" ? "Prufe Berechtigung…" : gate === "no-session" ? "Nicht angemeldet" : "Kein Zugriff";
    const msg = gate === "loading" ? "" : gate === "no-session" ? "Bitte zuerst einloggen, um Bahnen zu verwalten." : "Diese Funktion ist nur fur Administratoren.";
    const btnHref = gate === "no-session" ? "/" : "/dashboard";
    const btnText = gate === "no-session" ? "Zur Anmeldung" : "Zum Dashboard";
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
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
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Bahnen</h1>
          <div className="flex items-center gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nach Bahn suchen..."
              className="w-64 px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Link href="/bahnen/neu" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
              + Neue Bahn
            </Link>
            <Link href="/dashboard" className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors">
              Zurück
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Nummer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Bahn</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-700">{b.nummer ?? "–"}</td>
                  <td className="px-4 py-3 text-slate-700">{b.name ?? "–"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link href={`/bahnen/${b.id}`} title="Bearbeiten" className="text-slate-500 hover:text-blue-600 transition-colors text-base leading-none">✏️</Link>
                      <button onClick={() => delItem(b.id)} title="Löschen" className="text-slate-500 hover:text-red-600 transition-colors text-base leading-none">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && !filtered.length && (
                <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-400 text-sm">Keine Einträge gefunden.</td></tr>
              )}
              {loading && (
                <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-400 text-sm">Lade…</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
