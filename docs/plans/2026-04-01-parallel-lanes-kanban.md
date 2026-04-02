# HealthBytes - Kanban semanal (P0/P1/P2)

Fecha de inicio: 2026-04-01
Fuente: `docs/plans/2026-04-01-parallel-lanes-execution-pack.md`

---

## Reglas de operacion

- Una tarea solo pasa a `DONE` con evidencia verificable.
- P0 tiene prioridad absoluta sobre P1 y P2.
- Si una tarea queda bloqueada >24h, se escala en la daily.
- Actualizacion diaria: owner + estado + proximo paso.

---

## Backlog priorizado

### P0 (Critico)

| ID | Tarea | Owner | ETA | Evidencia requerida |
|---|---|---|---|---|
| P0-01 | War room + freeze scope no critico | Product | D1 | Acta y RACI firmado |
| P0-02 | Inventario total de secretos | Security | D1 | Inventario versionado |
| P0-03 | Rotacion y revocacion de secretos | Security + DevOps | D2 | Logs por proveedor + SSM |
| P0-04 | Limpieza historial git por secretos | DevOps + Security | D4 | Saneamiento + force-push controlado |
| P0-05 | Re-scan seguridad post saneamiento | Security + QA | D4 | Gitleaks/CI/Bandit/Audit limpios |
| P0-06 | E2E real compra en device | QA | D6 | Evidencia completa de flujo |
| P0-07 | Smoke post-deploy (8/8) | DevOps + QA | D7 | `8/8 checks passed` |
| P0-08 | Cierre go/no-go firmado | Product + Security + DevOps + QA | D7 | Checklist firmado |

### P1 (Alto)

| ID | Tarea | Owner | ETA | Evidencia requerida |
|---|---|---|---|---|
| P1-01 | Fuente unica de verdad roadmap/estado | Product + Tech Lead | D4 | Documento canonico publicado |
| P1-02 | Contrato final addresses + checkout | Backend + Frontend | D5 | Criterios funcionales cerrados |
| P1-03 | Integracion FE/BE flujo feliz | Frontend + Backend | D7 | Demo funcional + QA pass |
| P1-04 | Casos borde ciclo 1 y hardening | QA + FE + BE | D10 | Defectos criticos en cero |
| P1-05 | Gate formal de release | DevOps + QA | D12 | Gate documentado y ejecutable |
| P1-06 | Dry run + cierre de gaps | DevOps + QA + FE + BE | D13 | Acta de dry run |
| P1-07 | Cierre P1 con firma | Product + Tech Lead | D14 | Go/No-Go P1 registrado |

### P2 (Medio)

| ID | Tarea | Owner | ETA | Evidencia requerida |
|---|---|---|---|---|
| P2-01 | Baseline deprecations + scorecard v1 | Backend + QA + Product + DevOps | S1 | Inventario + scorecard publicado |
| P2-02 | Quick wins deprecations (30-40%) | Backend + QA | S2 | Reduccion medible |
| P2-03 | Consolidacion (60-70%) + alertas | Backend + DevOps + QA | S3 | Tendencia a la baja |
| P2-04 | Cierre mensual + diferidos con fecha | Product + Backend + QA + DevOps | S4 | Cierre de ciclo y plan siguiente |

---

## Tablero diario

### TODO

- P0-01 War room + freeze scope no critico
- P0-02 Inventario total de secretos
- P0-03 Rotacion y revocacion de secretos
- P0-04 Limpieza historial git por secretos
- P0-05 Re-scan seguridad post saneamiento
- P0-06 E2E real compra en device
- P0-07 Smoke post-deploy (8/8)
- P0-08 Cierre go/no-go firmado
- P1-01 Fuente unica de verdad roadmap/estado
- P1-02 Contrato final addresses + checkout
- P1-03 Integracion FE/BE flujo feliz
- P1-04 Casos borde ciclo 1 y hardening
- P1-05 Gate formal de release
- P1-06 Dry run + cierre de gaps
- P1-07 Cierre P1 con firma

### IN PROGRESS

- (vacio)

### BLOCKED

- (vacio)

### DONE

- P2-01 Baseline deprecations + scorecard v1
  - Evidencia: `docs/plans/2026-04-01-p2-scorecard-semanal-unico.md` con baseline=14
- P2-02 Quick wins deprecations (30-40%)
  - Evidencia: `HTTP_422_UNPROCESSABLE_ENTITY` reducido 3->0 + QA `441 passed, 1 skipped`
- P2-03 Consolidacion (60-70%) + alertas
  - Evidencia: regla `no net increase` activa en CI (`python scripts/check_p2_deprecations.py`)
- P2-04 Cierre mensual + diferidos con fecha
  - Evidencia: `docs/plans/2026-04-01-p2-scorecard-semanal-unico.md` (S4 + backlog diferido)
  - Informe ejecutivo: `docs/plans/2026-04-01-p2-informe-ejecutivo-cierre-ciclo.md`

---

## KPI semanales

- Health Score global
- % P0 cerrados
- Gate pass rate
- E2E critico en device real (ejecutado/no)
- Smoke `8/8` en deploy
- Burn-down deprecations (semanal)
