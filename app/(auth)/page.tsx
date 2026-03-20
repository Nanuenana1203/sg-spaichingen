'use client';
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getDeviceToken } from "../../lib/deviceToken";

export default function Home() {
  const [name, setName] = useState("");
  const [kennwort, setKennwort] = useState("");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("Anmeldung...");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, kennwort, deviceToken: getDeviceToken() }),
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok === true) {
        sessionStorage.setItem("sgs_alive", "1");
        window.location.href = "/dashboard";
      } else {
        setMsg("Name oder Kennwort ungültig oder Rechner nicht freigegeben");
      }
    } catch {
      setMsg("Netzwerkfehler");
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 gap-4"
    >

      {/* SGS-Logo */}
      <Image src="/sg-logo.png" alt="SG Spaichingen" width={80} height={144} className="drop-shadow-lg" priority />

      <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <h1 className="text-2xl font-bold text-slate-900 text-center mb-6">Anmeldung</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            placeholder="Name"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <input
            value={kennwort}
            onChange={(e) => setKennwort(e.target.value)}
            type="password"
            placeholder="Kennwort"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Anmelden
          </button>
        </form>
        {msg && (
          <p className="mt-3 text-sm text-center text-red-500">{msg}</p>
        )}
      </div>

      <Link
        href="/bahnbuchung-public"
        className="w-full max-w-sm flex items-center justify-center h-14 rounded-2xl border border-slate-200 bg-white shadow-sm text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
      >
        Bahnbuchung (öffentlicher Bereich)
      </Link>

      <Link
        href="/dienstbuchung-public"
        className="w-full max-w-sm flex items-center justify-center h-14 rounded-2xl border border-slate-200 bg-white shadow-sm text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
      >
        Dienstbuchung (öffentlicher Bereich)
      </Link>

      <p className="mt-4 text-xs text-slate-400">
        Copyright © 2025–{new Date().getFullYear()} Nanuenana
      </p>
    </div>
  );
}
