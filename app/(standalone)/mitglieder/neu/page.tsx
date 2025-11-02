"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NeuesMitglied() {
  const router = useRouter();
  const [mitgliedsnr, setMitgliedsnr] = useState<string>("");
  const [name, setName] = useState("");
  const [strasse, setStrasse] = useState("");
  const [landkz, setLandkz] = useState("D");
  const [plz, setPlz] = useState("");
  const [ort, setOrt] = useState("");
  const [preisgruppe, setPreisgruppe] = useState<string>("");
  const [ausweisnr, setAusweisnr] = useState("");
  const [mitglied, setMitglied] = useState(false);
  const [gesperrt, setGesperrt] = useState(false);
  const [err, setErr] = useState("");

  // 🔹 Nächste Mitgliedsnummer beim Start abrufen
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/next-mitgliedsnr", { cache: "no-store" });
        if (r.ok) {
          const d = await r.json().catch(() => ({}));
          if (d?.nr) setMitgliedsnr(String(d.nr));
        }
      } catch {}
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const pg = preisgruppe === "" ? null : Number(preisgruppe);

    const body = { name, strasse, landkz, plz, ort, preisgruppe: pg, ausweisnr, mitglied, gesperrt };

    const r = await fetch("/api/mitglieder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (r.ok) router.push("/mitglieder");
    else setErr("Speichern fehlgeschlagen");
  }

  const wrap = { maxWidth: 1100, margin: "0 auto" };
  const grid: React.CSSProperties = { display: "grid", gap: 16, gridTemplateColumns: "repeat(12, minmax(0,1fr))" };
  const input = { width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8 };

  return (
    <main style={{ padding: 24 }}>
      <div style={wrap}>
        <h1 style={{ textAlign: "center", fontSize: 28, fontWeight: 800, marginBottom: 16 }}>Neues Mitglied</h1>

        <form onSubmit={save} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
          <div style={{ padding: 16, ...grid }}>
            {/* Zeile 1 */}
            <div style={{ gridColumn: "span 4 / span 4" }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Mitglieds-Nr.</label>
              <input
                value={mitgliedsnr || "—"}
                disabled
                style={{ ...input, background: "#f3f4f6", color: "#374151", fontWeight: 500 }}
              />
            </div>
            <div style={{ gridColumn: "span 8 / span 8" }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Name*</label>
              <input value={name} onChange={(e) => setName(e.target.value)} style={input} />
            </div>

            {/* Zeile 2 */}
            <div style={{ gridColumn: "span 12 / span 12" }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Straße</label>
              <input value={strasse} onChange={(e) => setStrasse(e.target.value)} style={input} />
            </div>

            {/* Zeile 3 */}
            <div style={{ gridColumn: "span 2 / span 2" }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Landkz</label>
              <input value={landkz} onChange={(e) => setLandkz(e.target.value)} style={input} />
            </div>
            <div style={{ gridColumn: "span 3 / span 3" }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>PLZ</label>
              <input value={plz} onChange={(e) => setPlz(e.target.value)} style={input} />
            </div>
            <div style={{ gridColumn: "span 7 / span 7" }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Ort</label>
              <input value={ort} onChange={(e) => setOrt(e.target.value)} style={input} />
            </div>

            {/* Zeile 4 */}
            <div style={{ gridColumn: "span 3 / span 3" }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Preisgruppe</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="\\d*"
                min={0}
                step={1}
                value={preisgruppe}
                onChange={(e) => setPreisgruppe(e.target.value.replace(/\\D/g, ""))}
                style={{ ...input, textAlign: "right" }}
              />
            </div>
            <div style={{ gridColumn: "span 9 / span 9" }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Ausweis-Nr.</label>
              <input value={ausweisnr} onChange={(e) => setAusweisnr(e.target.value)} style={input} />
            </div>

            {/* Zeile 5 */}
            <div style={{ gridColumn: "span 12 / span 12", display: "flex", gap: 24, alignItems: "center", marginTop: 4 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={mitglied} onChange={(e) => setMitglied(e.target.checked)} /> Mitglied
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={gesperrt} onChange={(e) => setGesperrt(e.target.checked)} /> Gesperrt
              </label>
            </div>
          </div>

          {err && <div style={{ color: "#dc2626", padding: "0 16px 12px 16px" }}>❌ {err}</div>}

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-start", padding: 16, borderTop: "1px solid #e5e7eb", background: "#f9fafb", borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
            <button type="submit" style={{ background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: 600, cursor: "pointer" }}>
              Speichern
            </button>
            <button
              type="button"
              onClick={() => router.push("/mitglieder")}
              style={{ background: "#e5e7eb", color: "#111827", border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: 600, cursor: "pointer" }}
            >
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
