"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const inp = "w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
const lbl = "block text-sm font-medium text-slate-700 mb-1.5";

type DienststZeile = { id: number; nummer: number; name: string | null; telefon: string | null; datum: string | null; buchung_von: string | null; buchung_bis: string | null; gebucht_am: string | null };
type DienstSlot = { id: number; datum_von: string; datum_bis: string; uhrzeit_von: string; uhrzeit_bis: string; dauer_minuten: number | null; anzahl_personen: number; dienst_zeilen: DienststZeile[] };
type Dienst = { id: number; titel: string; beschreibung: string | null; aktiv: boolean; dienst_slots: DienstSlot[] };

type NewSlot = { datum_von: string; datum_bis: string; uhrzeit_von: string; uhrzeit_bis: string; dauer_minuten: string; anzahl_personen: string };

function fmtDate(d: string) {
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" });
}
function fmtTime(t: string) { return t.slice(0, 5); }
function fmtDauer(min: number | null) {
  if (!min) return null;
  return min >= 60 ? `${Math.floor(min / 60)}h${min % 60 ? ` ${min % 60}min` : ""}` : `${min} min`;
}
function fmtTs(ts: string | null) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function DienstDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [dienst, setDienst] = useState<Dienst | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [addingSlot, setAddingSlot] = useState(false);
  const [newSlot, setNewSlot] = useState<NewSlot>({ datum_von: "", datum_bis: "", uhrzeit_von: "", uhrzeit_bis: "", dauer_minuten: "", anzahl_personen: "1" });

  useEffect(() => { load(); }, [id]);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`/api/dienste/${id}`, { cache: "no-store" });
      const d = await r.json().catch(() => null);
      if (!r.ok || !d) throw new Error("Dienst nicht gefunden");
      setDienst(d);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally { setLoading(false); }
  }

  async function saveMeta(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setSaving(true);
    try {
      const r = await fetch(`/api/dienste/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titel: dienst?.titel, beschreibung: dienst?.beschreibung, aktiv: dienst?.aktiv }),
      });
      if (!r.ok) throw new Error("Speichern fehlgeschlagen");
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : String(e)); }
    finally { setSaving(false); }
  }

  async function addSlot(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setSaving(true);
    try {
      const r = await fetch("/api/dienst-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dienst_id: Number(id),
          datum_von: newSlot.datum_von,
          datum_bis: newSlot.datum_bis || newSlot.datum_von,
          uhrzeit_von: newSlot.uhrzeit_von,
          uhrzeit_bis: newSlot.uhrzeit_bis,
          dauer_minuten: newSlot.dauer_minuten ? Number(newSlot.dauer_minuten) : null,
          anzahl_personen: Number(newSlot.anzahl_personen) || 1,
        }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok || j?.ok === false) throw new Error(j?.detail || "Fehler beim Anlegen");
      setAddingSlot(false);
      setNewSlot({ datum_von: "", datum_bis: "", uhrzeit_von: "", uhrzeit_bis: "", dauer_minuten: "", anzahl_personen: "1" });
      await load();
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : String(e)); }
    finally { setSaving(false); }
  }

  async function deleteSlot(slotId: number) {
    if (!confirm("Slot und alle Buchungen dazu löschen?")) return;
    await fetch(`/api/dienst-slots/${slotId}`, { method: "DELETE" });
    await load();
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-slate-500 text-sm">Lade…</p>
    </div>
  );
  if (!dienst) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-red-600 text-sm">{err || "Dienst nicht gefunden"}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Dienst bearbeiten</h1>
          <button onClick={() => router.push("/dienste")}
            className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors">
            Zurück
          </button>
        </div>

        {/* Grunddaten */}
        <form onSubmit={saveMeta} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-800">Grunddaten</h2>
          <div>
            <label className={lbl}>Überschrift *</label>
            <input className={inp} value={dienst.titel} onChange={e => setDienst({ ...dienst, titel: e.target.value })} required />
          </div>
          <div>
            <label className={lbl}>Beschreibung</label>
            <textarea className={inp + " resize-none"} rows={3}
              value={dienst.beschreibung ?? ""}
              onChange={e => setDienst({ ...dienst, beschreibung: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={dienst.aktiv} onChange={e => setDienst({ ...dienst, aktiv: e.target.checked })} className="rounded" />
            Aktiv (in Dienstübersicht sichtbar)
          </label>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button type="submit" disabled={saving}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
            {saving ? "Speichern…" : "Änderungen speichern"}
          </button>
        </form>

        {/* Slots */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-800">Einsatz-Zeiten</h2>
            <button type="button" onClick={() => setAddingSlot(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors">
              + Zeitraum hinzufügen
            </button>
          </div>

          {/* Formular neuer Slot */}
          {addingSlot && (
            <form onSubmit={addSlot} className="rounded-xl border border-blue-200 bg-blue-50 p-4 mb-4 space-y-3">
              <p className="text-sm font-medium text-blue-800">Neuer Zeitraum</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Datum von *</label>
                  <input type="date" className={inp} value={newSlot.datum_von}
                    onChange={e => setNewSlot(s => ({ ...s, datum_von: e.target.value }))} required />
                </div>
                <div>
                  <label className={lbl}>Datum bis</label>
                  <input type="date" className={inp} value={newSlot.datum_bis}
                    onChange={e => setNewSlot(s => ({ ...s, datum_bis: e.target.value }))}
                    min={newSlot.datum_von} />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className={lbl}>Von *</label>
                  <input type="time" className={inp} value={newSlot.uhrzeit_von}
                    onChange={e => setNewSlot(s => ({ ...s, uhrzeit_von: e.target.value }))} required />
                </div>
                <div>
                  <label className={lbl}>Bis *</label>
                  <input type="time" className={inp} value={newSlot.uhrzeit_bis}
                    onChange={e => setNewSlot(s => ({ ...s, uhrzeit_bis: e.target.value }))} required />
                </div>
                <div>
                  <label className={lbl}>Dauer (Min.)</label>
                  <input type="number" min="1" className={inp + " text-right"} value={newSlot.dauer_minuten}
                    onChange={e => setNewSlot(s => ({ ...s, dauer_minuten: e.target.value }))} placeholder="120" />
                </div>
                <div>
                  <label className={lbl}>Personen *</label>
                  <input type="number" min="1" className={inp + " text-right"} value={newSlot.anzahl_personen}
                    onChange={e => setNewSlot(s => ({ ...s, anzahl_personen: e.target.value }))} required />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={saving}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
                  Speichern
                </button>
                <button type="button" onClick={() => setAddingSlot(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm hover:bg-slate-200 transition-colors">
                  Abbrechen
                </button>
              </div>
            </form>
          )}

          {/* Slot-Liste */}
          {(dienst.dienst_slots ?? []).length === 0 ? (
            <p className="text-sm text-slate-500">Noch keine Zeiträume angelegt.</p>
          ) : (
            <div className="space-y-3">
              {(dienst.dienst_slots ?? []).map(slot => {
                const zeilen = slot.dienst_zeilen ?? [];
                const booked = zeilen.filter(z => z.name).length;
                const free = slot.anzahl_personen - booked;
                const multiday = slot.datum_von !== slot.datum_bis;
                return (
                  <div key={slot.id} className="rounded-xl border border-slate-200 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-medium text-slate-800">
                          {multiday ? `${fmtDate(slot.datum_von)} – ${fmtDate(slot.datum_bis)}` : fmtDate(slot.datum_von)}
                        </span>
                        <span className="text-slate-500">{fmtTime(slot.uhrzeit_von)} – {fmtTime(slot.uhrzeit_bis)}</span>
                        {slot.dauer_minuten && <span className="text-slate-500">{fmtDauer(slot.dauer_minuten)}</span>}
                        <span className={`font-medium ${free === 0 ? "text-red-600" : "text-green-700"}`}>
                          {free} / {slot.anzahl_personen} frei
                        </span>
                      </div>
                      <button onClick={() => deleteSlot(slot.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors text-sm">🗑️</button>
                    </div>
                    {zeilen.length > 0 && (
                      <div className="divide-y divide-slate-100">
                        {zeilen.map(z => (
                          <div key={z.id} className="flex items-center justify-between px-4 py-2">
                            <span className="text-sm text-slate-600">Platz {z.nummer}</span>
                            {z.name ? (
                              <div className="text-right">
                                <span className="text-sm font-medium text-slate-800">{z.name}</span>
                                {z.telefon && <span className="ml-2 text-xs text-slate-500">{z.telefon}</span>}
                                {z.datum && (
                                  <span className="ml-2 text-xs text-slate-400">
                                    {fmtDate(z.datum)}{z.buchung_von ? ` ${z.buchung_von.slice(0,5)}–${(z.buchung_bis ?? "").slice(0,5)}` : ""}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">frei</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
