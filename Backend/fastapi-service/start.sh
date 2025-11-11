#!/usr/bin/env bash
set -euo pipefail

# Move to script directory (fastapi-service)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

printf "===============================================\n"
printf " HealthBytes FastAPI - Unix/macOS Starter\n"
printf "===============================================\n"

# 1) Ensure virtualenv exists
if [ ! -d ".venv" ]; then
  if command -v python3.14 >/dev/null 2>&1; then PY=python3.14
  elif command -v python3 >/dev/null 2>&1; then PY=python3
  else PY=python; fi
  echo "Creating virtualenv with $PY ..."
  "$PY" -m venv .venv
fi

# 2) Activate virtualenv
# shellcheck source=/dev/null
source .venv/bin/activate

# 3) Install/update deps
if [ "${NO_INSTALL:-}" != "1" ]; then
  echo "Upgrading pip/setuptools/wheel..."
  python -m pip install --upgrade pip setuptools wheel
  echo "Installing requirements..."
  python -m pip install -r requirements.txt
fi

# 4) Start server via run_server.py (configured reload excludes)
echo "Starting FastAPI server on http://127.0.0.1:3001 ..."
echo "Press CTRL+C to stop."
exec python run_server.py
