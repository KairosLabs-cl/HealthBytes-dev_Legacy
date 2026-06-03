#!/usr/bin/env bash
set -euo pipefail

SESSION_NAME="healthbytes-lanes"
ATTACH=true

if [[ "${1:-}" == "--no-attach" ]]; then
  ATTACH=false
fi

if ! command -v tmux >/dev/null 2>&1; then
  echo "tmux is not installed. Install with: brew install tmux"
  exit 1
fi

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

if ! git check-ignore -q .worktrees; then
  echo "ERROR: .worktrees is not ignored by git. Add '.worktrees/' to .gitignore first."
  exit 1
fi

mkdir -p "$ROOT/.worktrees"

ensure_worktree() {
  local lane="$1"
  local branch="lane/$lane"
  local path="$ROOT/.worktrees/lane-$lane"

  if git worktree list --porcelain | grep -q "worktree $path"; then
    return 0
  fi

  if git show-ref --verify --quiet "refs/heads/$branch"; then
    git worktree add "$path" "$branch"
  else
    git worktree add "$path" -b "$branch"
  fi
}

ensure_worktree "p0"
ensure_worktree "p1"
ensure_worktree "p2"

if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
  if [[ "$ATTACH" == true ]]; then
    tmux attach -t "$SESSION_NAME"
  else
    echo "Session already exists: $SESSION_NAME"
  fi
  exit 0
fi

tmux new-session -d -s "$SESSION_NAME" -c "$ROOT/.worktrees/lane-p0"
tmux split-window -h -t "$SESSION_NAME":0 -c "$ROOT/.worktrees/lane-p1"
tmux split-window -v -t "$SESSION_NAME":0.1 -c "$ROOT/.worktrees/lane-p2"
tmux select-layout -t "$SESSION_NAME":0 tiled

tmux send-keys -t "$SESSION_NAME":0.0 "clear; echo '[P0] Security + Release'; git status --short --branch" C-m
tmux send-keys -t "$SESSION_NAME":0.1 "clear; echo '[P1] Roadmap + E2E + Gate'; git status --short --branch" C-m
tmux send-keys -t "$SESSION_NAME":0.2 "clear; echo '[P2] Deprecations + Scorecard'; git status --short --branch" C-m

if [[ "$ATTACH" == true ]]; then
  tmux attach -t "$SESSION_NAME"
else
  echo "Created tmux session: $SESSION_NAME"
fi
