#!/usr/bin/env bash
# Ubuntu sem python3-venv: instala Playwright só nesta pasta (.deps)
set -euo pipefail
cd "$(dirname "$0")"
python3 -m pip install --target .deps playwright
export PYTHONPATH="$(pwd)/.deps${PYTHONPATH:+:$PYTHONPATH}"
python3 -m playwright install chromium
echo "Pronto. Rode: ./run.sh --steps steps.smoke.json --headless"
