"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const inp = "w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
const lbl = "block text-sm font-medium text-slate-700 mb-1.5";

type SlotForm = {
  datum_von: string;
  datum_bis: string;
  uhrzeit_von: string;
  uhrzeit_bis: string;
  dauer_minuten: string;
  anzahl_personen: string;
};

function emptySlot(): SlotForm {
  return { datum_von: "", datum_bis: "", uhrzeit_von: "", uhrzeit_bis: "", dauer_minuten: "", anzahl_personen: "1" };
}

const KATEGORIEN = ["Arbeitseinsatz", "Salat", "Kuchen"] as const;

export default function NeuerDienst() {
  const router = useRouter();
  const [titel, setTitel] = useState("");
  const [event, setEvent] = useState("");
  const [kategorie, setKategorie] = useState("");
  const [existingEvents, setExistingEvents] = useState<string[]>([]);
  const [slots, setSlots] = useState<SlotForm[]>([emptySlot()]);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/dienste", { cache: "no-store" })
      .then(r => r.json())
      .then((rows: { event?: string | null }[]) => {
        if (!Array.isArray(rows)) return;
        const evts = [...new Set(rows.map(r => r.event).filter(Boolean) as string[])].sort();
        setExistingEvents(evts);
      })
      .catch(() => {});
  }, []);

  function updateSlot(i: number, field: keyof SlotForm, val: string) {
    setSlots(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  }

  function addSlot() { setSlots(prev => [...prev, emptySlot()]); }
  function removeSlot(i: number) { setSlots(prev => prev.filter((_, idx) => idx !== i)); }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setSaving(true);
    try {
      // Dienst anlegen
      const r = await fetch("/api/dienste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titel, event, kategorie }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok || j?.ok === false) throw new Error(j?.detail || j?.error || "Fehler beim Anlegen");
      const dienst_id = j?.dienst?.id;
      if (!dienst_id) throw new Error("Keine Dienst-ID erhalten");

      // Slots anlegen
      for (const slot of slots) {
        if (!slot.datum_von || !slot.uhrzeit_von || !slot.uhrzeit_bis) continue;
        const rs = await fetch("/api/dienst-slots", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dienst_id,
            datum_von: slot.datum_von,
            datum_bis: slot.datum_bis || slot.datum_von,
            uhrzeit_von: slot.uhrzeit_von,
            uhrzeit_bis: slot.uhrzeit_bis,
            dauer_minuten: slot.dauer_minuten ? Number(slot.dauer_minuten) : null,
            anzahl_personen: Number(slot.anzahl_personen) || 1,
          }),
        });
        const js = await rs.json().catch(() => null);
        if (!rs.ok || js?.ok === false) throw new Error(js?.detail || js?.error || "Fehler beim Slot-Anlegen");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally { setSaving(false); }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Neuer Dienst</h1>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Grunddaten */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-800">Grunddaten</h2>
            <div>
              <label className={lbl}>Event</label>
              <input
                className={inp}
                list="event-list"
                value={event}
                onChange={e => setEvent(e.target.value)}
                placeholder="Event eingeben oder auswählen…"
              />
              <datalist id="event-list">
                {existingEvents.map(ev => <option key={ev} value={ev} />)}
              </datalist>
            </div>
            <div>
              <label className={lbl}>Kategorie</label>
              <select className={inp} value={kategorie} onChange={e => setKategorie(e.target.value)}>
                <option value="">– bitte wählen –</option>
                {KATEGORIEN.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Überschrift *</label>
              <input className={inp} value={titel} onChange={e => setTitel(e.target.value)} placeholder="z. B. Vereinsputz Frühjahr 2026" required />
            </div>
          </div>

          {/* Slots */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-800">Einsatz-Zeiten</h2>
              <button type="button" onClick={addSlot}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors">
                + Zeitraum hinzufügen
              </button>
            </div>

            <div className="space-y-4">
              {slots.map((slot, i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-600">Zeitraum {i + 1}</span>
                    {slots.length > 1 && (
                      <button type="button" onClick={() => removeSlot(i)}
                        className="text-slate-400 hover:text-red-600 transition-colors text-sm">🗑️</button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className={lbl}>Datum von *</label>
                      <input type="date" className={inp} value={slot.datum_von}
                        onChange={e => updateSlot(i, "datum_von", e.target.value)} required />
                    </div>
                    <div>
                      <label className={lbl}>Datum bis</label>
                      <input type="date" className={inp} value={slot.datum_bis}
                        onChange={e => updateSlot(i, "datum_bis", e.target.value)}
                        min={slot.datum_von} />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className={lbl}>Uhrzeit von *</label>
                      <input type="time" className={inp} value={slot.uhrzeit_von}
                        onChange={e => updateSlot(i, "uhrzeit_von", e.target.value)} required />
                    </div>
                    <div>
                      <label className={lbl}>Uhrzeit bis *</label>
                      <input type="time" className={inp} value={slot.uhrzeit_bis}
                        onChange={e => updateSlot(i, "uhrzeit_bis", e.target.value)} required />
                    </div>
                    <div>
                      <label className={lbl}>Dauer (Min.)</label>
                      <input type="number" min="1" className={inp + " text-right"} value={slot.dauer_minuten}
                        onChange={e => updateSlot(i, "dauer_minuten", e.target.value)}
                        placeholder="z. B. 120" />
                    </div>
                    <div>
                      <label className={lbl}>Anz. Personen *</label>
                      <input type="number" min="1" className={inp + " text-right"} value={slot.anzahl_personen}
                        onChange={e => updateSlot(i, "anzahl_personen", e.target.value)} required />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {err && <p className="text-sm text-red-600">{err}</p>}
          {saved && <p className="text-sm text-green-600 font-medium">Gespeichert</p>}

          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
              {saving ? "Speichern…" : "Speichern"}
            </button>
            <button type="button" onClick={() => router.push("/dienste")}
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors">
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
