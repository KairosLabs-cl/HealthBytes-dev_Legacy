#!/usr/bin/env bash

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP_DIR="$(mktemp -d)"
CAPTURE_FILE="$TMP_DIR/pnpm-args"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

if [ ! -f "$REPO_ROOT/frontend/.env" ]; then
  echo "frontend/.env missing. Run frontend/setup-env.sh before this test." >&2
  exit 1
fi

cat > "$TMP_DIR/pnpm" <<'EOF'
#!/usr/bin/env bash
printf '%s\n' "$*" > "$CAPTURE_FILE"
EOF
chmod +x "$TMP_DIR/pnpm"

run_case() {
  local expected="$1"
  shift

  PATH="$TMP_DIR:$PATH" CAPTURE_FILE="$CAPTURE_FILE" bash "$REPO_ROOT/frontend/start.sh" "$@"

  local actual
  actual="$(cat "$CAPTURE_FILE")"
  if [ "$actual" != "$expected" ]; then
    echo "Expected: $expected" >&2
    echo "Actual:   $actual" >&2
    exit 1
  fi
}

run_case "exec expo start --lan --go"
run_case "exec expo start --tunnel --go" --tunnel
run_case "exec expo start --dev-client --lan" --dev-client

echo "PASS: pnpm start defaults to Expo Go over LAN and preserves explicit overrides"
