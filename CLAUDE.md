# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Next.js 16 + Turbopack) → http://localhost:3000
npm run build     # Production build
npm run lint      # ESLint
```

## Environment

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

The active Supabase project is **Vereinxxl** (`rxprumwtuijmpohuunun`, eu-west-1).

## Architecture

**Next.js 16 App Router** with three route groups plus the root page:

- `app/page.tsx` — Primary login page (root `/`). After logout, users land on `app/(auth)/page.tsx` at `/auth`. Both pages are visually identical.
- `app/(auth)/` — Secondary login page at `/auth` (redirect target after logout)
- `app/(app)/` — Dashboard + sidebar layout (requires `sgs_user` cookie)
- `app/(standalone)/` — Full-page admin and public pages (no sidebar)

Middleware (`middleware.ts`) protects specific paths by checking the `sgs_user` cookie. Unprotected paths include `/dienstbuchung-public`, `/bahnbuchung-public`, `/dienstbuchung-storno`, and all `/api/*` public routes.

**Public vs. authenticated pages pattern:** Public pages (e.g. `dienstbuchung-public`) never call `requireAuth()` and use separate `*-public` API routes that omit personal data. Authenticated views of the same content use the standard API routes. Never mix session-checking into a page intended as public.

## Authentication

- Login: `POST /api/login` — validates password with `bcryptjs`, sets `sgs_user` httpOnly cookie (8h)
- Session: `GET /api/session` — reads `sgs_user` cookie, returns `{ user: { id, name, isAdmin } }`
- Logout: `POST /api/logout` then redirect to `/auth`
- Non-admin users require `erlaubter_rechner_hash` (device approval) in `benutzer` table

## Database Access Pattern

All API routes use direct Supabase REST API via `fetch`, **not** the Supabase JS client.

Shared helpers in `app/api/_supabase.ts`:
```ts
export const BASE = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
export const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
export async function requireAuth(): Promise<SessionUser | null>  // reads sgs_user cookie
```

**Important:** In Next.js 16, dynamic route `params` is a Promise — always `await` it:
```ts
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
}
```

## Database Schema (Supabase/PostgreSQL)

Core tables: `benutzer`, `mitglieder`, `artikel`, `kasse`, `kasse_saldo`, `bahnen`, `bahn_regeln`, `bahn_buchungen`, `app_settings`

Dienste tables (added during development):
```sql
dienste          -- id, titel, beschreibung, aktiv, created_at
dienst_slots     -- id, dienst_id (fk), datum_von, datum_bis, uhrzeit_von, uhrzeit_bis, dauer_minuten, anzahl_personen
dienst_zeilen    -- id, dienst_slot_id (fk), nummer, name, telefon, datum, buchung_von, buchung_bis, gebucht_am
```

- `kasse`: POS transactions — `benutzer` (text), `mitglied_id`, `betrag`, `storno`
- `mitglieder`: `preisgruppe` (1–9) maps to `preis1`–`preis9` on `artikel`. Has `geburtsdatum date` column.
- `dienst_zeilen`: N rows auto-created per slot (N = `anzahl_personen`). Booking = PATCH name/telefon onto a free row.

## Key Design Decisions

**Dienste booking flow:** `POST /api/dienst-slots` creates a slot and auto-inserts N empty `dienst_zeilen`. Booking (`POST /api/dienst-buchen`) finds the first zeile where `name IS NULL` and PATCHes it. Cancellation resets all booking fields back to `null`.

**Flexible slots:** A slot is "flexible" if `datum_von != datum_bis` OR the time window (uhrzeit_bis − uhrzeit_von) doesn't equal `dauer_minuten`. Flexible slots let the user pick a specific date and time within the window.

**Public API routes** (`/api/dienste-public`, `/api/dienst-buchen-public`, `/api/dienst-storno-public`) omit personal data and require no auth. They exist alongside the standard routes which require `requireAuth()`.

## Design System

All pages use Tailwind CSS with these consistent tokens:
- Page bg: `min-h-screen bg-slate-50`
- Card: `bg-white rounded-2xl border border-slate-200 shadow-sm`
- Primary btn: `px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors`
- Secondary btn: `px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors`
- Input: `w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`
- Table header: `px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide`

Every list page has a "Zurück" button (top right) linking to `/dashboard`. Public pages use `router.back()` instead of a hardcoded href so back-navigation works correctly regardless of where the user came from.

## Supabase CLI

The CLI binary is at `C:/Users/mario/Desktop/claude-code/supabase.exe`.
Use with `SUPABASE_ACCESS_TOKEN=<token>` env var.
Re-link to active project if needed:
```bash
SUPABASE_ACCESS_TOKEN=... /path/to/supabase.exe link --project-ref rxprumwtuijmpohuunun
```
