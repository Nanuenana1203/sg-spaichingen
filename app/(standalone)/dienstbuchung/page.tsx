"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { Toaster, toast } from "sonner";
import * as XLSX from "xlsx";

type Zeile = {
  id: number;
  nummer: number;
  name: string | null;
  telefon?: string | null;
  datum?: string | null;
  buchung_von?: string | null;
  buchung_bis?: string | null;
  gebucht_am?: string | null;
};
type DienstSlot = {
  id: number;
  datum_von: string;
  datum_bis: string;
  uhrzeit_von: string;
  uhrzeit_bis: string;
  dauer_minuten: number | null;
  anzahl_personen: number;
  dienst_zeilen: Zeile[];
};
type Dienst = {
  id: number;
  titel: string;
  beschreibung: string | null;
  event: string | null;
  kategorie: string | null;
  aktiv: boolean;
  dienst_slots: DienstSlot[];
};

function datesInRange(von: string, bis: string): string[] {
  const result: string[] = [];
  const cur = new Date(von + "T00:00:00");
  const end = new Date(bis + "T00:00:00");
  while (cur <= end) {
    result.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return result;
}

function fmtDate(d: string | null) {
  if (!d) return "–";
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" });
}
function fmtTime(t: string | null) { return t ? t.slice(0, 5) : "–"; }
function fmtDauer(min: number | null) {
  if (!min) return null;
  return min >= 60 ? `${Math.floor(min / 60)}h${min % 60 ? ` ${min % 60}min` : ""}` : `${min} min`;
}
function fmtTs(ts: string | null) {
  if (!ts) return "";
  return new Date(ts).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function isFlexible(slot: DienstSlot): boolean {
  if (slot.datum_von !== slot.datum_bis) return true;
  if (slot.dauer_minuten) {
    const [h1, m1] = slot.uhrzeit_von.split(":").map(Number);
    const [h2, m2] = slot.uhrzeit_bis.split(":").map(Number);
    if (h2 * 60 + m2 - (h1 * 60 + m1) !== slot.dauer_minuten) return true;
  }
  return false;
}

function calcEnd(von: string, dauer: number): string {
  const [h, m] = von.split(":").map(Number);
  const total = h * 60 + m + dauer;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

type EventGroup = { event: string; katGroups: { kat: string; dienste: Dienst[] }[] };

function buildEventGroups(dienste: Dienst[]): EventGroup[] {
  const sorted = [...dienste].sort((a, b) => {
    const evA = a.event ?? "\uffff";
    const evB = b.event ?? "\uffff";
    if (evA !== evB) return evA.localeCompare(evB, "de");
    const dateA = [...(a.dienst_slots ?? [])].map(s => s.datum_von).sort()[0] ?? "";
    const dateB = [...(b.dienst_slots ?? [])].map(s => s.datum_von).sort()[0] ?? "";
    if (dateA !== dateB) return dateA.localeCompare(dateB);
    return (a.kategorie ?? "").localeCompare(b.kategorie ?? "", "de");
  });
  const groups: EventGroup[] = [];
  for (const d of sorted) {
    const ev = d.event ?? "";
    const kat = d.kategorie ?? "";
    let evGroup = groups.find(g => g.event === ev);
    if (!evGroup) { evGroup = { event: ev, katGroups: [] }; groups.push(evGroup); }
    let katGroup = evGroup.katGroups.find(g => g.kat === kat);
    if (!katGroup) { katGroup = { kat, dienste: [] }; evGroup.katGroups.push(katGroup); }
    katGroup.dienste.push(d);
  }
  return groups;
}

type ActiveBooking = { slotId: number; datum: string; zeitVon: string; zeitBis: string };

const inp = "px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

type Gate = "loading" | "ok" | "no-session" | "forbidden";

export default function DienstbuchungPage() {
  const [gate, setGate] = useState<Gate>("loading");
  const [dienste, setDienste] = useState<Dienst[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [telefon, setTelefon] = useState("");
  const [active, setActive] = useState<ActiveBooking | null>(null);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const s = await fetch("/api/session", { cache: "no-store", credentials: "include" });
        const sd = await s.json().catch(() => ({}));
        const user = sd?.user ?? null;
        if (!user) { setGate("no-session"); return; }
        if (!user.isAdmin) { setGate("forbidden"); return; }
        setGate("ok");

        const r = await fetch("/api/dienste", { cache: "no-store" });
        const d = await r.json().catch(() => []);
        const all: Dienst[] = Array.isArray(d) ? d : [];
        setDienste(all.filter(di => di.aktiv));
      } finally { setLoading(false); }
    })();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/dienste", { cache: "no-store" });
      const d = await r.json().catch(() => []);
      const all: Dienst[] = Array.isArray(d) ? d : [];
      setDienste(all.filter(di => di.aktiv));
    } finally { setLoading(false); }
  }

  function openSlot(slot: DienstSlot) {
    if (active?.slotId === slot.id) { setActive(null); return; }
    const flex = isFlexible(slot);
    setActive({
      slotId: slot.id,
      datum: flex ? "" : slot.datum_von,
      zeitVon: flex ? "" : fmtTime(slot.uhrzeit_von),
      zeitBis: flex ? "" : fmtTime(slot.uhrzeit_bis),
    });
  }

  function onZeitVonChange(val: string, slot: DienstSlot) {
    const zeitBis = slot.dauer_minuten ? calcEnd(val, slot.dauer_minuten) : (active?.zeitBis ?? "");
    setActive(a => a ? { ...a, zeitVon: val, zeitBis } : a);
  }

  function exportExcel() {
    const rows: Record<string, string>[] = [];
    const evGroups = buildEventGroups(dienste);
    for (const ev of evGroups) {
      for (const kg of ev.katGroups) {
        for (const dienst of kg.dienste) {
          const slots = (dienst.dienst_slots ?? []).slice().sort((a, b) =>
            a.datum_von.localeCompare(b.datum_von) || a.uhrzeit_von.localeCompare(b.uhrzeit_von));
          for (const slot of slots) {
            const zeilen = (slot.dienst_zeilen ?? []).slice().sort((a, b) => a.nummer - b.nummer);
            for (const z of zeilen) {
              rows.push({
                "Event": ev.event || "",
                "Kategorie": kg.kat || "",
                "Dienst": dienst.titel,
                "Datum (Slot von)": fmtDate(slot.datum_von),
                "Datum (Slot bis)": slot.datum_bis !== slot.datum_von ? fmtDate(slot.datum_bis) : "",
                "Uhrzeit von": fmtTime(slot.uhrzeit_von),
                "Uhrzeit bis": fmtTime(slot.uhrzeit_bis),
                "Platz": String(z.nummer),
                "Name": z.name ?? "",
                "Telefon": z.telefon ?? "",
                "Buchungsdatum": z.datum ? fmtDate(z.datum) : "",
                "Buchung von": z.buchung_von ? fmtTime(z.buchung_von) : "",
                "Buchung bis": z.buchung_bis ? fmtTime(z.buchung_bis) : "",
                "Gebucht am": fmtTs(z.gebucht_am ?? null),
              });
            }
          }
        }
      }
    }
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dienstbuchungen");
    XLSX.writeFile(wb, `Dienstbuchungen_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  async function buchen(slot: DienstSlot) {
    if (!name.trim() || !telefon.trim()) {
      toast.warning("Bitte zuerst Name und Telefonnummer eingeben (oben).");
      return;
    }
    if (!active?.datum || !active?.zeitVon || !active?.zeitBis) {
      toast.warning("Bitte Datum und Uhrzeit auswählen.");
      return;
    }
    setBooking(true);
    toast.info("Buchung wird durchgeführt…");
    try {
      const r = await fetch("/api/dienst-buchen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slot_id: slot.id,
          name: name.trim(),
          telefon: telefon.trim(),
          datum: active.datum,
          buchung_von: active.zeitVon,
          buchung_bis: active.zeitBis,
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j?.ok !== true) {
        if (j?.error === "AUSGEBUCHT") toast.error("Dieser Dienst ist bereits ausgebucht.");
        else toast.error("Buchung fehlgeschlagen.");
        return;
      }
      toast.success(`Buchung für ${name} erfolgreich eingetragen!`);
      setActive(null);
      await load();
    } finally { setBooking(false); }
  }

  if (gate !== "ok") {
    const title = gate === "loading" ? "Lade…" : gate === "no-session" ? "Nicht angemeldet" : "Kein Zugriff";
    const msg = gate === "loading" ? "" : gate === "no-session"
      ? "Bitte zuerst einloggen, um die Dienstübersicht zu öffnen."
      : "Für die Dienstübersicht ist Admin-Recht erforderlich.";
    const btnHref = gate === "no-session" ? "/" : "/dashboard";
    const btnText = gate === "no-session" ? "Zur Anmeldung" : "Zum Dashboard";
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-md w-full text-center space-y-4">
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          {msg && <p className="text-sm text-slate-600">{msg}</p>}
          {gate !== "loading" && (
            <Link href={btnHref} className="inline-flex px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition-colors">
              {btnText}
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-500 text-sm">Lade…</p>
    </div>
  );

  const eventGroups = buildEventGroups(dienste);

  return (
    <div className="min-h-screen">
      <Toaster richColors position="top-center" />
      <div className="mx-auto max-w-5xl px-6 py-8">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Dienstübersicht</h1>
          <div className="flex gap-2">
            <button onClick={exportExcel}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors">
              Excel exportieren
            </button>
            <Link href="/dienstbuchung-storno?ref=intern" className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">
              Buchung stornieren
            </Link>
            <Link href="/dashboard" className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors">
              Zurück
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Schritt 1 — Ihre Daten eingeben</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Name *</label>
              <input className={inp + " w-full"} placeholder="Vor- und Nachname" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Telefon *</label>
              <input className={inp + " w-full"} placeholder="z. B. 0176 12345678" value={telefon} onChange={e => setTelefon(e.target.value)} />
            </div>
            <p className="text-xs text-slate-500">Schritt 2 → Dienst auswählen und auf <strong>Buchen</strong> klicken.</p>
          </div>
        </div>

        {dienste.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <p className="text-slate-500 text-sm">Aktuell sind keine buchbaren Dienste verfügbar.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {eventGroups.map(({ event: ev, katGroups }) => (
              <div key={ev}>
                {ev && (
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-2xl font-bold text-slate-900">{ev}</h2>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>
                )}
                <div className="space-y-5">
                  {katGroups.map(({ kat, dienste: diensteListe }) => (
                    <div key={kat}>
                      {kat && (
                        <p className="text-lg font-bold text-slate-800 mb-2 ml-1">{kat}</p>
                      )}
                      <div className="space-y-3">
                        {diensteListe.map(dienst => {
                          const slots = (dienst.dienst_slots ?? []).slice().sort((a, b) =>
                            a.datum_von.localeCompare(b.datum_von) || a.uhrzeit_von.localeCompare(b.uhrzeit_von));
                          return (
                            <div key={dienst.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                              <div className="px-6 py-3 border-b border-slate-100 bg-slate-50">
                                <h3 className="text-base font-bold text-slate-900">{dienst.titel}</h3>
                                {dienst.beschreibung && (
                                  <p className="mt-1 text-sm text-slate-600 whitespace-pre-line">{dienst.beschreibung}</p>
                                )}
                              </div>
                              <div className="divide-y divide-slate-100">
                                {slots.map(slot => {
                                  const zeilen = slot.dienst_zeilen ?? [];
                                  const gebucht = zeilen.filter(z => z.name).length;
                                  const frei = slot.anzahl_personen - gebucht;
                                  const ausgebucht = frei <= 0;
                                  const flex = isFlexible(slot);
                                  const tage = datesInRange(slot.datum_von, slot.datum_bis);
                                  const isOpen = active?.slotId === slot.id;

                                  return (
                                    <Fragment key={slot.id}>
                                      <div className={`${isOpen ? "bg-blue-50" : ""} transition-colors`}>
                                        <div className={`px-5 py-4 flex items-center justify-between gap-4 ${isOpen ? "" : "hover:bg-slate-50"}`}>
                                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                                            <span className="font-medium text-slate-800">
                                              {tage.length > 1 ? `${fmtDate(slot.datum_von)} – ${fmtDate(slot.datum_bis)}` : fmtDate(slot.datum_von)}
                                            </span>
                                            <span className="text-slate-500">{fmtTime(slot.uhrzeit_von)} – {fmtTime(slot.uhrzeit_bis)}</span>
                                            {slot.dauer_minuten && <span className="text-slate-400 text-xs">Dauer: {fmtDauer(slot.dauer_minuten)}</span>}
                                            {flex && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Flexibel buchbar</span>}
                                          </div>
                                          <div className="flex items-center gap-3 shrink-0">
                                            <span className={`text-sm font-semibold ${ausgebucht ? "text-red-600" : "text-green-700"}`}>
                                              {ausgebucht ? "Gebucht" : `${frei} / ${slot.anzahl_personen} frei`}
                                            </span>
                                            {!ausgebucht && (
                                              <button onClick={() => openSlot(slot)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isOpen ? "bg-slate-200 text-slate-700 hover:bg-slate-300" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
                                                {isOpen ? "Abbrechen" : "Buchen"}
                                              </button>
                                            )}
                                          </div>
                                        </div>

                                        {isOpen && active && (
                                          <div className="px-5 pb-4 pt-0">
                                            <div className="border-t border-blue-200 pt-4">
                                              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-3">
                                                {flex ? "Datum und Zeit wählen" : "Buchung bestätigen"}
                                              </p>
                                              <div className="flex flex-wrap items-end gap-3">
                                                {flex ? (
                                                  <div>
                                                    <label className="block text-xs font-medium text-slate-600 mb-1">Datum *</label>
                                                    <input type="date" className={inp} min={slot.datum_von} max={slot.datum_bis}
                                                      value={active.datum} onChange={e => setActive(a => a ? { ...a, datum: e.target.value } : a)} />
                                                  </div>
                                                ) : (
                                                  <div>
                                                    <label className="block text-xs font-medium text-slate-600 mb-1">Datum</label>
                                                    <span className="block px-3 py-2 text-sm text-slate-700 bg-slate-100 rounded-lg">{fmtDate(slot.datum_von)}</span>
                                                  </div>
                                                )}
                                                <div>
                                                  <label className="block text-xs font-medium text-slate-600 mb-1">Von *</label>
                                                  {flex ? (
                                                    <input type="time" className={inp} min={fmtTime(slot.uhrzeit_von)} max={fmtTime(slot.uhrzeit_bis)}
                                                      value={active.zeitVon} onChange={e => onZeitVonChange(e.target.value, slot)} />
                                                  ) : (
                                                    <span className="block px-3 py-2 text-sm text-slate-700 bg-slate-100 rounded-lg">{fmtTime(slot.uhrzeit_von)}</span>
                                                  )}
                                                </div>
                                                <div>
                                                  <label className="block text-xs font-medium text-slate-600 mb-1">Bis *</label>
                                                  {flex ? (
                                                    <input type="time" className={inp} min={active.zeitVon || fmtTime(slot.uhrzeit_von)} max={fmtTime(slot.uhrzeit_bis)}
                                                      value={active.zeitBis} onChange={e => setActive(a => a ? { ...a, zeitBis: e.target.value } : a)} />
                                                  ) : (
                                                    <span className="block px-3 py-2 text-sm text-slate-700 bg-slate-100 rounded-lg">{fmtTime(slot.uhrzeit_bis)}</span>
                                                  )}
                                                </div>
                                                {active.datum && active.zeitVon && active.zeitBis && (
                                                  <div className="text-xs text-slate-500 self-end pb-2">
                                                    {name && <><strong>{name}</strong> · </>}
                                                    {fmtDate(active.datum)} · {active.zeitVon}–{active.zeitBis}
                                                  </div>
                                                )}
                                                <button onClick={() => buchen(slot)} disabled={booking || !active.datum || !active.zeitVon || !active.zeitBis}
                                                  className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 self-end">
                                                  {booking ? "…" : "Jetzt buchen"}
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        )}

                                        {zeilen.length > 0 && (
                                          <div className="mx-5 mb-4 rounded-xl border border-slate-200 overflow-hidden">
                                            <table className="w-full">
                                              <thead className="bg-slate-50 border-b border-slate-200">
                                                <tr>
                                                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Platz</th>
                                                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                                                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Telefon</th>
                                                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Datum</th>
                                                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Uhrzeit</th>
                                                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Gebucht am</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {zeilen.slice().sort((a, b) => a.nummer - b.nummer).map(z => (
                                                  <tr key={z.id} className={`border-t border-slate-100 ${z.name ? "" : "bg-slate-50/50"}`}>
                                                    <td className="px-3 py-2 text-xs text-slate-500">{z.nummer}</td>
                                                    <td className="px-3 py-2 text-sm">
                                                      {z.name
                                                        ? <span className="font-medium text-slate-800">{z.name}</span>
                                                        : <span className="text-slate-300 italic text-xs">frei</span>}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-slate-600">{z.telefon ?? (z.name ? "–" : "")}</td>
                                                    <td className="px-3 py-2 text-sm text-slate-600">{z.datum ? fmtDate(z.datum) : (z.name ? "–" : "")}</td>
                                                    <td className="px-3 py-2 text-sm text-slate-600">
                                                      {z.buchung_von ? `${fmtTime(z.buchung_von)} – ${fmtTime(z.buchung_bis ?? null)}` : (z.name ? "–" : "")}
                                                    </td>
                                                    <td className="px-3 py-2 text-xs text-slate-400">{fmtTs(z.gebucht_am ?? null)}</td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        )}
                                      </div>
                                    </Fragment>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
