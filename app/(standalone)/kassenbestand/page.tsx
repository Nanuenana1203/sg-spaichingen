// "use client" – Kassenbestand prüfen (kompakte Darstellung)
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
  function getCount(v: number) {
    return counts[String(v)] ?? 0;
  }

  const coins = DENOMS.filter(d => d.kind === "coin");
  const notes = DENOMS.filter(d => d.kind === "note");

  const subtotals = useMemo(() => {
    const map: Record<string, number> = {};
    for (const d of DENOMS) map[String(d.value)] = d.value * getCount(d.value);
    return map;
  }, [counts]);

  const totalCoins = coins.reduce((s, d) => s + subtotals[String(d.value)], 0);
  const totalNotes = notes.reduce((s, d) => s + subtotals[String(d.value)], 0);
  const totalAll   = totalCoins + totalNotes;

  return (
    <div className="p-3 md:p-4 space-y-3 md:space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-semibold">Kassenbestand prüfen</h1>
        <Link href="/dashboard" className="px-2 py-1 text-sm border rounded hover:bg-gray-50">← Zurück</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {[{ title: "Münzen", list: coins, total: totalCoins },
          { title: "Scheine", list: notes, total: totalNotes }].map((block) => (
          <div key={block.title} className="rounded-xl border bg-white/70 p-3 md:p-4 shadow-sm">
            <h2 className="text-base md:text-lg font-semibold mb-2 md:mb-3">{block.title}</h2>
            <div className="space-y-1.5 md:space-y-2">
              {block.list.map((d) => (
                <div key={d.value} className="flex items-center gap-2 border rounded px-2 py-1">
                  <div className="w-16 md:w-20 text-xs md:text-sm">{d.label}</div>
                  <div className="text-gray-500 text-xs md:text-sm">×</div>
                  <input
                    type="number"
                    min="0"
                    className="w-14 md:w-20 text-right border rounded px-1 md:px-2 py-0.5 md:py-1 text-sm"
                    value={getCount(d.value)}
                    onChange={(e) => setCount(d.value, Number(e.target.value))}
                  />
                  <div className="ml-auto tabular-nums text-sm md:text-base">
                    {eur(subtotals[String(d.value)] || 0)}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-right font-semibold mt-3 md:mt-4 text-sm md:text-base">
              Summe: {eur(block.total)}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-white/70 p-3 md:p-4 shadow-sm text-right text-lg md:text-xl font-bold">
        Gesamt: {eur(totalAll)}
      </div>
    </div>
  );
}
