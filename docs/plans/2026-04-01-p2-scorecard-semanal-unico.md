# HealthBytes - P2 Scorecard semanal unico (Deprecations + Roadmap)

Fecha de inicio: 2026-04-01
Cadencia: semanal (4 semanas)
Owner operativo: Product
Co-owners: Backend, QA, DevOps
Fuente de referencia: `docs/plans/2026-04-01-parallel-lanes-kanban.md`

---

## Objetivo P2 (30 dias)

- Limpiar deprecations no bloqueantes sin comprometer capacidad critica de P0/P1.
- Consolidar un scorecard semanal unico de roadmap con KPI y evidencia verificable.

## Guardrails operativos

- P0 tiene prioridad absoluta; P2 se pausa ante incidente critico de seguridad/release.
- Capacidad sugerida para P2: maximo 15% de Backend y QA por semana.
- Ningun item pasa a `DONE` sin evidencia enlazada.

---

## KPI oficiales y metas

| KPI | Meta | Regla de medicion | Evidencia requerida |
|---|---|---|---|
| Burn-down deprecations semanal | >= 15% (S2-S4) | ((baseline - abiertos semana) / baseline) * 100 | Conteo baseline + conteo semanal |
| Reduccion acumulada deprecations | >= 60% al cierre S4 | (baseline - abiertos S4) / baseline | Comparativo S1 vs S4 |
| Scorecard publicado en fecha | 4/4 semanas | Publicado antes del cierre semanal | Timestamp de publicacion |
| Lead time de remediacion | mediana <= 7 dias | Fecha deteccion -> fecha cierre | Export de tracker |
| Aging sin decision | 0 items > 21 dias | Items sin estado `resolver/diferir` | Reporte aging semanal |
| Regresiones criticas por remediacion | 0 | Defectos criticos por limpieza deprecations | Sign-off QA + smoke |
| Impacto a P0/P1 por P2 | 0 bloqueos criticos | Bloqueos atribuidos a consumo P2 | Acta semanal de conflictos |

---

## Scorecard semanal (fuente unica)

| Semana | Estado P2 (R/A/V) | Deprecations baseline | Deprecations abiertas | Burn-down semanal | Burn-down acumulado | Lead time mediana (dias) | Aging >21d | Regresiones criticas | Publicado en fecha | Evidencia |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| S1 (baseline) | AMARILLO | 14 | 11 | N/A | 21.4% | 7 (estimado) | 0 | 0 | SI | Inventario: FE lock deprecated=9; BE tokens: HTTP_422 3->0, DeprecationWarning=2. Publicado 2026-04-01 21:34 UTC |
| S2 | AMARILLO | 14 | 11 | 21.4% | 21.4% | 1 | 0 | 0 | SI | Quick win aplicado + QA: `441 passed, 1 skipped` con `DATABASE_URL=sqlite+aiosqlite:///:memory:` |
| S3 | AMARILLO | 14 | 11 | 0.0% | 21.4% | 1 | 0 | 0 | SI | Alerta activa: CI ejecuta `python scripts/check_p2_deprecations.py` (regla no-net-increase) |
| S4 | AMARILLO | 14 | 11 | 0.0% | 21.4% | 1 | 0 | 0 | SI | Cierre mensual publicado + backlog diferido con fecha/owner/criterio |

---

## Registro semanal de decisiones (ligero)

| Fecha | Decision | Tipo (`resolver`/`diferir`) | Owner | Fecha compromiso | Motivo | Evidencia |
|---|---|---|---|---|---|---|
| 2026-04-01 | Iniciar baseline unico P2 y adoptar inventario por tokens/lockfile | resolver | Product | 2026-04-05 | Tener metrica objetiva semanal sin bloquear P0/P1 | Scorecard actualizado 2026-04-01 21:34 UTC |
| 2026-04-01 | Ejecutar quick win de deprecation HTTP_422 en backend | resolver | Backend | 2026-04-02 | Reducir deuda no bloqueante sin impacto en P0/P1 | `backend/app/api/v1/orders.py`, `backend/tests/test_api/test_cart.py` |
| 2026-04-01 | Institucionalizar alerta no-net-increase en CI | resolver | DevOps | 2026-04-03 | Evitar regresiones por nuevas deprecations | `.github/workflows/ci.yml`, `backend/scripts/check_p2_deprecations.py` |
| 2026-04-01 | Cerrar ciclo mensual P2 con backlog diferido priorizado | resolver | Product | 2026-04-04 | Sostener plan liviano y continuidad sin afectar P0/P1 | Seccion de backlog diferido en este scorecard |

---

## Backlog diferido P2 (siguiente ciclo)

| Item | Estado | Owner | Fecha objetivo | Criterio de salida | Impacto esperado |
|---|---|---|---|---|---|
| Migrar suppressions de `DeprecationWarning` a manejo condicional por version en arranque backend | diferir | Backend | 2026-04-11 | Sin `warnings.filterwarnings` global para asyncio en Windows, manteniendo compatibilidad | Reducir deuda tecnica de runtime |
| Reducir `deprecated:` en `frontend/pnpm-lock.yaml` via actualizacion de dependencias transitivas | diferir | DevOps + Frontend | 2026-04-18 | Conteo `deprecated:` <= 6 y CI verde | Burn-down acumulado hacia meta >= 60% |
| Formalizar export semanal de lead time/aging desde tracker en formato fijo | diferir | QA + Product | 2026-04-08 | Reporte semanal adjunto al scorecard sin carga manual > 15 min | Mayor trazabilidad de KPI |

---

## Semaforo y criterio

- VERDE: scorecard en fecha por 2 semanas consecutivas, burn-down >= 15%, sin impacto critico en P0/P1.
- AMARILLO: plan en ejecucion con desviaciones menores o baseline incompleto.
- ROJO: scorecard no publicado o impacto critico a P0/P1 o regresion critica.

Estado recomendado actual: **AMARILLO**.
