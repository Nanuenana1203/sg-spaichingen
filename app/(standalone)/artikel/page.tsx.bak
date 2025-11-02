"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Row = { id:number; anr:number|null; bezeichnung:string; preis1:number|null };

export default function ArtikelPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/artikel", { cache: "no-store" });
        const j = await r.json().catch(() => []);
        const list: Row[] = Array.isArray(j) ? j : Array.isArray(j?.artikel) ? j.artikel : [];
        setRows(list);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(a =>
      [a.artnr, a.bezeichnung].filter(v => v !== null && v !== undefined)
        .some(v => String(v).toLowerCase().includes(s))
    );
  }, [rows, q]);

  async function delArtikel(id: number) {
    if (!confirm("Artikel wirklich löschen?")) return;
    const res = await fetch(`/api/artikel/${id}`, { method: "DELETE" });
    if (!res.ok) { alert("Löschen fehlgeschlagen."); return; }
    setRows(prev => prev.filter(x => x.id !== id));
  }

  if (loading) return <div className="p-8 text-center">Lade…</div>;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-semibold text-center text-slate-800 mb-6">Artikel</h1>

      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link
            href="/artikel/neu"
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            + Neuer Artikel
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800 transition"
          >
            Zurück
          </Link>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nach Artikel suchen…"
          className="w-72 px-3 py-2 rounded-md border border-slate-300 outline-none focus:ring-2 focus:ring-slate-300"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th style={{ padding: 12, textAlign: "left" }}>Artikelnummer</th>
              <th style={{ padding: 12, textAlign: "left" }}>Bezeichnung</th>
              <th style={{ padding: 12, textAlign: "left" }}>Preis 1</th>
              <th style={{ padding: 12, textAlign: "left" }}>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td style={{ padding: 12 }}>{a.artnr ?? "—"}</td>
                <td style={{ padding: 12 }}>{a.bezeichnung}</td>
                <td style={{ padding: 12 }}>
                  {a.preis1 != null ? `€ ${Number(a.preis1).toFixed(2)}` : "—"}
                </td>
                <td style={{ padding: 12 }}>
                  <Link
                    href={`/artikel/${a.id}`}
                    title="Bearbeiten"
                    style={{ marginRight: 12, textDecoration: "none" }}
                  >✏️</Link>
                  <button
                    title="Löschen"
                    style={{ background: "transparent", border: "none", cursor: "pointer" }}
                    onClick={() => delArtikel(a.id)}
                  >🗑️</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: 16, color: "#6b7280", textAlign: "center" }}>
                  Keine Artikel gefunden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
