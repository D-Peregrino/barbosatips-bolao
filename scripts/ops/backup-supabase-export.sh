#!/usr/bin/env bash
# Export lógico do projeto Supabase (schema + dados via CLI).
# Pré-requisitos: `supabase` CLI, login (`supabase login`), link ao projecto remoto.
#
# Uso (exemplo):
#   export SUPABASE_PROJECT_REF="xxxxxxxx"
#   ./scripts/ops/backup-supabase-export.sh
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUT_DIR="${BACKUP_DIR:-$ROOT/backups}/supabase"
STAMP="$(date -u +"%Y%m%dT%H%M%SZ")"
DEST="$OUT_DIR/db_$STAMP"

echo "[backup-supabase] Raiz: $ROOT"
echo "[backup-supabase] Destino: $DEST"

if ! command -v supabase >/dev/null 2>&1; then
  echo "[backup-supabase] ERRO: instala a CLI Supabase (https://supabase.com/docs/guides/cli)."
  exit 1
fi

mkdir -p "$DEST"

# Descomenta e ajusta quando o projecto estiver linkado localmente:
# (cd "$ROOT" && supabase db dump --linked -f "$DEST/schema.sql")
# (cd "$ROOT" && supabase db dump --linked --data-only -f "$DEST/data.sql")

echo "[backup-supabase] Placeholder: adiciona comandos reais de dump acima (sem credenciais no repo)."
echo "[backup-supabase] Concluído (0 bytes esperados até configurares o dump)."
