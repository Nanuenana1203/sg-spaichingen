"use client";
import { useState, useEffect } from "react";

type Mitglied = {
  id: number;
  name: string;
  ort?: string | null;
  ausweisnr?: string | null;
  preisgruppe: number | string | null;
  email?: string | null;
};

type Artikel = {
  id: number;
  bezeichnung: string;
  preis: number;
  kachel: boolean;
};

type WarenPos = {
  artikelId: number;
  bezeichnung: string;
  menge: number;
  preis: number;
};

export default function KassePage() {
  const [query, setQuery] = useState("");
  const [treffer, setTreffer] = useState<Mitglied[]>([]);
  const [mitglied, setMitglied] = useState<Mitglied | null>(null);
  const [artikel, setArtikel] = useState<Artikel[]>([]);
  const [warenkorb, setWarenkorb] = useState<WarenPos[]>([]);

  // --- Mitglieder suchen: nur ab 3 Zeichen, serverseitig nach Name/Ort/Ausweisnr gefiltert ---
  useEffect(() => {
    const load = async () => {
      const q = query.trim();
      if (q.length < 3) {
        setTreffer([]);
        return;
      }
      const res = await fetch(`/api/mitglieder?query=${encodeURIComponent(q)}`, { cache: "no-store" });
      const data = (await res.json()) as Mitglied[];
      // API ist bereits gefiltert + sortiert; wir setzen nur das Ergebnis
      setTreffer(Array.isArray(data) ? data : []);
    };
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [query]);

  // --- Artikel laden (nur Kacheln) ---
  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/artikel?kachel=1`, { cache: "no-store" });
      const data = await res.json();
      setArtikel(Array.isArray(data) ? data : []);
    };
    load();
  }, []);

  // --- Artikel in Warenkorb ---
  const addArtikel = (a: Artikel) => {
    if (!mitglied) return;
    setWarenkorb((cur) => {
      const existing = cur.find((x) => x.artikelId === a.id);
      if (existing) {
        return cur.map((x) =>
          x.artikelId === a.id ? { ...x, menge: x.menge + 1 } : x
        );
      } else {
        return [...cur, { artikelId: a.id, bezeichnung: a.bezeichnung, menge: 1, preis: a.preis }];
      }
    });
  };

  const summe = warenkorb.reduce((s, p) => s + p.menge * p.preis, 0);

  const buchen = async () => {
    if (!mitglied || warenkorb.length === 0) return;
    await fetch("/api/kasse/buchen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mitgliedId: mitglied.id,
        positionen: warenkorb,
        summe,
      }),
    });
    setWarenkorb([]);
    setMitglied(null);
    setQuery("");
    setTreffer([]);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      <h1 className="text-center text-3xl font-semibold mb-6">Kasse</h1>

      {/* Mitgliedsauswahl */}
      <div className="bg-white shadow rounded-2xl p-4 mb-6">
        {mitglied ? (
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">{mitglied.name}</p>
              <p className="text-sm text-gray-500">
                {mitglied.ort ? `${mitglied.ort} · ` : ""}Preisgruppe {mitglied.preisgruppe ?? "-"}
                {mitglied.ausweisnr ? ` · Ausweis ${mitglied.ausweisnr}` : ""}
              </p>
            </div>
            <button
              onClick={() => setMitglied(null)}
              className="text-sm text-blue-600 hover:underline"
            >
              Anderes Mitglied wählen
            </button>
          </div>
        ) : (
          <>
            <p className="font-semibold mb-2">Kein Mitglied ausgewählt</p>
            <div className="flex gap-3 items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nach Name, Ort oder Ausweisnummer suchen (min. 3 Zeichen)"
                className="border rounded-lg px-4 py-2 w-full max-w-2xl text-lg"
              />
            </div>

            {treffer.length > 0 && (
              <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="p-2">Name</th>
                      <th className="p-2">Ort</th>
                      <th className="p-2">Ausweisnr</th>
                      <th className="p-2">Preisgruppe</th>
                      <th className="p-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {treffer.map((m) => (
                      <tr key={m.id} className="border-t hover:bg-gray-50">
                        <td className="p-2">{m.name}</td>
                        <td className="p-2">{m.ort ?? "—"}</td>
                        <td className="p-2">{m.ausweisnr ?? "—"}</td>
                        <td className="p-2">{m.preisgruppe ?? "—"}</td>
                        <td className="p-2 text-right">
                          <button
                            onClick={() => setMitglied(m)}
                            className="text-blue-600 hover:underline"
                          >
                            Wählen
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Artikel / Warenkorb */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-2xl p-4 md:col-span-2">
          <h2 className="font-semibold mb-3">Artikel</h2>
          {!mitglied && (
            <p className="text-gray-500 text-sm">
              Bitte zuerst ein Mitglied wählen – dann können Artikel gebucht werden.
            </p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
            {mitglied &&
              artikel.map((a) => (
                <button
                  key={a.id}
                  onClick={() => addArtikel(a)}
                  className="border rounded-xl p-3 hover:bg-blue-50 text-left"
                >
                  <div className="font-medium truncate">{a.bezeichnung}</div>
                  <div className="text-gray-500 text-xs mt-1">{a.preis.toFixed(2)} €</div>
                </button>
              ))}
          </div>
        </div>

        <div className="bg-white shadow rounded-2xl p-4">
          <h2 className="font-semibold mb-3">Warenkorb</h2>
          {warenkorb.length === 0 ? (
            <p className="text-gray-500 text-sm">Noch keine Positionen.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {warenkorb.map((p) => (
                  <tr key={p.artikelId}>
                    <td className="py-1 pr-2">{p.bezeichnung}</td>
                    <td className="py-1 text-right">
                      {p.menge} × {p.preis.toFixed(2)} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="mt-3 flex justify-between font-semibold">
            <span>Summe</span>
            <span>{summe.toFixed(2)} €</span>
          </div>
          <button
            onClick={buchen}
            disabled={!mitglied || warenkorb.length === 0}
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
          >
            Buchen
          </button>
        </div>
      </div>
    </div>
  );
}
