ARQUITECTURA - HealthBytes
Actualizado: 2026-01-22

Alcance: vista compacta de cómo se organiza la plataforma (frontend + backend) y los puntos a reforzar.

Backend (FastAPI)
- Patrón capas obligatorio: routers → services → db/models → database. Lógica solo en services.
- Autenticación dual: Clerk (RS256 via JWKS) con fallback JWT HS256 legacy; middleware en app/middleware/auth.py.
- Rutas principales: products, auth, orders, users; Stripe está deshabilitado (503).
- Datos: PostgreSQL (prod), SQLite en tests; ORM SQLAlchemy async; schemas Pydantic v2.

Frontend (React Native Expo)
- Expo Router para navegación; páginas en frontend/app (index, product/[id], cart, checkout, (auth)/login).
- Estado global con Zustand (authStore, cartStore, recentlyViewedStore); UI Gluestack + Tailwind.
- Llamadas HTTP solo en frontend/api (products.ts, auth.ts, orders.ts); tokens en SecureStore (cache.ts).

Flujos clave
- Carrito: ProductListItem → useCart.add → cartStore (memoria + persistencia pendiente) → checkout.tsx → POST /orders → limpia carrito al éxito.
- Auth: Clerk preferido; si falla JWKS en dev se intenta decode sin verificar; JWT legacy sigue activo para compatibilidad.

Brechas arquitectónicas
- Servicios en routers auth/users/orders siguen teniendo lógica: mover a services/ y cubrir con tests.
- Falta paginación y filtros en GET /products; agregar índices en DB para campos consultados.
- Checkout y Stripe aún no implementados; sin CI/CD ni contenedores.

Referencias rápidas
- Backend entrypoint: backend/app/main.py
- Seguridad: backend/app/middleware/auth.py y backend/app/core/security.py
- Frontend layout: frontend/app/_layout.tsx
- Stores: frontend/store/cartStore.ts, frontend/store/authStore.ts
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
