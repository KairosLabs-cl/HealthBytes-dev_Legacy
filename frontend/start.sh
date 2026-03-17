#!/usr/bin/env bash
# Error Handling Pattern implementation for Environment Startup
# Implements: Fail Fast, Graceful Degradation, Meaningful Messages

set -euo pipefail

# Move to script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

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
exec pnpm exec expo start
