"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Regel = {
  id: number;
  weekday: number;
  start_time: string | null;
  end_time: string | null;
  slot_minutes: number | null;
  aktiv: boolean | null;
  bahn_id: number | null;
  bahnen?: { id:number; nummer:string|null; name:string|null } | null;
};

const WDN = ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"];

function hhmm(s: string | null): string {
  if (!s) return "";
  // "19:00:00" -> "19:00"
  const m = s.match(/^(\d{2}:\d{2})(?::\d{2})?$/);
  return m ? m[1] : s;
}

export default function EditClient({ id }: { id:number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reg, setReg] = useState<Regel | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/zeitregeln/${id}`, { cache:"no-store" });
        const row = await r.json().catch(() => null);
        if (alive) setReg(row);
      } catch {
        alert("Zeitregel konnte nicht geladen werden.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  async function onSave() {
    if (!reg) return;
    setSaving(true);
    try {
      const body = {
        weekday: reg.weekday,
        start_time: (document.getElementById("t_from") as HTMLInputElement)?.value || null,
        end_time:   (document.getElementById("t_to") as HTMLInputElement)?.value || null,
        slot_minutes: Number((document.getElementById("slot") as HTMLInputElement)?.value || "0") || null,
        aktiv: (document.getElementById("aktiv") as HTMLInputElement)?.checked ?? true,
      };
      const r = await fetch(`/api/zeitregeln/${id}`, { method:"PATCH", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error("patch");
      router.push("/zeitregeln"); // zurück zur Tabelle
    } catch {
      alert("Fehler beim Speichern.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !reg) {
    return <main style={{padding:"24px"}}><div style={{maxWidth:800,margin:"0 auto"}}>Lade…</div></main>;
  }

  return (
    <main style={{ padding:"24px" }}>
      <div style={{ maxWidth:800, margin:"0 auto" }}>
        <h1 style={{ fontSize:"28px", fontWeight:800, textAlign:"center", marginBottom:20 }}>Zeitregel bearbeiten</h1>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:12 }}>
          <label style={{ display:"grid", gap:6 }}>
            <span>Wochentag</span>
            <select
              value={reg.weekday}
              onChange={e=>setReg({ ...reg, weekday: Number(e.target.value) })}
              style={{ padding:"10px 12px", border:"1px solid #e5e7eb", borderRadius:8 }}
            >
              {WDN.map((w,idx)=>(<option key={idx} value={idx}>{w}</option>))}
            </select>
          </label>

          <div />
          <label style={{ display:"grid", gap:6 }}>
            <span>Zeit von</span>
            <input id="t_from" type="time" defaultValue={hhmm(reg.start_time)} style={{ padding:"10px 12px", border:"1px solid #e5e7eb", borderRadius:8 }} />
          </label>
          <label style={{ display:"grid", gap:6 }}>
            <span>Zeit bis</span>
            <input id="t_to" type="time" defaultValue={hhmm(reg.end_time)} style={{ padding:"10px 12px", border:"1px solid #e5e7eb", borderRadius:8 }} />
          </label>

          <label style={{ display:"grid", gap:6 }}>
            <span>Slot-Minuten</span>
            <input id="slot" type="number" min={5} step={5} defaultValue={reg.slot_minutes ?? 60} style={{ padding:"10px 12px", border:"1px solid #e5e7eb", borderRadius:8 }} />
          </label>

          <label style={{ alignSelf:"end", display:"flex", gap:10, alignItems:"center" }}>
            <input id="aktiv" type="checkbox" defaultChecked={reg.aktiv ?? true} />
            <span>Regel ist aktiv</span>
          </label>
        </div>

        {/* Hinweis zur Bahn (nur anzeigen, nicht änderbar) */}
        <div style={{ marginBottom:16, color:"#6b7280" }}>
          Bahn: {reg.bahn_id === null ? "Alle Bahnen" : (reg.bahnen?.nummer ? `${reg.bahnen.nummer} – ${reg.bahnen.name ?? ""}` : `#${reg.bahn_id}`)}
        </div>

        <div style={{ display:"flex", gap:12 }}>
          <button onClick={onSave} disabled={saving}
            style={{ background:"#3b82f6", color:"#fff", padding:"10px 16px", borderRadius:8, fontWeight:700, border:"none", cursor:"pointer", opacity:saving?0.7:1 }}>
            {saving ? "Speichern…" : "Speichern"}
          </button>
          <button onClick={()=>router.push("/zeitregeln")}
            style={{ background:"#e5e7eb", padding:"10px 16px", borderRadius:8, fontWeight:600, border:"none", cursor:"pointer" }}>
            Abbrechen
          </button>
        </div>
      </div>
    </main>
  );
}
