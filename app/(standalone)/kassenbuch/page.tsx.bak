"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Mitglied = {
  id: number;
  mitgliedsnr: string | null;
  name: string | null;
  ort: string | null;
  ausweisnr: string | null;
  preisgruppe: number | null;
};

type Buchung = {
  datum: string;
  artikel_nummer: string | null;
  artikel_bezeichnung: string | null;
  menge: number | null;
  einzelpreis: number | null;
  gesamtpreis: number | null;
  mitglied_name: string | null;
  benutzer_name: string | null;
};

// Hilfsfunktionen wie in Kasse
const norm = (v: unknown) => (v ?? "").toString().trim().toLowerCase();
const fmt2 = (n: number | null | undefined) =>
  (n ?? 0).toFixed(2).replace(".", ",");

// Zeitraum-Voreinstellung: 01.01. aktuelles Jahr bis heute
function janFirstISO() {
  const d = new Date();
  return `${d.getFullYear()}-01-01`;
}
function todayISO() {
  const d = new Date();
  const z = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

export default function KassenbuchPage() {
  // --- Mitgliederauswahl EXAKT wie in Kasse ---
  const [mitglieder, setMitglieder] = useState<Mitglied[]>([]);
  const [queryMitglied, setQueryMitglied] = useState("");
  const [auswahl, setAuswahl] = useState<Mitglied | null>(null);

  // Zeitraum
  const [from, setFrom] = useState(janFirstISO());
  const [to, setTo] = useState(todayISO());

  // Daten
  const [rows, setRows] = useState<Buchung[]>([]);
  const [loading, setLoading] = useState(false);

  // Laden wie in Kasse (api/mitglieder)
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/mitglieder", { cache: "no-store" });
        const j = r.ok ? await r.json() : [];
        setMitglieder(Array.isArray(j) ? j : []);
      } catch {}
    })();
  }, []);

  // Filter Mitglied (wie Kasse)
  const filteredMitglieder = useMemo(() => {
    const n = norm(queryMitglied);
    if (n.length < 3) return [];
    return mitglieder
      .filter(
        (m) =>
          norm(m.name).includes(n) ||
          norm(m.ort).includes(n) ||
          norm(m.ausweisnr).includes(n) ||
          norm(m.mitgliedsnr).includes(n)
      )
      .sort((a, b) => norm(a.name).localeCompare(norm(b.name)));
  }, [mitglieder, queryMitglied]);

  // Daten laden
  async function loadData() {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (from) q.set("from", from);
      if (to) q.set("to", to);
      if (auswahl?.id) q.set("mitglied_id", String(auswahl.id));
      const r = await fetch(`/api/kassenbuch?${q.toString()}`, { cache: "no-store" });
      const j = await r.json().catch(() => ({}));
      const list: Buchung[] = Array.isArray(j) ? j : Array.isArray(j?.rows) ? j.rows : [];
      setRows(list);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  const cols = useMemo(
    () => ["Datum", "Artikel", "Bezeichnung", "Menge", "EP (€)", "GP (€)", "Mitglied", "Benutzer"],
    []
  );

  function exportCSV() {
    const head = cols.join(";");
    const body = rows.map((r) =>
      [
        new Date(r.datum).toLocaleDateString("de-DE"),
        r.artikel_nummer ?? "",
        r.artikel_bezeichnung ?? "",
        r.menge ?? "",
        fmt2(r.einzelpreis),
        fmt2(r.gesamtpreis),
        r.mitglied_name ?? "",
        r.benutzer_name ?? "",
      ].join(";")
    );
    const csv = [head, ...body].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kassenbuch_${from}_bis_${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="p-6 flex flex-col items-center bg-gray-50 min-h-screen">
      <div className="relative bg-white p-6 rounded-2xl shadow w-full max-w-6xl">
        {/* Zurück oben rechts */}
        <Link
          href="/dashboard"
          className="absolute right-6 top-6 px-4 py-2 rounded bg-slate-200 hover:bg-slate-300 text-slate-800"
        >
          Zurück
        </Link>

        <h1 className="text-2xl font-semibold mb-6 text-center">📘 Kassenbuch</h1>

        {/* Mitglied wählen – 1:1 wie in Kasse (Tabelle nach Suche) */}
        {!auswahl ? (
          <div className="rounded-xl border bg-white p-4 mb-5">
            <div className="text-sm font-semibold text-gray-700 mb-2 text-center">Mitglied auswählen</div>
            <div className="flex justify-center">
              <input
                className="border rounded-lg px-3 py-2 w-96 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Mitglied suchen (mind. 3 Zeichen)…"
                value={queryMitglied}
                onChange={(e) => setQueryMitglied(e.target.value)}
              />
            </div>
            {queryMitglied.length >= 3 && (
              <div className="mt-3 overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2">Nr.</th>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Ort</th>
                      <th className="px-4 py-2">Ausweisnr.</th>
                      <th className="px-4 py-2">Gruppe</th>
                      <th className="px-4 py-2 text-right">Aktion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMitglieder.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-3 text-center text-gray-500">
                          Keine Mitglieder gefunden.
                        </td>
                      </tr>
                    )}
                    {filteredMitglieder.map((m) => (
                      <tr key={m.id} className="border-t hover:bg-blue-50">
                        <td className="px-4 py-2">{m.mitgliedsnr}</td>
                        <td className="px-4 py-2">{m.name}</td>
                        <td className="px-4 py-2">{m.ort}</td>
                        <td className="px-4 py-2">{m.ausweisnr}</td>
                        <td className="px-4 py-2">{m.preisgruppe}</td>
                        <td className="px-4 py-2 text-right">
                          <button
                            onClick={() => {
                              setAuswahl(m);
                            }}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Übernehmen
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border bg-white p-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="text-base">
                <strong>{auswahl.name}</strong>
                {auswahl.ort ? <> ({auswahl.ort})</> : null} – Preisgruppe:{" "}
                {auswahl.preisgruppe ?? "–"}
              </div>
              <button
                onClick={() => {
                  setAuswahl(null);
                  setQueryMitglied("");
                }}
                className="ml-auto px-3 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700"
              >
                Mitglied wechseln
              </button>
            </div>
          </div>
        )}

        {/* Zeitraum + Buttons rechts */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 items-end">
          <div>
            <label className="block text-sm font-medium mb-1 text-center md:text-left">Von</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-48 border rounded px-2 py-1 text-center"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-center md:text-left">Bis</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-48 border rounded px-2 py-1 text-center"
            />
          </div>
          <div className="md:col-span-3 flex justify-end gap-3">
            <button
              onClick={loadData}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Anzeigen
            </button>
            <button
              onClick={exportCSV}
              className="px-4 py-2 rounded border border-slate-300 hover:bg-slate-50"
            >
              Exportieren (CSV)
            </button>
          </div>
        </div>

        {/* Tabelle */}
        <div className="overflow-x-auto rounded border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                {cols.map((c) => (
                  <th key={c} className="border p-2">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={cols.length} className="p-3 text-center">
                    Lade…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={cols.length} className="p-3 text-center text-gray-500">
                    Keine Buchungen gefunden
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr key={i} className="even:bg-gray-50">
                    <td className="border p-2">
                      {new Date(r.datum).toLocaleDateString("de-DE")}
                    </td>
                    <td className="border p-2">{r.artikel_nummer}</td>
                    <td className="border p-2">{r.artikel_bezeichnung}</td>
                    <td className="border p-2 text-right">{r.menge}</td>
                    <td className="border p-2 text-right">{fmt2(r.einzelpreis)}</td>
                    <td className="border p-2 text-right">{fmt2(r.gesamtpreis)}</td>
                    <td className="border p-2">{r.mitglied_name}</td>
                    <td className="border p-2">{r.benutzer_name}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
