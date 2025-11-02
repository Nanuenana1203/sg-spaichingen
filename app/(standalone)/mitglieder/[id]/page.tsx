"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Mitglied = {
  id:number; mitgliedsnr:string; name:string;
  strasse?:string; landkz?:string; plz?:string; ort?:string;
  preisgruppe?: number | null; ausweisnr?:string; mitglied?:boolean; gesperrt?:boolean;
};

export default function EditMitglied() {
  const { id } = useParams<{ id:string }>();
  const router = useRouter();
  const [m, setM] = useState<Mitglied | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/mitglieder/${id}`, { cache:"no-store" });
        const data = await r.json();
        setM(data);
      } finally { setLoading(false); }
    })();
  }, [id]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!m) return;
    const body = { ...m, preisgruppe: m.preisgruppe == null || Number.isNaN(m.preisgruppe) ? null : Number(m.preisgruppe) };
    const r = await fetch(`/api/mitglieder/${id}`, { method:"PUT", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body) });
    if (r.ok) router.push("/mitglieder"); else setErr("Speichern fehlgeschlagen");
  }

  const wrap = { maxWidth:1100, margin:"0 auto" };
  const grid: React.CSSProperties = { display:"grid", gap:16, gridTemplateColumns:"repeat(12, minmax(0,1fr))" };
  const input = { width:"100%", padding:"10px 12px", border:"1px solid #e5e7eb", borderRadius:8 };

  if (loading || !m) return <main style={{padding:24}}><div style={wrap as any}>Lade…</div></main>;

  return (
    <main style={{ padding:24 }}>
      <div style={wrap}>
        <h1 style={{ textAlign:"center", fontSize:28, fontWeight:800, marginBottom:16 }}>Mitglied bearbeiten</h1>

        <form onSubmit={save} style={{ background:"#fff", borderRadius:12, border:"1px solid #e5e7eb", boxShadow:"0 2px 8px rgba(0,0,0,.06)" }}>
          <div style={{ padding:16, ...grid }}>
            {/* Zeile 1 */}
            <div style={{ gridColumn:"span 4 / span 4" }}>
              <label style={{display:"block", fontWeight:600, marginBottom:6}}>Mitglieds-Nr.*</label>
              <input value={m.mitgliedsnr||""} onChange={e=>setM({...m, mitgliedsnr:e.target.value})} style={input}/>
            </div>
            <div style={{ gridColumn:"span 8 / span 8" }}>
              <label style={{display:"block", fontWeight:600, marginBottom:6}}>Name*</label>
              <input value={m.name||""} onChange={e=>setM({...m, name:e.target.value})} style={input}/>
            </div>

            {/* Zeile 2 */}
            <div style={{ gridColumn:"span 12 / span 12" }}>
              <label style={{display:"block", fontWeight:600, marginBottom:6}}>Straße</label>
              <input value={m.strasse||""} onChange={e=>setM({...m, strasse:e.target.value})} style={input}/>
            </div>

            {/* Zeile 3 */}
            <div style={{ gridColumn:"span 2 / span 2" }}>
              <label style={{display:"block", fontWeight:600, marginBottom:6}}>Landkz</label>
              <input value={m.landkz||""} onChange={e=>setM({...m, landkz:e.target.value})} style={input}/>
            </div>
            <div style={{ gridColumn:"span 3 / span 3" }}>
              <label style={{display:"block", fontWeight:600, marginBottom:6}}>PLZ</label>
              <input value={m.plz||""} onChange={e=>setM({...m, plz:e.target.value})} style={input}/>
            </div>
            <div style={{ gridColumn:"span 7 / span 7" }}>
              <label style={{display:"block", fontWeight:600, marginBottom:6}}>Ort</label>
              <input value={m.ort||""} onChange={e=>setM({...m, ort:e.target.value})} style={input}/>
            </div>

            {/* Zeile 4 */}
            <div style={{ gridColumn:"span 3 / span 3" }}>
              <label style={{display:"block", fontWeight:600, marginBottom:6}}>Preisgruppe</label>
              <input
                type="text" inputMode="numeric" pattern="\d*" min={0} step={1}
                value={(m.preisgruppe ?? "").toString()}
                onChange={(e)=>{
                  const v = e.target.value.replace(/\D/g,"");
                  setM({...m, preisgruppe: v === "" ? null : Number(v)});
                }}
                style={{ ...input, textAlign:"right" }}
              />
            </div>
            <div style={{ gridColumn:"span 9 / span 9" }}>
              <label style={{display:"block", fontWeight:600, marginBottom:6}}>Ausweis-Nr.</label>
              <input value={m.ausweisnr||""} onChange={e=>setM({...m, ausweisnr:e.target.value})} style={input}/>
            </div>

            {/* Zeile 5: Flags */}
            <div style={{ gridColumn:"span 12 / span 12", display:"flex", gap:24, alignItems:"center", marginTop:4 }}>
              <label style={{ display:"flex", alignItems:"center", gap:8 }}>
                <input type="checkbox" checked={!!m.mitglied} onChange={e=>setM({...m, mitglied:e.target.checked})}/> Mitglied
              </label>
              <label style={{ display:"flex", alignItems:"center", gap:8 }}>
                <input type="checkbox" checked={!!m.gesperrt} onChange={e=>setM({...m, gesperrt:e.target.checked})}/> Gesperrt
              </label>
            </div>
          </div>

          {err && <div style={{ color:"#dc2626", padding:"0 16px 12px 16px" }}>❌ {err}</div>}

          <div style={{ display:"flex", gap:12, justifyContent:"flex-start", padding:16, borderTop:"1px solid #e5e7eb", background:"#f9fafb",
                         borderBottomLeftRadius:12, borderBottomRightRadius:12 }}>
            <button type="submit" style={{ background:"#3b82f6", color:"#fff", border:"none", borderRadius:8, padding:"10px 16px", fontWeight:600, cursor:"pointer" }}>
              Speichern
            </button>
            <button type="button" onClick={()=>router.push("/mitglieder")}
              style={{ background:"#e5e7eb", color:"#111827", border:"none", borderRadius:8, padding:"10px 16px", fontWeight:600, cursor:"pointer" }}>
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
