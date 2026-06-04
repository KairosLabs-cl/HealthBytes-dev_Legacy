# HealthBytes - Estado y Roadmap Centralizado (SSOT)

> **⚠️ FUENTE DE VERDAD ÚNICA (Single Source of Truth)**
> Este documento es la autoridad absoluta sobre el estado, hitos y prioridades del proyecto.
> Última actualización: 2026-05-18

---

## Snapshot Ejecutivo

- **Estado general:** MVP en cierre técnico, foco en release readiness y calidad.
- **Métricas Clave:**
  - **Tests:** 600+ (Backend coverage improved, Frontend High).
  - **Calidad:** 14+ PRs abiertos.
- **Riesgo principal:** Ninguno crítico (Cleanup y Hardening completados).

## Hitos Principales

| Milestone | Target | Estado | Progreso |
| --- | --- | --- | --- |
| MVP Launch | Abril 2026 | En progreso | 95% |
| Payment Integration | Febrero 2026 | Completado | 100% |
| App Store Release | Mayo 2026 | Planeado | 0% |
| 100 Beta Users | Abril 2026 | Planeado | 0% |

## Estado por Prioridad

### P0 - Completado (base MVP)

- Integración de pagos (Mercado Pago) en backend.
- Checkout frontend completo.
- CRUD de direcciones y selección en checkout.
- Webhooks de pago y confirmación.
- Gestión de stock con enfoque atómico.
- Docker, CI/CD y scripts base de infraestructura.
- Hardening de seguridad completo (Refresh Tokens, Redis Auth, CI Gating).
- Unificación de IA y Limpieza de Repositorio.

### P1 - Pendiente (Abril 2026)

- Push notifications de órdenes.
- Recomendaciones básicas.
- Reviews y ratings (MVP ligero).
- Deep linking.

### P2 - Pendiente (Mayo 2026)

- Dark mode.
- Auditoría de accesibilidad.
- Optimizaciones de performance.
- Offline mode básico.
- Image CDN.

## Identidad y Stack Técnico

| Componente | Tecnología |
|-----------|-------------|
| **Frontend** | React Native / Expo SDK 54 |
| **Backend** | FastAPI + Python 3.13 |
| **Database** | PostgreSQL 16 |
| **Auth** | Clerk + JWT |
| **Payments** | MercadoPago |
| **Email** | Resend |

## Archivos Clave de Referencia

| Documento | Ubicación |
|-----------|-----------|
| **Arquitectura** | `docs/architecture/architecture.md` |
| **Review Técnica** | `docs/architecture/HealthBytes_Architecture_Review.md` |
| **Setup** | `docs/development/setup/` |
| **Features** | `docs/product/features/` |

## Decisión de Gobernanza Documental

Desde esta fecha:

- Este archivo centraliza estado y roadmap.
- Los demás documentos DEBEN referenciar este archivo para estado global.
- Si existe discrepancia con documentos históricos (como `docs/STATE.md`), prevalece este archivo.

## Protocolo de Actualización (Semanal)

1. Revisa los commits y PRs cerrados en la última semana.
2. Actualiza los porcentajes de progreso y métricas de tests/PRs.
3. Mueve los items completados de las listas de pendientes (P1/P2) a P0.
4. Actualiza la fecha de "Última actualización".
5. Reporta nuevos riesgos operativos en el "Snapshot Ejecutivo".
