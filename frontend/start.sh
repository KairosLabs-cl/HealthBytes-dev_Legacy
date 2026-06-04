#!/usr/bin/env bash
# Error Handling Pattern implementation for Environment Startup
# Implements: Fail Fast, Graceful Degradation, Meaningful Messages

set -euo pipefail

# Move to script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
ENV_FILE="$SCRIPT_DIR/.env"
SETUP_SCRIPT="$SCRIPT_DIR/setup-env.sh"

ensure_frontend_env() {
  local missing_env=0

  if [ ! -f "$ENV_FILE" ]; then
    missing_env=1
  elif ! grep -q '^EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_' "$ENV_FILE"; then
    missing_env=1
  fi

  if [ "$missing_env" -eq 0 ]; then
    return 0
  fi

  if [ -t 0 ] && [ -x "$SETUP_SCRIPT" ]; then
    echo ""
    echo "⚠️  frontend/.env falta o no tiene Clerk publishable key valida."
    echo "   Ejecutando ./setup-env.sh antes de iniciar Expo..."
    "$SETUP_SCRIPT"
    return 0
  fi

  echo ""
  echo "❌ Error: Missing Clerk publishable key."
  echo "   Code: ENV_ERROR"
  echo "   Details:"
  echo "     - Expected EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_... in frontend/.env"
  echo "     - Action: Run 'cd frontend && ./setup-env.sh' and then 'pnpm start'"
  exit 1
}

normalize_expo_args() {
  EXPO_ARGS=()
  local has_host_arg=0
  local has_client_arg=0
  for arg in "$@"; do
    if [ "$arg" = "--" ]; then
      continue
    fi
    case "$arg" in
      --lan|--tunnel|--localhost|--host|--host=*)
        has_host_arg=1
        ;;
    esac
    case "$arg" in
      --go|--dev-client)
        has_client_arg=1
        ;;
    esac
    EXPO_ARGS+=("$arg")
  done

  if [ "$has_host_arg" -eq 0 ]; then
    EXPO_ARGS+=("--lan")
  fi
  if [ "$has_client_arg" -eq 0 ]; then
    EXPO_ARGS+=("--go")
  fi
}

# ── Graceful Degradation: try fnm first, then nvm ──────────────────────────
resolve_node_environment() {
  echo "⚠️  Attempting graceful recovery of Node environment..." >&2

  # Try fnm (Fast Node Manager)
  if command -v fnm >/dev/null 2>&1; then
    echo "   Found fnm, loading Node environment..." >&2
    eval "$(fnm env)" 2>/dev/null || true
    fnm install 20 --quiet 2>/dev/null || true
    fnm use 20 --quiet 2>/dev/null || true
    return 0
  fi

  # Try nvm (Node Version Manager)
  if command -v nvm >/dev/null 2>&1; then
    echo "   Found nvm, loading Node environment..." >&2
    nvm use 20 2>/dev/null || nvm install 20 2>/dev/null || true
    return 0
  fi

  # Source nvm from common install paths (not always in PATH)
  for NVM_INIT in "$HOME/.nvm/nvm.sh" "/opt/homebrew/opt/nvm/nvm.sh"; do
    if [ -f "$NVM_INIT" ]; then
      # shellcheck source=/dev/null
      source "$NVM_INIT"
      nvm use 20 2>/dev/null || nvm install 20 2>/dev/null || true
      return 0
    fi
  done

  return 1
}

# ── Fail Fast: validate Node is present and >= 20.18.0 ────────────────────
validate_environment() {
  echo "🔍 Validating environment before startup..." 

  if ! command -v node >/dev/null 2>&1; then
    if ! resolve_node_environment || ! command -v node >/dev/null 2>&1; then
      echo ""
      echo "❌ Error: Node.js is not recognized. It is either not installed or not in your PATH."
      echo "   Code: ENV_ERROR"
      echo "   Details:"
      echo "     - Suggestion: Install Node.js >= 20.18.0 or activate your node version manager (fnm/nvm) in this terminal."
      exit 1
    fi
    echo "✅ Environment recovered gracefully."
  fi

  # Version check
  RAW_VERSION="$(node -v | tr -d 'v\n')"
  MAJOR="$(echo "$RAW_VERSION" | cut -d. -f1)"
  MINOR="$(echo "$RAW_VERSION" | cut -d. -f2)"
  PATCH="$(echo "$RAW_VERSION" | cut -d. -f3)"

  # Compare against 20.18.0
  NEED_RECOVER=0
  if   [ "$MAJOR" -lt 20 ]; then NEED_RECOVER=1
  elif [ "$MAJOR" -eq 20 ] && [ "$MINOR" -lt 18 ]; then NEED_RECOVER=1
  elif [ "$MAJOR" -eq 20 ] && [ "$MINOR" -eq 18 ] && [ "$PATCH" -lt 0 ]; then NEED_RECOVER=1
  fi

  if [ "$NEED_RECOVER" -eq 1 ]; then
    resolve_node_environment || true
    RAW_VERSION="$(node -v | tr -d 'v\n')"
    MAJOR="$(echo "$RAW_VERSION" | cut -d. -f1)"
    MINOR="$(echo "$RAW_VERSION" | cut -d. -f2)"
    PATCH="$(echo "$RAW_VERSION" | cut -d. -f3)"

    STILL_BAD=0
    if   [ "$MAJOR" -lt 20 ]; then STILL_BAD=1
    elif [ "$MAJOR" -eq 20 ] && [ "$MINOR" -lt 18 ]; then STILL_BAD=1
    fi

    if [ "$STILL_BAD" -eq 1 ]; then
      echo ""
      echo "❌ Error: Incompatible Node version."
      echo "   Code: ENV_ERROR"
      echo "   Details:"
      echo "     - Expected: >= 20.18.0"
      echo "     - Got: $RAW_VERSION"
      echo "     - Action: Run 'fnm install 20' or 'nvm install 20.18.0' followed by 'use'."
      exit 1
    fi
  fi

  echo "✅ Environment is healthy (node v$RAW_VERSION). Starting Expo server..."
}

# ── Entry Point ────────────────────────────────────────────────────────────
validate_environment
ensure_frontend_env
normalize_expo_args "$@"
# Disable unbound variable check right before array expansion
# because an empty array in bash with set -u throws an error
set +u
exec pnpm exec expo start "${EXPO_ARGS[@]}"
