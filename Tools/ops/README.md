# Ops Utilities

Este directorio contiene scripts y herramientas para la gestión operativa del proyecto HealthBytes.

## 🐳 Docker Management

Scripts para iniciar y gestionar los contenedores de desarrollo.

### Iniciar Servicios (Docker Compose)

- **PowerShell (Windows):**
  ```powershell
  ./Tools/ops/docker-start.ps1
  ```
- **Bash (Linux/Mac):**
  ```bash
  ./Tools/ops/docker-start.sh
  ```

Estos scripts se encargan de levantar la base de datos PostgreSQL y otros servicios necesarios definidos en el `docker-compose.yml`.

---

## 🛣️ Parallel Lanes (Worktrees)

Utilidad para gestionar múltiples flujos de trabajo paralelos usando git worktrees y tmux.

### Iniciar Lanes

Inicia una sesión de tmux con tres worktrees aislados:
- `lane/p0` -> `.worktrees/lane-p0` (Critical fixes)
- `lane/p1` -> `.worktrees/lane-p1` (Features)
- `lane/p2` -> `.worktrees/lane-p2` (Debt/Refactor)

**Comando:**
```bash
./Tools/ops/parallel-lanes.sh
```

**Opcional (crear/reutilizar sin adjuntar):**
```bash
./Tools/ops/parallel-lanes.sh --no-attach
```

### Lane Monitor

Estado rápido de las tres lanes:
```bash
./Tools/ops/lane-monitor.sh
```

**Modo live (refresca cada 5s):**
```bash
./Tools/ops/lane-monitor.sh --watch
```

---

## 📉 Deprecations Governance

Documentación y herramientas para el seguimiento de la deuda técnica (Deprecations).

- **Baseline:** `docs/plans/2026-04-01-p2-deprecation-baseline.json`
- **CI Check:** `backend/scripts/check_p2_deprecations.py`

Ver detalles de gobernanza en el código fuente de los scripts.
