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
