#!/usr/bin/env bash
set -euo pipefail

# Move to script directory (fastapi-service)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

printf "===============================================\n"
printf " HealthBytes FastAPI - Unix/macOS Starter\n"
printf "===============================================\n"

# ── Read required version from .python-version ───────────────────────────
REQUIRED_PY="$(cat .python-version 2>/dev/null | tr -d '[:space:]')"
REQUIRED_PY="${REQUIRED_PY:-3.13.1}"
echo "Required Python: $REQUIRED_PY"

# ── Resolve Python via version manager ───────────────────────────────────
# Returns the absolute path to the correct python binary.
resolve_python() {
  # 1) pyenv: preferred - auto-install if version missing
  if command -v pyenv >/dev/null 2>&1; then
    echo "   [pyenv] found - checking for Python $REQUIRED_PY ..." >&2
    if ! pyenv versions --bare 2>/dev/null | grep -qF "$REQUIRED_PY"; then
      echo "   [pyenv] Python $REQUIRED_PY not installed. Installing (this may take a few minutes)..." >&2
      pyenv install "$REQUIRED_PY"
    fi
    pyenv local "$REQUIRED_PY"
    # Let pyenv shims resolve the binary
    export PYENV_VERSION="$REQUIRED_PY"
    echo "$(pyenv which python)"
    return 0
  fi

  # 2) mise: second option
  if command -v mise >/dev/null 2>&1; then
    echo "   [mise] found - ensuring Python $REQUIRED_PY ..." >&2
    mise use "python@$REQUIRED_PY" --yes 2>/dev/null || true
    local mise_py
    mise_py="$(mise which python 2>/dev/null || true)"
    if [ -n "$mise_py" ]; then
      echo "$mise_py"
      return 0
    fi
  fi

  # 3) Fallback: look for exact version in common paths
  for candidate in \
    "python${REQUIRED_PY}" \
    "python3.13" "python3.14" "python3.12" \
    "python3" "python"; do
    if command -v "$candidate" >/dev/null 2>&1; then
      echo "$(command -v "$candidate")"
      return 0
    fi
  done

  echo "[ERROR] Could not find Python $REQUIRED_PY." >&2
  echo "        Install pyenv (recommended): https://github.com/pyenv/pyenv" >&2
  echo "        Or mise: https://mise.jdx.dev" >&2
  exit 1
}

PY_BIN="$(resolve_python)"
PY_ACTUAL="$("$PY_BIN" --version 2>&1)"
echo "[OK] Using: $PY_ACTUAL  ($PY_BIN)"

# ── Helper: test that venv's python actually runs ─────────────────────────
venv_is_valid() {
  [ -f ".venv/bin/python" ] || return 1

  local venv_py
  venv_py="$(.venv/bin/python -c 'import sys; print(".".join(map(str, sys.version_info[:3])))' 2>/dev/null || true)"

  # Ensure venv is built with the required interpreter version.
  [[ "$venv_py" == "$REQUIRED_PY"* ]] || return 1

  # Ensure pip is importable (catches partially broken/copied environments).
  .venv/bin/python -c 'import pip' >/dev/null 2>&1
}

# ── Health summary after pip install ──────────────────────────────────────
show_health_summary() {
  local log_file="$1"
  local warnings errors pkg_count status
  warnings=$(grep -ciE 'WARNING|deprecated' "$log_file" 2>/dev/null || true)
  errors=$(grep -ciE 'ERROR|failed' "$log_file" 2>/dev/null || true)
  pkg_count=$(grep -c 'Successfully installed' "$log_file" 2>/dev/null || true)

  warnings="${warnings:-0}"
  errors="${errors:-0}"
  pkg_count="${pkg_count:-0}"

  if   [ "$errors" -gt 0 ];   then status="[ERROR]"
  elif [ "$warnings" -gt 5 ]; then status="[WARN]"
  else status="[OK]"
  fi
  echo ""
  printf "=== %s Health Check: %s deps | %s warnings | %s errors\n" \
    "$status" "$pkg_count" "$warnings" "$errors"
}

# 1) Ensure virtualenv exists and is valid
if [ ! -d ".venv" ]; then
  echo "Creating virtualenv with $PY_ACTUAL ..."
  "$PY_BIN" -m venv .venv
elif ! venv_is_valid; then
  echo "[WARNING] Virtualenv exists but appears corrupted. Recreating..."
  rm -rf .venv
  "$PY_BIN" -m venv .venv
fi

# 2) Activate virtualenv
# shellcheck source=/dev/null
source .venv/bin/activate

# 3) Install/update deps
if [ "${NO_INSTALL:-}" != "1" ]; then
  INSTALL_LOG="$(mktemp)"
  echo "Upgrading pip/setuptools/wheel..."
  if ! python -m pip install --upgrade pip setuptools wheel >> "$INSTALL_LOG" 2>&1; then
    echo ""
    echo "❌ pip upgrade failed. Last log lines:"
    tail -n 80 "$INSTALL_LOG" || true
    rm -f "$INSTALL_LOG"
    exit 1
  fi
  echo "Installing requirements..."
  if ! python -m pip install -r requirements.txt >> "$INSTALL_LOG" 2>&1; then
    echo ""
    echo "❌ requirements install failed. Last log lines:"
    tail -n 80 "$INSTALL_LOG" || true
    rm -f "$INSTALL_LOG"
    exit 1
  fi
  show_health_summary "$INSTALL_LOG"
  rm -f "$INSTALL_LOG"
fi

# 4) Apply local database migrations
if [ "${NO_MIGRATIONS:-}" != "1" ]; then
  echo ""
  echo "Applying database migrations..."
  if ! python -m alembic upgrade head; then
    echo ""
    echo "❌ Alembic migrations failed."
    echo "   Check backend/.env DATABASE_URL and confirm Postgres is running."
    echo "   Skip only when intentional: NO_MIGRATIONS=1 ./start.sh"
    exit 1
  fi
fi

# 5) Start server via run_server.py (configured reload excludes)
echo ""
echo "Starting FastAPI server on http://127.0.0.1:3001 ..."
echo "Press CTRL+C to stop."
exec python run_server.py
