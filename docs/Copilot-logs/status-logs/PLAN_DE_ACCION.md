# 🗺️ PLAN DE ACCIÓN - HealthBytes

**Última actualización:** 21 Enero 2026  
**Horizonte:** 6 semanas (MVP Completo)  
**Owner:** @nojustbenja

---

## 📊 RESUMEN DE SPRINTS

```
┌─────────────────────────────────────────────────────────────┐
│                    ROADMAP VISUAL                           │
├─────────────────────────────────────────────────────────────┤
│  Sprint 1 (21-27 Ene)   🔴 BLOCKER: Fix Tests              │
│  ████░░░░░░░░░░░░░░░░   Arreglar tests rotos               │
│                         Refactor orders router              │
├─────────────────────────────────────────────────────────────┤
│  Sprint 2 (28 Ene-3 Feb) 🟡 CORE: Filtros                  │
│  ░░░░████░░░░░░░░░░░░   Filtros productos                  │
│                         Persistencia carrito                │
├─────────────────────────────────────────────────────────────┤
│  Sprint 3 (4-17 Feb)    🟡 REVENUE: Checkout               │
│  ░░░░░░░░████████░░░░   Stripe integration                 │
│                         Formulario envío                    │
├─────────────────────────────────────────────────────────────┤
│  Sprint 4 (18-28 Feb)   🟢 QUALITY: Polish                 │
│  ░░░░░░░░░░░░░░░░████   CI/CD                              │
│                         Coverage 70%                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔴 SPRINT 1: DESBLOQUEADOR (21-27 Enero)

**Meta:** Tests verdes, arquitectura limpia

### Tareas

| # | Tarea | Esfuerzo | Dependencia | Asignado |
|---|-------|----------|-------------|----------|
| 1.1 | **Fix fixtures tests** | 2h | - | - |
| | - Cambiar `password_hash` → `password` en fixtures | | | |
| | - Truncar passwords a 72 bytes (bcrypt limit) | | | |
| | - Agregar `rollback()` a MockAsyncSession | | | |
| 1.2 | **Fix async tests** | 2h | 1.1 | - |
| | - Convertir fixtures async a sync | | | |
| | - O usar `pytest-asyncio` correctamente | | | |
| 1.3 | **Refactor orders router** | 4h | 1.2 | - |
| | - Mover lógica a `order_service.create_order()` | | | |
| | - Router solo: parse → call service → return | | | |
| | - Tests para order_service | | | |
| 1.4 | **Refactor auth/users routers** | 3h | 1.3 | - |
| | - Mismo patrón: delegar a services | | | |

### Criterios de Éxito

```
✅ pytest: 0 failed, 0 errors
✅ Coverage: ≥50%
✅ Routers sin lógica de negocio
```

### Archivos a Modificar

```
backend/tests/conftest.py                    # MockAsyncSession.rollback()
backend/tests/test_services/test_auth_service.py    # passwords < 72 bytes
backend/tests/test_services/test_user_service.py    # password → password
backend/tests/test_services/test_order_service.py   # fixtures sync
backend/tests/test_api/test_orders_validation.py    # fixtures sync
backend/app/api/v1/orders.py                 # delegar a service
backend/app/api/v1/auth.py                   # delegar a service
backend/app/api/v1/users.py                  # delegar a service
```

---

## 🟡 SPRINT 2: CORE FEATURES (28 Ene - 3 Feb)

**Meta:** Filtros funcionales, carrito persistente

### Tareas

| # | Tarea | Esfuerzo | Dependencia | Asignado |
|---|-------|----------|-------------|----------|
| 2.1 | **Extender Product model** | 3h | Sprint 1 | - |
| | - Agregar `allergens: List[str]` | | | |
| | - Agregar `dietary_tags: List[str]` | | | |
| | - Agregar `ingredients: str` | | | |
| | - Agregar `created_at`, `updated_at` | | | |
| 2.2 | **Migración Alembic** | 2h | 2.1 | - |
| | - `alembic revision --autogenerate` | | | |
| | - Verificar migration file | | | |
| | - `alembic upgrade head` | | | |
| 2.3 | **Endpoints con filtros** | 4h | 2.2 | - |
| | - `GET /products?allergen=gluten` | | | |
| | - `GET /products?dietary=sin_gluten,vegano` | | | |
| | - `GET /products?search=quinoa` | | | |
| | - Paginación: `?skip=0&limit=20` | | | |
| 2.4 | **Frontend QuickFilters** | 4h | 2.3 | - |
| | - Conectar UI existente con API | | | |
| | - Actualizar `listProducts()` en api/products.ts | | | |
| 2.5 | **Persistencia carrito** | 3h | Sprint 1 | - |
| | - AsyncStorage save on change | | | |
| | - Load on app start (_layout.tsx) | | | |
| | - Sync con cartStore | | | |

### Criterios de Éxito

```
✅ GET /products acepta query params
✅ QuickFilters filtra productos visualmente
✅ Carrito persiste al cerrar/abrir app
✅ Coverage: ≥55%
```

### Archivos a Modificar

```
backend/app/db/schemas.py                # Product model
backend/migrations/versions/xxx.py       # Nueva migración
backend/app/api/v1/products.py           # Query params
backend/app/services/product_service.py  # Filter logic
frontend/components/QuickFilters.tsx     # Connect to API
frontend/api/products.ts                 # Query params
frontend/store/cartStore.ts              # AsyncStorage
frontend/app/_layout.tsx                 # Load cart on start
```

---

## 🟡 SPRINT 3: REVENUE (4-17 Feb)

**Meta:** Checkout completo, pagos funcionando

### Tareas

| # | Tarea | Esfuerzo | Dependencia | Asignado |
|---|-------|----------|-------------|----------|
| 3.1 | **Formulario envío** | 4h | Sprint 2 | - |
| | - Campos: nombre, dirección, teléfono | | | |
| | - Validación con Pydantic/Zod | | | |
| | - Guardar en Order o User | | | |
| 3.2 | **Stripe PaymentIntent** | 6h | 3.1 | - |
| | - Habilitar endpoints en stripe.py | | | |
| | - Crear PaymentIntent desde backend | | | |
| | - Pasar client_secret a frontend | | | |
| 3.3 | **Stripe Elements (frontend)** | 6h | 3.2 | - |
| | - `@stripe/stripe-react-native` | | | |
| | - CardField component | | | |
| | - confirmPayment flow | | | |
| 3.4 | **Webhook handling** | 4h | 3.3 | - |
| | - Endpoint POST /stripe/webhook | | | |
| | - Verificar firma | | | |
| | - Actualizar Order status | | | |
| 3.5 | **Confirmación visual** | 3h | 3.4 | - |
| | - Pantalla éxito | | | |
| | - Limpiar carrito | | | |
| | - Email confirmación (opcional) | | | |

### Criterios de Éxito

```
✅ Usuario puede pagar con tarjeta de prueba
✅ Order se actualiza a "paid" después de pago
✅ Carrito se limpia después de checkout exitoso
✅ Coverage: ≥60%
```

---

## 🟢 SPRINT 4: QUALITY & DEPLOY (18-28 Feb)

**Meta:** CI/CD, cobertura 70%, listo para producción

### Tareas

| # | Tarea | Esfuerzo | Dependencia | Asignado |
|---|-------|----------|-------------|----------|
| 4.1 | **GitHub Actions CI** | 4h | Sprint 3 | - |
| | - pytest + coverage report | | | |
| | - TypeScript type-check | | | |
| | - Lint (ruff/eslint) | | | |
| 4.2 | **Aumentar coverage** | 8h | 4.1 | - |
| | - Tests para middleware/auth.py | | | |
| | - Tests para api/v1/orders.py | | | |
| | - Tests para Stripe flow | | | |
| 4.3 | **Seguridad hardening** | 4h | 4.2 | - |
| | - Eliminar decode sin firma en dev | | | |
| | - Rate limiting (slowapi) | | | |
| | - Audit de dependencias | | | |
| 4.4 | **Docker productivo** | 4h | 4.3 | - |
| | - Dockerfile backend | | | |
| | - docker-compose.prod.yml | | | |
| | - Health checks | | | |

### Criterios de Éxito

```
✅ CI verde en cada PR
✅ Coverage: ≥70%
✅ No vulnerabilidades críticas
✅ App deployable con docker-compose up
```

---

## 📅 CALENDARIO VISUAL

```
Enero 2026
Lu Ma Mi Ju Vi Sa Do
      21 22 23 24 25    ← Sprint 1: Fix Tests
26 27 28 29 30 31       ← Sprint 1 → Sprint 2

Febrero 2026
Lu Ma Mi Ju Vi Sa Do
                  1     ← Sprint 2: Filtros
 2  3  4  5  6  7  8    ← Sprint 2 → Sprint 3
 9 10 11 12 13 14 15    ← Sprint 3: Checkout
16 17 18 19 20 21 22    ← Sprint 3 → Sprint 4
23 24 25 26 27 28       ← Sprint 4: Polish

Marzo 2026
Lu Ma Mi Ju Vi Sa Do
                  1     🚀 MVP RELEASE
```

---

## ⚠️ RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Stripe approval demora | Media | Alto | Tener mock de pagos listo |
| Tests siguen fallando | Alta | Alto | Dedicar Sprint 1 completo |
| Alembic rompe DB | Baja | Alto | Backup antes de migrar |
| Clerk JWKS inestable | Baja | Medio | Mantener JWT fallback |

---

## 📊 DEPENDENCIAS ENTRE TAREAS

```
Sprint 1 ─────────────────────────────────────────┐
   │                                              │
   ├── 1.1 Fix fixtures ──┐                       │
   │                      │                       │
   ├── 1.2 Fix async ─────┼── 1.3 Orders ──┐      │
   │                      │                │      │
   └── 1.4 Auth/Users ────┘                │      │
                                           │      │
Sprint 2 ◄─────────────────────────────────┘      │
   │                                              │
   ├── 2.1 Product model ── 2.2 Alembic ─┐        │
   │                                     │        │
   ├── 2.3 Endpoints ◄───────────────────┤        │
   │                                     │        │
   ├── 2.4 QuickFilters ◄────────────────┘        │
   │                                              │
   └── 2.5 Cart persist (paralelo)                │
                                                  │
Sprint 3 ◄────────────────────────────────────────┘
   │
   ├── 3.1 Form envío ── 3.2 Stripe ── 3.3 Frontend
   │                                       │
   └── 3.4 Webhook ◄───────────────────────┘
           │
           └── 3.5 Confirmación

Sprint 4 ◄──────────────────────────────────────────
   │
   ├── 4.1 CI ── 4.2 Coverage ── 4.3 Security ── 4.4 Docker
```

---

## ✅ DEFINITION OF DONE (DoD)

Cada tarea se considera completa cuando:

- [ ] Código implementado y funcional
- [ ] Tests escritos y pasando
- [ ] Sin errores de TypeScript/Lint
- [ ] Documentación actualizada (si aplica)
- [ ] Code review aprobado (si hay reviewer)
- [ ] Mergeado a branch principal

---

## 📞 REFERENCIAS

| Documento | Propósito |
|-----------|-----------|
| [ESTADO.md](ESTADO.md) | Estado actual detallado |
| [ARQUITECTURA.md](ARQUITECTURA.md) | Estructura técnica |
| [.cursorrules](../../../.cursorrules) | Reglas de desarrollo |

---

**Próxima revisión:** 28 Enero 2026  
**Milestone:** Sprint 1 completado
