#!/usr/bin/env bash
set -e

# === Restore eines Backups ===
# Verwendung:
#   ./restore-backup.sh backups/backup-YYYYMMDD-HHMM.zip

ZIPFILE="$1"

if [ -z "$ZIPFILE" ]; then
  echo "❌ Bitte Backup-Datei angeben (z.B. ./restore-backup.sh backups/backup-20251026-0952.zip)"
  exit 1
fi

if [ ! -f "$ZIPFILE" ]; then
  echo "❌ Datei '$ZIPFILE' nicht gefunden!"
  exit 1
fi

# Zielordner bestimmen
OUTDIR="restore-temp"
rm -rf "$OUTDIR"
mkdir -p "$OUTDIR"

echo "==> Entpacke $ZIPFILE nach $OUTDIR ..."
unzip -q "$ZIPFILE" -d "$OUTDIR"

# Optional: Supabase-Datenbank wiederherstellen
if [ -f "$OUTDIR"/*/supabase-db.sql ]; then
  echo "==> Wiederherstellen der Supabase-Datenbank ..."
  supabase db restore "$OUTDIR"/*/supabase-db.sql || true
fi

echo "✅ Wiederherstellung abgeschlossen."
echo "   Dateien entpackt nach: $OUTDIR/"
