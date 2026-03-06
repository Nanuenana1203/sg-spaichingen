"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Gate = "loading" | "ok" | "no-session" | "forbidden";
type Mitglied = {
  id: number; mitgliedsnr: string; name: string;
  ort?: string; preisgruppe?: string; gesperrt?: boolean;
};

export default function MitgliederverwaltungPage() {
  const [gate, setGate] = useState<Gate>("loading");
  const [rows, setRows] = useState<Mitglied[]>([]);
  const [q, setQ] = useState("");
  const router = useRouter();

  async function load() {
    const res = await fetch("/api/mitglieder", { cache: "no-store" });
    const data = await res.json().catch(() => []);
    const sorted: Mitglied[] = Array.isArray(data)
      ? data
          .filter((m: any) => m.mitglied === true || m.mitglied === 1 || m.mitglied === "true")
          .sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""))
      : [];
    setRows(sorted);
  }

  useEffect(() => {
    (async () => {
      try {
        const s = await fetch("/api/session", { cache: "no-store" });
        const sd = await s.json().catch(() => ({}));
        const user = sd?.user ?? null;
        if (!user) return setGate("no-session");
        if (!user.isAdmin) return setGate("forbidden");
        setGate("ok");
        await load();
      } catch { setGate("no-session"); }
    })();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(m =>
      (m.mitgliedsnr || "").toLowerCase().includes(s) ||
      (m.name || "").toLowerCase().includes(s) ||
      (m.ort || "").toLowerCase().includes(s)
    );
  }, [q, rows]);

  const delItem = async (id: number) => {
    if (!confirm("Mitglied wirklich löschen?")) return;
    await fetch(`/api/mitglieder/${id}`, { method: "DELETE" });
    await load();
  };

  if (gate !== "ok") {
    const title = gate === "loading" ? "Lade…" : gate === "no-session" ? "Nicht angemeldet" : "Kein Zugriff";
    const msg = gate === "loading" ? "" : gate === "no-session"
      ? "Bitte zuerst einloggen, um die Mitgliederverwaltung zu öffnen."
      : "Für die Mitgliederverwaltung ist Admin-Recht erforderlich.";
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
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Mitgliederverwaltung</h1>
          <div className="flex items-center gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Suchen nach Nr., Name, Ort..."
              className="w-64 px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
            >
              Zurück
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Mitglieds-Nr.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Ort</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Preisgruppe</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-700">{m.mitgliedsnr}</td>
                  <td className="px-4 py-3 text-slate-700 max-w-xs truncate">{m.name}</td>
                  <td className="px-4 py-3 text-slate-700">{m.ort ?? "–"}</td>
                  <td className="px-4 py-3 text-slate-700 text-right">{m.preisgruppe ?? "–"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                      m.gesperrt ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    }`}>
                      {m.gesperrt ? "Gesperrt" : "Mitglied"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link href={`/mitgliederverwaltung/${m.id}`} title="Bearbeiten" className="text-slate-500 hover:text-blue-600 transition-colors text-base leading-none">✏️</Link>
                      <button onClick={() => delItem(m.id)} title="Löschen" className="text-slate-500 hover:text-red-600 transition-colors text-base leading-none">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400 text-sm">
                    Keine Mitglieder gefunden.
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
