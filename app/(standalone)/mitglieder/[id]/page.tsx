"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Mitglied = {
  id: number; mitgliedsnr: string; name: string;
  strasse?: string; landkz?: string; plz?: string; ort?: string;
  preisgruppe?: number | null; ausweisnr?: string; geburtsdatum?: string; mitglied?: boolean; gesperrt?: boolean;
};

const inp = "w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
const lbl = "block text-sm font-medium text-slate-700 mb-1.5";

export default function EditMitglied() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [m, setM] = useState<Mitglied | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/mitglieder/${id}`, { cache: "no-store" });
        const data = await r.json();
        setM(data);
      } finally { setLoading(false); }
    })();
  }, [id]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!m) return;
    const body = { ...m, preisgruppe: m.preisgruppe == null || Number.isNaN(m.preisgruppe) ? null : Number(m.preisgruppe) };
    const r = await fetch(`/api/mitglieder/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (r.ok) router.push("/mitglieder");
    else setErr("Speichern fehlgeschlagen");
  }

  if (loading || !m) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-500 text-sm">Lade…</p>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Kunde bearbeiten</h1>

        <form onSubmit={save} className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-6 grid grid-cols-12 gap-4">
            <div className="col-span-4">
              <label className={lbl}>Mitglieds-Nr.*</label>
              <input value={m.mitgliedsnr || ""} onChange={e => setM({ ...m, mitgliedsnr: e.target.value })} className={inp} />
            </div>
            <div className="col-span-8">
              <label className={lbl}>Name*</label>
              <input value={m.name || ""} onChange={e => setM({ ...m, name: e.target.value })} className={inp} />
            </div>

            <div className="col-span-12">
              <label className={lbl}>Strasse</label>
              <input value={m.strasse || ""} onChange={e => setM({ ...m, strasse: e.target.value })} className={inp} />
            </div>

            <div className="col-span-2">
              <label className={lbl}>Landkz</label>
              <input value={m.landkz || ""} onChange={e => setM({ ...m, landkz: e.target.value })} className={inp} />
            </div>
            <div className="col-span-3">
              <label className={lbl}>PLZ</label>
              <input value={m.plz || ""} onChange={e => setM({ ...m, plz: e.target.value })} className={inp} />
            </div>
            <div className="col-span-7">
              <label className={lbl}>Ort</label>
              <input value={m.ort || ""} onChange={e => setM({ ...m, ort: e.target.value })} className={inp} />
            </div>

            <div className="col-span-3">
              <label className={lbl}>Preisgruppe</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                value={(m.preisgruppe ?? "").toString()}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "");
                  setM({ ...m, preisgruppe: v === "" ? null : Number(v) });
                }}
                className={inp + " text-right"}
              />
            </div>
            <div className="col-span-5">
              <label className={lbl}>Ausweis-Nr.</label>
              <input value={m.ausweisnr || ""} onChange={e => setM({ ...m, ausweisnr: e.target.value })} className={inp} />
            </div>
            <div className="col-span-4">
              <label className={lbl}>Geburtsdatum</label>
              <input type="date" value={m.geburtsdatum || ""} onChange={e => setM({ ...m, geburtsdatum: e.target.value })} className={inp} />
            </div>
            <div className="col-span-12">
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs text-slate-500">
                <span className="font-semibold text-slate-600 mr-2">Preisgruppen:</span>
                1 = Gast / 2 = Mitglieder ohne Aufsicht / 3 = Mitglieder mit Aufsicht / 4 = Mitglieder mit Jahreskarte
              </div>
            </div>

            <div className="col-span-12 flex gap-6 items-center pt-1">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={!!m.mitglied} onChange={e => setM({ ...m, mitglied: e.target.checked })} className="rounded" />
                Mitglied
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={!!m.gesperrt} onChange={e => setM({ ...m, gesperrt: e.target.checked })} className="rounded" />
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
