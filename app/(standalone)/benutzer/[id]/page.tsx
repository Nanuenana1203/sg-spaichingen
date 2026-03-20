"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

type User = { id: number; name: string; email?: string | null; istadmin?: any };

function asBool(v: any): boolean {
  return v === true || v === 1 || v === "1" || String(v).toLowerCase() === "true" || String(v).toLowerCase() === "t";
}

const inp = "w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
const lbl = "block text-sm font-medium text-slate-700 mb-1.5";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [loading, setLoading] = useState(true);
  const [u, setU] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const s = await fetch("/api/session", { cache: "no-store" });
        const sd = await s.json();
        if (!sd?.user?.isAdmin) { router.push("/benutzer"); return; }

        const r = await fetch(`/api/users/${id}`, { cache: "no-store" });
        const j = await r.json();
        const user: User = j?.user ?? j;
        setU(user);
        setName(user?.name ?? "");
        setEmail(user?.email ?? "");
        setIsAdmin(asBool(user?.istadmin));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    const body: any = { name, email: email || null, istadmin: isAdmin };
    if (password.trim()) body.kennwort = password;
    const res = await fetch(`/api/users/${id}`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) { alert("Speichern fehlgeschlagen."); return; }
    router.push("/benutzer");
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-500 text-sm">Lade…</p>
    </div>
  );
  if (!u) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-500 text-sm">Benutzer nicht gefunden.</p>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Benutzer bearbeiten</h1>

        <form onSubmit={onSave} className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-6 space-y-4">
            <div>
              <label className={lbl}>Name</label>
              <input className={inp} value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className={lbl}>E-Mail</label>
              <input type="email" className={inp} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className={lbl}>Neues Kennwort (optional)</label>
              <input type="password" className={inp} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input id="admin" type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} className="rounded" />
              Administratorrechte
            </label>
          </div>

          <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
            <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
              Speichern
            </button>
            <Link href="/benutzer" className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors">
              Abbrechen
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
