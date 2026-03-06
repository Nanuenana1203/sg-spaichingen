// "use client" – Kassenbestand prüfen
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Denom = { value: number; label: string; kind: "coin" | "note" };

const DENOMS: Denom[] = [
  { value: 0.01, label: "0,01 €", kind: "coin" },
  { value: 0.02, label: "0,02 €", kind: "coin" },
  { value: 0.05, label: "0,05 €", kind: "coin" },
  { value: 0.1,  label: "0,10 €", kind: "coin" },
  { value: 0.2,  label: "0,20 €", kind: "coin" },
  { value: 0.5,  label: "0,50 €", kind: "coin" },
  { value: 1,    label: "1 €", kind: "coin" },
  { value: 2,    label: "2 €", kind: "coin" },
  { value: 5,    label: "5 €", kind: "note" },
  { value: 10,   label: "10 €", kind: "note" },
  { value: 20,   label: "20 €", kind: "note" },
  { value: 50,   label: "50 €", kind: "note" },
  { value: 100,  label: "100 €", kind: "note" },
  { value: 200,  label: "200 €", kind: "note" },
  { value: 500,  label: "500 €", kind: "note" },
];

function eur(n: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);
}

export default function KassenbestandPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  function setCount(v: number, n: number) {
    setCounts((old) => ({ ...old, [String(v)]: Math.max(0, Math.floor(n) || 0) }));
  }
  function getCount(v: number) { return counts[String(v)] ?? 0; }

  const coins = DENOMS.filter(d => d.kind === "coin");
  const notes = DENOMS.filter(d => d.kind === "note");

  const subtotals = useMemo(() => {
    const map: Record<string, number> = {};
    for (const d of DENOMS) map[String(d.value)] = d.value * getCount(d.value);
    return map;
  }, [counts]);

  const totalCoins = coins.reduce((s, d) => s + subtotals[String(d.value)], 0);
  const totalNotes = notes.reduce((s, d) => s + subtotals[String(d.value)], 0);
  const totalAll = totalCoins + totalNotes;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Kassenbestand prüfen</h1>
          <Link href="/dashboard" className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors">
            Zurück
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {[{ title: "Münzen", list: coins, total: totalCoins },
            { title: "Scheine", list: notes, total: totalNotes }].map((block) => (
            <div key={block.title} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-base font-semibold text-slate-900 mb-4">{block.title}</h2>
              <div className="space-y-2">
                {block.list.map((d) => (
                  <div key={d.value} className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2">
                    <span className="w-16 text-sm text-slate-600">{d.label}</span>
                    <span className="text-slate-400 text-sm">×</span>
                    <input
                      type="number"
                      min="0"
                      className="w-20 text-right px-2 py-1 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={getCount(d.value)}
                      onChange={(e) => setCount(d.value, Number(e.target.value))}
                    />
                    <span className="ml-auto text-sm font-medium text-slate-700 tabular-nums">
                      {eur(subtotals[String(d.value)] || 0)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-right font-semibold text-slate-900 mt-4 pt-3 border-t border-slate-100">
                Summe: {eur(block.total)}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-right">
          <span className="text-lg font-bold text-slate-900">Gesamt: {eur(totalAll)}</span>
        </div>
      </div>
    </div>
  );
}
