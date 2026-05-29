# HealthBytes

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

E-commerce especializado para personas con condiciones de salud diagnosticadas (celiaquía, diabetes, alergias, enfermedades metabólicas) que necesitan alimentos específicos que no se encuentran en supermercados convencionales — sino en tiendas especializadas o lugares de difícil acceso.

---

## ¿Qué problema resolvemos?

Las personas con condiciones médicas diagnosticadas necesitan alimentos que generalmente **no están en el supermercado de la esquina**. Están dispersos en tiendas especializadas, importadores o lugares poco visibles. Encontrarlos requiere tiempo, conocimiento de dónde buscar y saber leer etiquetas con criterio clínico.

**HealthBytes centraliza esos productos** en un solo catálogo validado y los hace accesibles desde el celular.

## Cómo lo resolvemos

### Hoy — E-commerce especializado

- Catálogo curado de productos para condiciones específicas (sin gluten, sin lactosa, bajos en azúcar, etc.)
- Filtros por condición médica y restricción dietética
- Checkout completo con pagos (Mercado Pago) y gestión de direcciones

### Próximo — Recomendaciones con IA

El usuario crea un **perfil de salud** al registrarse: indica su condición médica y puede subir su minuta (plan alimentario de su nutricionista). Con esa información, un asistente de IA con criterios nutricionales entrenados:

- Responde preguntas en lenguaje natural ("¿qué puedo desayunar esta semana?")
- Recomienda productos del catálogo basados en el perfil real del usuario
- Genera mini planes semanales coherentes con su condición

> **Importante:** la IA democratiza el acceso a orientación nutricional pero **no reemplaza al nutricionista**. Las recomendaciones son un punto de partida — la responsabilidad de seguirlas recae en el usuario. Esto se comunica explícitamente dentro de la app.

### Visión B2B — Red de minimarkets especializados

Las tiendas donde viven estos productos (minimarkets y tiendas especializadas medianas y pequeñas) generalmente no tienen sistemas digitales de inventario. HealthBytes propone una app de back-office que permite a esos negocios **escanear y digitalizar su catálogo de productos** — manual o por código de barra — mejorando su control de stock y velocidad de cobro.

El intercambio es explícito y simétrico:

| El minimarket recibe | HealthBytes recibe |
| --- | --- |
| Inventario digitalizado sin esfuerzo técnico | Datos de stock en tiempo real de esas tiendas |
| Mejor control de sus productos y existencias | Ubicación de productos especializados en el mapa |
| Visibilidad en la app de HealthBytes | Red de proveedores locales validados |

Esto convierte a HealthBytes en la fuente de verdad sobre **dónde están y qué tienen disponible** las tiendas especializadas — dato que hoy no existe en ningún lugar centralizado.

> Esta propuesta es una visión de negocio a largo plazo. No hay implementación activa. El flujo de inserción B2B está documentado en [docs/architecture/diagrams/b2b-product-insertion-flow.md](docs/architecture/diagrams/b2b-product-insertion-flow.md).

### Visión — Computer Vision

"¿Puedo comer esto?" apuntando con la cámara a un producto. Feature en etapa de exploración, sin fecha de implementación.

---

> HealthBytes opera en Chile con visión de expansión a Latinoamérica.

---

## Estado actual

<!-- DOCSYNC:status-table -->
| Componente | Estado |
| --- | --- |
| Frontend Mobile | ✅ Funcional — React Native + Expo |
| Backend API | ✅ Funcional — FastAPI async |
| Base de Datos | ✅ Funcional — PostgreSQL + Redis |
| Autenticación | ✅ Implementado — JWT + Clerk |
| Tests | ✅ 600+ tests (backend + frontend) — CI verde |
| CI/CD + Infra | ✅ GitHub Actions + Docker + AWS scripts |
<!-- /DOCSYNC:status-table -->

Fuente de verdad: [docs/development/PROJECT_STATUS.md](docs/development/PROJECT_STATUS.md)

---

## Quick Start

### Prerrequisitos

- Python 3.13+ — [python.org](https://www.python.org/downloads/)
- Node.js 18+ — [nodejs.org](https://nodejs.org/)
- pnpm 8+ — `npm install -g pnpm`
- PostgreSQL 14+ — [postgresql.org](https://www.postgresql.org/download/)
- Docker (opcional, recomendado para la DB)

### 1. Clonar

```bash
gh repo clone nojustbenja/HealthBytes-dev
cd HealthBytes-dev
```

### 2. Backend

```bash
cd backend

# Mac/Linux
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
./start.sh

# Windows (PowerShell)
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
.\start.ps1
```

Copia `.env.example` → `.env` y completa las variables (ver sección [Configuración](#configuración)).

API disponible en `http://localhost:3001` · Swagger en `http://localhost:3001/docs`

### 3. Frontend

```bash
cd frontend
pnpm install

# Mac/Linux — detecta tu IP y configura el .env automáticamente
./setup-env.sh

# Windows (PowerShell)
.\setup-env.ps1
```

```bash
pnpm start   # Expo dev server
```

> **Nota:** Si usas Expo Go en celular, elige la opción "Ambos" del script para que use tu IP local en lugar de `localhost`.

### 4. Base de datos (Docker)

```bash
docker run --name healthbytes-postgres \
  -e POSTGRES_USER=healthbytes_user \
  -e POSTGRES_PASSWORD=tu_password \
  -e POSTGRES_DB=healthbytes \
  -p 5432:5432 -d postgres:16
```

O usa el `docker-compose.yml` de la raíz para levantar Postgres + Redis juntos:

```bash
docker compose up -d
```

---

## Configuración

### Variables de entorno — Backend

Copia `.env.example` a `.env` en `backend/` y ajusta:

```env
DATABASE_URL="postgresql://healthbytes_user:tu_password@localhost:5432/healthbytes"
JWT_SECRET="cambia-esto-en-produccion"
JWT_ALGORITHM="HS256"
ENVIRONMENT="dev"

# Clerk (autenticación)
CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

Las API keys reales (Clerk, Mercado Pago, Resend) están en ClickUp — solicita acceso al líder del equipo.

### Verificar configuración

```bash
cd backend
python -c "from app.core.config import settings; print(settings.DATABASE_URL)"
```

---

## Arquitectura

```
┌─────────────────────────────┐
│     React Native (Expo)     │  Mobile + Web
└──────────────┬──────────────┘
               │ HTTP / JSON
┌──────────────▼──────────────┐
│         FastAPI              │  REST API · JWT · Clerk
│   /api/v1/*                 │
└──────────────┬──────────────┘
               │ SQLAlchemy async
┌──────────────▼──────────────┐
│   PostgreSQL + Redis         │  Datos relacionales + cache
└─────────────────────────────┘
```

- Rutas en `backend/app/api/v1/` → solo llaman a servicios
- Lógica de negocio en `backend/app/services/`
- Modelos DB en `backend/app/db/` · Schemas Pydantic en `backend/app/schemas/`

---

## Stack

### Frontend

| Tecnología | Versión | Propósito |
| --- | --- | --- |
| React Native | 0.81.5 | Framework mobile multiplataforma |
| Expo | ~54.0.33 | Tooling y build |
| TypeScript | ~5.9.2 | Type safety |
| NativeWind | ^4.2 | Tailwind CSS en React Native |
| Zustand | ^5.0 | State management |

### Backend

| Tecnología | Versión | Propósito |
| --- | --- | --- |
| FastAPI | >=0.128 | Framework web async |
| Python | 3.13.1 | Lenguaje principal |
| SQLAlchemy | >=2.0.46 | ORM async |
| Pydantic | >=2.12 | Validación de datos |
| PostgreSQL | 16 | Base de datos relacional |
| Redis | 7 | Cache (productos) |

---

## Estructura del proyecto

```
HealthBytes-dev/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # Routers: products, orders, auth, cart, users…
│   │   ├── services/        # Lógica de negocio
│   │   ├── db/              # Modelos SQLAlchemy
│   │   ├── schemas/         # Schemas Pydantic (request/response)
│   │   ├── core/            # Config, seguridad, dependencias
│   │   └── middleware/      # Auth middleware
│   ├── tests/               # pytest — unit, integration, e2e
│   ├── alembic/             # Migraciones de DB
│   ├── scripts/             # Seeds y utilidades
│   ├── start.sh             # Arranque Mac/Linux
│   ├── start.ps1            # Arranque Windows
│   └── requirements.txt
│
├── frontend/
│   ├── app/                 # Pantallas (Expo Router file-based)
│   │   ├── (auth)/          # Login, registro
│   │   ├── (tabs)/          # Navegación principal
│   │   └── product/         # Detalle de producto
│   ├── components/          # Componentes reutilizables
│   ├── store/               # Zustand stores
│   ├── api/                 # Clientes HTTP
│   ├── types/               # TypeScript types compartidos
│   ├── hooks/               # Custom hooks
│   ├── setup-env.sh         # Configuración .env Mac/Linux
│   └── setup-env.ps1        # Configuración .env Windows
│
├── docs/                    # Documentación técnica
│   ├── development/         # PROJECT_STATUS.md, roadmap, guías
│   ├── architecture/        # Decisiones y diagramas
│   ├── features/            # Documentación por feature
│   └── security/            # Políticas y auditorías
│
├── infra/                   # Scripts AWS (ECR, ECS, SSM)
├── .agents/                     # Skills y agentes de IA del repo
├── docker-compose.yml       # Postgres + Redis
└── AGENTS.md                # Reglas para agentes de IA
```

---

## Documentación

| Qué necesito | Dónde |
| --- | --- |
| Estado y roadmap actual | [docs/development/PROJECT_STATUS.md](docs/development/PROJECT_STATUS.md) |
| Índice general de docs | [docs/README.md](docs/README.md) |
| Seguridad | [docs/architecture/security/](docs/architecture/security/) |
| Reglas para agentes de IA | [AGENTS.md](AGENTS.md) · [.cursorrules](.cursorrules) |
| API interactiva (runtime) | http://localhost:3001/docs |
| Figma / Wireframes | [Ver diseño](https://www.figma.com/design/0yTwgp5ddVCKM1SL1p2rIS/) |

---

## Testing

```bash
# Backend
cd backend
pytest                          # todos los tests
pytest --cov=app --cov-report=html  # con coverage

# Frontend
cd frontend
pnpm test                       # Jest + React Native Testing Library
pnpm run type-check             # TypeScript
```

<!-- DOCSYNC:testing-table -->
| Suite | Tests | Estado |
| --- | --- | --- |
| Backend | 470+ | ✅ Passing |
| Frontend | 130 | ✅ Passing |
| E2E | 10 | ✅ Passing |
| **Total** | **600+** | ✅ CI verde |
<!-- /DOCSYNC:testing-table -->

---

## Contribuir

### Branches

```
tipo/descripcion-corta
```

| Tipo | Ejemplo |
| --- | --- |
| `feat/` | `feat/product-filters` |
| `fix/` | `fix/price-validation` |
| `docs/` | `docs/update-readme` |
| `refactor/` | `refactor/cart-store` |
| `test/` | `test/add-auth-tests` |
| `chore/` | `chore/update-deps` |
| `perf/` | `perf/optimize-images` |

### Commits (Conventional Commits)

```bash
git commit -m "feat(products): add filtering by allergens"
git commit -m "fix(orders): validate prices from database not client"
git commit -m "test(auth): add JWT expiration tests"
```

### Flujo

```bash
git checkout master && git pull
git checkout -b feat/mi-feature

# ... cambios ...
cd backend && pytest
cd ../frontend && pnpm run type-check && pnpm test

git push origin feat/mi-feature
# Abre PR en GitHub — sigue la plantilla en .github/PULL_REQUEST_TEMPLATE.md
```

> Antes de abrir un PR, verifica que exista una entrada en `.agents/agents/tasks.json` para el trabajo.

---

## Contacto

- 📧 [staff@healthbytes.cl](mailto:staff@healthbytes.cl)
- 🐛 [GitHub Issues](https://github.com/WindB3NJA/HealthBytes-dev/issues)

---

<div align="center">

Hecho con ❤️ por el equipo de HealthBytes

<!-- DOCSYNC:last-updated -->
_Última actualización: 2026-05-29 — generado automáticamente por docsync_
<!-- /DOCSYNC:last-updated -->

</div>
