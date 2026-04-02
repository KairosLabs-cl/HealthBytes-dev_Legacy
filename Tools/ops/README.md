# Ops Utilities

## Parallel lanes

Use this script to start (or reuse) a tmux session with three isolated worktrees:

- `lane/p0` -> `.worktrees/lane-p0`
- `lane/p1` -> `.worktrees/lane-p1`
- `lane/p2` -> `.worktrees/lane-p2`

Command:

```bash
./Tools/ops/parallel-lanes.sh
```

Optional (create/reuse without attaching):

```bash
./Tools/ops/parallel-lanes.sh --no-attach
```

Requirements:

- `tmux` installed
- `.worktrees/` ignored in `.gitignore`

The script is idempotent:

- Creates missing worktrees/branches when needed
- Reuses existing tmux session (`healthbytes-lanes`) if already running

## Lane monitor

Quick status across all three lanes from any terminal:

```bash
./Tools/ops/lane-monitor.sh
```

Live mode (refresh every 5s):

```bash
./Tools/ops/lane-monitor.sh --watch
```

## P2 Deprecations Baseline

### Overview

The P2 deprecations baseline is the **source of truth** for tracking deprecation debt trends across the codebase. It enforces a **no-net-increase** rule during CI, preventing regression in deprecation counts.

**Location:** `docs/plans/2026-04-01-p2-deprecation-baseline.json`

**Tracked Tokens:**
- `deprecated:` in `frontend/pnpm-lock.yaml` (deprecated npm packages)
- `HTTP_422_UNPROCESSABLE_ENTITY` in backend Python files (Django legacy status code)
- `DeprecationWarning` in backend Python files (Python deprecation warnings)

### Baseline Governance

1. **Source of Truth:** The baseline JSON is immutable during normal development
2. **Read-Only Protection:** Consider making baseline file read-only to prevent accidental edits:
   ```bash
   chmod 444 docs/plans/2026-04-01-p2-deprecation-baseline.json
   ```
3. **Manual Updates:** Only updated intentionally after:
   - Completing scheduled deprecation cleanups (end of P2 cycle)
   - Documenting evidence in scorecard (`2026-04-01-p2-scorecard-semanal-unico.md`)
   - PR approval from team lead

4. **CI Integration:** Script `backend/scripts/check_p2_deprecations.py` runs on every CI build
   - Fails if `current_total > baseline_total` (regression detected)
   - Passes if `current_total <= baseline_total` (no regression)

### Updating Baseline

When intentionally reducing deprecation debt:

1. Make planned cleanup PRs targeting specific tokens
2. Verify locally:
   ```bash
   cd backend
   python scripts/check_p2_deprecations.py
   ```
3. After merge, manually update baseline (authorized users only):
   ```bash
   # After running cleanups and tests pass
   python backend/scripts/check_p2_deprecations.py > /tmp/counts.txt
   # Manually edit docs/plans/2026-04-01-p2-deprecation-baseline.json
   ```
4. Update `captured_at` timestamp and `notes` field in baseline JSON

### Important Notes

- **Do NOT edit baseline in feature PRs** - CI will reject if baseline changes without proper governance
- **Do NOT manually commit baseline changes** - coordinate with team for explicit approval
- **Do NOT merge PRs that increase deprecations** - the CI gate will catch this

## Troubleshooting P2 Conflicts

### Issue: P2 lane interfering with P0/P1 capacity

**Symptoms:**
- P0/P1 work getting delayed
- CI queue backup due to P2 tests running too frequently

**Solutions:**
1. **Pause P2 temporarily:**
   ```bash
   # Temporarily disable P2 deprecation check in CI
   git -C .worktrees/lane-p2 stash
   git -C .worktrees/lane-p2 rebase main
   # Resume after P0/P1 stabilizes
   ```

2. **Reduce P2 scope:** Edit lane definitions in `docs/plans/2026-04-01-parallel-lanes-kanban.md`

3. **Escalate to team:** Document in PR if P2 is blocking critical work

### Issue: Deprecation check failing unexpectedly

**Symptoms:**
- CI fails with "net increase detected" but you haven't touched deprecation patterns

**Debug Steps:**
1. Run locally in your branch:
   ```bash
   cd backend
   DATABASE_URL="sqlite+aiosqlite:///:memory:" JWT_SECRET="test-key" \
     python scripts/check_p2_deprecations.py
   ```

2. Compare with baseline:
   ```bash
   cat docs/plans/2026-04-01-p2-deprecation-baseline.json
   ```

3. Check which files added deprecations:
   ```bash
   # Search for new patterns
   grep -r "HTTP_422_UNPROCESSABLE_ENTITY" backend/app --include="*.py" | wc -l
   grep -r "DeprecationWarning" backend/app --include="*.py" | wc -l
   ```

4. If finding is legitimate but acceptable, update baseline (see "Updating Baseline" above)

### Issue: Baseline file permissions

**Symptoms:**
- Warning: "baseline is writable" appears in CI logs

**Solution:**
```bash
# Make baseline read-only
chmod 444 docs/plans/2026-04-01-p2-deprecation-baseline.json
git add docs/plans/2026-04-01-p2-deprecation-baseline.json
git commit -m "chore: set baseline file permissions to read-only"
```

### Issue: Multiple lane conflicts

**When to stop P2:**
- Security fix (P0) is in progress
- Major roadmap item (P1) is blocked by infrastructure work
- CI/test infrastructure is unstable

**How to pause:**
1. Stop current P2 work in `.worktrees/lane-p2`
2. Notify team in lane-status doc
3. Resume after P0/P1 stabilizes

