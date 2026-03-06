"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Bahn = { id: number; nummer: string | null; name: string | null };

const inp = "w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
const lbl = "block text-sm font-medium text-slate-700 mb-1.5";

export default function ZeitregelNeuPage() {
  const router = useRouter();
  const [bahnen, setBahnen] = useState<Bahn[]>([]);
  const [weekday, setWeekday] = useState<number>(1);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [slotMinutes, setSlotMinutes] = useState(60);
  const [aktiv, setAktiv] = useState(true);
  const [alleBahnen, setAlleBahnen] = useState(false);
  const [bahnIds, setBahnIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/bahnen", { cache: "no-store" });
      const list = await r.json().catch(() => []);
      setBahnen(Array.isArray(list) ? list : []);
      setLoading(false);
    })();
  }, []);

  async function speichern() {
    setSaving(true);
    try {
      const body = { weekday, start_time: startTime, end_time: endTime, slot_minutes: slotMinutes, aktiv, alle_bahnen: alleBahnen, bahn_ids: bahnIds };
      const r = await fetch("/api/zeitregeln", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error("Fehler");
      router.push("/zeitregeln");
    } catch {
      alert("Fehler beim Speichern.");
    } finally {
      setSaving(false);
    }
  }

  function toggleBahn(id: number) {
    setBahnIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Zeitregel anlegen</h1>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-6 space-y-5">
            <div>
              <label className={lbl}>Wochentag</label>
              <select value={weekday} onChange={(e) => setWeekday(Number(e.target.value))} className={inp}>
                <option value={0}>Sonntag</option>
                <option value={1}>Montag</option>
                <option value={2}>Dienstag</option>
                <option value={3}>Mittwoch</option>
                <option value={4}>Donnerstag</option>
                <option value={5}>Freitag</option>
                <option value={6}>Samstag</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={lbl}>Zeit von</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inp} />
              </div>
              <div>
                <label className={lbl}>Zeit bis</label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inp} />
              </div>
              <div>
                <label className={lbl}>Slot-Minuten</label>
                <input type="number" min={5} step={5} value={slotMinutes} onChange={(e) => setSlotMinutes(Number(e.target.value))} className={inp} />
              </div>
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={aktiv} onChange={(e) => setAktiv(e.target.checked)} className="rounded" />
                Regel ist aktiv
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={alleBahnen} onChange={(e) => setAlleBahnen(e.target.checked)} className="rounded" />
                Fur alle Bahnen
              </label>
            </div>

            {!alleBahnen && !loading && (
              <div>
                <p className={lbl}>Bahnen auswahlen</p>
                <div className="flex flex-wrap gap-3">
                  {bahnen.map((b) => (
                    <label key={b.id} className="flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" checked={bahnIds.includes(b.id)} onChange={() => toggleBahn(b.id)} className="rounded" />
                      {b.nummer ?? "?"} – {b.name ?? ""}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
            <button
              onClick={speichern}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? "Speichern…" : "Speichern"}
            </button>
            <button
              onClick={() => router.push("/zeitregeln")}
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
