"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const inp = "w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
const lbl = "block text-sm font-medium text-slate-700 mb-1.5";

export default function BahnNeuPage() {
  const router = useRouter();
  const [nummer, setNummer] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { alert("Bitte Name ausfullen."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/bahnen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nummer: nummer.trim() || null, name: name.trim() }),
      });
      if (!res.ok) throw new Error(await res.text());
      router.push("/bahnen");
    } catch (err: any) {
      alert("Anlegen fehlgeschlagen.\n" + (err?.message ?? ""));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Neue Bahn</h1>

        <form onSubmit={onSave} className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-6 grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Nummer</label>
              <input value={nummer} onChange={(e) => setNummer(e.target.value)} placeholder="z. B. 1" className={inp} />
            </div>
            <div>
              <label className={lbl}>Name*</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Bezeichnung der Bahn" className={inp} required />
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
