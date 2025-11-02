"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Bahn = { id:number; nummer:string|null; name:string|null };

export default function ZeitregelNeuPage() {
  const router = useRouter();
  const [bahnen, setBahnen] = useState<Bahn[]>([]);
  const [weekday, setWeekday] = useState<number>(1);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [slotMinutes, setSlotMinutes] = useState(60);
  const [aktiv, setAktiv] = useState(true);
  const [alleBahnen, setAlleBahnen] = useState(false);
  const [bahnIds, setBahnIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/bahnen", { cache: "no-store" });
      const list = await r.json().catch(() => []);
      setBahnen(Array.isArray(list) ? list : []);
      setLoading(false);
    })();
  }, []);

  async function speichern() {
    setSaving(true);
    try {
      const body = {
        weekday,
        start_time: startTime,
        end_time: endTime,
        slot_minutes: slotMinutes,
        aktiv,
        alle_bahnen: alleBahnen,
        bahn_ids: bahnIds,
      };
      const r = await fetch("/api/zeitregeln", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error("Fehler");
      router.push("/zeitregeln");
    } catch {
      alert("Fehler beim Speichern.");
    } finally {
      setSaving(false);
    }
  }

  function toggleBahn(id: number) {
    setBahnIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <h1 style={{ textAlign: "center", fontSize: 26, fontWeight: 800, marginBottom: 16 }}>
          Zeitregel anlegen
        </h1>

        <div style={{ display: "grid", gap: 16 }}>
          <label>
            Wochentag:
            <select
              value={weekday}
              onChange={(e) => setWeekday(Number(e.target.value))}
              style={{ marginLeft: 8, padding: 6 }}
            >
              <option value={0}>Sonntag</option>
              <option value={1}>Montag</option>
              <option value={2}>Dienstag</option>
              <option value={3}>Mittwoch</option>
              <option value={4}>Donnerstag</option>
              <option value={5}>Freitag</option>
              <option value={6}>Samstag</option>
            </select>
          </label>

          <div style={{ display: "flex", gap: 16 }}>
            <label>
              Zeit von:
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={{ marginLeft: 8 }}
              />
            </label>
            <label>
              Zeit bis:
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                style={{ marginLeft: 8 }}
              />
            </label>
          </div>

          <label>
            Slot-Minuten:
            <input
              type="number"
              min={5}
              step={5}
              value={slotMinutes}
              onChange={(e) => setSlotMinutes(Number(e.target.value))}
              style={{ marginLeft: 8, width: 100 }}
            />
          </label>

          <label>
            <input
              type="checkbox"
              checked={aktiv}
              onChange={(e) => setAktiv(e.target.checked)}
            />{" "}
            Regel ist aktiv
          </label>

          <label>
            <input
              type="checkbox"
              checked={alleBahnen}
              onChange={(e) => setAlleBahnen(e.target.checked)}
            />{" "}
            Für alle Bahnen
          </label>

          {!alleBahnen && !loading && (
            <div>
              <strong>Bahnen:</strong>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
                {bahnen.map((b) => (
                  <label key={b.id}>
                    <input
                      type="checkbox"
                      checked={bahnIds.includes(b.id)}
                      onChange={() => toggleBahn(b.id)}
                    />{" "}
                    {b.nummer ?? "?"} – {b.name ?? ""}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button
              onClick={speichern}
              disabled={saving}
              style={{
                background: "#2563eb",
                color: "#fff",
                padding: "8px 16px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
              }}
            >
              {saving ? "Speichern…" : "Speichern"}
            </button>
            <button
              onClick={() => router.push("/zeitregeln")}
              style={{
                background: "#e5e7eb",
                padding: "8px 16px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
              }}
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
