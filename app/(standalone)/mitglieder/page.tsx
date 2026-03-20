"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Mitglied = {
  id: number; mitgliedsnr: string; name: string;
  ort?: string; preisgruppe?: string; mitglied?: boolean; gesperrt?: boolean;
};

export default function MitgliederPage() {
  const [rows, setRows] = useState<Mitglied[]>([]);
  const [q, setQ] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  async function load() {
    const res = await fetch("/api/mitglieder", { cache: "no-store" });
    const data = await res.json().catch(() => []);
    const sorted = Array.isArray(data)
      ? data.sort((a, b) => (a.name || "").localeCompare(b.name || ""))
      : [];
    setRows(sorted);
  }

  useEffect(() => {
    (async () => {
      const s = await fetch("/api/session", { cache: "no-store" });
      const sd = await s.json().catch(() => ({}));
      setIsAdmin(!!sd?.user?.isAdmin);
      await load();
    })();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(m =>
      (m.mitgliedsnr || "").toLowerCase().includes(s) ||
      (m.name || "").toLowerCase().includes(s) ||
      (m.ort || "").toLowerCase().includes(s)
    );
  }, [q, rows]);

  const delItem = async (id: number) => {
    if (!confirm("Mitglied wirklich loschen?")) return;
    await fetch(`/api/mitglieder/${id}`, { method: "DELETE" });
    await load();
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Kunden</h1>
          <div className="flex items-center gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Suchen nach Nr., Name, Ort..."
              className="w-64 px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Link
              href="/mitglieder/neu"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              + Neuer Kunde
            </Link>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
            >
              Zurück
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Mitglieds-Nr.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Ort</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Preisgruppe</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-700">{m.mitgliedsnr}</td>
                  <td className="px-4 py-3 text-slate-700 max-w-xs truncate">{m.name}</td>
                  <td className="px-4 py-3 text-slate-700">{m.ort ?? "–"}</td>
                  <td className="px-4 py-3 text-slate-700 text-right">{m.preisgruppe ?? "–"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                      m.gesperrt
                        ? "bg-red-100 text-red-700"
                        : m.mitglied
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {m.gesperrt ? "Gesperrt" : m.mitglied ? "Mitglied" : "Kein Mitglied"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link href={`/mitglieder/${m.id}`} title="Bearbeiten" className="text-slate-500 hover:text-blue-600 transition-colors text-base leading-none">✏️</Link>
                      {isAdmin && <button onClick={() => delItem(m.id)} title="Löschen" className="text-slate-500 hover:text-red-600 transition-colors text-base leading-none">🗑️</button>}
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400 text-sm">
                    Keine Mitglieder gefunden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
