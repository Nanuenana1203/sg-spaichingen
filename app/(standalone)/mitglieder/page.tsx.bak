"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Mitglied = {
  id:number; mitgliedsnr:string; name:string;
  ort?:string; preisgruppe?:string; mitglied?:boolean; gesperrt?:boolean;
};

export default function MitgliederPage() {
  const [rows, setRows] = useState<Mitglied[]>([]);
  const [q, setQ] = useState("");
  const router = useRouter();

  async function load() {
    const res = await fetch("/api/mitglieder", { cache:"no-store" });
    const data = await res.json().catch(()=>[]);
    // sortiere nach Name
    const sorted = Array.isArray(data)
      ? data.sort((a,b)=>(a.name||"").localeCompare(b.name||""))
      : [];
    setRows(sorted);
  }
  useEffect(()=>{ load(); },[]);

  const filtered = useMemo(()=>{
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(m =>
      (m.mitgliedsnr||"").toLowerCase().includes(s) ||
      (m.name||"").toLowerCase().includes(s) ||
      (m.ort||"").toLowerCase().includes(s)
    );
  },[q, rows]);

  const delItem = async(id:number) => {
    if (!confirm("Mitglied wirklich löschen?")) return;
    await fetch(`/api/mitglieder/${id}`, { method:"DELETE" });
    await load();
  };

  return (
    <main style={{ padding:"24px" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <h1 style={{ textAlign:"center", fontSize:28, fontWeight:800, marginBottom:16 }}>Mitglieder</h1>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div style={{ display:"flex", gap:12 }}>
            <Link href="/mitglieder/neu"
              style={{ background:"#3b82f6", color:"#fff", padding:"8px 14px", borderRadius:6, fontWeight:600, textDecoration:"none" }}>
              + Neues Mitglied
            </Link>
            <button onClick={()=>router.push("/dashboard")}
              style={{ background:"#e5e7eb", padding:"8px 14px", borderRadius:6, fontWeight:600, border:"none", cursor:"pointer" }}>
              Zurück
            </button>
          </div>

          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Suchen nach Nr., Name, Ort…"
            style={{ width:320, padding:"10px 12px", border:"1px solid #e5e7eb", borderRadius:8 }} />
        </div>

        <div style={{ border:"1px solid #e5e7eb", borderRadius:10, overflow:"hidden", background:"#fff" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", tableLayout:"fixed" }}>
            <colgroup>
              <col style={{ width:"110px" }} />  {/* Mitglieds-Nr. schmal */}
              <col style={{ width:"340px" }} />  {/* Name breiter */}
              <col style={{ width:"220px" }} />  {/* Ort */}
              <col style={{ width:"100px" }} />  {/* Preisgruppe schmal */}
              <col style={{ width:"140px" }} />  {/* Status */}
              <col style={{ width:"110px" }} />  {/* Aktionen */}
            </colgroup>
            <thead style={{ background:"#f9fafb" }}>
              <tr>
                <th style={{ padding:12, textAlign:"left" }}>Mitglieds-Nr.</th>
                <th style={{ padding:12, textAlign:"left" }}>Name</th>
                <th style={{ padding:12, textAlign:"left" }}>Ort</th>
                <th style={{ padding:12, textAlign:"left" }}>Preisgruppe</th>
                <th style={{ padding:12, textAlign:"left" }}>Status</th>
                <th style={{ padding:12, textAlign:"left" }}>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m=>(
                <tr key={m.id} style={{ borderTop:"1px solid #e5e7eb" }}>
                  <td style={{ padding:12 }}>{m.mitgliedsnr}</td>
                  <td style={{ padding:12, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{m.name}</td>
                  <td style={{ padding:12 }}>{m.ort ?? "–"}</td>
                  <td style={{ padding:12, textAlign:"right" }}>{m.preisgruppe ?? "–"}</td>
                  <td style={{ padding:12 }}>
                    <span style={{
                      background: m.gesperrt ? "#fee2e2" : (m.mitglied ? "#dcfce7" : "#fef9c3"),
                      color: m.gesperrt ? "#991b1b" : (m.mitglied ? "#166534" : "#854d0e"),
                      padding:"4px 8px", borderRadius:6, fontSize:"0.875rem", fontWeight:600
                    }}>
                      {m.gesperrt ? "Gesperrt" : (m.mitglied ? "Mitglied" : "Kein Mitglied")}
                    </span>
                  </td>
                  <td style={{ padding:12 }}>
                    <div style={{ display:"flex", gap:20, alignItems:"center" }}>
                      <Link href={`/mitglieder/${m.id}`} title="Bearbeiten" style={{ textDecoration:"none" }}>✏️</Link>
                      <button title="Löschen" onClick={()=>delItem(m.id)}
                        style={{ background:"transparent", border:"none", cursor:"pointer" }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={6} style={{ padding:16, color:"#6b7280" }}>Keine Mitglieder gefunden.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
