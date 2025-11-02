"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Bahn = { id:number; nummer:string|null; name:string|null };

export default function BahnBearbeitenPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [nummer, setNummer] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(()=> {
    let active = true;
    (async()=>{
      try{
        const r = await fetch(`/api/bahnen/${encodeURIComponent(id)}`, { cache:"no-store" });
        const row: Bahn|null = await r.json().catch(()=>null);
        if (!active) return;
        if (!r.ok || !row) { alert("Bahn konnte nicht geladen werden."); return; }
        setNummer(row.nummer ?? "");
        setName(row.name ?? "");
      } finally { if (active) setLoading(false); }
    })();
    return ()=>{ active = false; };
  }, [id]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { alert("Name ist erforderlich."); return; }
    setSaving(true);
    try{
      const r = await fetch(`/api/bahnen/${encodeURIComponent(id)}`, {
        method:"PATCH",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ nummer: nummer.trim(), name: name.trim() }),
      });
      if (!r.ok) throw new Error("update");
      router.push('/bahnen');
    } catch {
      alert("Update fehlgeschlagen.");
    } finally { setSaving(false); }
  }

  return (
    <main style={{ padding:"24px" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <h1 style={{ textAlign:"center", fontSize:"28px", fontWeight:800, marginBottom:16 }}>Bahn bearbeiten</h1>

        <form onSubmit={onSave} style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:10, padding:"16px 16px 8px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <div>
              <label style={{ display:"block", fontWeight:600, marginBottom:6 }}>Nummer</label>
              <input
                value={nummer}
                onChange={(e)=>setNummer(e.target.value)}
                placeholder="z. B. 1"
                style={{ width:"100%", padding:"10px 12px", border:"1px solid #e5e7eb", borderRadius:8 }}
                disabled={loading || saving}
              />
            </div>
            <div>
              <label style={{ display:"block", fontWeight:600, marginBottom:6 }}>Name*</label>
              <input
                value={name}
                onChange={(e)=>setName(e.target.value)}
                placeholder="Bezeichnung der Bahn"
                style={{ width:"100%", padding:"10px 12px", border:"1px solid #e5e7eb", borderRadius:8 }}
                disabled={loading || saving}
              />
            </div>
          </div>

          <div style={{ display:"flex", gap:12, marginTop:16 }}>
            <button type="submit" disabled={saving || loading}
              style={{ background:"#3b82f6", color:"#fff", padding:"8px 14px", borderRadius:6, fontWeight:600, border:"none", cursor:"pointer", opacity:(saving||loading)?0.7:1 }}>
              Speichern
            </button>
            <button type="button" onClick={()=>history.back()}
              style={{ background:"#e5e7eb", padding:"8px 14px", borderRadius:6, fontWeight:600, border:"none", cursor:"pointer" }}>
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
