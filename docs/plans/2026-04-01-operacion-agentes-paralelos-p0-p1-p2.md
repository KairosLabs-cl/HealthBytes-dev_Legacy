# HealthBytes - Operacion con agentes paralelos (P0/P1/P2)

Fecha: 2026-04-01
Objetivo: paralelizar ejecucion por prioridad con roles expertos y uso de skills.

---

## 1) Diseno de lanes y responsables

### Lane P0 - Seguridad y release readiness (7 dias)

- Enfoque: riesgo critico y bloqueo de produccion
- Roles: Security, DevOps, QA, Product
- Objetivos:
  - Rotacion total de secretos
  - Limpieza de historial git por secretos historicos
  - Checklist de produccion con evidencia centralizada
  - E2E real en dispositivo
  - Smoke post-deploy (8/8)

### Lane P1 - Estabilizacion de roadmap (14 dias)

- Enfoque: cierre funcional y disciplina operativa de release
- Roles: Product, Frontend, Backend, QA, DevOps, Tech Lead
- Objetivos:
  - Fuente unica de verdad para estado/roadmap
  - Cierre end-to-end addresses + checkout con casos borde
  - Gate formal de release (security + E2E + smoke)

### Lane P2 - Mejora continua (30 dias)

- Enfoque: sostenibilidad tecnica y gobernanza semanal
- Roles: Backend, QA, Product, DevOps
- Objetivos:
  - Limpieza de deprecations no bloqueantes
  - Scorecard semanal unico del roadmap

---

## 2) Skills recomendadas por lane

### P0

- writing-plans
- verification-before-completion
- systematic-debugging
- dispatching-parallel-agents
- requesting-code-review
- finishing-a-development-branch

### P1

- writing-plans
- test-driven-development
- error-handling-patterns
- native-data-fetching
- react-native-best-practices
- expo-cicd-workflows
- verification-before-completion

### P2

- systematic-debugging
- test-driven-development
- verification-before-completion
- nodejs-best-practices
- react-native-best-practices
- upgrading-expo
- dispatching-parallel-agents

---

## 3) Prompts base para subagentes (reutilizable)

### Prompt base - P0

"Eres especialista en seguridad y operaciones de release. Trabaja SOLO la lane P0 de HealthBytes. No escribir codigo sin evidencia. Entrega: plan diario 7 dias, checklist por rol (Security/DevOps/QA/Product), riesgos, mitigaciones, KPI de cierre, dependencias, y skills recomendadas por paso."

### Prompt base - P1

"Eres especialista en producto+ingenieria. Trabaja SOLO lane P1 de HealthBytes. Entrega: plan 14 dias con hitos, matriz owner/dependencia, criterios de aceptacion para addresses+checkout y release gate, riesgos, mitigaciones, skills por hito."

### Prompt base - P2

"Eres especialista en mejora continua. Trabaja SOLO lane P2 de HealthBytes. Entrega: plan 30 dias por semanas, operativa semanal (ritual y artefactos), KPI de tendencia, riesgos y skills recomendadas."

---

## 4) Protocolo operativo semanal

1. Lanzar 3 subagentes en paralelo (P0, P1, P2).
2. Consolidar resultados en tablero unico con semaforo por lane.
3. Resolver conflictos de dependencia (P0 bloquea release; P1 y P2 no deben comprometer P0).
4. Ejecutar verificacion de evidencia antes de marcar un item como "cerrado".
5. Publicar corte semanal con:
   - Estado por lane
   - Top bloqueos
   - Decisiones tomadas
   - Cambios de prioridad

---

## 5) Definicion de listo (DoD) por lane

### P0 DoD

- Secretos rotados y revocados
- Historial saneado y escaneo sin hallazgos criticos
- E2E real exitoso en dispositivo
- Smoke 8/8 exitoso
- Evidencia consolidada y firmada por roles

### P1 DoD

- Documento canonico de estado/roadmap activo
- Addresses + checkout con casos borde validados
- Gate formal de release habilitado y probado

### P2 DoD

- Tendencia de deprecations a la baja vs baseline
- Scorecard semanal sostenido sin atrasos
- Politica de deuda ligera definida (resolver/diferir con fecha)

---

## 6) Referencias

- `docs/plans/2026-04-01-estado-roadmap-prioridades.md`
- `docs/plans/PRODUCTION_CHECKLIST.md`
- `docs/development/UIUX_ROADMAP.md`
