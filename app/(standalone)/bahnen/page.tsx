"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Bahn = { id:number; nummer:string|null; name:string|null };

export default function BahnenPage() {
  const [rows, setRows] = useState<Bahn[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/bahnen", { cache: "no-store" });
      const data = await r.json().catch(()=>[]);
      setRows(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  }
  useEffect(()=>{ load(); },[]);

  const filtered = useMemo(()=>{
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(b =>
      (b.nummer ?? "").toLowerCase().includes(s) ||
      (b.name ?? "").toLowerCase().includes(s)
    );
  },[q, rows]);

  async function delBahn(id:number) {
    if (!confirm("Bahn wirklich löschen?")) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/bahnen/${id}`, { method:"DELETE" });
      if (!r.ok) throw new Error("delete");
      await load();
    } catch {
      alert("Löschen fehlgeschlagen.");
    } finally { setLoading(false); }
  }

  return (
    <main style={{ padding: "24px" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <h1 style={{ textAlign:"center", fontSize:"28px", fontWeight:800, marginBottom:16 }}>Bahnen</h1>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div style={{ display:"flex", gap:12 }}>
            <Link href="/bahnen/neu"
              style={{ background:"#3b82f6", color:"#fff", padding:"8px 14px", borderRadius:6, fontWeight:600, textDecoration:"none" }}>
              + Neue Bahn
            </Link>
            {/* Zurück führt jetzt zum Dashboard */}
            <Link href="/dashboard"
              style={{ background:"#e5e7eb", padding:"8px 14px", borderRadius:6, fontWeight:600, textDecoration:"none" }}>
              Zurück
            </Link>
          </div>

          <input
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            placeholder="Nach Bahn suchen…"
            style={{ width: 320, padding:"10px 12px", border:"1px solid #e5e7eb", borderRadius:8 }}
          />
        </div>

        <div style={{ border:"1px solid #e5e7eb", borderRadius:10, overflow:"hidden", background:"#fff" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead style={{ background:"#f9fafb" }}>
              <tr>
                <th style={{ padding:12, textAlign:"left" }}>Nummer</th>
                <th style={{ padding:12, textAlign:"left" }}>Bahn</th>
                <th style={{ padding:12, textAlign:"left" }}>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b=>(
                <tr key={b.id} style={{ borderTop:"1px solid #e5e7eb" }}>
                  <td style={{ padding:12 }}>{b.nummer ?? "—"}</td>
                  <td style={{ padding:12 }}>{b.name ?? "—"}</td>
                  <td style={{ padding:12 }}>
                    <div style={{ display:"flex", gap:20, alignItems:"center" }}>
                      <Link href={`/bahnen/${b.id}`} title="Bearbeiten" style={{ fontSize:"18px", textDecoration:"none" }}>✏️</Link>
                      <button title="Löschen" onClick={()=>delBahn(b.id)}
                        style={{ background:"transparent", border:"none", cursor:"pointer", fontSize:"18px" }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && !filtered.length && (
                <tr><td colSpan={3} style={{ padding:16, color:"#6b7280" }}>Keine Einträge gefunden.</td></tr>
              )}
              {loading && (
                <tr><td colSpan={3} style={{ padding:16, color:"#6b7280" }}>Lade…</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
