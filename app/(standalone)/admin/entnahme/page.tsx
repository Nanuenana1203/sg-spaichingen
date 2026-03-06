"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Gate = "loading" | "ok" | "no-session" | "forbidden";

const inp = "w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
const lbl = "block text-sm font-medium text-slate-700 mb-1.5";

export default function EntnahmePage() {
  const [gate, setGate] = useState<Gate>("loading");
  const [amount, setAmount] = useState<string>("");
  const [purpose, setPurpose] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const s = await fetch("/api/session", { cache: "no-store", credentials: "include" });
        const sd = await s.json().catch(() => ({}));
        const user = sd?.user ?? null;
        if (!user) return setGate("no-session");
        if (!user.isAdmin) return setGate("forbidden");
        setGate("ok");
      } catch {
        setGate("no-session");
      }
    })();
  }, []);

  function toNumber(a: string): number { return parseFloat(String(a || "0").replace(",", ".")); }
  function toComma2(n: number): string { if (!Number.isFinite(n)) return ""; return n.toFixed(2).replace(".", ","); }

  async function buchen() {
    const n = toNumber(amount);
    if (!Number.isFinite(n) || n === 0) { alert("Bitte einen gultigen Betrag eingeben."); return; }
    try {
      const res = await fetch("/api/withdrawal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: n, purpose }),
      });
      if (!res.ok) throw new Error((await res.text()) || "Fehler beim Buchen.");
      alert("Entnahme erfolgreich gebucht.");
      setAmount(""); setPurpose("");
    } catch (e: any) {
      alert(e?.message ?? "Fehler");
    }
  }

  const disabled = !amount || toNumber(amount) === 0;

  if (gate !== "ok") {
    const title = gate === "loading" ? "Prüfe Berechtigung…" : gate === "no-session" ? "Nicht angemeldet" : "Kein Zugriff";
    const msg = gate === "loading" ? "" : gate === "no-session" ? "Bitte zuerst einloggen, um Entnahmen zu buchen." : "Diese Funktion ist nur für Administratoren.";
    const btnHref = gate === "no-session" ? "/" : "/dashboard";
    const btnText = gate === "no-session" ? "Zur Anmeldung" : "Zum Dashboard";
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Entnahme buchen</h1>
          <Link href="/dashboard" className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors">
            Zurück
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div>
            <label className={lbl}>Betrag (€)</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onBlur={(e) => setAmount(toComma2(toNumber(e.target.value)))}
              inputMode="decimal"
              placeholder="0,00"
              className={inp + " text-right"}
            />
          </div>

          <div>
            <label className={lbl}>Verwendungszweck</label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="z. B. Kassenentnahme"
              rows={3}
              className={inp}
            />
          </div>

          <button
            onClick={buchen}
            disabled={disabled}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Entnahme buchen
          </button>
        </div>
      </div>
    </div>
  );
}
