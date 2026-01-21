# 📊 ESTADO ACTUAL DEL PROYECTO - HealthBytes

**Última actualización:** 21 Enero 2026  
**Branch activo:** `refactor/create-services-layer`  
**Status:** MVP Funcional con Deuda Técnica en Testing

---

## 🎯 SCORECARD VISUAL

```
┌─────────────────────────────────────────────────────────────┐
│            SCORECARD - ESTADO DEL PROYECTO                  │
├─────────────────────────────────────────────────────────────┤
│  Seguridad            ████████░░  80%  ✅ Precios validados │
│  Funcionalidad        █████░░░░░  50%  ⏳ Filtros pending   │
│  Testing              ██░░░░░░░░  18%  🔴 18 FAILED         │
│  Arquitectura         ███████░░░  70%  ⏳ Routers pendientes│
│  Documentación        ████████░░  80%  ✅ AI-READMEs listos │
│  DevOps               ███░░░░░░░  30%  ⏳ Sin CI/CD         │
│                                                             │
│  OVERALL:             █████░░░░░  50%  🟡 MVP con Issues    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 TESTING - ESTADO CRÍTICO

### Resultados Última Ejecución (21/01/2026)

```
pytest -v --tb=no
═══════════════════════════════════════════════════════════════
   57 collected │ 25 passed │ 18 failed │ 14 errors
   Coverage: 45% (871 statements, 483 missed)
═══════════════════════════════════════════════════════════════
```

### Desglose de Fallos

| Categoría | # | Causa Raíz |
|-----------|---|------------|
| **Auth Service** | 10 | `password > 72 bytes` (bcrypt limit) |
| **User Service** | 7 | `password_hash` invalid keyword (campo es `password`) |
| **Order Service** | 1 | `get_order()` falta argumento `user_id` |
| **API Auth** | 1 | `MockAsyncSession.rollback()` no implementado |
| **Validation Tests** | 4 | Fixtures async no soportadas en pytest sync |

### Archivos con 0% Coverage

```
app/core/exceptions.py          0%   (25 líneas sin cubrir)
app/db/models/order.py          0%   (46 líneas)
app/db/models/product.py        0%   (31 líneas)
app/db/models/user.py           0%   (46 líneas)
```

### Archivos Críticos con Coverage Bajo

| Archivo | Coverage | Líneas Sin Cubrir |
|---------|----------|-------------------|
| `api/v1/orders.py` | 18% | 25-102, 120-283 |
| `middleware/auth.py` | 25% | 23-155, 169-197 |
| `services/order_service.py` | 28% | 38-214 |
| `main.py` | 29% | 42-121 |

---

## ✅ IMPLEMENTACIONES CONFIRMADAS

### Backend - Estructura

| Componente | Estado | Archivos |
|------------|--------|----------|
| **Routers (api/v1/)** | ✅ 5/5 | `auth.py`, `products.py`, `orders.py`, `users.py`, `stripe.py` |
| **Services** | ✅ 4/4 | `product_service.py`, `order_service.py`, `auth_service.py`, `user_service.py` |
| **Schemas** | ✅ 4/4 | `product.py`, `order.py`, `user.py` + `db/schemas.py` |
| **Models (ORM)** | ✅ 4/4 | `Product`, `User`, `Order`, `OrderItem` |
| **Middleware** | ✅ | Clerk + JWT fallback |

### Backend - Seguridad

| Feature | Estado | Detalle |
|---------|--------|---------|
| Validación precios | ✅ | Orders usa `product.price` de DB |
| Clerk JWKS | ✅ | RS256 verificación |
| JWT Legacy | ✅ | HS256 fallback 30d |
| Password hash | ✅ | bcrypt en auth_service |
| Ownership check | ⚠️ | Implementado en orders, falta en users |

### Frontend - Estructura

| Componente | Estado | Archivos |
|------------|--------|----------|
| **Screens** | ✅ 5/5 | `index`, `cart`, `checkout`, `(auth)/login`, `product/[id]` |
| **API Clients** | ✅ 3/3 | `products.ts`, `orders.ts`, `auth.ts` |
| **Stores** | ✅ 3/3 | `cartStore`, `authStore`, `recentlyViewedStore` |
| **Components** | ✅ 6 | `ProductListItem`, `Header`, `QuickFilters`, `FavoritesBar`, `RecentlyViewedBar`, `SectionHeader` |

---

## 🔴 PROBLEMAS ACTIVOS

### P1 - Tests Rotos (CRÍTICO)

**Problema:** 18 tests fallando + 14 errores
**Impacto:** No se puede confiar en CI, cambios pueden romper producción
**Causa raíz:**
1. Fixtures usan `password_hash` pero modelo User tiene `password`
2. Mock bcrypt con passwords > 72 bytes
3. Fixtures async en tests sync
4. MockAsyncSession incompleto

**Archivos afectados:**
- `tests/test_services/test_auth_service.py`
- `tests/test_services/test_user_service.py`
- `tests/test_services/test_order_service.py`
- `tests/test_api/test_orders_validation.py`
- `tests/conftest.py`

### P2 - Lógica en Routers

**Problema:** `orders.py` tiene 100+ líneas de lógica de negocio
**Impacto:** Duplicación, difícil de testear
**Solución:** Mover a `order_service.py` (ya existe pero no se usa en router)

```python
# ❌ Actual: orders.py líneas 24-102 tienen queries directas
@router.post("/")
async def create_order(...):
    # 80 líneas de lógica aquí

# ✅ Debería ser:
@router.post("/")
async def create_order(...):
    return await order_service.create_order(db, user_id, order_data)
```

### P3 - QuickFilters No Funcional

**Problema:** Componente UI existe pero backend no soporta filtros
**Impacto:** UX degradada, usuarios no pueden filtrar por alergenos
**Archivos:**
- `frontend/components/QuickFilters.tsx` - UI existe
- `backend/app/api/v1/products.py` - Falta `?allergen=`, `?dietary=`
- `backend/app/db/schemas.py` - Product model sin campos de filtros

---

## 📈 COMMITS RECIENTES (Última Semana)

```
21/01  .cursorrules actualizado (docs canónicos)     [Local]
20/01  docs: add credentials section                 08aa2f0
20/01  feat: price validation tests                  a427173 ⭐
20/01  chore: update dependencies                    b14eb8b
19/01  feat: AI guidelines document                  887d5ad
19/01  feat: AI-README files (backend/frontend)      eab315e
18/01  Merge: Clerk integration complete             24a2ab7
```

---

## 🏗️ ARQUITECTURA ACTUAL

### Capas Backend

```
┌─────────────────────────────────────────────────────────────┐
│                      ROUTERS (api/v1/)                      │
│  ⚠️ auth.py, orders.py, users.py tienen lógica interna    │
│  ✅ products.py delegada correctamente a service           │
├─────────────────────────────────────────────────────────────┤
│                     SERVICES (services/)                    │
│  ✅ product_service.py - 100% coverage                     │
│  ⚠️ order_service.py - existe pero no usado en router     │
│  ⚠️ auth_service.py - 71% coverage                        │
│  ⚠️ user_service.py - 67% coverage                        │
├─────────────────────────────────────────────────────────────┤
│                     SCHEMAS (schemas/)                      │
│  ✅ Pydantic v2 con Field() constraints                    │
├─────────────────────────────────────────────────────────────┤
│                   MODELS (db/schemas.py)                    │
│  Product, User, Order, OrderItem                           │
│  ⚠️ Falta: allergens, dietary_tags, ingredients           │
└─────────────────────────────────────────────────────────────┘
```

### Product Model (Actual vs Requerido)

```python
# ACTUAL (db/schemas.py)
class Product(Base):
    id, name, description, image, price

# REQUERIDO (para filtros)
class Product(Base):
    id, name, description, image, price,
    + allergens: List[str]      # ["gluten", "lactosa", "frutos_secos"]
    + dietary_tags: List[str]   # ["sin_gluten", "vegano", "keto"]
    + ingredients: str          # Texto libre
    + created_at, updated_at    # Timestamps
```

---

## 📊 MÉTRICAS OBJETIVO vs ACTUAL

| Métrica | Actual | Objetivo | Gap | Prioridad |
|---------|--------|----------|-----|-----------|
| **Test Coverage** | 45% | 70% | 25% | 🔴 P1 |
| **Tests Passing** | 44% | 100% | 56% | 🔴 P1 |
| **Endpoints** | 14/14 | 16/16 | 2 | 🟡 P2 |
| **Services Used** | 1/4 | 4/4 | 3 | 🟡 P2 |
| **Filtros** | 0/3 | 3/3 | 3 | 🟡 P2 |
| **Carrito Persist** | No | Sí | - | 🟡 P2 |

---

## ✅ CHECKLIST PRÓXIMOS PASOS

### INMEDIATO (Esta Semana)

- [ ] **Fix Tests Rotos**
  - [ ] Corregir fixtures: `password_hash` → `password`
  - [ ] Truncar passwords a 72 bytes en tests
  - [ ] Agregar `rollback()` a MockAsyncSession
  - [ ] Convertir fixtures async a sync o usar pytest-asyncio correctamente

- [ ] **Refactor Orders Router**
  - [ ] Mover lógica de `create_order` a `order_service`
  - [ ] Router solo: parse request → call service → return response

### SEMANA 2

- [ ] **Filtros de Productos**
  - [ ] Extender Product model
  - [ ] Migración DB (Alembic)
  - [ ] Endpoints con query params

- [ ] **Persistencia Carrito**
  - [ ] AsyncStorage integration
  - [ ] Load on app start

### SEMANA 3+

- [ ] Checkout completo (Stripe)
- [ ] CI/CD (GitHub Actions)
- [ ] Coverage ≥70%

---

## 💡 NOTAS TÉCNICAS

### Inconsistencias Detectadas

1. **Modelo User:**
   - `db/schemas.py` define `password` (correcto)
   - Tests usan `password_hash` (incorrecto)

2. **Order Service:**
   - `order_service.py` tiene `create_order` bien implementado
   - `api/v1/orders.py` reimplementa la lógica en el router (duplicado)

3. **Timestamps:**
   - Order tiene `created_at`
   - Product y User no tienen timestamps

4. **Async Testing:**
   - `conftest.py` usa SQLite sync
   - Tests de validación usan `@pytest.mark.asyncio` con fixtures sync

---

## 📞 REFERENCIAS

| Documento | Propósito |
|-----------|-----------|
| [ARQUITECTURA.md](ARQUITECTURA.md) | Diagramas técnicos y endpoints |
| [PLAN_DE_ACCION.md](PLAN_DE_ACCION.md) | Roadmap y sprints |
| [.cursorrules](../../../.cursorrules) | Reglas estrictas de desarrollo |
| [backend/AI-README.md](../../../backend/AI-README.md) | Patrones backend |
| [frontend/AI-README.md](../../../frontend/AI-README.md) | Patrones frontend |

---

**Status:** 🟡 MVP Funcional con Deuda Técnica  
**Blocker Principal:** Tests rotos impiden desarrollo seguro  
**Next Review:** 28 Enero 2026  
**Owner:** @nojustbenja
