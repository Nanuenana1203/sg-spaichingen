"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const inp = "w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
const lbl = "block text-sm font-medium text-slate-700 mb-1.5";

export default function PasswortPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [aktuell, setAktuell] = useState("");
  const [neu, setNeu] = useState("");
  const [neuWdh, setNeuWdh] = useState("");
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/session", { cache: "no-store", credentials: "include" });
        const d = await r.json().catch(() => ({}));
        if (!d?.user) { router.replace("/"); return; }
        setUserName(d.user.name ?? "");
      } catch { router.replace("/"); }
    })();
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setSuccess(false);

    if (neu !== neuWdh) { setErr("Die neuen Kennwörter stimmen nicht überein."); return; }
    if (neu.length < 6) { setErr("Das neue Kennwort muss mindestens 6 Zeichen lang sein."); return; }

    setSaving(true);
    try {
      const r = await fetch("/api/passwort", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aktuell, neu }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok || j?.ok === false) {
        if (j?.error === "WRONG_PASSWORD") { setErr("Das aktuelle Kennwort ist falsch."); return; }
        if (j?.error === "TOO_SHORT") { setErr("Das neue Kennwort muss mindestens 6 Zeichen lang sein."); return; }
        setErr("Speichern fehlgeschlagen.");
        return;
      }
      setSuccess(true);
      setAktuell(""); setNeu(""); setNeuWdh("");
    } finally { setSaving(false); }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-md px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Kennwort ändern</h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
          >
            Zurück
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-6 space-y-4">
            {userName && (
              <p className="text-sm text-slate-500">
                Angemeldet als <span className="font-semibold text-slate-700">{userName}</span>
              </p>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className={lbl}>Aktuelles Kennwort *</label>
                <input
                  type="password"
                  className={inp}
                  value={aktuell}
                  onChange={e => setAktuell(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
              <div>
                <label className={lbl}>Neues Kennwort *</label>
                <input
                  type="password"
                  className={inp}
                  value={neu}
                  onChange={e => setNeu(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              <div>
                <label className={lbl}>Neues Kennwort wiederholen *</label>
                <input
                  type="password"
                  className={inp}
                  value={neuWdh}
                  onChange={e => setNeuWdh(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              {err && (
                <p className="text-sm text-red-600">{err}</p>
              )}
              {success && (
                <p className="text-sm text-green-600 font-medium">Kennwort erfolgreich geändert.</p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? "Speichern…" : "Kennwort ändern"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
