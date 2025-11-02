"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BahnNeuPage() {
  const router = useRouter();
  const [nummer, setNummer] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      alert("Bitte Name ausfüllen.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/bahnen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nummer: nummer.trim() || null, name: name.trim() }),
      });
      if (!res.ok) throw new Error(await res.text());
      router.push('/bahnen');
    } catch (err: any) {
      alert("Anlegen fehlgeschlagen.\n" + (err?.message ?? ""));
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main style={{ padding: "24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ textAlign: "center", fontSize: "28px", fontWeight: 800, marginBottom: 16 }}>
          Neue Bahn
        </h1>

        <form
          onSubmit={onSave}
          style={{ border: "1px solid #e5e7eb", borderRadius: 10, background: "#fff", padding: 20 }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Nummer</label>
              <input
                value={nummer}
                onChange={(e) => setNummer(e.target.value)}
                placeholder="z. B. 1"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Name*</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Bezeichnung der Bahn"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button
              disabled={saving}
              style={{
                background: "#3b82f6",
                color: "#fff",
                padding: "8px 14px",
                borderRadius: 6,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "Speichern…" : "Speichern"}
            </button>
            <button
              type="button"
              onClick={() => history.back()}
              style={{
                background: "#e5e7eb",
                padding: "8px 14px",
                borderRadius: 6,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
