"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Regel = {
  id: number;
  weekday: number;
  start_time: string | null;
  end_time: string | null;
  slot_minutes: number | null;
  aktiv: boolean | null;
  bahn_id: number | null;
  bahnen?: { id: number; nummer: string | null; name: string | null } | null;
};

const WDN = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

function hhmm(s: string | null): string {
  if (!s) return "";
  const m = s.match(/^(\d{2}:\d{2})(?::\d{2})?$/);
  return m ? m[1] : s;
}

const inp = "w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
const lbl = "block text-sm font-medium text-slate-700 mb-1.5";

export default function EditClient({ id }: { id: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reg, setReg] = useState<Regel | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [slotMin, setSlotMin] = useState(60);
  const [aktiv, setAktiv] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/zeitregeln/${id}`, { cache: "no-store" });
        const row: Regel | null = await r.json().catch(() => null);
        if (alive && row) {
          setReg(row);
          setStartTime(hhmm(row.start_time));
          setEndTime(hhmm(row.end_time));
          setSlotMin(row.slot_minutes ?? 60);
          setAktiv(row.aktiv ?? true);
        }
      } catch {
        alert("Zeitregel konnte nicht geladen werden.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  async function onSave() {
    if (!reg) return;
    setSaving(true);
    try {
      const body = { weekday: reg.weekday, start_time: startTime || null, end_time: endTime || null, slot_minutes: slotMin || null, aktiv };
      const r = await fetch(`/api/zeitregeln/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error("patch");
      router.push("/zeitregeln");
    } catch {
      alert("Fehler beim Speichern.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !reg) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-slate-500 text-sm">Lade…</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Zeitregel bearbeiten</h1>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-6 space-y-5">
            <div>
              <label className={lbl}>Wochentag</label>
              <select
                value={reg.weekday}
                onChange={e => setReg({ ...reg, weekday: Number(e.target.value) })}
                className={inp}
              >
                {WDN.map((w, idx) => (<option key={idx} value={idx}>{w}</option>))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={lbl}>Zeit von</label>
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className={inp} />
              </div>
              <div>
                <label className={lbl}>Zeit bis</label>
                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className={inp} />
              </div>
              <div>
                <label className={lbl}>Slot-Minuten</label>
                <input type="number" min={5} step={5} value={slotMin} onChange={e => setSlotMin(Number(e.target.value))} className={inp} />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={aktiv} onChange={e => setAktiv(e.target.checked)} className="rounded" />
              Regel ist aktiv
            </label>

            <div className="text-sm text-slate-500">
              Bahn: {reg.bahn_id === null ? "Alle Bahnen" : (reg.bahnen?.nummer ? `${reg.bahnen.nummer} – ${reg.bahnen.name ?? ""}` : `#${reg.bahn_id}`)}
            </div>
          </div>

          <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
            <button
              onClick={onSave}
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
