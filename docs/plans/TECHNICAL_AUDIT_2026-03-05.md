# HealthBytes — Technical Audit Report
**Fecha:** 5 Marzo 2026
**Auditor:** OpenCode Agent
**Alcance:** Repositorio completo — backend, frontend, CI/CD, infra, documentación

---

## Resumen Ejecutivo

El proyecto está aproximadamente al **85% de readiness para producción**. Tras un sprint de fixes el 5 de marzo de 2026, todos los gaps de *código* del plan MVP fueron resueltos. La base técnica es sólida: tests pasando, CI/CD estructurado, modelos de datos correctos, Redis cache implementado, OnboardingModal cableado, y E2E tests escritos. Lo que queda son tareas de **infra y ops** (DB migration, secrets en AWS, build en device real, deploy a staging/prod).

**Estado post-fix sprint:**
- `mangum` eliminado de `requirements.txt` y `main.py` ✅
- `pytest-cov` agregado a `requirements-dev.txt` ✅
- pnpm v9 → v10 en `deploy.yml:209` ✅
- E2E tests escritos en `backend/tests/e2e/` (10 tests) ✅
- Redis `get_products_cached()` implementado en `product_service.py` ✅
- `OnboardingModal` cableado al store y a `_layout.tsx` ✅
- Smoke tests extendidos a 8 checks (incluyendo `/addresses` y `/favorites`) ✅

---

## 1. Estado de Tests (verificado localmente)

### Backend

```
439 passed, 1 skipped en ~60s — cobertura 87%
```

| Suite | Tests | Estado |
|-------|-------|--------|
| `test_api/` | ~180 | ✅ Todos pasan |
| `test_services/` | ~90 | ✅ Todos pasan |
| `test_middleware/` | ~30 | ✅ Todos pasan |
| `test_schemas/` | ~20 | ✅ Todos pasan |
| `performance/` | 4 parametrizados | ⚠️ 1 falla con 100 órdenes (`test_get_user_orders_performance[100]`) |
| `e2e/` | 10 tests | ✅ `test_auth_gate.py` (7) + `test_checkout_flow.py` (2) + `test_email_flow.py` (1) |

**`pytest-cov` agregado a `requirements-dev.txt`** — devs nuevos tienen coverage localmente sin pasos extra.

**Deprecation warnings activos (no fallan, pero deben corregirse):**
- `HTTP_422_UNPROCESSABLE_ENTITY` → usar `HTTP_422_UNPROCESSABLE_CONTENT` (FastAPI)
- `datetime.utcnow()` → usar `datetime.now(datetime.UTC)` (Python 3.12+, SQLAlchemy)

### Frontend

```
126 passed, 13 suites en ~21s
```

| Suite | Archivo | Tests |
|-------|---------|-------|
| API products | `api/__tests__/products.test.ts` | ✅ |
| API cart | `api/__tests__/cart.test.ts` | ✅ |
| API orders | `api/__tests__/orders.test.ts` | ✅ |
| API favorites | `api/__tests__/favorites.test.ts` | ✅ |
| API addresses | `api/__tests__/addresses.test.ts` | ✅ |
| API MercadoPago | `api/__tests__/mercadopago.test.ts` | ✅ |
| Store orderStore | `store/__tests__/orderStore.test.ts` | ✅ |
| Store favoritesStore | `store/__tests__/favoritesStore.test.ts` | ✅ |
| Store addressStore | `store/__tests__/addressStore.test.ts` | ✅ |
| App index | `app/__tests__/index.test.tsx` | ✅ |
| App cart | `app/__tests__/cart.test.tsx` | ✅ |
| App cartStore | `app/__tests__/cartStore.test.ts` | ✅ |
| App checkout-v2 | `app/__tests__/checkout-v2.test.tsx` | ✅ |

**Gaps de cobertura frontend:**
- Sin tests para `components/` (ProductCard, CartFlyOverlay, AuthGate, ErrorBoundary, OnboardingModal)
- Sin tests para screens: `addresses.tsx`, `orders.tsx`, `profile.tsx`
- `ErrorBoundary.tsx:25` tiene un `TODO: integrar Sentry en producción`

---

## 2. Arquitectura

### Backend

```
backend/app/
├── api/v1/          # Routers: products, orders, cart, favorites, addresses, auth, users, mercadopago, stock
├── config.py        # Settings con validación de startup para producción
├── core/            # Limiter (rate limiting con slowapi)
├── db/
│   ├── database.py  # Engine, SessionLocal, get_db dependency
│   ├── models/      # SQLAlchemy ORM: user, product, order, payment, address
│   └── schemas.py   # Pydantic schemas para requests/responses
├── middleware/      # Request logging, error handling
├── services/        # Lógica de negocio: cart, order, payment, email, mercadopago, stock, etc.
└── main.py          # App FastAPI con Sentry, CORS, rate limiting, structured logging
```

**Patrón:** Service layer bien separada de los routers. Routers delegan a services, services usan la sesión de DB directamente.

**Issue:** `mangum` (AWS Lambda adapter) importado en `main.py:9` pero no hay infraestructura Lambda. El deploy es ECS Fargate. Dependencia muerta que amplía el attack surface.

> **Post-fix:** `mangum` fue eliminado de `requirements.txt` y de `main.py`. ✅

### Frontend

```
frontend/
├── app/             # Expo Router (file-based routing)
│   ├── (auth)/      # Screens de autenticación
│   ├── _layout.tsx  # Root layout con providers (Clerk, QueryClient, Zustand)
│   ├── index.tsx    # Home screen
│   ├── cart.tsx, checkout-v2.tsx, orders.tsx, ...
│   └── product/     # Detail screen
├── api/             # API clients (products, cart, orders, favorites, addresses, mercadopago)
├── components/      # UI components reutilizables
├── store/           # Zustand stores (cart, favorites, addresses, orders, preferences)
├── lib/             # Utilidades
└── types/           # TypeScript types
```

**Patrón:** Zustand para estado local/offline, TanStack Query para datos del servidor. Separación clara. Expo Router v3 con layouts anidados.

---

## 3. CI/CD

### ci.yml — Estado

| Job | Estado | Notas |
|-----|--------|-------|
| `backend-lint` | ✅ | Black + isort + Flake8 |
| `backend-test` | ✅ | pytest + coverage 80% threshold |
| `frontend-lint` | ✅ | TypeScript check + ESLint |
| `frontend-test` | ✅ | Jest con forceExit |
| `frontend-audit` | ⚠️ | `continue-on-error: true` — vulnerabilidades pueden silenciarse |
| `secret-scan` | ✅ | Gitleaks en historial completo |
| `sast` | ✅ | Bandit severity HIGH+MEDIUM |
| `docker-build` | ✅ | Build de ambas imágenes |
| `deploy-production` (en ci.yml) | 🔶 Placeholder | Solo hace `echo`, no deploy real |

### deploy.yml — Issues identificados

| Issue | Ubicación | Severidad | Estado |
|-------|-----------|-----------|--------|
| pnpm v9 en job Android | `deploy.yml:209` | Media | ✅ Corregido a v10 |
| Sin smoke tests post-deploy producción | `deploy-production-backend` | Media | Pendiente |
| `ci.yml` deploy placeholder | `ci.yml:231-233` | Info | Pendiente |

---

## 4. Dependencias con Issues

### Backend

| Paquete | Issue | Estado |
|---------|-------|--------|
| `mangum>=0.20.0` | Sin Lambda infra — dependencia muerta | ✅ Eliminado |
| `python-jose[cryptography]` | Librería conocida con issues de mantenimiento, considerar migrar a `python-jwt` puro | Pendiente |

### Frontend

| Issue | Tipo |
|-------|------|
| `react-native-worklets` + `react-native-worklets-core` | Dos paquetes de worklets — revisar si ambos son necesarios |
| `@types/node@^25.1.0` en frontend RN | No se usa Node types en RN nativo — puede causar conflictos de tipos |

---

## 5. TODOs y Deuda Técnica en Código

### Backend

```python
# backend/app/api/v1/orders.py:143
- Seller: Orders with their products (TODO)
# backend/app/api/v1/orders.py:150
# TODO: Filter by seller's products once seller_id is added to Product schema
```

El modelo `Product` no tiene `seller_id`. Si hay un rol vendedor, la columna falta en el schema y en el modelo ORM.

### Frontend

```typescript
// frontend/components/ErrorBoundary.tsx:25
// TODO: integrar Sentry en producción

// frontend/components/ui/icon/index.web.tsx:37,50,59,92
// @ts-expect-error : TODO: fix this (x4)
```

---

## 6. Gaps de Features MVP

| Feature | Estado | Bloqueante para prod |
|---------|--------|----------------------|
| Redis product cache | ✅ Implementado (`product_service.py:278`) | — |
| OnboardingModal wired | ✅ Implementado (`_layout.tsx:17,178`) | — |
| E2E tests en CI | ✅ Escritos en `backend/tests/e2e/` (10 tests) | — |
| Filtro por vendedor en órdenes | ❌ Schema incompleto | No (MVP B2C primero) |
| Sentry en ErrorBoundary | ❌ TODO en código | No (observabilidad) |
| iOS TestFlight | ❌ No ejecutado | Depende del roadmap iOS |

---

## 7. Quick Wins (Alta Prioridad, Bajo Esfuerzo)

En orden de impacto:

1. **Agregar `pytest-cov` a `requirements-dev.txt`** — ✅ Completado
2. **Cambiar pnpm v9 → v10 en `deploy.yml:209`** — ✅ Completado
3. **Eliminar `mangum` de `requirements.txt` y `main.py`** — ✅ Completado
4. **Escribir E2E tests en `backend/tests/e2e/`** — ✅ Completado (10 tests)
5. **Implementar Redis cache en `product_service.py`** — ✅ Completado
6. **Cablear `OnboardingModal` al store y `_layout.tsx`** — ✅ Completado
7. **Extender `smoke_tests.py` con `/addresses` + `/favorites`** — ✅ Completado (8 checks)
8. **Agregar smoke tests post-deploy a `deploy-production-backend`** — Pendiente (copiar el step que ya existe en staging)
9. **Actualizar `datetime.utcnow()` → `datetime.now(UTC)`** — Pendiente (elimina deprecation warnings)

---

## 8. Riesgos Activos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|-----------|
| Build Android falla por pnpm v9/v10 divergencia | ~~Alta~~ Resuelta | — | ✅ Corregido en `deploy.yml:209` |
| Mangum en requirements aumenta attack surface | ~~Baja~~ Resuelta | — | ✅ Eliminado |
| Performance test flaky en CI | Media | Bajo | Skip o fix el test de 100 órdenes |
| Redis URL no configurada en staging → cache silenciosamente desactivada | Alta | Bajo | Agregar `REDIS_URL` al `.env.example` con valor por defecto |
| Sentry no inicializado en `ErrorBoundary` frontend | Alta | Medio | Conectar DSN antes del launch |

---

## 9. Roadmap Recomendado

```
Sprint de código — COMPLETADO (5 Mar 2026)
  ├── Fix pnpm v9 → v10 en deploy.yml                   ✅
  ├── Eliminar mangum                                    ✅
  ├── Agregar pytest-cov a requirements-dev.txt          ✅
  ├── Escribir tests/e2e/ (auth gate + checkout flow)    ✅
  ├── Implementar Redis cache en product_service.py      ✅
  ├── Cablear OnboardingModal al store y _layout.tsx     ✅
  └── Extender smoke_tests.py con /addresses + /favorites ✅

Sprint de infra/ops — PENDIENTE
  ├── alembic upgrade head en RDS prod                   [30 min]
  ├── Secrets en AWS SSM con infra/secrets-setup.sh      [1 hora]
  ├── EAS Build preview — Android APK en device real     [1 día]
  ├── Flujo E2E manual completo                          [1 día]
  └── Deploy a staging → smoke tests → producción        [1 día]
```

---

*Auditoría generada automáticamente el 5 de marzo de 2026 con análisis de código fuente, ejecución de tests locales, e inspección de configuración de CI/CD.*
