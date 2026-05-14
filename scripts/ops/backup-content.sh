#!/usr/bin/env bash
# Backup de conteúdo estático / editorial versionado (ficheiros no repo).
# Ajusta INCLUDE conforme a tua pasta de conteúdo (MDX, JSON, etc.).
#
# Uso:
#   BACKUP_DIR=/caminho/seguro ./scripts/ops/backup-content.sh
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUT_DIR="${BACKUP_DIR:-$ROOT/backups}/content"
STAMP="$(date -u +"%Y%m%dT%H%M%SZ")"
ARCHIVE="$OUT_DIR/content_$STAMP.tgz"

echo "[backup-content] Raiz: $ROOT"
mkdir -p "$OUT_DIR"

INCLUDE=(
  # Exemplos — descomenta o que existir no teu repo:
  # "$ROOT/content"
  # "$ROOT/public/uploads"
)

if ((${#INCLUDE[@]} == 0)); then
  echo "[backup-content] Nada a arquivar: edita INCLUDE[] em scripts/ops/backup-content.sh"
  exit 0
fi

tar -czf "$ARCHIVE" "${INCLUDE[@]}"
echo "[backup-content] Arquivo: $ARCHIVE"
