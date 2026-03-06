"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Bahn = { id: number; nummer: string | null; name: string | null };

const inp = "w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
const lbl = "block text-sm font-medium text-slate-700 mb-1.5";

export default function BahnBearbeitenPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [nummer, setNummer] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const r = await fetch(`/api/bahnen/${encodeURIComponent(id)}`, { cache: "no-store" });
        const row: Bahn | null = await r.json().catch(() => null);
        if (!active) return;
        if (!r.ok || !row) { alert("Bahn konnte nicht geladen werden."); return; }
        setNummer(row.nummer ?? "");
        setName(row.name ?? "");
      } finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [id]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { alert("Name ist erforderlich."); return; }
    setSaving(true);
    try {
      const r = await fetch(`/api/bahnen/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nummer: nummer.trim(), name: name.trim() }),
      });
      if (!r.ok) throw new Error("update");
      router.push("/bahnen");
    } catch {
      alert("Update fehlgeschlagen.");
    } finally { setSaving(false); }
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-slate-500 text-sm">Lade…</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Bahn bearbeiten</h1>

        <form onSubmit={onSave} className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-6 grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Nummer</label>
              <input value={nummer} onChange={(e) => setNummer(e.target.value)} placeholder="z. B. 1" className={inp} disabled={saving} />
            </div>
            <div>
              <label className={lbl}>Name*</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Bezeichnung der Bahn" className={inp} required disabled={saving} />
            </div>
          </div>

          <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? "Speichern…" : "Speichern"}
            </button>
            <button
              type="button"
              onClick={() => history.back()}
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
