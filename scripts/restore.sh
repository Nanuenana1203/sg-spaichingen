#!/usr/bin/env bash
set -euo pipefail
FILE="${1:-backups/backup_latest.tgz}"
[ -f "$FILE" ] || { echo "Backup fehlt: $FILE"; exit 1; }
TMP="$(mktemp -d)"
tar -xzf "$FILE" -C "$TMP"
TOP="$(tar -tzf "$FILE" | head -1 | cut -d/ -f1)"
rsync -a --delete --exclude='.git' --exclude='node_modules' "$TMP/$TOP"/ ./
echo "Restore OK"
