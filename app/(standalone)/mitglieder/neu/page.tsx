"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const inp = "w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
const lbl = "block text-sm font-medium text-slate-700 mb-1.5";

export default function NeuesMitglied() {
  const router = useRouter();
  const [mitgliedsnr, setMitgliedsnr] = useState<string>("");
  const [name, setName] = useState("");
  const [strasse, setStrasse] = useState("");
  const [landkz, setLandkz] = useState("D");
  const [plz, setPlz] = useState("");
  const [ort, setOrt] = useState("");
  const [preisgruppe, setPreisgruppe] = useState<string>("");
  const [ausweisnr, setAusweisnr] = useState("");
  const [geburtsdatum, setGeburtsdatum] = useState("");
  const [mitglied, setMitglied] = useState(false);
  const [gesperrt, setGesperrt] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/next-mitgliedsnr", { cache: "no-store" });
        if (r.ok) {
          const d = await r.json().catch(() => ({}));
          if (d?.nr) setMitgliedsnr(String(d.nr));
        }
      } catch {}
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const pg = preisgruppe === "" ? null : Number(preisgruppe);
    const body = { name, strasse, landkz, plz, ort, preisgruppe: pg, ausweisnr, geburtsdatum: geburtsdatum || null, mitglied, gesperrt };
    const r = await fetch("/api/mitglieder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (r.ok) router.push("/mitglieder");
    else setErr("Speichern fehlgeschlagen");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Neuer Kunde</h1>

        <form onSubmit={save} className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-6 grid grid-cols-12 gap-4">
            <div className="col-span-4">
              <label className={lbl}>Mitglieds-Nr.</label>
              <input value={mitgliedsnr || "—"} disabled className={inp + " bg-slate-50 text-slate-500"} />
            </div>
            <div className="col-span-8">
              <label className={lbl}>Name*</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={inp} required />
            </div>

            <div className="col-span-12">
              <label className={lbl}>Strasse</label>
              <input value={strasse} onChange={(e) => setStrasse(e.target.value)} className={inp} />
            </div>

            <div className="col-span-2">
              <label className={lbl}>Landkz</label>
              <input value={landkz} onChange={(e) => setLandkz(e.target.value)} className={inp} />
            </div>
            <div className="col-span-3">
              <label className={lbl}>PLZ</label>
              <input value={plz} onChange={(e) => setPlz(e.target.value)} className={inp} />
            </div>
            <div className="col-span-7">
              <label className={lbl}>Ort</label>
              <input value={ort} onChange={(e) => setOrt(e.target.value)} className={inp} />
            </div>

            <div className="col-span-3">
              <label className={lbl}>Preisgruppe</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                value={preisgruppe}
                onChange={(e) => setPreisgruppe(e.target.value.replace(/\D/g, ""))}
                className={inp + " text-right"}
              />
            </div>
            <div className="col-span-5">
              <label className={lbl}>Ausweis-Nr.</label>
              <input value={ausweisnr} onChange={(e) => setAusweisnr(e.target.value)} className={inp} />
            </div>
            <div className="col-span-4">
              <label className={lbl}>Geburtsdatum</label>
              <input type="date" value={geburtsdatum} onChange={(e) => setGeburtsdatum(e.target.value)} className={inp} />
            </div>
            <div className="col-span-12">
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs text-slate-500">
                <span className="font-semibold text-slate-600 mr-2">Preisgruppen:</span>
                1 = Gast / 2 = Mitglieder ohne Aufsicht / 3 = Mitglieder mit Aufsicht / 4 = Mitglieder mit Jahreskarte
              </div>
            </div>

            <div className="col-span-12 flex gap-6 items-center pt-1">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={mitglied} onChange={(e) => setMitglied(e.target.checked)} className="rounded" />
                Mitglied
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={gesperrt} onChange={(e) => setGesperrt(e.target.checked)} className="rounded" />
                Gesperrt
              </label>
            </div>
          </div>

          {err && <p className="px-6 pb-2 text-sm text-red-600">{err}</p>}

          <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
            <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
              Speichern
            </button>
            <button type="button" onClick={() => router.push("/mitglieder")} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors">
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
