"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RechnerFreigebenButton from "./components/RechnerFreigebenButton";

type Gate = "loading" | "ok" | "no-session" | "forbidden";
type UserRow = { id: number; name: string; email?: string | null; istadmin?: any };

function asAdmin(value: any): boolean {
  return (
    value === true || value === 1 || value === "1" || value === "true" ||
    value === "TRUE" || value === "t" || value === "T"
  );
}

export default function BenutzerPage() {
  const router = useRouter();
  const [gate, setGate] = useState<Gate>("loading");
  const [rows, setRows] = useState<UserRow[]>([]);
  const [q, setQ] = useState("");

  async function load() {
    const s = await fetch("/api/session", { cache: "no-store" });
    const sd = await s.json().catch(() => ({}));
    const user = sd?.user ?? null;
    if (!user) return setGate("no-session");
    if (!user.isAdmin) return setGate("forbidden");

    const r = await fetch("/api/users", { cache: "no-store" });
    if (!r.ok) throw new Error("users");
    const j = await r.json().catch(() => ({}));
    const list: UserRow[] = Array.isArray(j) ? j : Array.isArray(j?.users) ? j.users : [];
    setRows(list);
    setGate("ok");
  }

  useEffect(() => { load().catch(() => setGate("no-session")); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((u) =>
      [u.name, u.email].filter(Boolean).some((x) => String(x).toLowerCase().includes(s))
    );
  }, [rows, q]);

  async function delUser(id: number) {
    if (!confirm("Benutzer wirklich loschen?")) return;
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (!res.ok) { alert("Loschen fehlgeschlagen."); return; }
    setRows((prev) => prev.filter((x) => x.id !== id));
  }

  if (gate !== "ok") {
    const title = gate === "loading" ? "Lade…" : gate === "no-session" ? "Nicht angemeldet" : "Kein Zugriff";
    const msg = gate === "loading" ? "" : gate === "no-session"
      ? "Bitte zuerst einloggen, um die Benutzerverwaltung zu offnen."
      : "Fur die Benutzerverwaltung ist Admin-Recht erforderlich.";
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

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Benutzer</h1>
          <div className="flex items-center gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nach Benutzer suchen..."
              className="w-64 px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Link href="/benutzer/neu" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
              + Neuer Benutzer
            </Link>
            <Link href="/dashboard" className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors">
              Zurück
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">E-Mail</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Admin</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const isAdmin = asAdmin(u.istadmin);
                return (
                  <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-700">{u.name}</td>
                    <td className="px-4 py-3 text-slate-700">{u.email ?? "–"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${isAdmin ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                        {isAdmin ? "Ja" : "Nein"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Link href={`/benutzer/${u.id}`} title="Bearbeiten" className="text-slate-500 hover:text-blue-600 transition-colors text-base leading-none">✏️</Link>
                        <button onClick={() => delUser(u.id)} title="Löschen" className="text-slate-500 hover:text-red-600 transition-colors text-base leading-none">🗑️</button>
                        {!isAdmin && <RechnerFreigebenButton benutzerId={u.id} />}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400 text-sm">
                    Keine Benutzer gefunden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
