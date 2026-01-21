# 🔴 PROBLEMAS IDENTIFICADOS - Diagrama Visual

## PROBLEMA #1: SERVICIOS VACÍOS (CRÍTICO)

### Situación Actual ❌
```
┌──────────────────────────────────────────────────────────────┐
│                    API ROUTER (products.py)                  │
│                                                              │
│  async def list_products(db):                               │
│      result = await db.execute(select(Product))  ← SQL AQUÍ│
│      return result.scalars().all()                          │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │  DATABASE (Query)    │
            └──────────────────────┘


PROBLEMA:
- Lógica SQL en router
- services/ vacío
- Violación de arquitectura de capas
- Difícil de testear
```

### Situación Correcta ✅
```
┌──────────────────────────────────────────────────────────────┐
│                    API ROUTER (products.py)                  │
│                                                              │
│  async def list_products(db):                               │
│      return await product_service.list_products(db)         │
│                                            ↑                 │
│                    Solo delega               │                 │
└──────────────────────┬───────────────────────────────────────┘
                       │ Delega
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                  SERVICE (product_service.py)                │
│                                                              │
│  async def list_products(db) -> List[Product]:              │
│      result = await db.execute(select(Product))             │
│      return result.scalars().all()                          │
└──────────────────────┬───────────────────────────────────────┘
                       │ Query
                       ▼
            ┌──────────────────────┐
            │  DATABASE (Query)    │
            └──────────────────────┘


VENTAJAS:
✅ Lógica centralizada en services
✅ Router solo orquesta HTTP
✅ Fácil de testear servicios
✅ Sigue arquitectura de capas
```

---

## PROBLEMA #2: SERVICIOS QUE DEBEN EXISTIR

```
backend/app/services/
├── __init__.py              ✅ (existe)
├── product_service.py       ❌ FALTA
├── order_service.py         ❌ FALTA
├── auth_service.py          ❌ FALTA
└── user_service.py          ❌ FALTA

FUNCIONES FALTANTES:

product_service.py
├── list_products()
├── get_product(id)
├── create_product()
├── update_product()
└── delete_product()

order_service.py
├── create_order()
├── get_user_orders()
├── update_order_status()
├── validate_order_items()
└── calculate_total()

auth_service.py
├── register_user()
├── login_user()
├── verify_token()
└── generate_jwt_token()

user_service.py
├── get_user()
├── update_user()
└── delete_user()
```

---

## PROBLEMA #3: TESTING DISTRIBUTION

```
Cobertura Actual (30%)
┌────────────────────────────────┐
│ ████░░░░░░░░░░░░░░░░░░░░░░    │ 30% - BAJO
│ Testeado vs No testeado        │
└────────────────────────────────┘

Testeado (6 archivos):
- ✅ auth.py (router) - test_auth.py
- ✅ products.py (router) - test_products.py
- ✅ orders.py (router) - test_orders.py + test_orders_validation.py
- ✅ health - test_health.py

NO Testeado:
- ❌ services/* (no existen aún)
- ❌ middleware/auth.py
- ❌ schemas/* (solo validación Pydantic)
- ❌ db/models/* 
- ❌ core/security.py
- ❌ core/exceptions.py

Meta (70%)
┌────────────────────────────────┐
│ █████████████████████░░░░░░    │ 70% - META
│ Testeado vs No testeado        │
└────────────────────────────────┘

Brecha: 40% de testing por hacer
Esfuerzo: ~1 semana
```

---

## PROBLEMA #4: ENDPOINTS INCOMPLETOS

```
ESTADO DE ENDPOINTS (21/01/2026)

PRODUCTS (/products)
─────────────────────
✅ GET /                (list all) - FUNCIONA
✅ GET /:id             (get one) - FUNCIONA
✅ POST /               (create)  - FUNCIONA
✅ PUT /:id             (update)  - FUNCIONA
✅ DELETE /:id          (delete)  - FUNCIONA

❌ GET /?allergens=...  (FILTRAR) - NO IMPLEMENTADO
❌ GET /?diet=...       (FILTRAR) - NO IMPLEMENTADO
❌ GET /?search=...     (BUSCAR)  - PARCIAL


AUTH (/auth)
────────────
✅ POST /register       - FUNCIONA
✅ POST /login          - FUNCIONA
❌ POST /logout         - NO IMPLEMENTADO
❌ POST /refresh-token  - NO IMPLEMENTADO
❌ POST /verify-email   - NO IMPLEMENTADO


ORDERS (/orders)
────────────────
✅ GET /                (list) - FUNCIONA
✅ GET /:id             (get) - FUNCIONA
✅ POST /               (create) - FUNCIONA
⚠️  State machine incomplete
❌ PUT /:id/cancel      - NO IMPLEMENTADO
❌ PUT /:id/status      - INCOMPLETO


STRIPE (/stripe)
────────────────
❌ POST /create-payment-intent - DESHABILITADO (503)
❌ POST /webhook               - DESHABILITADO (503)

Endpoint Health Summary:
━━━━━━━━━━━━━━━━━━━━━━━━
Total Endpoints:      14
Funcionales:          10 (71%)
Incompletos:           2 (14%)
Deshabilitados:        2 (14%)
```

---

## PROBLEMA #5: ARQUITECTURA VIOLADA

```
DEFINICIÓN EN backend/AI-README.md (línea 150):
──────────────────────────────────────────────

"Cada capa tiene responsabilidad clara. No mezclar.

✅ Routers solo llaman services
✅ Services contienen TODA la lógica
✅ Models solo definen estructura
❌ NUNCA lógica en routers
❌ NUNCA queries SQL fuera de services
❌ NUNCA importar models en api/v1/
"

ESTADO ACTUAL:
──────────────
Router (products.py) línea 20:
    result = await db.execute(select(Product)) ← VIOLACIÓN
                    ↑
    SQL query directo en router

Debería estar en:
    services/product_service.py


ARCHIVOS VIOLADORES:
    ❌ backend/app/api/v1/products.py (línea 20-25)
    ❌ backend/app/api/v1/orders.py
    ❌ backend/app/api/v1/users.py
    ❌ backend/app/api/v1/auth.py
```

---

## PROBLEMA #6: FRONT-END CART - NO PERSISTE

```
FLUJO ACTUAL (Incompleto)
──────────────────────────

APP START
    ↓
User Opens App (app/_layout.tsx)
    ↓
Zustand cartStore initialized (empty) []
    ↓
✅ Show Home
    ↓
User adds items (useCart.addProduct)
    ↓
✅ Items in memory store
    ↓
User closes app
    ↓
💥 CART LOST ❌


FLUJO DEBE SER:
───────────────

APP START
    ↓
useEffect en _layout.tsx
    ↓
Load cart from AsyncStorage
    ↓
Load from backend if exists
    ↓
Merge y resolver conflictos
    ↓
Initialize Zustand store
    ↓
✅ Show Home con carrito restaurado


ESTADO DEL CÓDIGO:
──────────────────
frontend/store/cartStore.ts:
    ✅ Zustand store existe
    ✅ AsyncStorage se usa en lib/cache.ts
    ❌ NO hay loading de AsyncStorage en _layout.tsx
    ❌ NO hay sincronización con backend


IMPACTO EN USER EXPERIENCE:
    🟡 Alto - Usuarios pierden carrito al cerrar app
```

---

## PROBLEMA #7: ERRORES DE TIPO EN FRONTEND

```
Algunos archivos no tienen tipos explícitos:

frontend/store/cartStore.ts
────────────────────────────
type CartItem = {
    product: any;  ❌ DEBE SER: Product
    quantity: number;
};

frontend/api/products.ts
──────────────────────────
export async function listProducts(searchTerm?: string) {
    // ...
    const data = await res.json();  ❌ No tipado, retorna any
    return data;                     ✅ Debería: Promise<Product[]>
}

META: 0 usos de 'any' en código frontend
ESTADO: Algunos quedan por limpiar
```

---

## RESUMEN VISUAL - DEUDA TÉCNICA

```
Deuda Técnica Actual (Enero 2026)
┌─────────────────────────────────────────────────────┐
│ 🔴 CRÍTICA                                          │
│  • Servicios vacíos                                 │
│  • Queries en routers                               │
│  • Violación de arquitectura                        │
│                                                     │
│ 🟡 ALTA                                             │
│  • Testing bajo (30% vs 70%)                        │
│  • Features incompletas (Stripe, filtros)           │
│  • Persistencia carrito incompleta                  │
│  • Migraciones DB no versionadas                    │
│                                                     │
│ 🟢 MEDIA                                            │
│  • Tipos TypeScript loose en frontend               │
│  • DevOps no configurado                            │
│  • Documentación API incompleta                     │
└─────────────────────────────────────────────────────┘

Impacto en Desarrollo:
    Escribir nuevo código es rápido pero frágil
    Cambios tienen efecto cascada
    Testing es tedioso
    Refactoring es arriesgado
```

---

## MATRIZ DE DECISIÓN

```
┌──────────────────────────────────────────────────────┐
│ ¿QUÉ HACER AHORA?                                    │
├──────────────────────────────────────────────────────┤
│                                                      │
│ OPCIÓN A: Arreglar Arquitectura Primero             │
│ ────────────────────────────────────────            │
│ Tiempo: 3-4 semanas                                 │
│ Effort: Alta                                        │
│ Riesgo: Bajo (after, everything is easier)          │
│                                                     │
│ Pasos:                                              │
│  1. Crear servicios (5-7 días) ← START HERE         │
│  2. Refactor routers (3-5 días)                     │
│  3. Tests → 70% (5-7 días)                          │
│  4. Features (5-7 días)                             │
│  5. DevOps (7-10 días)                              │
│                                                     │
│ Resultado: Production-ready                         │
│                                                     │
├──────────────────────────────────────────────────────┤
│                                                      │
│ OPCIÓN B: Features Primero (Riesgo)                 │
│ ───────────────────────────────────                 │
│ Tiempo: 2 semanas                                   │
│ Effort: Media                                       │
│ Riesgo: Alto (después es un infierno)               │
│                                                     │
│ Pasos:                                              │
│  1. Agregar Stripe (3-5 días)                       │
│  2. Filtros (2-3 días)                              │
│  3. Carrito persistente (2-3 días)                  │
│  4. Deploy rápido                                   │
│                                                     │
│ Resultado: Funciona, pero frágil                    │
│                                                     │
├──────────────────────────────────────────────────────┤
│ RECOMENDACIÓN: 🎯 OPCIÓN A                          │
│ Porque después es más fácil TODO                    │
└──────────────────────────────────────────────────────┘
```
