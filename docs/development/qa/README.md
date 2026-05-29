# docs/.automation — HealthBytes DocSync

Sistema de sincronización automática de documentación. Extrae métricas reales del repo
(tests, versiones, endpoints, git log) y actualiza `README.md`, `AI-README.md`s y
`CHANGELOG.md` con datos verdaderos.

---

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `docsync.py` | Script principal |
| `config.yaml` | Configuración de métricas y archivos a actualizar |
| `pre-commit` | Hook de pre-commit (validación rápida) |

---

## Uso

```bash
# Actualizar todos los docs con métricas en vivo
python docs/.automation/docsync.py --update

# Ver qué cambiaría sin escribir nada
python docs/.automation/docsync.py --dry-run

# Solo regenerar CHANGELOG
python docs/.automation/docsync.py --changelog

# Validación rápida (pre-commit) — falla si métricas fuera de rango
python docs/.automation/docsync.py --validate

# Actualizar + correr tests reales (lento, ~2min)
python docs/.automation/docsync.py --update --run-tests
```

---

## Métricas que trackea

### Tier 1 — Versiones (instantáneo)
- Python, Node, pnpm
- FastAPI, SQLAlchemy, Pydantic
- Expo, React Native, Zustand

### Tier 2 — Tests y análisis estático (rápido, ~5s)
- Backend tests collected (`pytest --co -q`)
- Backend coverage % (mismo comando)
- Frontend tests passed/total + suites
- API endpoints count (scan `app/api/v1/`)
- E2E tests count (scan `tests/e2e/`)
- Smoke checks count
- TODOs pendientes en código
- Alembic migrations count

### Tier 3 — Git (para CHANGELOG)
- Commits últimos 7 días
- Commits por tipo (`feat:`, `fix:`, `perf:`, `refactor:`, `test:`, `docs:`, `chore:`)
- Features implementadas (scan de archivos clave)

---

## Markers en los docs

Los archivos a actualizar usan markers HTML como delimitadores:

```markdown
<!-- DOCSYNC:status-table -->
...contenido generado automáticamente...
<!-- /DOCSYNC:status-table -->
```

Markers disponibles:

| Marker | Archivo | Contenido |
|--------|---------|-----------|
| `status-table` | README.md | Tabla de estado del proyecto |
| `testing-table` | README.md | Tabla de tests y coverage |
| `stack-backend` | README.md | Tabla de stack backend con versiones |
| `stack-frontend` | README.md | Tabla de stack frontend con versiones |
| `last-updated` | README.md | Timestamp de última actualización |
| `backend-stack` | backend/AI-README.md | Stack con versiones para IA |
| `test-status` | backend/AI-README.md | Estado de tests para IA |
| `frontend-stack` | frontend/AI-README.md | Stack con versiones para IA |
| `test-status` | frontend/AI-README.md | Estado de tests para IA |
| `changelog-body` | CHANGELOG.md | Entradas del changelog |

---

## Instalar el pre-commit hook

```bash
# Windows
copy docs\.automation\pre-commit .git\hooks\pre-commit

# Linux/Mac
cp docs/.automation/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

---

## Para el agente de schedule ("Jules")

Cuando el agente corra en horario:

```bash
# 1. Actualizar docs
python docs/.automation/docsync.py --update

# 2. Ver si hubo cambios
git diff --stat

# 3. Si hay cambios, commitear
git add README.md backend/AI-README.md frontend/AI-README.md CHANGELOG.md
git commit -m "docs(sync): auto-update metrics $(date +%Y-%m-%d)"
```

El script imprime un resumen de qué cambió para que el agente pueda decidir
si el cambio requiere revisión humana antes de hacer push.

---

## Thresholds de validación

Definidos en `config.yaml`:

| Métrica | Mínimo |
|---------|--------|
| Backend tests collected | 400 |
| Frontend tests passed | 100 |
| API endpoints | 40 |

Si algún valor cae por debajo del mínimo, `--validate` falla y bloquea el commit.
Esto detecta regresiones accidentales (ej: alguien borra tests sin querer).
