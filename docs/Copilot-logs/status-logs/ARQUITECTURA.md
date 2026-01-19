# 🏗️ ARQUITECTURA DEL PROYECTO - HealthBytes

**Documento técnico de la arquitectura actual y futura**

---

## 📐 ARQUITECTURA ACTUAL (2026-01-18)

```
┌─────────────────────────────────────────────────────────────┐
│                      USUARIOS                                │
│        (Mobile: iOS/Android, Web: Expo Web)                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP/HTTPS
                         ▼
┌──────────────────────────────────────────────────────────────┐
│              FRONTEND - React Native (Expo)                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Pages                                                 │  │
│  │  • index.tsx (Catálogo)                               │  │
│  │  • product/[id].tsx (Detalle)                        │  │
│  │  • cart.tsx (Carrito)                                │  │
│  │  • checkout.tsx (Pago)                               │  │
│  │  • (auth)/login.tsx (Autenticación)                 │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Components (UI)                                       │  │
│  │  • ProductListItem, Header, Cart, Filters             │  │
│  │  • Powered by Gluestack + TailwindCSS                 │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  State Management (Zustand)                            │  │
│  │  • authStore (JWT/Clerk tokens)                       │  │
│  │  • cartStore (items en memoria + AsyncStorage)        │  │
│  │  • recentlyViewedStore                                │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  API Clients (fetch)                                   │  │
│  │  • products.ts, auth.ts, orders.ts                     │  │
│  │  • Error handling, headers, auth headers              │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬───────────────────────────────┘
                                 │
                REST API (JSON) │
                  (Port 3001)  │
                                 ▼
┌──────────────────────────────────────────────────────────────┐
│                   BACKEND - FastAPI (Python)                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  main.py (FastAPI App)                                 │  │
│  │  • CORS configurado                                   │  │
│  │  • Docs en /docs, /redoc                              │  │
│  │  • Health check en /                                  │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Routers (Endpoints)                                   │  │
│  │  • /products (GET, POST, PUT, DELETE)                 │  │
│  │  • /auth (POST: register, login)                      │  │
│  │  • /orders (GET, POST, PUT)                           │  │
│  │  • /users (GET, PUT)                                  │  │
│  │  • /stripe (503 - disabled)                           │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Middleware                                            │  │
│  │  • CORS (allow localhost:8081, 8082)                  │  │
│  │  • Auth (JWT verification, Clerk JWKS)                │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Models (Pydantic)                                     │  │
│  │  • ProductCreate, ProductResponse                      │  │
│  │  • UserCreate, UserResponse                            │  │
│  │  • OrderCreate, OrderResponse                          │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Database Layer                                        │  │
│  │  • SQLAlchemy ORM (async)                             │  │
│  │  • Schemas (SQLAlchemy models)                        │  │
│  │  • database.py (engine, sessionmaker)                 │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Utils                                                 │  │
│  │  • security.py (JWT encode/decode, bcrypt)            │  │
│  │  • exceptions.py (custom exceptions)                  │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬───────────────────────────────┘
                                 │
                   SQL (async)  │
                 (psycopg)      │
                                 ▼
┌──────────────────────────────────────────────────────────────┐
│                   DATABASE - PostgreSQL                      │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Tables                                                │  │
│  │  • products (id, name, price, description, image...)  │  │
│  │  • users (id, email, password, clerk_id, role...)    │  │
│  │  • orders (id, user_id, status, created_at, ...)     │  │
│  │  • order_items (id, order_id, product_id, price...)  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES (Futuro)                      │
│  • Clerk (auth, JWKS endpoint)                               │
│  • Stripe (payments, webhooks) - 503 Disabled               │
│  • AWS (S3 images, Lambda deployment)                        │
│  • SendGrid/Mailgun (transactional emails)                  │
└──────────────────────────────────────────────────────────────┘
```

---

## 📊 DATA FLOW - Carrito al Checkout

```
┌────────────┐
│  Usuario   │
└─────┬──────┘
      │
      │ Click "Agregar al carrito"
      ▼
┌──────────────────────────┐
│ ProductListItem.tsx      │
│ onClick → useCart.add()  │
└──────────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │  Zustand cartStore   │ ✅ State en memoria
    │  (items)             │ 💾 Persistida en AsyncStorage
    └──────────────────────┘
               │
               │ (mostrar en UI)
               ▼
┌──────────────────────────┐
│  cart.tsx                │
│  • Listar items         │
│  • +/- cantidad         │
│  • Botón "Checkout"     │
└──────────────┬───────────┘
               │
               │ Click "Checkout"
               ▼
┌──────────────────────────┐
│  checkout.tsx            │
│  • Form envío (TODO)     │
│  • Stripe Payment (TODO) │
│  • POST /orders          │
└──────────────┬───────────┘
               │
               │ JSON payload
               ▼
    ┌──────────────────────────┐
    │ Backend: POST /orders    │
    │ 1. Validar usuario      │
    │ 2. Obtener precios REALES│ ⚠️ FIX: línea 46 orders.py
    │ 3. Crear Order          │
    │ 4. Crear OrderItems     │
    │ 5. Guardar en DB        │
    └──────────────┬───────────┘
                   │
                   ▼
            ┌─────────────┐
            │ PostgreSQL  │
            └─────────────┘
               │
               ▼
    ┌──────────────────────┐
    │ Respuesta: orderId   │
    │ Status: 201 Created  │
    └──────────────┬───────┘
                   │
                   ▼
    ┌──────────────────────┐
    │ Frontend:            │
    │ • Limpiar carrito    │
    │ • Mostrar confetti   │
    │ • Redirigir a orden  │
    └──────────────────────┘
```

---

## 🔐 AUTH FLOW - Dos Métodos (En Transición)

### Método 1: JWT Legacy (Node.js API)
```
Usuario → Ingresa email/password → /auth/login →
  ↓
Backend genera JWT (HS256) con:
  {
    "userId": 1,
    "role": "user",
    "iat": 1726...,
    "exp": 1728...
  }
  ↓
Frontend guarda en AsyncStorage + header Authorization
  ↓
Todos los requests incluyen: Authorization: Bearer <token>
  ↓
Backend verifica firma con JWT_SECRET
```

### Método 2: Clerk (Nuevo)

```
Usuario → Click "Sign up/in" → Clerk Modal →
  ↓
Clerk maneja todo (email, OAuth, MFA) →
  ↓
Frontend obtiene sessionToken de Clerk →
  ↓
Backend valida contra JWKS de Clerk →
  ↓
Crea/actualiza User con clerk_id en DB
```

**ESTADO:** Ambos soportados simultáneamente → **Confusión**
**ACCIÓN RECOMENDADA:** Deprecar JWT gradualmente en 3 meses

---

## 🔄 FLUJO DE FILTROS (Futuro)

```
Frontend:
  QuickFilters.tsx
  ├── allergen_free checkbox → "gluten"
  ├── dietary select → "vegan"
  └── onClick → listProducts({allergen_free: "gluten", dietary: "vegan"})
       │
       ▼
  api/products.ts
    buildQueryString()
    fetch(`/products?allergen_free=gluten&dietary=vegan`)
       │
       ▼
Backend:
  routers/products.py
    @router.get("/")
    query = select(Product)
  
    if allergen_free:
      query = query.where(~Product.allergens.contains([allergen_free]))
  
    if dietary:
      query = query.where(Product.dietary_tags.contains([dietary]))
  
    execute() → filtered results
       │
       ▼
Frontend:
  ProductListItem.map(items)
```

---

## 🚀 ARQUITECTURA FUTURA (3-6 Meses)

```
┌─────────────────────────────────────────┐
│         FRONTEND ESCALADO                │
│  • Web (Next.js SSR)                    │
│  • Mobile (React Native Multi-platform) │
│  • Admin (separate app)                 │
└─────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
   ┌────────┐ ┌────────┐ ┌──────────────┐
   │ Gateway│ │  Main  │ │  Recommender │
   │(Nginx) │ │ FastAPI│ │  Service     │
   └────────┘ └────────┘ │ (FastAPI)    │
                         └──────────────┘
        │           │           │
        └───────────┼───────────┘
                    │
        ┌───────────┼───────────────────┐
        │           │                   │
        ▼           ▼                   ▼
   ┌────────┐ ┌──────────┐ ┌─────────────────┐
   │  Cache │ │PostgreSQL│ │  Search Engine  │
   │ Redis  │ │          │ │ (Elasticsearch) │
   └────────┘ └──────────┘ └─────────────────┘
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
   Backups   Monitoring   Logs
   (S3)     (Prometheus) (ELK)

    ┌──────────────────────────────┐
    │  Docker + Kubernetes (AWS EKS)│
    │  • Auto-scaling              │
    │  • CI/CD (GitHub Actions)     │
    │  • Blue-Green Deployment      │
    └──────────────────────────────┘
```

---

## 📁 ESTRUCTURA DE CARPETAS - DETALLE

### Backend

```
Backend/fastapi-service/
├── app/
│   ├── __init__.py
│   ├── main.py              # 🎯 App entrypoint
│   ├── config.py            # Settings y variables
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── products.py      # GET, POST, PUT, DELETE /products
│   │   ├── auth.py          # POST /auth/register, /login
│   │   ├── orders.py        # GET, POST /orders  ⚠️ FIX: validar precios
│   │   ├── users.py         # GET, PUT /users
│   │   └── stripe.py        # 503 disabled
│   ├── models/
│   │   ├── __init__.py
│   │   ├── product.py       # Pydantic schemas
│   │   ├── user.py
│   │   └── order.py
│   ├── db/
│   │   ├── __init__.py
│   │   ├── database.py      # SQLAlchemy engine, sessionmaker
│   │   └── schemas.py       # SQLAlchemy ORM models ⚠️ EXTENDER para medicamentos
│   ├── middleware/
│   │   ├── __init__.py
│   │   └── auth.py          # JWT verify, Clerk JWKS
│   └── utils/
│       ├── __init__.py
│       ├── security.py      # JWT, bcrypt
│       └── exceptions.py    # Custom exceptions
├── run_server.py            # Dev runner
├── start.ps1                # Windows bootstrap
├── start.sh                 # Unix bootstrap
├── requirements.txt         # Dependencies
├── .env.example             # ⚠️ COMPLETAR
├── .env                     # ⚠️ LOCAL (gitignore)
└── README.md                # ⚠️ CORRUPTO - REESCRIBIR

Futuro:
├── tests/
│   ├── conftest.py          # pytest fixtures
│   ├── test_products.py
│   ├── test_orders.py
│   └── test_auth.py
└── migrations/              # Alembic para schema versions
```

### Frontend

```
Frontend/shop/
├── app/                     # Expo Router pages
│   ├── _layout.tsx          # Root layout
│   ├── index.tsx            # Catálogo (/)
│   ├── product/
│   │   └── [id].tsx         # Detalle (/product/:id)
│   ├── cart.tsx             # Carrito
│   ├── checkout.tsx         # ⚠️ TODO: Implementar
│   └── (auth)/
│       └── login.tsx        # Auth
├── components/              # Reusable UI
│   ├── Header.tsx
│   ├── ProductListItem.tsx
│   ├── QuickFilters.tsx     # ⚠️ TODO: Implementar
│   ├── FavoritesBar.tsx
│   ├── RecentlyViewedBar.tsx
│   ├── SectionHeader.tsx
│   └── ui/                  # Gluestack wrappers
│       ├── button/
│       ├── card/
│       ├── input/
│       ├── form-control/
│       ├── text/
│       └── ...
├── api/                     # Backend clients
│   ├── products.ts          # ⚠️ TODO: Type safety
│   ├── auth.ts
│   └── orders.ts
├── store/                   # Zustand stores
│   ├── authStore.ts
│   ├── cartStore.ts         # ⚠️ TODO: AsyncStorage persist
│   └── recentlyViewedStore.ts
├── types/
│   └── product.ts
├── lib/
│   └── cache.ts
├── assets/                  # Static files
│   ├── products.json        # ⚠️ EMPTY/UNKNOWN
│   └── icons/
├── app.json                 # Expo config
├── babel.config.js
├── metro.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md                # Buena documentación
```

---

## 🔌 API ENDPOINTS - Resumen

```
┌─────────┬──────────────────────────────────────┬──────────────┐
│ Método  │ Endpoint                             │ Status       │
├─────────┼──────────────────────────────────────┼──────────────┤
│ GET     │ /                                    │ ✅ OK        │
│ GET     │ /health/jwks                         │ ✅ OK        │
│ GET     │ /products                            │ ✅ OK        │
│ GET     │ /products/{id}                       │ ✅ OK        │
│ POST    │ /products                            │ ✅ OK (seller)
│ PUT     │ /products/{id}                       │ ✅ OK (seller)
│ DELETE  │ /products/{id}                       │ ✅ OK (seller)
├─────────┼──────────────────────────────────────┼──────────────┤
│ POST    │ /auth/register                       │ ✅ OK        │
│ POST    │ /auth/login                          │ ✅ OK        │
├─────────┼──────────────────────────────────────┼──────────────┤
│ GET     │ /users/{id}                          │ ✅ OK        │
│ PUT     │ /users/{id}                          │ ✅ OK        │
├─────────┼──────────────────────────────────────┼──────────────┤
│ GET     │ /orders                              │ ✅ OK        │
│ GET     │ /orders/{id}                         │ ✅ OK        │
│ POST    │ /orders                              │ ⚠️  INSEGURO*│
│ PUT     │ /orders/{id}                         │ ✅ OK        │
├─────────┼──────────────────────────────────────┼──────────────┤
│ GET     │ /stripe/keys                         │ 🔴 503       │
│ POST    │ /stripe/payment-intent               │ 🔴 503       │
│ POST    │ /stripe/webhook                      │ 🔴 503       │
└─────────┴──────────────────────────────────────┴──────────────┘

* POST /orders: No valida precios de DB - CRÍTICO FIX
```

---

## 🔒 Seguridad - Estado Actual

| Aspecto          | Status           | Notas                            |
| ---------------- | ---------------- | -------------------------------- |
| CORS             | ✅ Configurado   | localhost:8081, 8082 permitidos  |
| HTTPS            | ⚠️ Dev sin SSL | Necesario en producción         |
| JWT              | ✅ HS256         | Compatible con Node.js legacy    |
| Passwords        | ✅ bcrypt        | Hash seguro                      |
| Precios          | 🔴 INSEGURO      | Cliente puede cambiar precios    |
| Rate Limiting    | ❌ Ninguno       | DDoS vulnerable                  |
| Input Validation | ⚠️ Básico     | Pydantic Field() sin constraints |
| SQL Injection    | ✅ SQLAlchemy    | ORM protege queries              |
| CSRF             | ⚠️ N/A         | Stateless API, considerar tokens |
| Secrets          | ⚠️ En .env     | Usar AWS Secrets Manager en prod |

---

## 💾 Estado de la Base de Datos

### Tablas Actuales

```sql
products
├── id (PK, auto)
├── name
├── description
├── image
├── price
└── [FALTA: created_at, updated_at, categoria, alérgenos, etc.]

users
├── id (PK, auto)
├── email (unique)
├── password
├── role
├── name
├── address
└── clerk_id (unique, nullable)
    [FALTA: created_at, updated_at, phone, etc.]

orders
├── id (PK, auto)
├── created_at
├── status
├── user_id (FK → users)
└── stripe_payment_intent_id
    [FALTA: updated_at, total_amount, shipping_address]

order_items
├── id (PK, auto)
├── order_id (FK → orders)
├── product_id (FK → products)
├── quantity
└── price
    [FALTA: updated_at]
```

### Índices Necesarios

```sql
-- Búsqueda rápida
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(category);

-- Queries de usuario
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_users_email ON users(email);
```

---

## 🎯 CONCLUSIÓN

**Arquitectura Sólida pero Incompleta**

✅ Base técnica moderna y escalable
❌ Funcionalidades core no terminadas (checkout, filtros)
⚠️ Deuda técnica (testing, documentación, seguridad)

**Next Step:** Implementar items de PLAN_ACCION.md en orden de prioridad
