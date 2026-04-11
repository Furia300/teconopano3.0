#!/usr/bin/env bash
# Uso: ./run.sh --steps steps.smoke.json --headless
# Sem venv: dependências em .deps (veja instalar-deps.sh)
set -euo pipefail
cd "$(dirname "$0")"
export PYTHONPATH="$(pwd)/.deps${PYTHONPATH:+:$PYTHONPATH}"
exec python3 bubble_captura.py "$@"
