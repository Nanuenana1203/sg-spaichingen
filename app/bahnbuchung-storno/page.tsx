"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Buchung = {
  id: number;
  bahn_id: number;
  bahn_name: string;
  datum: string;       // YYYY-MM-DD
  start_time: string;  // HH:MM:SS
  end_time: string;    // HH:MM:SS
  name: string;
  email: string;
};

export default function StornoPage() {
  return <Suspense><StornoInner /></Suspense>;
}

function StornoInner() {
  const searchParams = useSearchParams();
  const backHref = searchParams.get("ref") === "intern" ? "/dashboard" : "/bahnbuchung-public";

  const [email, setEmail] = useState("");
  const [items, setItems] = useState<Buchung[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number|null>(null);

  async function suchen(e?: React.FormEvent) {
    e?.preventDefault();
    setMsg("");
    setItems([]);
    const em = email.trim();
    if (!em) { setMsg("Bitte E-Mail eingeben."); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/buchungen?email=${encodeURIComponent(em)}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        setMsg("Fehler beim Laden.");
        return;
      }
      const list: Buchung[] = Array.isArray(data.items) ? data.items : [];
      if (!list.length) setMsg("Keine zukünftigen Buchungen gefunden.");
      setItems(list);
    } catch {
      setMsg("Fehler beim Laden.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteItem(id: number) {
    if (!confirm("Diese Buchung wirklich löschen?")) return;
    setDeletingId(id);
    setMsg("");
    try {
      const res = await fetch(`/api/buchungen?id=${id}&email=${encodeURIComponent(email.trim())}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        setMsg("Löschen fehlgeschlagen.");
        return;
      }
      // Optimistisch aus Liste entfernen
      setItems(cur => cur.filter(b => b.id !== id));
    } catch {
      setMsg("Löschen fehlgeschlagen.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Buchung stornieren</h1>
        <Link
          href={backHref}
          className="px-3 py-1 rounded border"
        >
          ← Zurück
        </Link>
      </div>

      <p className="text-sm text-gray-600">Bitte die E-Mail-Adresse eingeben, unter der die Buchung vorgenommen wurde.</p>
      <form onSubmit={suchen} className="flex gap-3">
        <input
          className="flex-1 rounded border px-3 py-2"
          placeholder="name@beispiel.de"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Suchen…" : "Suchen"}
        </button>
      </form>

      {msg && (
        <div className="px-4 py-2 rounded bg-red-50 text-red-700 border border-red-200">
          {msg}
        </div>
      )}

      {items.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full border rounded">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-3 py-2 border-b">Datum</th>
                <th className="px-3 py-2 border-b">Von</th>
                <th className="px-3 py-2 border-b">Bis</th>
                <th className="px-3 py-2 border-b">Bahn</th>
                <th className="px-3 py-2 border-b">Name</th>
                <th className="px-3 py-2 border-b text-right">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {items.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 border-b">{b.datum}</td>
                  <td className="px-3 py-2 border-b">{b.start_time.slice(0,5)}</td>
                  <td className="px-3 py-2 border-b">{b.end_time.slice(0,5)}</td>
                  <td className="px-3 py-2 border-b">{b.bahn_name}</td>
                  <td className="px-3 py-2 border-b">{b.name}</td>
                  <td className="px-3 py-2 border-b text-right">
                    <button
                      onClick={() => deleteItem(b.id)}
                      disabled={deletingId === b.id}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded border hover:bg-red-50 disabled:opacity-50"
                      title="Buchung löschen"
                    >
                      🗑️ {deletingId === b.id ? "Lösche…" : "Löschen"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
