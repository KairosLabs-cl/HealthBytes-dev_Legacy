---
name: HealthBytes Development Guide
description: Comprehensive development guide for HealthBytes project including architecture patterns, coding conventions, and strict rules for AI assistants
---

# HealthBytes AI Agent Instructions

> **📚 Documentation Map**: This file provides the complete development guide for the HealthBytes project, combining architecture patterns and strict rules.

## Project Overview
HealthBytes is a mobile-first e-commerce platform for health-restricted individuals. **Dual-stack architecture**: FastAPI backend + React Native (Expo) frontend, targeting people with dietary restrictions (celiac, diabetes, allergies).

## 🚫 PROHIBICIONES ABSOLUTAS

### Nunca Modificar Sin Aprobación Explícita

❌ **Stack Tecnológico**
- Backend: FastAPI, SQLAlchemy 2.x (async), PostgreSQL, JWT
- Frontend: React Native, Expo, TypeScript, Zustand, TailwindCSS
- Infraestructura: Docker, docker-compose

❌ **Estructura de Carpetas**
- No mover archivos entre `backend/` y `frontend/`
- No crear nuevas carpetas raíz (mantener: backend, frontend, docs, tools, image)
- No renombrar carpetas principales sin consultar

❌ **Archivos de Configuración Críticos**
- `docker-compose.yml`
- `backend/requirements.txt`
- `frontend/package.json`
- `backend/app/config.py`
- `.env` (nunca crear ni commitear)

❌ **Seguridad**
- NUNCA hardcodear credenciales, tokens, API keys
- NUNCA usar `localStorage` para tokens en frontend
- NUNCA loguear información sensible (passwords, tokens, emails)
- NUNCA deshabilitar validaciones de seguridad sin razón documentada
- NUNCA exponer endpoints sin autenticación (excepto `/health`, `/docs`)

❌ **Gestión de Dependencias**
- No instalar dependencias sin justificación
- No actualizar versiones mayores sin testing completo
- Backend: usar `requirements.txt` (no conda, no poetry)
- Frontend: usar `pnpm` (no npm, no yarn)

---

## 📍 Project Structure

```
HealthBytes-dev/
├── backend/               # FastAPI REST API
│   ├── app/
│   │   ├── api/v1/       # HTTP routers (endpoints only, no business logic)
│   │   │   ├── auth.py   # Login, register
│   │   │   ├── products.py  # Product CRUD
│   │   │   ├── orders.py    # Order management
│   │   │   └── users.py     # User endpoints
│   │   ├── services/     # Business logic layer (currently empty, to be populated)
│   │   ├── schemas/      # Pydantic request/response models
│   │   │   ├── product.py
│   │   │   ├── order.py
│   │   │   └── user.py
│   │   ├── db/
│   │   │   ├── models/   # SQLAlchemy ORM (user.py, product.py, order.py)
│   │   │   ├── database.py  # DB connection & session
│   │   │   └── schemas.py   # Shared enums
│   │   ├── core/
│   │   │   ├── security.py   # JWT, bcrypt hashing
│   │   │   └── exceptions.py # Custom exceptions
│   │   ├── middleware/
│   │   │   └── auth.py       # Clerk + JWT verification
│   │   ├── config.py     # Settings from .env
│   │   └── main.py       # FastAPI app entry point
│   ├── tests/
│   │   ├── conftest.py   # Fixtures, MockAsyncSession
│   │   ├── test_api/     # Endpoint tests
│   │   └── test_services/  # Business logic tests
│   ├── start.ps1         # Windows dev server launcher
│   └── requirements.txt
│
├── frontend/              # React Native (Expo) mobile app
│   ├── app/              # Screens (Expo Router file-based routing)
│   │   ├── _layout.tsx   # Root layout, Clerk provider
│   │   ├── index.tsx     # Home/product list
│   │   ├── cart.tsx      # Shopping cart
│   │   ├── checkout.tsx  # Order checkout
│   │   ├── (auth)/login.tsx  # Auth group
│   │   └── product/[id].tsx  # Dynamic product detail
│   ├── components/       # Reusable UI components
│   │   ├── ui/           # Gluestack UI pre-built components
│   │   ├── ProductListItem.tsx
│   │   └── Header.tsx
│   ├── api/              # HTTP client functions (fetch wrappers)
│   │   ├── products.ts
│   │   ├── orders.ts
│   │   └── auth.ts
│   ├── store/            # Zustand state management
│   │   ├── cartStore.ts
│   │   └── authStore.ts
│   ├── lib/
│   │   └── cache.ts      # Clerk token caching (AsyncStorage)
│   ├── types/
│   │   └── product.ts    # TypeScript interfaces
│   └── package.json      # pnpm dependencies
│
├── docs/
│   ├── copilot-logs/     # AI session documentation
│   │   ├── test-logs/    # Testing coverage status
│   │   └── status-logs/  # Project state tracking
│   └── diagramas/        # Architecture diagrams
│
├── .cursorrules          # Strict rules & prohibitions
├── .github/
│   └── copilot-instructions.md  # This file
└── docker-compose.yml    # (Empty, planned for future)
```

---

## 📁 DOCUMENTACIÓN CANÓNICA

### Documentos Críticos en `docs/copilot-logs/status-logs/`

Solo deben existir 4 archivos canónicos. Cualquier otro archivo nuevo requiere aprobación previa.

| Prioridad | Archivo | Propósito | Cuándo Modificar |
|-----------|---------|-----------|------------------|
| 1️⃣ | `ARQUITECTURA.md` | Diagramas técnicos, stack, estructura de capas, decisiones arquitectónicas | Primero en caso de cambios estructurales |
| 2️⃣ | `ESTADO.md` | **Estado profundo del proyecto para devs**: métricas, scorecard, commits recientes, features por fase, bloqueadores, checklists técnicos | Después de arquitectura, refleja el "cómo estamos" |
| 3️⃣ | `PLAN_DE_ACCION.md` | Roadmap detallado, estimaciones, dependencias entre tareas, sprints planeados | Define el "hacia dónde vamos" |
| 4️⃣ | `RESUMEN_EJECUTIVO.md` | Vista de alto nivel para stakeholders, KPIs, hitos alcanzados | Último, resume los otros 3 docs |

**Orden de actualización ante cambios mayores:**
```
ARQUITECTURA.md → ESTADO.md → PLAN_DE_ACCION.md → RESUMEN_EJECUTIVO.md
```

### Contenido Requerido por Documento

**`ARQUITECTURA.md` - Estructura Técnica:**
- Diagrama ASCII de alto nivel (cliente → backend → DB → servicios externos)
- Estructura de carpetas detallada con estado de cada componente (✅/⚠️/❌)
- Patrón de capas obligatorio (routers → services → models)
- Flujo de autenticación visual (Clerk + JWT)
- Esquema SQL de todas las tablas con campos faltantes marcados
- Tabla de endpoints con status actual
- Brechas arquitectónicas identificadas con código de ejemplo

**`ESTADO.md` - Estado Profundo para Devs:**
- Scorecard visual ASCII del proyecto (% por área: seguridad, funcionalidad, testing, etc.)
- Resultados de última ejecución de tests (passed/failed/errors con causas)
- Desglose de fallos agrupados por categoría
- Archivos con 0% coverage listados
- Tabla de implementaciones confirmadas (backend/frontend)
- Problemas activos con archivos afectados y solución propuesta
- Commits recientes con hashes
- Métricas objetivo vs actual
- Checklist de próximos pasos con prioridad

**`PLAN_DE_ACCION.md` - Roadmap Detallado:**
- Roadmap visual ASCII con sprints y fechas
- Tabla de tareas por sprint con: #, tarea, esfuerzo, dependencia, asignado
- Criterios de éxito por sprint (checkboxes)
- Archivos a modificar listados por sprint
- Calendario visual del mes
- Diagrama de dependencias entre tareas
- Riesgos y mitigaciones
- Definition of Done (DoD)

**`RESUMEN_EJECUTIVO.md` - Vista Stakeholders:**
- Propuesta de valor (1 línea)
- Dashboard ejecutivo ASCII (status, fase, milestone)
- Tabla de hitos alcanzados con fechas
- Funcionalidades: implementadas ✅, en desarrollo ⏳, planificadas 📋
- KPIs técnicos (uptime, coverage, tests, build time)
- Stack tecnológico en tabla lado a lado (frontend vs backend)
- Blocker actual destacado
- Roadmap simplificado (mes a mes)
- Decisiones clave tomadas con justificación

### Reglas de Documentación

**Estructura de documentación:**
```
docs/copilot-logs/
├─ status-logs/          ← Estado general del proyecto (4 archivos canónicos)
├─ test-logs/            ← Testing y QA
├─ auth-logs/            ← Autenticación y seguridad
├─ database-logs/        ← Migraciones y esquemas DB
├─ api-logs/             ← Cambios en endpoints
├─ ui-logs/              ← Componentes y UX
├─ deployment-logs/      ← Docker y despliegues
└─ {topico}-logs/        ← Logs específicos de tópico
   ├─ README.md          ← Índice del tópico
   ├─ {fecha}_{descripcion}.md
   └─ RESUMEN.md         ← Resumen ejecutivo
```

**Reglas:**
- ✅ Logs de IA van en `copilot-logs/{topico}-logs/`
- ✅ Cada carpeta de logs debe tener README.md como índice
- ✅ Usar nombres descriptivos: `YYYY-MM-DD_descripcion.md`
- ✅ Diagramas técnicos en `diagramas/`
- ✅ Crear RESUMEN.md para tópicos extensos
- ❌ NUNCA documentar en raíz del proyecto (usar `docs/`)
- ❌ NUNCA borrar documentación existente sin consultar
- ❌ NUNCA crear docs sin solicitud explícita (excepto cambios arquitectónicos)

**Cuando crear documentación:**
- ✅ Soluciones de bugs complejos
- ✅ Implementación de features nuevas con decisiones arquitectónicas
- ✅ Refactorizaciones mayores
- ✅ Logs de trabajo con IA

---

## Critical Architecture Patterns

### Backend: Strict Layer Separation
```
api/v1/routers → services → db/models
     ↓              ↓           ↓
  HTTP only    Business logic  DB entities
```

**Enforce these rules**:
- Routers (`api/v1/*.py`) ONLY handle HTTP: parse requests, call services, return responses
- Services (`services/*`) contain ALL business logic (queries, validations, calculations)
- Models (`db/models/*`) are pure SQLAlchemy ORM (no business methods)
- NEVER import `db.models` in routers—use services as the interface

**Example violation**:
```python
# ❌ WRONG: Direct DB query in router
@router.get("/products")
async def list_products(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product))  # Business logic in router!
    return result.scalars().all()
```

**Correct pattern**:
```python
# ✅ Router delegates to service
@router.get("/products")
async def list_products(db: AsyncSession = Depends(get_db)):
    return await product_service.list_products(db)

# services/product_service.py
async def list_products(db: AsyncSession) -> List[Product]:
    result = await db.execute(select(Product))
    return result.scalars().all()
```

### Frontend: Clean Component Architecture
- Components (`components/*`) are presentational—props in, JSX out
- API calls ONLY in `api/*.ts` modules (never in components)
- State management via Zustand stores (`store/*Store.ts`)
- Use `AsyncStorage` for persistence, NEVER `localStorage`

**Example**: Cart logic lives in `store/cartStore.ts`, components call `useCart()` hook

### Authentication: Dual System in Transition
- **Legacy**: JWT with `your-secret` key (HS256), 30-day expiration
- **Current**: Clerk OAuth with JWKS verification (RS256)
- Middleware (`middleware/auth.py`) tries Clerk first, falls back to JWT in dev mode
- Frontend uses `@clerk/clerk-expo` with `tokenCache` in `lib/cache.ts`

---

## Developer Workflows

### Start Backend (Windows)
```powershell
cd backend
.\start.ps1          # Creates venv, installs deps, runs uvicorn
.\start.ps1 -NoInstall  # Skip pip install (faster restarts)
```
**Critical**: Uses PowerShell script to manage virtual environment and hot reload. Do NOT use `python run_server.py` directly—it lacks dependency checks.

### Start Frontend
```bash
cd frontend
pnpm install  # MUST use pnpm, NOT npm/yarn
pnpm start
```
Expo dev server runs on port 8081, connects to backend at `http://127.0.0.1:3001`

### Running Tests
```bash
cd backend
pytest                    # Run all tests with coverage
pytest tests/test_api/    # Specific test folder
pytest -m auth            # Run tests marked with @pytest.mark.auth
```
**Note**: Tests use SQLite in-memory DB (see `conftest.py`), not PostgreSQL. Mock async sessions with `MockAsyncSession` wrapper.

### Environment Setup
Backend requires `.env` in `backend/` with:
```
***REDACTED_DATABASE_URL***
JWT_SECRET=your-secret
CLERK_PUBLISHABLE_KEY=pk_test_...
***REDACTED_CLERK_SECRET_KEY***
```
Frontend requires `.env` in `frontend/` with:
```
EXPO_PUBLIC_API_URL=http://127.0.0.1:3001
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

---

## 🎯 FLUJO DE TRABAJO OBLIGATORIO

### 1. Antes de Modificar Código

```
1. Lee el AI-README.md correspondiente (backend/frontend)
2. Verifica la estructura actual con grep_search o semantic_search
3. Identifica el archivo exacto donde hacer el cambio
4. Lee el archivo completo antes de editarlo
5. Ejecuta tests relevantes antes de cambios
```

### 2. Al Crear Nuevas Features

**Backend:**
```
1. Define el schema Pydantic en schemas/
2. Crea/actualiza el model en db/models/
3. Implementa service en services/
4. Crea router en api/v1/
5. Escribe tests en tests/test_api/ o tests/test_services/
6. Actualiza AI-README.md si cambia patrón
```

**Frontend:**
```
1. Define tipos en types/
2. Crea funciones API en api/
3. Crea/actualiza store si necesita estado global
4. Implementa componente UI en components/
5. Integra en screen de app/
6. Verifica que compile con tsc (no `any`)
```

### 3. Al Debuggear

```
1. Lee el error completo antes de proponer solución
2. Verifica archivos relacionados (imports, dependencias)
3. Ejecuta tests para validar fix
4. Si creas logs de debug, guárdalos en docs/copilot-logs/{topico}-logs/
```

### 4. Al Instalar Dependencias

**Backend:**
```bash
# En terminal python:
pip install {package}
pip freeze | grep {package} >> requirements.txt
```

**Frontend:**
```bash
# En terminal pnpm:
pnpm add {package}
# o
pnpm add -D {package}  # para dev dependencies
```

---

## 🧪 TESTING (OBLIGATORIO)

### Cuándo Ejecutar Tests

- ✅ Antes de modificar código existente
- ✅ Después de cada cambio significativo
- ✅ Antes de declarar "tarea completada"

### Comandos de Testing

**Backend:**
```bash
cd backend
pytest                          # Todos los tests
pytest tests/test_api/         # Solo tests de API
pytest -v -s                    # Verbose con prints
```

**Frontend:**
```bash
cd frontend
pnpm test                      # Ejecutar tests (Jest)
pnpm run type-check            # Verificar tipos TypeScript
```

### No Proceder Si:
- ❌ Tests fallan
- ❌ TypeScript no compila
- ❌ Hay errores de sintaxis

---

## 🔒 PRINCIPIOS DE SEGURIDAD

### Variables de Entorno

**Backend (.env):**
```bash
***REDACTED_DATABASE_URL***
JWT_SECRET_KEY=...
JWT_ALGORITHM=HS256
CLERK_PUBLISHABLE_KEY=pk_test_...
***REDACTED_CLERK_SECRET_KEY***
```

**Frontend (.env):**
```bash
EXPO_PUBLIC_API_URL=http://...
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

**Reglas:**
- ✅ Usar `config.py` (backend) o process.env (frontend)
- ✅ Proveer `.env.example` con valores dummy
- ❌ NUNCA commitear `.env`
- ❌ NUNCA hardcodear valores sensibles

### Autenticación

**Backend:**
- ✅ JWT con expiración (1 hora)
- ✅ Middleware `verify_token` en rutas protegidas
- ❌ NUNCA endpoints sin auth (excepto login, health, docs)

**Frontend:**
- ✅ Tokens en AsyncStorage cifrado
- ✅ Limpiar tokens en logout
- ❌ NUNCA localStorage para tokens
- ❌ NUNCA tokens en URL query params

---

## 📦 GESTIÓN DE DEPENDENCIAS

### Dependencias Aprobadas

**Backend (requirements.txt):**
```
fastapi>=0.104.0
uvicorn[standard]>=0.24.0
sqlalchemy>=2.0.0
pydantic>=2.0.0
psycopg2-binary>=2.9.9
python-jose[cryptography]
passlib[bcrypt]
python-multipart
pytest
httpx
```

**Frontend (package.json):**
```json
{
  "dependencies": {
    "expo": "~52.0.0",
    "react-native": "0.76.5",
    "@gluestack-ui/themed": "*",
    "zustand": "*",
    "nativewind": "*"
  }
}
```

### Antes de Añadir Nuevas:
1. ¿Es realmente necesaria?
2. ¿Hay alternativa nativa?
3. ¿Está mantenida activamente?
4. ¿Es compatible con las versiones actuales?

---

## 🚀 COMANDOS PERMITIDOS

### Backend

```bash
# ✅ Permitidos
cd backend
python run_server.py           # Iniciar servidor
.\start.ps1                    # Script PowerShell (Windows)
pytest                          # Ejecutar tests
pip install {package}          # Instalar dependencia
pip freeze                      # Listar dependencias

# ❌ Prohibidos
rm -rf migrations/             # No borrar migraciones
pip install --upgrade fastapi  # No actualizar sin consultar
```

### Frontend

```bash
# ✅ Permitidos
cd frontend
pnpm install                   # Instalar dependencias
pnpm start                      # Iniciar app
pnpm test                       # Ejecutar tests
pnpm run type-check            # Check TypeScript
pnpm add {package}             # Agregar dependencia

# ❌ Prohibidos
npm install                    # Usar pnpm, no npm
rm -rf node_modules/           # No borrar sin razón
expo eject                      # No eject
```

### Docker

```bash
# ✅ Permitidos
docker-compose up              # Levantar servicios
docker-compose down            # Bajar servicios
docker-compose logs            # Ver logs

# ❌ Prohibidos
docker-compose down -v         # No borrar volúmenes sin consultar
```

---

## 🔍 DEBUGGING Y LOGGING

### Backend (Python)

```python
import logging

logger = logging.getLogger(__name__)

# ✅ Correcto
logger.info(f"Fetching products for user {user_id}")
logger.error(f"Database error: {str(e)}", exc_info=True)

# ❌ Incorrecto
print(f"User token: {token}")  # No print, no tokens
```

### Frontend (React Native)

```typescript
// ✅ Correcto
console.log('ProductList rendered with', products.length, 'items');
console.error('Failed to fetch products:', error.message);

// ❌ Incorrecto
console.log('User token:', token);  // No loguear tokens
alert('Error');  // Usar toast/notification UI
```

---

## 📝 CONVENCIONES DE CÓDIGO

### Python (Backend)

```python
# ✅ Correcto
from app.schemas.product import ProductResponse
from app.services.product_service import get_products

async def list_products(db: AsyncSession) -> list[ProductResponse]:
    """Docstring conciso explicando propósito."""
    products = await get_products(db)
    return [ProductResponse.model_validate(p) for p in products]

# ❌ Incorrecto
def list_products(db):  # Sin async, sin tipos
    return db.query(Product).all()  # Query directo (debe estar en service)
```

**Reglas Python:**
- ✅ Type hints obligatorios
- ✅ Async/await para I/O (DB, HTTP)
- ✅ Docstrings en funciones públicas
- ✅ snake_case para funciones y variables
- ❌ No usar `print()` (usar logging)
- ❌ No usar `Any` de typing

### TypeScript (Frontend)

```typescript
// ✅ Correcto
interface Product {
  id: string;
  name: string;
  price: number;
}

export const fetchProducts = async (): Promise<Product[]> => {
  const response = await fetch(`${API_URL}/products`);
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
};

// ❌ Incorrecto
export const fetchProducts = async (): Promise<any> => {  // No any
  return fetch('/products').then(r => r.json());  // URL hardcodeada
};
```

**Reglas TypeScript:**
- ✅ Interfaces para objetos complejos
- ✅ Types explícitos (no `any`)
- ✅ Async/await (no .then())
- ✅ PascalCase para componentes e interfaces
- ✅ camelCase para funciones y variables
- ❌ No `var` (usar `const`/`let`)
- ❌ No `require()` (usar `import`)

### Componentes React Native

```tsx
// ✅ Correcto
interface ProductCardProps {
  product: Product;
  onPress: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  return (
    <Pressable onPress={() => onPress(product.id)}>
      <Text>{product.name}</Text>
      <Text>${product.price}</Text>
    </Pressable>
  );
};

// ❌ Incorrecto
export default function ProductCard({ product }: any) {  // No any, no default export
  const [data, setData] = useState();  // No fetch en componente
  useEffect(() => {
    fetch('/api/products').then(/* ... */);  // Debe estar en api/
  }, []);
  return <View>...</View>;
}
```

---

## 🎨 PATRONES Y ANTI-PATRONES

### ✅ Patrones Recomendados

**Backend:**
- Dependency Injection (FastAPI `Depends`)
- Repository pattern (services actúan como repos)
- Excepciones custom para errores de negocio
- Async para toda I/O (DB, HTTP)

**Frontend:**
- Componentes presentacionales + Container pattern
- Custom hooks para lógica reutilizable
- Zustand para estado global predictible
- Optimistic updates en carrito

### ❌ Anti-Patrones Prohibidos

**Backend:**
- God objects (clases con múltiples responsabilidades)
- Queries SQL raw (usar SQLAlchemy)
- Lógica en routers (debe estar en services)
- Excepciones genéricas sin contexto

**Frontend:**
- Props drilling (más de 3 niveles → usar store)
- Fetching en componentes (usar api/ + store)
- Estado duplicado entre componentes
- Hardcodear estilos (usar TailwindCSS classes)

---

## 🚦 CRITERIOS DE "COMPLETADO"

Una tarea NO está completa hasta que:

- [ ] El código compila/ejecuta sin errores
- [ ] Tests relevantes pasan
- [ ] TypeScript no tiene errores (frontend)
- [ ] Sigue la estructura de carpetas establecida
- [ ] No hay warnings de seguridad
- [ ] Se actualizó documentación si hubo cambios arquitectónicos
- [ ] Se probó manualmente la funcionalidad

---

## 📞 CUANDO CONSULTAR

### Siempre Preguntar Si:

- Vas a cambiar el stack tecnológico
- Necesitas crear una carpeta nueva en raíz
- Vas a modificar docker-compose.yml
- La solución requiere dependencias nuevas
- Hay conflicto entre estos guard rails y la solicitud
- No estás seguro de dónde ubicar un archivo
- La tarea requiere borrar código existente significativo

### Puedes Proceder Sin Preguntar Si:

- Agregas un endpoint nuevo siguiendo patrones existentes
- Creas un componente UI dentro de `components/`
- Agregas un test
- Refactorizas código manteniendo funcionalidad
- Actualizas documentación técnica en `docs/`

---

## 🎓 RECURSOS DE REFERENCIA

### Documentación Interna

- **Arquitectura**: `docs/copilot-logs/status-logs/ARQUITECTURA.md`
- **Testing**: `docs/copilot-logs/test-logs/TESTING_QUICK_START.md`
- **Backend AI**: `backend/AI-README.md`
- **Frontend AI**: `frontend/AI-README.md`

### Documentación Externa

- FastAPI: https://fastapi.tiangolo.com/
- SQLAlchemy 2.0: https://docs.sqlalchemy.org/
- Expo: https://docs.expo.dev/
- React Native: https://reactnative.dev/
- Zustand: https://zustand-demo.pmnd.rs/

---

## 📋 PULL REQUEST RULES (OBLIGATORIO)

### 📌 Convención de Branch Names

**Formato:**
```
tipo/descripcion-corta
```

**Tipos permitidos:**

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| `feat/` | Nueva feature | `feat/product-filters` |
| `fix/` | Bug fix | `fix/price-validation` |
| `docs/` | Documentación | `docs/update-readme` |
| `refactor/` | Mejora de código | `refactor/cart-store` |
| `test/` | Agregar tests | `test/add-auth-tests` |
| `chore/` | Tareas de mantenimiento | `chore/update-dependencies` |
| `perf/` | Optimización | `perf/optimize-images` |

**Reglas Estrictas:**
- ✅ Usa minúsculas: `feat/product-filters`
- ✅ Separa palabras con guión: `feat/add-allergen-filters`
- ✅ Sé descriptivo pero conciso (máx 50 caracteres)
- ✅ No uses caracteres especiales: solo `-` y números
- ❌ NO PERMITIDO: `feature/f1`, `fix/BUG-123`, `Feature/MyNewFeature`

**IA: Si el usuario crea rama con nombre incorrecto, RECHAZA y sugiere el correcto.**

### 📝 Commits con Conventional Commits

**Formato obligatorio:**
```
tipo(scope): descripción en presente

[body opcional - máximo 100 caracteres por línea]

[footer opcional - Closes #123]
```

**Tipos de commit:**
- `feat:` - Nueva feature
- `fix:` - Bug fix
- `docs:` - Cambios de documentación
- `refactor:` - Refactoring sin cambio de funcionalidad
- `test:` - Agregar o actualizar tests
- `chore:` - Cambios no relacionados con código (deps, build, etc)
- `perf:` - Mejora de performance

**Ejemplos Correctos:**
```bash
feat(products): add filtering by allergens and dietary tags

- Added allergen field to Product model
- Implemented filtering endpoints with query parameters
- Created QuickFilters UI component

Closes #250

---

fix(orders): validate prices from database, not client

Previously, prices were accepted from client, allowing security breach.
Now always use price from Product table in DB.

Closes #249

---

docs(readme): update branch naming convention

Added comprehensive guide for branch naming and PR workflow.
```

**IA: Si el mensaje de commit no sigue este formato, RECHAZA y sugiere el correcto.**

### 🎯 Estructura Obligatoria de Pull Request

El título del PR DEBE coincidir con el primer commit.

**Título (máximo 72 caracteres):**
```
feat: Add product filtering by allergens and dietary tags
fix: Validate prices from database, not client
docs: Update contributing guidelines
```

**Descripción (Template):**
```markdown
## 📝 Descripción
[Qué hace este PR y por qué es importante]

## 🎯 Tipo de Cambio
- [x] Nueva feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentación
- [ ] Refactoring

## 🔗 Relacionado con
Closes #123 (reemplaza con número de issue real)

## 📸 Screenshots (si aplica)
[Agregar screenshots para cambios visuales]

## ✅ Checklist Obligatorio
- [ ] Tests pasan localmente (`pytest` en backend, `pnpm test` en frontend)
- [ ] Código sigue convenciones (PEP8 backend, ESLint frontend)
- [ ] Sin console.logs ni debuggers en código
- [ ] Sin `any` types en TypeScript
- [ ] Branch name sigue convención: `tipo/descripcion`
- [ ] Commits son descriptivos y usan Conventional Commits
- [ ] Documentación actualizada si es necesario
- [ ] No hay TODOs pendientes (o documentados en issue)

## 💡 Notas Adicionales
[Información que el revisor debería saber]
```

**IA: Si el PR description está vacía o incompleta, RECHAZA y pide que completen el template.**

### 🚫 PR Automáticamente Rechazado Si:

❌ **Problemas de Formato:**
- Branch name no sigue convención (`tipo/descripcion`)
- Título no sigue Conventional Commits format
- Commits sin mensajes descriptivos o con typos mayores
- Description vacía o sin llenar template

❌ **Problemas de Código:**
- Tests fallan
- TypeScript errors (frontend)
- Código con `any` types
- `console.log` o `debugger` en código
- Líneas comentadas en código productivo

❌ **Problemas de Seguridad:**
- `.env` file commiteado
- Tokens o credenciales en código
- Endpoints sin autenticación (excepto `/health`, `/docs`)
- Passwords hasheados incorrectamente

❌ **Problemas de Estructura:**
- Archivos en carpetas incorrectas
- Nueva carpeta raíz sin aprobación
- Cambio de stack tecnológico sin consultar
- Breaking changes sin documentación

❌ **Sin Checklist:**
- No completó el checklist de PR
- No hizo pruebas manuales

**IA: Tu responsabilidad es RECHAZAR PRs que violen estas reglas ANTES de ser pushéadas.**

### ✅ Flujo de PR Correcto (Paso a Paso)

```bash
# 1. Actualizar desde master
git checkout master
git pull origin master

# 2. Crear rama con nombre correcto
git checkout -b feat/product-filters    # ✅ CORRECTO
# git checkout -b Feature/ProductFilters  # ❌ INCORRECTO
# git checkout -b feature/filters         # ❌ Nombre muy genérico

# 3. Desarrollo y tests
# ... escribir código ...
pytest                  # Tests deben pasar
pnpm run type-check    # TypeScript sin errores

# 4. Commits descriptivos
git commit -m "feat(products): add filtering by allergens

- Implemented filtering endpoints
- Added QuickFilters UI component
- Updated tests

Closes #250"

# 5. Verificar antes de push
git log --oneline -3        # Ver últimos commits
git branch --show-current   # Verificar nombre de rama
git status                  # Archivos limpios

# 6. Push
git push origin feat/product-filters

# 7. Crear PR en GitHub con template completo
# - Título: "feat: Add product filtering by allergens and dietary tags"
# - Description: Llenar completamente el template
# - Checklist: Marcar todos los items
```

### IA: Antes de Sugerir un PR

**SIEMPRE verifica:**
1. ¿El branch name sigue `tipo/descripcion`?
2. ¿Los commits usan Conventional Commits?
3. ¿El código compila sin errores?
4. ¿Los tests pasan?
5. ¿No hay `console.log` o `debugger` en código?
6. ¿No hay `.env` commiteado?
7. ¿No hay tokens/credenciales en código?
8. ¿Hay `any` types que deben ser explícitos?

**Si algo falla: RECHAZA la sugerencia y pide que lo arreglen ANTES de crear el PR.**

---

## 🤝 TL;DR - Reglas de Oro

1. **Lee primero, modifica después** (AI-README.md + código existente)
2. **Sigue la arquitectura** (routers → services → models)
3. **Ubica correctamente** (usa la matriz de ubicaciones)
4. **No hardcodees nada** (env vars para todo)
5. **Testea siempre** (antes y después de cambios)
6. **TypeScript estricto** (no `any`, types explícitos)
7. **Seguridad primero** (no tokens en logs, no endpoints sin auth)
8. **Pregunta si dudas** (mejor consultar que romper)

---

**Este documento es ley.** Si encuentras conflictos con otros documentos, estas reglas tienen prioridad.

Última actualización: 2026-01-27
