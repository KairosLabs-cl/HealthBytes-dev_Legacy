# 🏗️ Arquitectura y Decisiones de Diseño

Comprende cómo está construido HealthBytes y por qué tomamos estas decisiones.

## 📋 Contenido

### 📄 Documentos de Arquitectura

- **[API_DESIGN_ANALYSIS.md](./API_DESIGN_ANALYSIS.md)** - Análisis completo del diseño REST API
  - Problemas identificados y soluciones
  - Recomendaciones prioritizadas (crítico, importante, nice-to-have)
  - Benchmarks y métricas de performance
  - Basado en: `api-design-principles` skill

### Stack Tecnológico

**Backend:**
- **Framework**: FastAPI (async, high-performance)
- **ORM**: SQLAlchemy 2.x (async support)
- **Database**: PostgreSQL (production), SQLite (testing)
- **Auth**: Clerk (primary) + JWT (fallback)
- **Testing**: pytest

**Frontend:**
- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **State**: Zustand (simple, powerful)
- **UI**: Gluestack + Tailwind (NativeWind)
- **Navigation**: Expo Router (file-based)

**Infrastructure:**
- **Containerization**: Docker (planned)
- **CI/CD**: GitHub Actions (planned)

---

## 🎯 Decisiones Arquitectónicas

### 1. ¿Por qué FastAPI en lugar de Express/Node?
- ✅ **Type Safety**: Python con hints (como TypeScript)
- ✅ **Performance**: Async nativo, ASGI
- ✅ **Developer Experience**: Documentación automática (Swagger)
- ✅ **Data Validation**: Pydantic integrado

### 2. ¿Por qué Zustand en lugar de Redux?
- ✅ **Simplicidad**: ~500 bytes vs Redux miles
- ✅ **No boilerplate**: Actions y state en una sola definición
- ✅ **TypeScript**: Inferencia automática de tipos
- ✅ **DevTools**: Integración con browsers

### 3. ¿Por qué Clerk + JWT (dual system)?
- ✅ **Seguridad**: Clerk usa JWKS, validación en backend
- ✅ **Flexibility**: JWT fallback para desarrollo
- ✅ **Legacy support**: Migramos gradualmente
- ✅ **Production-ready**: Clerk maneja MFA, SSO

### 4. ¿Por qué PostgreSQL?
- ✅ **Full-Text Search**: Nativo (mejor que MySQL)
- ✅ **JSON Support**: Para datos semi-estructurados
- ✅ **Reliability**: ACID, transacciones
- ✅ **Scalability**: Replication, partitioning

---

## 🏛️ Arquitectura en Capas

```
┌─────────────────────────────────┐
│      Frontend (React Native)    │
│   - Componentes presentacionales│
│   - Zustand stores (estado)     │
│   - API clients (fetch)         │
└────────────────┬────────────────┘
                 │ HTTP REST
┌────────────────▼────────────────┐
│    Backend (FastAPI)            │
│  ┌────────────────────────────┐ │
│  │ Routers (api/v1/)          │ │
│  │ - Solo manejo HTTP         │ │
│  │ - Validación con Pydantic  │ │
│  └────────┬───────────────────┘ │
│           │                      │
│  ┌────────▼───────────────────┐ │
│  │ Services (business logic)  │ │
│  │ - Queries y cálculos       │ │
│  │ - Orquestación de datos    │ │
│  └────────┬───────────────────┘ │
│           │                      │
│  ┌────────▼───────────────────┐ │
│  │ Models (db/models/)        │ │
│  │ - SQLAlchemy ORM           │ │
│  │ - Estructura de tablas      │ │
│  └────────┬───────────────────┘ │
└────────────┼─────────────────────┘
             │ SQL
┌────────────▼─────────────────────┐
│    PostgreSQL Database          │
│  - products, orders, users      │
│  - Full-text search index       │
│  - Transacciones ACID           │
└─────────────────────────────────┘
```

**Regla de Oro**: 
- Routers → Services → Models
- Nunca saltarse capas
- Services contienen TODA la lógica de negocio

---

## 📂 Estructura de Carpetas

```
HealthBytes-dev/
│
├── backend/                    ← FastAPI REST API
│   ├── app/
│   │   ├── api/v1/            ← HTTP routers (sin lógica)
│   │   ├── services/          ← Business logic (EN DESARROLLO)
│   │   ├── schemas/           ← Pydantic DTOs
│   │   ├── db/models/         ← SQLAlchemy ORM
│   │   ├── core/              ← Security, exceptions
│   │   ├── middleware/        ← Auth, CORS
│   │   └── main.py            ← Punto de entrada
│   ├── tests/                 ← pytest tests
│   ├── migrations/            ← Alembic (en desarrollo)
│   └── start.ps1              ← Windows launcher
│
├── frontend/                   ← React Native (Expo)
│   ├── app/                   ← Screens (Expo Router)
│   ├── components/            ← Componentes reutilizables
│   ├── api/                   ← HTTP clients (fetch)
│   ├── store/                 ← Zustand stores
│   ├── types/                 ← TypeScript definitions
│   ├── lib/                   ← Utilities
│   └── setup-env.ps1          ← Launcher
│
├── docs/                       ← Documentación (TÚ ERES AQUÍ)
│   ├── setup/                 ← Instalación
│   ├── architecture/          ← Diseño
│   ├── features/              ← Features
│   ├── security/              ← Seguridad
│   ├── development/           ← Dev guides
│   └── ai-logs/               ← IA logs
│
├── Tools/                      ← Scripts utilitarios
│   ├── backend/
│   │   ├── database/          ← Migraciones
│   │   └── seeding/           ← Data population
│   └── frontend/
│
└── .cursorrules               ← Reglas para IA
```

---

## 🔄 Flujos de Datos Principales

### 1. Obtener Productos
```
User (Frontend)
    ↓ [GET /products?search=...]
Router (products.py)
    ↓ [await product_service.search_products()]
Service (product_service.py)
    ↓ [SELECT * FROM products WHERE ... FTS]
Database (PostgreSQL)
    ↓ [rows]
Service [formato respuesta]
    ↓ [List[ProductOut]]
Router [serializa JSON]
    ↓ [HTTP 200]
Frontend [recibe JSON, renderiza]
```

### 2. Agregar al Carrito (Autenticado)
```
User (Frontend)
    ↓ [POST /cart, token]
Middleware (verify_clerk_token)
    ↓ [validar JWKS]
Router (cart.py)
    ↓ [call cart_service.add_item()]
Service (cart_service.py)
    ↓ [UPDATE cart_items SET quantity = quantity + 1]
Database
    ↓ [OK]
Service [reconstruye carrito]
    ↓ [CartOut]
Frontend [actualiza Zustand store]
```

---

## ✅ Principios de Diseño

### 1. Seguridad Primero
- NUNCA confiar en input del cliente
- Validar SIEMPRE en backend
- CORS restrictivo
- HTTPS en producción

### 2. Performance
- Índices en BD (user_id, product_id, created_at)
- Eager loading en relaciones (selectinload)
- Paginación en endpoints de lista
- Cache cuando sea apropriado

### 3. Escalabilidad
- Componentes desacoplados
- Services reutilizables
- API versioning (/api/v1/)
- Docker listo (para futura escalada)

### 4. Developer Experience
- Type hints obligatorios
- Documentación automática (Swagger)
- Tests con pytest
- Logging estructurado

---

## 🚀 Roadmap de Arquitectura

| Fase | Tarea | Status |
|------|-------|--------|
| 1 | Core CRUD (productos, órdenes) | ✅ DONE |
| 2 | Autenticación (Clerk + JWT) | ✅ DONE |
| 3 | Services layer (extraer lógica) | 🟡 IN PROGRESS |
| 4 | Testing (cobertura 70%+) | 🟡 IN PROGRESS |
| 5 | Full-Text Search | ✅ DONE |
| 6 | Docker containerization | 📋 PLANNED |
| 7 | CI/CD (GitHub Actions) | 📋 PLANNED |
| 8 | Payment integration (Stripe) | 📋 PLANNED |

---

Última actualización: Feb 4, 2026
