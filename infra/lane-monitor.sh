#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"

show_once() {
  if [[ -t 1 && -n "${TERM:-}" ]]; then
    clear
  fi
  echo "HealthBytes Parallel Lanes Monitor"
  echo "Generated: $(date '+%Y-%m-%d %H:%M:%S')"
  echo

  for lane in p0 p1 p2; do
    path="$ROOT/.worktrees/lane-$lane"
    echo "[$lane] $path"
    if [[ -d "$path" ]]; then
      git -C "$path" status --short --branch
    else
      echo "Missing worktree: $path"
    fi
    echo
  done

  echo "Key docs"
  echo "- docs/plans/2026-04-01-parallel-lanes-kanban.md"
  echo "- docs/plans/2026-04-01-parallel-lanes-execution-pack.md"
  echo "- docs/plans/2026-04-01-estado-roadmap-prioridades.md"
}

if [[ "${1:-}" == "--watch" ]]; then
  while true; do
    show_once
    sleep 5
  done
else
  show_once
fi
