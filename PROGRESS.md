# PROGRESS – SG Spaichingen App

Stand: 2026-03-19

---

## Aktueller Status

Die App ist produktiv. Alle Kernfeatures (Kasse, Bahnen, Dienste, Mitglieder, Artikel, Backup) sind implementiert.

---

## Zuletzt implementierte Änderungen

### 2026-03-15 — Öffentliche Dienstbuchung: Namen & Beschreibung
- `app/api/dienste-public/route.ts`: Gibt jetzt `zeilen` (Name, ohne Telefon) und `beschreibung` zurück
- `app/dienstbuchung-public/page.tsx`: Zeigt Dienst-Beschreibung im Header, Zeilen-Tabelle (Platz, Name, Datum, Uhrzeit)

### 2026-03-12 — ref=intern-Kette & Navigation-Fixes
- `proxy.ts`: Storno- und öffentliche Pfade als `PUBLIC_PATHS`, setzt `x-pathname`-Header
- `app/(standalone)/layout.tsx`: Auth-Check für öffentliche Standalone-Pfade überspringen
- Bahn- und Dienstbuchung: `?ref=intern` → Zurück zu `/dashboard` statt zur öffentlichen Seite
- `app/api/dienst-slots/route.ts`: Freundliche Fehlermeldung bei 23505-Sequenzfehler

### 2026-03-09 — Dienstbuchung: Gruppierung, Labels, Excel-Export
- Intern & öffentlich: Gruppierung nach **Event → Datum → Kategorie**
- "Ausgebucht" → "Gebucht"; x/x frei immer grün
- Excel-Export (xlsx) mit allen Buchungsdaten (intern)
- `package.json`: `xlsx`-Paket hinzugefügt

### Früher — Backup via GitHub Actions
- `.github/workflows/db-backup.yml`: Automatisches DB-Backup Di/Fr/Sa/So um 23:00 Uhr
- `scripts/db-backup-api.mjs`: Backup via Supabase REST API (kein pg_dump, kein Docker nötig)

---

## Aktuelle Datenbankstruktur (Dienste)

```
dienste       — id, titel, beschreibung, aktiv, created_at
dienst_slots  — id, dienst_id (fk), datum_von, datum_bis, uhrzeit_von, uhrzeit_bis, dauer_minuten, anzahl_personen
dienst_zeilen — id, dienst_slot_id (fk), nummer, name, telefon, datum, buchung_von, buchung_bis, gebucht_am
```

Flexible Slots: `datum_von != datum_bis` ODER Zeitfenster ≠ `dauer_minuten`

---

## Offene Punkte / Nächste Schritte

_(hier eintragen, falls neue Aufgaben bekannt sind)_

---

## Supabase Projekt

- Projekt: **sgs-neu**
- Ref: `rhnpshxcefpycvfteger`
- Region: eu-central-1
- Org: `ykrenjpaftnazkkkrmhy`
