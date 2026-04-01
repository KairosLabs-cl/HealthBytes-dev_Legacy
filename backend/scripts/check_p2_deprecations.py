#!/usr/bin/env python3
"""Check P2 deprecation trend against baseline (no net increase rule)."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def count_occurrences(file_path: Path, token: str) -> int:
    text = file_path.read_text(encoding="utf-8")
    return text.count(token)


def count_backend_tokens(repo_root: Path) -> dict[str, int]:
    backend_root = repo_root / "backend"
    py_files = list(backend_root.rglob("*.py"))

    http_422 = 0
    dep_warning = 0
    self_path = Path(__file__).resolve()
    for file_path in py_files:
        if file_path.resolve() == self_path:
            continue
        try:
            text = file_path.read_text(encoding="utf-8")
        except Exception:
            continue
        http_422 += text.count("HTTP_422_UNPROCESSABLE_ENTITY")
        dep_warning += text.count("DeprecationWarning")

    return {
        "backend_http_422_token": http_422,
        "backend_deprecationwarning_token": dep_warning,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="P2 deprecation no-net-increase check")
    parser.add_argument(
        "--baseline",
        default="docs/plans/2026-04-01-p2-deprecation-baseline.json",
        help="Path to baseline JSON file",
    )
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parents[2]
    baseline_path = repo_root / args.baseline

    if not baseline_path.exists():
        print(f"ERROR: baseline file not found: {baseline_path}")
        return 2

    baseline = json.loads(baseline_path.read_text(encoding="utf-8"))

    frontend_lock_path = repo_root / "frontend" / "pnpm-lock.yaml"
    frontend_dep = count_occurrences(frontend_lock_path, "deprecated:")
    backend_counts = count_backend_tokens(repo_root)

    current_total = (
        frontend_dep
        + backend_counts["backend_http_422_token"]
        + backend_counts["backend_deprecationwarning_token"]
    )
    baseline_total = int(baseline["baseline_total"])

    print("P2 Deprecation Check")
    print(f"baseline_total={baseline_total}")
    print(f"current_total={current_total}")
    print(f"frontend_lock_deprecated={frontend_dep}")
    print(f"backend_http_422_token={backend_counts['backend_http_422_token']}")
    print(
        "backend_deprecationwarning_token="
        f"{backend_counts['backend_deprecationwarning_token']}"
    )

    if current_total > baseline_total:
        print("RESULT=FAIL (net increase detected)")
        return 1

    print("RESULT=PASS (no net increase)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
