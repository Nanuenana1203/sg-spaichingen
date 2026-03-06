"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const inp = "w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
const lbl = "block text-sm font-medium text-slate-700 mb-1.5";

export default function NeuerBenutzer() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [kennwort, setKennwort] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (!name.trim() || !kennwort.trim()) { setMsg("Name und Kennwort sind Pflichtfelder"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() ? email.trim() : null, kennwort: kennwort.trim(), istadmin: isAdmin }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && (data?.ok === true || data?.id || data?.user)) {
        router.push("/benutzer");
        return;
      }
      const detail = data?.detail || data?.message || data?.error || (typeof data === "string" ? data : "") || "Fehler beim Speichern";
      setMsg(String(detail));
    } catch {
      setMsg("Netzwerkfehler");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Neuer Benutzer</h1>

        <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-6 grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Name*</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required className={inp} />
            </div>
            <div>
              <label className={lbl}>E-Mail</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-Mail" type="email" className={inp} />
            </div>
            <div>
              <label className={lbl}>Kennwort*</label>
              <input type="password" value={kennwort} onChange={(e) => setKennwort(e.target.value)} placeholder="Kennwort" required className={inp} />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input id="isAdmin" type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} className="rounded" />
                Administratorrechte
              </label>
            </div>
          </div>

          {msg && <p className="px-6 pb-2 text-sm text-red-600">{msg}</p>}

          <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? "Speichere…" : "Speichern"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/benutzer")}
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
