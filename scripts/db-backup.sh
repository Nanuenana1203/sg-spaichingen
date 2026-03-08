#!/usr/bin/env bash
# SGS Datenbank-Backup via Supabase CLI
# Verwendung: ./scripts/db-backup.sh
# Voraussetzung: SUPABASE_ACCESS_TOKEN als Umgebungsvariable gesetzt

set -euo pipefail

SUPABASE_BIN="${SUPABASE_BIN:-C:/Users/mario/Desktop/claude-code/supabase.exe}"
PROJECT_REF="rxprumwtuijmpohuunun"
BACKUP_DIR="./db-backups"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUTFILE="$BACKUP_DIR/sgs-db-$STAMP.sql"

if [ -z "${SUPABASE_ACCESS_TOKEN:-}" ]; then
  echo "FEHLER: SUPABASE_ACCESS_TOKEN nicht gesetzt."
  echo "Exportiere zuerst: export SUPABASE_ACCESS_TOKEN=dein_token"
  exit 1
fi

mkdir -p "$BACKUP_DIR"

echo "Starte Datenbank-Dump für Projekt $PROJECT_REF ..."
SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" "$SUPABASE_BIN" \
  db dump \
  --project-ref "$PROJECT_REF" \
  -f "$OUTFILE"

# Komprimieren
gzip "$OUTFILE"
echo "Backup gespeichert: ${OUTFILE}.gz"

# Alte Backups löschen (älter als 30 Tage)
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete 2>/dev/null || true
echo "Fertig."
