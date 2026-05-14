#!/usr/bin/env bash
# Export da tabela `quick_picks` (picks rápidas) via `pg_dump`.
#
# Variáveis:
#   DATABASE_URL — connection string Postgres (service role / backup user).
#   BACKUP_DIR   — pasta base (default: ./backups)
#
# Uso:
#   DATABASE_URL="postgresql://..." ./scripts/ops/backup-picks-export.sh
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUT_DIR="${BACKUP_DIR:-$ROOT/backups}/picks"
STAMP="$(date -u +"%Y%m%dT%H%M%SZ")"
FILE="$OUT_DIR/quick_picks_$STAMP.sql"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "[backup-picks] Define DATABASE_URL (Postgres Supabase) para exportar."
  exit 1
fi

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "[backup-picks] ERRO: pg_dump não encontrado (instala cliente PostgreSQL)."
  exit 1
fi

mkdir -p "$OUT_DIR"

pg_dump "$DATABASE_URL" \
  --schema=public \
  --table=public.quick_picks \
  --no-owner \
  --no-privileges \
  -f "$FILE"

echo "[backup-picks] Ficheiro: $FILE"
