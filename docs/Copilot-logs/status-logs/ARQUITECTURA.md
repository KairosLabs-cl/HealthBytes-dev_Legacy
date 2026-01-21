# 🏗️ ARQUITECTURA - HealthBytes

**Última actualización:** 21 Enero 2026  
**Propósito:** Documentar estructura técnica, decisiones arquitectónicas y puntos de mejora

---

## 📐 DIAGRAMA DE ALTO NIVEL

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTE                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    React Native (Expo)                              │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │    │
│  │  │   Screens   │  │   Stores    │  │  API Client │                  │    │
│  │  │  (app/)     │──│  (Zustand)  │──│  (api/)     │                  │    │
│  │  └─────────────┘  └─────────────┘  └──────┬──────┘                  │    │
│  └───────────────────────────────────────────┼──────────────────────────┘    │
└──────────────────────────────────────────────┼──────────────────────────────┘
                                               │ HTTPS
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                       FastAPI                                       │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │    │
│  │  │   Routers   │──│  Services   │──│   Models    │                  │    │
│  │  │  (api/v1/)  │  │ (services/) │  │(db/schemas) │                  │    │
│  │  └──────┬──────┘  └─────────────┘  └──────┬──────┘                  │    │
│  │         │                                  │                         │    │
│  │  ┌──────┴──────┐                   ┌──────┴──────┐                  │    │
│  │  │ Middleware  │                   │  Database   │                  │    │
│  │  │   (auth)    │                   │ PostgreSQL  │                  │    │
│  │  └─────────────┘                   └─────────────┘                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SERVICIOS EXTERNOS                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                          │
│  │    Clerk    │  │   Stripe    │  │  PostgreSQL │                          │
│  │   (Auth)    │  │  (Pagos)    │  │   (Neon)    │                          │
│  │     ✅      │  │     🔴      │  │     ✅      │                          │
│  └─────────────┘  └─────────────┘  └─────────────┘                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 BACKEND (FastAPI)

### Estructura de Carpetas

```
backend/
├── app/
│   ├── main.py                 # Entrypoint, CORS, routers
│   ├── config.py               # Settings (env vars)
│   │
│   ├── api/v1/                 # 🔵 ROUTERS (solo HTTP)
│   │   ├── products.py         # ✅ Delega a service
│   │   ├── orders.py           # ⚠️ Tiene lógica interna
│   │   ├── auth.py             # ⚠️ Tiene lógica interna
│   │   ├── users.py            # ⚠️ Tiene lógica interna
│   │   └── stripe.py           # 🔴 Deshabilitado (503)
│   │
│   ├── services/               # 🟢 LÓGICA DE NEGOCIO
│   │   ├── product_service.py  # ✅ 100% coverage
│   │   ├── order_service.py    # ⚠️ Existe pero no usado
│   │   ├── auth_service.py     # ⚠️ 71% coverage
│   │   └── user_service.py     # ⚠️ 67% coverage
│   │
│   ├── schemas/                # 🔵 PYDANTIC (validación)
│   │   ├── product.py
│   │   ├── order.py
│   │   └── user.py
│   │
│   ├── db/
│   │   ├── database.py         # AsyncSession, engine
│   │   └── schemas.py          # ORM Models (SQLAlchemy)
│   │
│   ├── middleware/
│   │   └── auth.py             # Clerk JWKS + JWT legacy
│   │
│   └── core/
│       ├── security.py         # JWT encode/decode, bcrypt
│       └── exceptions.py       # Custom exceptions
│
└── tests/
    ├── conftest.py             # Fixtures, MockAsyncSession
    ├── test_api/               # Tests de endpoints
    └── test_services/          # Tests de lógica
```

### Patrón de Capas (Obligatorio)

```
┌─────────────────────────────────────────────────────────────┐
│  ROUTER (api/v1/)                                           │
│  - Parsear request                                          │
│  - Validar auth (Depends)                                   │
│  - Llamar service                                           │
│  - Retornar response                                        │
│  ❌ NO: queries, cálculos, lógica de negocio               │
├─────────────────────────────────────────────────────────────┤
│  SERVICE (services/)                                        │
│  - Toda la lógica de negocio                               │
│  - Queries a DB                                             │
│  - Validaciones de dominio                                  │
│  - Cálculos                                                 │
│  ✅ SÍ: todo lo que no sea HTTP                            │
├─────────────────────────────────────────────────────────────┤
│  MODEL (db/schemas.py)                                      │
│  - Definición de tablas                                     │
│  - Relaciones                                               │
│  ❌ NO: métodos de negocio                                 │
├─────────────────────────────────────────────────────────────┤
│  SCHEMA (schemas/)                                          │
│  - DTOs (Request/Response)                                  │
│  - Validación con Pydantic                                  │
│  ❌ NO: lógica                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 FRONTEND (React Native Expo)

### Estructura de Carpetas

```
frontend/
├── app/                        # 📱 SCREENS (Expo Router)
│   ├── _layout.tsx             # Root layout, providers
│   ├── index.tsx               # Home (lista productos)
│   ├── cart.tsx                # Carrito
│   ├── checkout.tsx            # Checkout
│   ├── (auth)/login.tsx        # Login (Clerk)
│   └── product/[id].tsx        # Detalle producto
│
├── components/                 # 🧩 UI COMPONENTS
│   ├── ui/                     # Gluestack components
│   ├── ProductListItem.tsx
│   ├── Header.tsx
│   ├── QuickFilters.tsx        # ⚠️ UI lista, API pendiente
│   ├── FavoritesBar.tsx
│   └── RecentlyViewedBar.tsx
│
├── api/                        # 🌐 HTTP CLIENTS
│   ├── products.ts             # listProducts, fetchProductById
│   ├── orders.ts               # createOrder
│   └── auth.ts                 # fetchWithAuth, login (legacy)
│
├── store/                      # 📦 ESTADO GLOBAL (Zustand)
│   ├── cartStore.ts            # items, addProduct, resetCart
│   ├── authStore.ts            # user, token
│   └── recentlyViewedStore.ts  # recently viewed products
│
├── types/                      # 📝 TYPESCRIPT
│   └── product.ts
│
└── lib/                        # 🔧 UTILIDADES
    └── cache.ts                # SecureStore (token cache)
```

### Flujo de Datos

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Screen    │───▶│   Store     │───▶│  API Client │
│  (app/)     │◀───│  (Zustand)  │◀───│   (api/)    │
└─────────────┘    └─────────────┘    └─────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │ AsyncStorage│
                   │ (pendiente) │
                   └─────────────┘
```

---

## 🔌 API ENDPOINTS

```
┌─────────┬──────────────────────────────────────┬──────────────┐
│ Método  │ Endpoint                             │ Status       │
├─────────┼──────────────────────────────────────┼──────────────┤
│ GET     │ /                                    │ ✅ OK        │
│ GET     │ /health/jwks                         │ ✅ OK        │
├─────────┼──────────────────────────────────────┼──────────────┤
│ GET     │ /products                            │ ✅ OK        │
│ GET     │ /products/{id}                       │ ✅ OK        │
│ POST    │ /products                            │ ✅ OK (seller)│
│ PUT     │ /products/{id}                       │ ✅ OK (seller)│
│ DELETE  │ /products/{id}                       │ ✅ OK (seller)│
├─────────┼──────────────────────────────────────┼──────────────┤
│ POST    │ /auth/register                       │ ✅ OK        │
│ POST    │ /auth/login                          │ ✅ OK        │
├─────────┼──────────────────────────────────────┼──────────────┤
│ GET     │ /users/{id}                          │ ✅ OK        │
│ PUT     │ /users/{id}                          │ ✅ OK        │
├─────────┼──────────────────────────────────────┼──────────────┤
│ GET     │ /orders                              │ ✅ OK        │
│ GET     │ /orders/{id}                         │ ✅ OK        │
│ POST    │ /orders                              │ ✅ OK ✓      │
│ PUT     │ /orders/{id}                         │ ✅ OK        │
├─────────┼──────────────────────────────────────┼──────────────┤
│ GET     │ /stripe/keys                         │ 🔴 503       │
│ POST    │ /stripe/payment-intent               │ 🔴 503       │
│ POST    │ /stripe/webhook                      │ 🔴 503       │
└─────────┴──────────────────────────────────────┴──────────────┘

✓ POST /orders: Valida precios desde DB (commit a427173)
```

---

## 🔒 AUTENTICACIÓN

### Flujo Dual (Clerk + JWT Legacy)

```
┌─────────────────────────────────────────────────────────────┐
│                    REQUEST CON TOKEN                        │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
            ┌──────────────────────────────┐
            │  ¿CLERK_PUBLISHABLE_KEY set? │
            └──────────────────────────────┘
                    │              │
                   SÍ              NO
                    │              │
                    ▼              │
         ┌─────────────────┐       │
         │ Verificar JWKS  │       │
         │ (RS256)         │       │
         └────────┬────────┘       │
                  │                │
           ┌──────┴──────┐         │
           │  ¿Válido?   │         │
           └──────┬──────┘         │
            SÍ    │    NO          │
            │     │     │          │
            │     │     ▼          │
            │     │  ┌─────────────────────┐
            │     └─▶│ Fallback JWT HS256  │◀┘
            │        │ (dev mode only)     │
            │        └──────────┬──────────┘
            │                   │
            ▼                   ▼
    ┌─────────────────────────────────────┐
    │          USUARIO AUTENTICADO        │
    └─────────────────────────────────────┘
```

### Archivos Clave

- `backend/app/middleware/auth.py` - Lógica de verificación
- `backend/app/core/security.py` - JWT encode/decode
- `backend/app/config.py` - JWKS URL generation
- `frontend/lib/cache.ts` - Token storage (SecureStore)

---

## 💾 MODELOS DE DATOS

### Esquema Actual

```sql
┌─────────────────────────────────────────────────────────────┐
│                        PRODUCTS                             │
├─────────────────────────────────────────────────────────────┤
│ id          │ INTEGER     │ PK, AUTO                        │
│ name        │ VARCHAR(255)│ NOT NULL                        │
│ description │ TEXT        │ NULLABLE                        │
│ image       │ VARCHAR(255)│ NULLABLE                        │
│ price       │ FLOAT       │ NOT NULL                        │
│ ─────────── │ ─────────── │ ─────────────────────────────── │
│ ⚠️ FALTA:  │             │ allergens, dietary_tags,        │
│             │             │ ingredients, created_at,        │
│             │             │ updated_at                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                         USERS                               │
├─────────────────────────────────────────────────────────────┤
│ id          │ INTEGER     │ PK, AUTO                        │
│ email       │ VARCHAR(255)│ UNIQUE, NOT NULL                │
│ password    │ VARCHAR(255)│ NULLABLE (Clerk users)          │
│ role        │ VARCHAR(255)│ DEFAULT 'user'                  │
│ name        │ VARCHAR(255)│ NULLABLE                        │
│ address     │ TEXT        │ NULLABLE                        │
│ clerk_id    │ VARCHAR(255)│ UNIQUE, NULLABLE                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                        ORDERS                               │
├─────────────────────────────────────────────────────────────┤
│ id                      │ INTEGER     │ PK, AUTO            │
│ created_at              │ TIMESTAMP   │ DEFAULT NOW()       │
│ status                  │ VARCHAR(50) │ DEFAULT 'New'       │
│ user_id                 │ INTEGER     │ FK → users.id       │
│ stripe_payment_intent_id│ VARCHAR(255)│ NULLABLE            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      ORDER_ITEMS                            │
├─────────────────────────────────────────────────────────────┤
│ id          │ INTEGER     │ PK, AUTO                        │
│ order_id    │ INTEGER     │ FK → orders.id                  │
│ product_id  │ INTEGER     │ FK → products.id                │
│ quantity    │ INTEGER     │ NOT NULL                        │
│ price       │ FLOAT       │ NOT NULL (snapshot from DB)     │
└─────────────────────────────────────────────────────────────┘
```

### Índices Recomendados

```sql
-- Búsquedas frecuentes
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
```

---

## 🔐 SEGURIDAD

| Aspecto | Estado | Notas |
|---------|--------|-------|
| CORS | ✅ | localhost:8081, 8082 |
| HTTPS | ⚠️ | Solo en producción |
| JWT | ✅ | HS256 (legacy) + RS256 (Clerk) |
| Passwords | ✅ | bcrypt hash |
| Precios | ✅ | Validados desde DB |
| Rate Limiting | ❌ | Pendiente |
| SQL Injection | ✅ | SQLAlchemy ORM |
| Input Validation | ✅ | Pydantic v2 |

---

## 🔴 BRECHAS ARQUITECTÓNICAS

### 1. Lógica en Routers (Crítico)

**Problema:** `orders.py`, `auth.py`, `users.py` tienen queries directas

```python
# ❌ ACTUAL (orders.py línea 45-60)
product = await db.get(Product, item_data.productId)
order_item = OrderItem(...)
db.add(order_item)

# ✅ CORRECTO
return await order_service.create_order(db, user_id, order_data)
```

**Impacto:** Difícil de testear, lógica duplicada, violación de capas

### 2. Product Model Incompleto

**Problema:** Falta `allergens`, `dietary_tags`, `ingredients`

**Impacto:** QuickFilters no puede filtrar en backend

### 3. Sin Persistencia de Carrito

**Problema:** cartStore solo en memoria

**Impacto:** Usuario pierde carrito al cerrar app

---

## 📚 REFERENCIAS

| Archivo | Propósito |
|---------|-----------|
| [ESTADO.md](ESTADO.md) | Métricas y tests actuales |
| [PLAN_DE_ACCION.md](PLAN_DE_ACCION.md) | Sprints y tareas |
| [.cursorrules](../../../.cursorrules) | Reglas estrictas |
| [backend/AI-README.md](../../../backend/AI-README.md) | Patrones backend |
| [frontend/AI-README.md](../../../frontend/AI-README.md) | Patrones frontend |

---

**Próxima actualización:** Cuando haya cambios arquitectónicos
