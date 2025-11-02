"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Mitglied = {
  id:number; mitgliedsnr:string; name:string;
  strasse?:string; landkz?:string; plz?:string; ort?:string;
  preisgruppe?:string; ausweisnr?:string; mitglied?:boolean; gesperrt?:boolean;
};

export default function EditClient({ id }:{ id:string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [mitgliedsnr, setMitgliedsnr] = useState("");
  const [name, setName] = useState("");
  const [strasse, setStrasse] = useState("");
  const [landkz, setLandkz] = useState("");
  const [plz, setPlz] = useState("");
  const [ort, setOrt] = useState("");
  const [preisgruppe, setPreisgruppe] = useState("");
  const [ausweisnr, setAusweisnr] = useState("");
  const [mitglied, setMitglied] = useState(false);
  const [gesperrt, setGesperrt] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/mitglieder/${id}`, { cache:"no-store" });
      if (!res.ok) { router.push("/mitglieder"); return; }
      const m:Mitglied = await res.json();
      setMitgliedsnr(m.mitgliedsnr||""); setName(m.name||"");
      setStrasse(m.strasse||""); setLandkz(m.landkz||""); setPlz(m.plz||"");
      setOrt(m.ort||""); setPreisgruppe(m.preisgruppe||""); setAusweisnr(m.ausweisnr||"");
      setMitglied(!!m.mitglied); setGesperrt(!!m.gesperrt);
      setLoading(false);
    })();
  }, [id, router]);

  const save = async (e:React.FormEvent) => {
    e.preventDefault();
    const body = { mitgliedsnr, name, strasse, landkz, plz, ort, preisgruppe, ausweisnr, mitglied, gesperrt };
    const res = await fetch(`/api/mitglieder/${id}`, {
      method:"PUT", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body)
    });
    if (res.ok) router.push("/mitglieder"); else alert("Speichern fehlgeschlagen");
  };

  if (loading) return <main style={{padding:24}}>Laden…</main>;
  const Input = (p:any)=><input {...p} style={{padding:"10px 12px", border:"1px solid #e5e7eb", borderRadius:8}} />;

  return (
    <main style={{ padding:24 }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <h1 style={{ textAlign:"center", fontSize:28, fontWeight:800, marginBottom:16 }}>Mitglied bearbeiten</h1>
        <form onSubmit={save} style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:10, padding:20, display:"grid", gap:16 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:16 }}>
            <label style={{ display:"grid", gap:6 }}><span style={{fontWeight:600}}>Mitglieds-Nr.*</span><Input value={mitgliedsnr} onChange={(e:any)=>setMitgliedsnr(e.target.value)} required /></label>
            <label style={{ display:"grid", gap:6 }}><span style={{fontWeight:600}}>Name*</span><Input value={name} onChange={(e:any)=>setName(e.target.value)} required /></label>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 2fr", gap:16 }}>
            <label style={{ display:"grid", gap:6 }}><span style={{fontWeight:600}}>Straße</span><Input value={strasse} onChange={(e:any)=>setStrasse(e.target.value)} /></label>
            <label style={{ display:"grid", gap:6 }}><span style={{fontWeight:600}}>Landkz</span><Input value={landkz} onChange={(e:any)=>setLandkz(e.target.value)} /></label>
            <label style={{ display:"grid", gap:6 }}><span style={{fontWeight:600}}>PLZ</span><Input value={plz} onChange={(e:any)=>setPlz(e.target.value)} /></label>
            <label style={{ display:"grid", gap:6 }}><span style={{fontWeight:600}}>Ort</span><Input value={ort} onChange={(e:any)=>setOrt(e.target.value)} /></label>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
            <label style={{ display:"grid", gap:6 }}><span style={{fontWeight:600}}>Preisgruppe</span><Input value={preisgruppe} onChange={(e:any)=>setPreisgruppe(e.target.value)} /></label>
            <label style={{ display:"grid", gap:6 }}><span style={{fontWeight:600}}>Ausweis-Nr.</span><Input value={ausweisnr} onChange={(e:any)=>setAusweisnr(e.target.value)} /></label>
            <div style={{ display:"flex", alignItems:"center", gap:18 }}>
              <label style={{ display:"flex", alignItems:"center", gap:8 }}><input type="checkbox" checked={mitglied} onChange={e=>setMitglied(e.currentTarget.checked)} /> Mitglied</label>
              <label style={{ display:"flex", alignItems:"center", gap:8 }}><input type="checkbox" checked={gesperrt} onChange={e=>setGesperrt(e.currentTarget.checked)} /> Gesperrt</label>
            </div>
          </div>

          <div style={{ display:"flex", gap:12 }}>
            <button type="submit" style={{ background:"#3b82f6", color:"#fff", padding:"10px 16px", borderRadius:6, fontWeight:600, border:"none", cursor:"pointer" }}>Speichern</button>
            <Link href="/mitglieder" style={{ background:"#e5e7eb", padding:"10px 16px", borderRadius:6, fontWeight:600, textDecoration:"none", color:"#111827" }}>Abbrechen</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
