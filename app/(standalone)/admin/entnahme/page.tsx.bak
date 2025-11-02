"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Gate = "loading" | "ok" | "no-session" | "forbidden";

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

  function toNumber(a: string): number {
    return parseFloat(String(a || "0").replace(",", "."));
  }
  function toComma2(n: number): string {
    if (!Number.isFinite(n)) return "";
    return n.toFixed(2).replace(".", ",");
  }

  async function buchen() {
    const n = toNumber(amount);
    if (!Number.isFinite(n) || n === 0) {
      alert("Bitte einen gültigen Betrag eingeben.");
      return;
    }
    try {
      const res = await fetch("/api/withdrawal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: n, purpose }),
      });
      if (!res.ok) throw new Error((await res.text()) || "Fehler beim Buchen.");
      alert("Entnahme erfolgreich gebucht.");
      setAmount("");
      setPurpose("");
    } catch (e: any) {
      alert(e?.message ?? "Fehler");
    }
  }

  const disabled = !amount || toNumber(amount) === 0;

  if (gate !== "ok") {
    const title =
      gate === "loading" ? "Prüfe Berechtigung…" :
      gate === "no-session" ? "Nicht angemeldet" : "Kein Zugriff";
    const msg =
      gate === "loading" ? "" :
      gate === "no-session" ? "Bitte zuerst einloggen, um Entnahmen zu buchen." :
      "Diese Funktion ist nur für Administratoren.";
    const btnHref = gate === "no-session" ? "/" : "/dashboard";
    const btnText = gate === "no-session" ? "Zur Anmeldung" : "Zum Dashboard";
    return (
      <div className="p-6">
        <div className="rounded-2xl bg-white shadow border border-gray-100 p-6 max-w-xl mx-auto text-center space-y-4">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {msg && <p>{msg}</p>}
          {gate !== "loading" && (
            <Link href={btnHref} className="inline-block px-4 py-2 rounded bg-slate-800 text-white">
              {btnText}
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="rounded-2xl bg-white shadow border border-gray-100 p-6 max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-extrabold">Entnahme buchen</h1>
          <Link href="/dashboard" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
            Zurück
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <label className="block text-sm font-medium">Betrag (€)</label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onBlur={(e) => setAmount(toComma2(toNumber(e.target.value)))}
            inputMode="decimal"
            placeholder="0,00"
            className="w-36 text-right px-3 py-2 border rounded ml-auto"
          />
        </div>

        <label className="block text-sm font-medium mb-1">Verwendungszweck</label>
        <textarea
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="z. B. Kassenentnahme"
          rows={3}
          className="w-full mb-6 px-3 py-2 border rounded"
        />

        <button
          onClick={buchen}
          disabled={disabled}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Entnahme buchen
        </button>
      </div>
    </div>
  );
}
