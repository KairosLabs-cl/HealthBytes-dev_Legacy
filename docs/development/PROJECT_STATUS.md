# HealthBytes - Estado y Roadmap Centralizado

> Ultima actualizacion: 2026-04-06
> Fuente de verdad unica para estado del proyecto, hitos y prioridades.

---

## Snapshot Ejecutivo

- Estado general: MVP en cierre tecnico, foco en release readiness.
- Bloqueadores core MVP: resueltos en su mayoria.
- Riesgo principal actual: divergencia documental entre archivos historicos.

## Hitos Principales

| Milestone | Target | Estado | Progreso |
| --- | --- | --- | --- |
| MVP Launch | Abril 2026 | En progreso | 90% |
| Payment Integration | Febrero 2026 | Completado | 100% |
| App Store Release | Mayo 2026 | Planeado | 0% |
| 100 Beta Users | Abril 2026 | Planeado | 0% |

## Estado por Prioridad

### P0 - Completado (base MVP)

- Integracion de pagos (Mercado Pago) en backend.
- Checkout frontend completo.
- CRUD de direcciones y seleccion en checkout.
- Webhooks de pago y confirmacion.
- Gestion de stock con enfoque atomico.
- Docker, CI/CD y scripts base de infraestructura.

### P1 - Pendiente (Abril 2026)

- Push notifications de ordenes.
- Recomendaciones basicas.
- Reviews y ratings (MVP ligero).
- Deep linking.

### P2 - Pendiente (Mayo 2026)

- Dark mode.
- Auditoria de accesibilidad.
- Optimizaciones de performance.
- Offline mode basico.
- Image CDN.

## Decision de Gobernanza Documental

Desde esta fecha:

- Este archivo centraliza estado y roadmap.
- Los demas documentos deben referenciar este archivo para estado global.
- Si existe discrepancia con documentos historicos, prevalece este archivo.

## Responsables Actuales

- Portal de pagos: Owner de negocio/equipo (manual).
- Centralizacion documental: Copilot + mantenimiento continuo del equipo.

## Proxima Revision

- Frecuencia sugerida: semanal (cada lunes).
- Trigger inmediato: cierre de feature P1 o cambio de riesgo operativo.

## How to update (Protocolo Semanal)

1. Revisa los commits y PRs cerrados en la ultima semana.
2. Actualiza los porcentajes de progreso en la seccion "Hitos Principales".
3. Mueve los items completados de las listas de pendientes (P1/P2) a la lista de completados (P0).
4. Actualiza la fecha de "Ultima actualizacion" al inicio del documento.
5. Si hay nuevos riesgos operativos, agregalos al "Snapshot Ejecutivo".
