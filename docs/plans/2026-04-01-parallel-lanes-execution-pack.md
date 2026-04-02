# HealthBytes - Parallel Lanes Execution Pack (P0/P1/P2)

Fecha: 2026-04-01
Origen: ejecucion de 3 subagentes en paralelo por prioridad.

---

## Estado inicial recomendado por lane

- P0: ROJO
- P1: AMARILLO
- P2: AMARILLO (scorecard en ROJO hasta institucionalizarse)

---

## Lane P0 (7 dias) - Seguridad y release readiness

### Sprint board (resumen)

| # | Tarea | Owner | Duracion | Dependencia | Evidencia |
|---|---|---|---|---|---|
| 1 | War room P0 + freeze de scope | Product | 0.5 dia | - | Acta y RACI firmado |
| 2 | Inventario total de secretos | Security | 0.5 dia | 1 | Inventario versionado |
| 3 | Rotacion y revocacion de credenciales | Security + DevOps | 1 dia | 2 | Logs por proveedor + SSM actualizado |
| 4 | Verificacion config prod segura | DevOps | 0.5 dia | 3 | Validaciones SSM/startup |
| 5 | Limpieza historial git (secretos) | DevOps + Security | 1 dia | 3 | Runbook, force-push controlado |
| 6 | Re-scan post saneamiento | Security + QA | 0.5 dia | 5 | Gitleaks/CI/Bandit/Audit limpios |
| 7 | Validacion DB/infra readiness | DevOps | 0.5 dia | 4 | Alembic + RDS checks |
| 8 | EAS preview builds + device real | DevOps + QA | 0.5 dia | 4 | IDs de build + evidencia instalacion |
| 9 | E2E real compra completa | QA | 1 dia | 8 | Evidencia funcional completa |
| 10 | Smoke post-deploy (8/8) + rollback | DevOps + QA | 0.5 dia | 9 | Salida 8/8 y validacion rollback |
| 11 | Cierre y go/no-go firmado | Product + Security + DevOps + QA | 0.5 dia | 6,7,10 | Checklist firmado |

### Top bloqueos esperados

- Secretos no inventariados reaparecen tras rotacion.
- Impacto operativo por saneamiento de historial y force-push.
- Permisos IAM/SSM incompletos para entorno prod.
- Falla E2E en device real por config de build.
- Smoke < 8/8 tras deploy.

### Validaciones criticas

- `aws ssm get-parameters-by-path --path /healthbytes/prod --region us-east-1 --query 'Parameters[*].Name'`
- `alembic upgrade head`
- `psql $PROD_DATABASE_URL -c "SELECT version();"`
- `gitleaks git --redact --verbose`
- `cd backend && bandit -r app/ -ll`
- `cd frontend && pnpm audit --prod`
- `eas build --platform android --profile preview`
- `eas build --platform ios --profile preview`
- `python backend/scripts/smoke_tests.py https://api.healthbytes.cl`

---

## Lane P1 (14 dias) - Estabilizacion de roadmap

### Hitos dia a dia (resumen)

- D1-D4: fuente unica de verdad (estado/roadmap) con gobernanza.
- D5-D7: contrato e integracion addresses + checkout (flujo feliz).
- D8-D10: casos borde + hardening + evidencia en device real.
- D11-D13: gate formal de release + dry run + cierre de gaps.
- D14: go/no-go y firma de cierre P1.

### DoD por objetivo

- Fuente unica: un documento/tablero canonico activo, referencias secundarias alineadas, KPI semanales activos.
- Addresses + checkout: CRUD + seleccion default + auth/no-auth + pending/success/failure validados, sin bloqueadores criticos.
- Gate release: security + E2E + smoke 8/8 + aprobacion manual, con evidencia centralizada.

### Dependencias clave

- P0 de seguridad impacta cierre real de gate P1.
- Backend estable desbloquea integracion FE y QA de casos borde.
- DevOps habilita evidencia y ejecucion de gate/smoke para decision final.

---

## Lane P2 (30 dias) - Mejora continua

### Plan por semanas

- Semana 1: baseline de deprecations + scorecard unico + politica resolver/diferir.
- Semana 2: quick wins (30-40%) + scorecard v1.
- Semana 3: consolidacion (60-70%) + alertas por desviacion.
- Semana 4: cierre de ciclo + backlog remanente con fecha.

### Ritual semanal

- Reunion fija 60 min: semaforo, deprecations, scorecard roadmap, decisiones, compromisos.
- Artefactos: scorecard semanal, backlog priorizado, log de decisiones, evidencia QA/DevOps.

### KPI y metas

- Burn-down deprecations: >=15% semanal (S2-S4).
- Scorecard publicado en fecha: 4/4 semanas.
- Lead time remediacion: mediana <= 7 dias.
- Aging: 0 items > 21 dias sin decision.
- Regresiones criticas por remediacion: 0.

---

## Referencias

- `docs/plans/2026-04-01-operacion-agentes-paralelos-p0-p1-p2.md`
- `docs/plans/2026-04-01-estado-roadmap-prioridades.md`
- `docs/plans/PRODUCTION_CHECKLIST.md`
- `docs/development/UIUX_ROADMAP.md`
