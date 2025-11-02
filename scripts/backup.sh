#!/usr/bin/env bash
set -euo pipefail
STAMP="$(date +%Y%m%d-%H%M%S)"
DIR="backups/sgs-$STAMP"
mkdir -p "$DIR"
rsync -a --exclude='.git' --exclude='node_modules' ./ "$DIR"/
tar -czf "backups/sgs-$STAMP.tgz" -C backups "sgs-$STAMP"
cp "backups/sgs-$STAMP.tgz" backups/backup_latest.tgz
echo "Backup erstellt: backups/sgs-$STAMP.tgz"
