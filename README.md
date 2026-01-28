# 🛒💊 HealthBytes – E-commerce de Salud y Bienestar

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

> **Plataforma mobile-first de e-commerce especializada en productos para personas con restricciones alimenticias**
>
> Simplificamos las decisiones de compra de alimentos especializados y medicamentos OTC para usuarios con necesidades dietéticas específicas (celiaquía, diabetes, alergias, intolerancias).

---

## 📋 Tabla de Contenidos

- [¿Qué es HealthBytes?](#-qué-es-healthbytes)
- [🚀 Quick Start](#-quick-start)
- [🏗️ Arquitectura del Proyecto](#️-arquitectura-del-proyecto)
- [🛠️ Stack Tecnológico](#️-stack-tecnológico)
- [📦 Estructura del Proyecto](#-estructura-del-proyecto)
- [🔧 Configuración](#-configuración)
- [📚 Documentación](#-documentación)
- [🧪 Testing](#-testing)
- [🤝 Contribuir](#-contribuir)
- [⚖️ Notas Legales](#️-notas-legales)

---

## 🎯 ¿Qué es HealthBytes?

**HealthBytes** es una aplicación móvil de e-commerce que facilita la compra segura de productos para personas con restricciones de salud.

### Problema que Resolvemos

Las personas con condiciones como celiaquía, diabetes o alergias alimentarias enfrentan dificultades para:

- Identificar productos seguros para su consumo
- Verificar ingredientes y componentes de manera rápida
- Confiar en la información nutricional disponible
- Encontrar alternativas adecuadas en un solo lugar

### Nuestra Solución

- ✅ **Catálogo Curado**: Productos pre-validados con información clara de ingredientes y alérgenos
- ✅ **Filtros Inteligentes**: Búsqueda por restricciones dietéticas, alérgenos y condiciones de salud
- ✅ **Compra Segura**: Sistema de checkout completo con autenticación robusta
- ✅ **Experiencia Mobile-First**: Diseñado para uso móvil con React Native
- ✅ **API Moderna**: Backend robusto con FastAPI y PostgreSQL

### Estado Actual del Proyecto

**Versión:** MVP en Desarrollo Activo  
**Última actualización:** Enero 2026  

| Componente         | Estado           | Descripción                      |
| ------------------ | ---------------- | --------------------------------- |
| 🎨 Frontend Mobile | ✅ Funcional     | React Native + Expo               |
| ⚙️ Backend API   | ✅ Funcional     | FastAPI + SQLAlchemy              |
| 🗄️ Base de Datos | ✅ Funcional     | PostgreSQL con modelos core       |
| 🔐 Autenticación  | ✅ Implementado  | JWT + Clerk (en transición)      |
| 🧪 Tests           | ⚠️ En Progreso | Coverage parcial (ver `tests/`) |
| 🐳 Docker          | 📝 Planeado      | Containerización pendiente       |
| 🚀 Deploy          | 📝 Planeado      | AWS (preparado)                   |

⚠️ **Disclaimer Legal**: Este proyecto NO sustituye el consejo médico profesional. La información de productos es referencial y debe ser verificada. Consulta siempre a un profesional de la salud.

---

## 🚀 Quick Start

¿Quieres empezar a desarrollar en menos de 10 minutos? Sigue estos pasos:

### Prerrequisitos

Asegúrate de tener instalado:

- **Git** ([Descargar](https://git-scm.com/downloads)) - Control de versiones
- **GitHub CLI (gh)** ([Descargar](https://cli.github.com/)) - Herramienta de línea de comandos para GitHub
- **Python 3.14+** ([Descargar](https://www.python.org/downloads/)) - Lenguaje para el backend ⚡ **Actualizado a 3.14.2**
- **Node.js 18+** ([Descargar](https://nodejs.org/)) - Runtime para frontend
- **pnpm 8+** ([Descargar](https://pnpm.io/installation)) - Gestor de paquetes (obligatorio)
- **PostgreSQL 14+** ([Descargar](https://www.postgresql.org/download/)) - Base de datos relacional

> 🚀 **Nueva versión**: Actualizado a Python 3.14.2 para mejor performance (~10-15% más rápido en inicio del servidor).

### 1️⃣ Clonar el Repositorio

```bash
gh repo clone nojustbenja/HealthBytes-dev
cd HealthBytes-dev
```

### 2️⃣ Configurar Backend (5 minutos)

```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
.\venv\Scripts\Activate.ps1  # Windows PowerShell
# source venv/bin/activate    # Linux/Mac

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# ⚠️ IMPORTANTE: Edita .env con tus credenciales reales
```

**Configurar `.env`** (ver sección [Configuración](#-configuración) para más detalles)

### 3️⃣ Configurar Frontend (3 minutos)

```bash
cd ../frontend

# Instalar dependencias (usar pnpm)
pnpm install
```

### 4️⃣ Ejecutar el Proyecto

**Terminal 1 - Backend:**

```bash
cd backend
.\start.ps1  # Windows
# ./start.sh # Linux/Mac
```

El backend estará disponible en:

- 🌐 API: http://localhost:3001
- 📖 Docs: http://localhost:3001/docs (Swagger UI)

**Terminal 2 - Frontend:**

```bash
cd frontend
pnpm start
```

### 5️⃣ Verificar Instalación

1. Abre http://localhost:3001/docs en tu navegador
2. Deberías ver la documentación interactiva de la API
3. Prueba el endpoint `GET /api/v1/health` para verificar que todo funciona

¿Problemas? Consulta la [Guía de Troubleshooting](docs/Copilot-logs/status-logs/QUICK_START.md)

---

## 🏗️ Arquitectura del Proyecto

HealthBytes sigue una arquitectura **monolítica modular** que facilita el desarrollo inicial y permite la extracción futura de microservicios.

```
┌─────────────────────────────────────────┐
│         📱 React Native App             │
│    (Frontend - Mobile First)            │
└──────────────┬──────────────────────────┘
               │ HTTP/JSON
               │
┌──────────────▼──────────────────────────┐
│      ⚙️  FastAPI Backend                │
│   • REST API (OpenAPI)                  │
│   • JWT Authentication                  │
│   • Business Logic                      │
└──────────────┬──────────────────────────┘
               │ SQLAlchemy ORM
               │
┌──────────────▼──────────────────────────┐
│      🗄️  PostgreSQL Database            │
│   • products, users, orders             │
│   • Relational data model               │
└─────────────────────────────────────────┘
```

### Características de Arquitectura

- **🔄 API Versionada**: `/api/v1/` permite evolución sin romper compatibilidad
- **🛡️ Seguridad por Capas**: Middleware de autenticación + validación en servicios
- **📦 Modularidad**: Separación clara entre API, Services, DB, Schemas
- **🔌 Preparado para Microservicios**: Estructura lista para extraer servicios independientes

### Flujo de Request Típico

```
1. Usuario hace acción en App
   ↓
2. Frontend envía HTTP request a /api/v1/*
   ↓
3. Middleware valida JWT (si es necesario)
   ↓
4. Router delega a Service
   ↓
5. Service ejecuta lógica de negocio
   ↓
6. SQLAlchemy consulta PostgreSQL
   ↓
7. Response con Pydantic Schema
   ↓
8. Frontend actualiza UI
```

---

## 🛠️ Stack Tecnológico

### Frontend

| Tecnología  | Versión | Propósito                       |
| ------------ | -------- | -------------------------------- |
| React Native | Latest   | Framework mobile multiplataforma |
| TypeScript   | 5.x      | Type safety y mejor DX           |
| Expo         | Latest   | Tooling y desarrollo             |
| Zustand      | Latest   | State management ligero          |
| Gluestack UI | Latest   | Componentes UI consistentes      |

### Backend

| Tecnología | Versión | Propósito               |
| ----------- | -------- | ------------------------ |
| FastAPI     | 0.109+   | Framework web moderno    |
| Python      | 3.11+    | Lenguaje principal       |
| SQLAlchemy  | 2.x      | ORM async                |
| Pydantic    | 2.x      | Validación de datos     |
| PostgreSQL  | 14+      | Base de datos relacional |
| pytest      | Latest   | Testing framework        |

### Autenticación & Seguridad

- **JWT** (HS256): Tokens stateless
- **Clerk** (en evaluación): Gestión avanzada de usuarios
- **bcrypt**: Hash de contraseñas
- **CORS**: Configuración para mobile apps

### DevOps (Roadmap)

- Docker + Docker Compose
- AWS (EC2, RDS, S3)
- GitHub Actions (CI/CD)

---

## 📦 Estructura del Proyecto

```
HealthBytes-dev/
│
├── 📱 frontend/              # Aplicación móvil React Native + TypeScript
│                             # (Ver frontend/README.md para detalles)
│
├── ⚙️ backend/               # API FastAPI + Python + SQLAlchemy
│                             # (Ver backend/README.md para detalles)
│
├── 📚 docs/                  # Documentación del proyecto
│   ├── Copilot-logs/         # Reportes y análisis
│   │   ├── status-logs/      # Estado y diagnóstico del proyecto
│   │   └── auth-logs/        # Autenticación y seguridad
│   └── diagramas/            # Diagramas de arquitectura
│
├── 🛠️ tools/                 # Herramientas y scripts utilitarios
│
├── 🐳 docker-compose.yml     # (Futuro) Configuración Docker
└── 📄 README.md              # Este archivo (raíz)
```

### 🗂️ Carpetas Principales

| Carpeta             | Descripción                                                                                         |
| ------------------- | ---------------------------------------------------------------------------------------------------- |
| **frontend/** | Aplicación móvil en React Native. Pantallas, componentes, estado global (Zustand), llamadas a API. |
| **backend/**  | API REST en FastAPI. Modelos, servicios, autenticación, validaciones, base de datos.                |
| **docs/**     | Documentación técnica, reportes de diagnóstico, guías y diagramas de arquitectura.               |
| **tools/**    | Scripts y herramientas auxiliares para el proyecto.                                                  |

📖 **Para ver la estructura detallada de cada carpeta, consulta:**

- [frontend/README.md](frontend/README.md)
- [backend/README.md](backend/README.md)

### Navegación Rápida

| Necesito...                 | Ve a...                                                                       |
| --------------------------- | ----------------------------------------------------------------------------- |
| Ver estado del proyecto     | [Análisis Profundo 27/01/26](docs/copilot-logs/status-logs/ANALISIS_PROFUNDO_2026-01-27.md) |
| Ver cambios recientes       | [Sesión 27/01/26](docs/copilot-logs/status-logs/SESSION_2026-01-27.md)           |
| Documentación general       | [docs/README.md](docs/README.md)                         |
| Documentación del Backend   | [backend/README.md](backend/README.md)                                           |
| Documentación del Frontend  | [frontend/README.md](frontend/README.md)                                         |
| Información de tests        | [backend/tests/README.md](backend/tests/README.md)                                       |
| Convención de branches      | [Sección Contribuir](#-contribuir)                                                |

---

## 🔧 Configuración

### Variables de Entorno - Backend

Crea un archivo `.env` en la carpeta `backend/` con las siguientes variables:

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
DATABASE_URL="postgresql://user:password@localhost:5432/healthbytes"
# Formato: postgresql://[usuario]:[contraseña]@[host]:[puerto]/[nombre_db]

# ============================================
# AUTHENTICATION - CLERK (Provider Externo)
# ============================================
# Ver documento de keys: https://app.clickup.com/90131597357/v/dc/2ky4621d-2233
CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# ============================================
# JWT CONFIGURATION
# ============================================
JWT_SECRET="tu-secreto-super-seguro-aqui-cambia-esto-en-produccion"
JWT_ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES="43200"  # 30 días (para desarrollo)

# ============================================
# APPLICATION SETTINGS
# ============================================
ENVIRONMENT="dev"  # dev | staging | production
DEBUG="True"       # Solo en desarrollo

# ============================================
# API CONFIGURATION
# ============================================
API_V1_PREFIX="/api/v1"
PROJECT_NAME="HealthBytes API"
```

### 🔑 Obtener Keys y Credenciales

Las credenciales y API keys (Clerk, Stripe, etc.) están documentadas en ClickUp:

**📋 [Documento de Keys en ClickUp](https://app.clickup.com/90131597357/v/dc/2ky4621d-2233)**

> **⚠️ Nota Importante:** Debes estar previamente invitado al workspace de ClickUp y haber aceptado la invitación para poder ver este documento.

Si no tienes acceso, solicítalo al líder del equipo.

### Configuración de PostgreSQL

**Opción 1: Instalación Local**

1. Descarga e instala PostgreSQL 14+ desde https://www.postgresql.org/download/
2. Crea una base de datos:
   ```sql
   CREATE DATABASE healthbytes;
   CREATE USER healthbytes_user WITH PASSWORD 'tu_password';
   GRANT ALL PRIVILEGES ON DATABASE healthbytes TO healthbytes_user;
   ```
3. Actualiza `DATABASE_URL` en tu `.env`

**Opción 2: Docker (Recomendado para desarrollo)**

```bash
docker run --name healthbytes-postgres \
  -e POSTGRES_USER=healthbytes_user \
  -e POSTGRES_PASSWORD=tu_password \
  -e POSTGRES_DB=healthbytes \
  -p 5432:5432 \
  -d postgres:14
```

### Clerk Setup (Autenticación)

1. Crea una cuenta en [Clerk](https://dashboard.clerk.com)
2. Crea una nueva aplicación
3. Copia las API Keys:
   - `CLERK_PUBLISHABLE_KEY` (empieza con `pk_`)
   - `CLERK_SECRET_KEY` (empieza con `sk_`)
4. Pégalas en tu archivo `.env`

**⚠️ IMPORTANTE**: Las keys reales están guardadas en ClickUp (solo para el equipo)

### Verificar Configuración

Una vez configurado todo, verifica que funciona:

```bash
cd backend
python -c "from app.core.config import settings; print(settings.DATABASE_URL)"
```

Si ves la URL de tu base de datos, ¡todo está bien! 🎉

---

## 📚 Documentación

### Documentación del Proyecto

| Documento                                                                     | Descripción                               | Audiencia          |
| ----------------------------------------------------------------------------- | ------------------------------------------ | ------------------ |
| [Análisis Proyecto](docs/copilot-logs/status-logs/ANALISIS_PROFUNDO_2026-01-27.md) | ⭐**Estado completo** - Análisis exhaustivo (27/01/26) | Todos |
| [Sesión 27/01](docs/copilot-logs/status-logs/SESSION_2026-01-27.md)       | Cambios y fixes recientes                  | Devs              |
| [docs/README.md](docs/README.md)                       | Índice general de documentación            | Todos              |

### READMEs Específicos

- **Backend**: [backend/README.md](backend/README.md) - API, endpoints, modelos
- **Frontend**: [frontend/README.md](frontend/README.md) - Componentes, navegación, estado
- **Testing**: [backend/tests/README.md](backend/tests/README.md) - Estrategia de testing

### 🤖 Directrices para IA

**Si eres un asistente de IA (Copilot, Claude, etc.) o vas usar alguna herramienta de IA, debes leer estos primero:**

- **[.cursorrules](.cursorrules)** - Guard rails obligatorios para cualquier IA; define qué se puede y no se puede hacer ¡ADJUNTALO! 
- **[backend/AI-README.md](backend/AI-README.md)** - Reglas y patrones para generar código del backend
- **[frontend/AI-README.md](frontend/AI-README.md)** - Reglas y patrones para generar código del frontend

⚠️ **IMPORTANTE**: [.cursorrules](.cursorrules) tiene prioridad y es obligatorio para mantener la calidad; ignóralo y romperás las reglas del proyecto.

### API Documentation

Una vez que el backend esté corriendo, accede a:

- **Swagger UI** (interactivo): http://localhost:3001/docs
- **ReDoc** (alternativo): http://localhost:3001/redoc
- **OpenAPI JSON**: http://localhost:3001/openapi.json

### Diagramas

Los diagramas de arquitectura están en `docs/diagramas/`:

- `Infrastructura.drawio` - Diagrama de infraestructura (abrir con draw.io)

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Ejecutar todos los tests
pytest

# Ejecutar con coverage
pytest --cov=app --cov-report=html

# Ejecutar tests específicos
pytest tests/test_api/test_products.py
pytest tests/test_services/

# Ejecutar tests en modo verbose
pytest -v
```

### Estado Actual de Tests

| Módulo      | Coverage | Estado           |
| ------------ | -------- | ---------------- |
| API Auth     | ~70%     | ⚠️ En progreso |
| API Products | ~80%     | ✅ Funcional     |
| API Orders   | ~60%     | ⚠️ Mejorar     |
| Services     | ~50%     | ⚠️ Incompleto  |

Ver más detalles en [tests/README.md](backend/tests/README.md)

### Frontend Tests (Pendiente)

```bash
cd frontend
# pnpm test  # Por implementar
```

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Sigue estos pasos:

### 📋 Convención de Branch Names

Usamos **Conventional Branch Names** - estándar en la industria, simple y legible.

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

**Reglas:**
- ✅ Usa minúsculas: `feat/product-filters`
- ✅ Separa palabras con guión: `feat/add-allergen-filters`
- ✅ Sé descriptivo pero conciso: `feat/cart-persistence` (no `feat/f1`)
- ✅ No uses caracteres especiales: `feat/fix-auth` (no `feat/fix-@auth`)

**Ejemplos correctos:**
```bash
feat/product-filters
feat/cart-persistence
fix/price-validation
docs/api-documentation
test/auth-endpoints
chore/npm-update
refactor/auth-middleware
```

### 🔄 Flujo de Trabajo

#### 1. Crea tu rama desde `master`

```bash
git checkout master
git pull origin master

# Crea la rama con el nombre adecuado
git checkout -b feat/mi-nueva-feature
# git checkout -b fix/mi-bug-fix
# git checkout -b docs/mi-doc-actualizada
```

#### 2. Desarrollo Local

```bash
# Realiza tus cambios...
# Asegúrate de seguir las convenciones de código

# Tests (obligatorio)
cd backend && pytest              # Para backend
cd ../frontend && pnpm test       # Para frontend (cuando esté listo)
```

#### 3. Commits con Conventional Commits

Sigue [Conventional Commits](https://www.conventionalcommits.org/) para que los commits sean claros y automáticamente versionados.

```bash
git commit -m "feat(products): add filtering by allergens and dietary tags"
git commit -m "fix(orders): validate prices from database, not client"
git commit -m "docs(readme): update branch naming convention"
git commit -m "test(auth): add JWT validation tests"
git commit -m "refactor(store): improve zustand cart structure"
```

**Formato:**
```
tipo(scope): descripción en presente

[body opcional]
[footer opcional - ejemplo: Closes #123]
```

**Ejemplos:**
```bash
feat(products): add product filtering by allergens

- Added allergen field to Product model
- Implemented filtering endpoint
- Created QuickFilters UI component

Closes #250
```

#### 4. Push y Pull Request

```bash
# Push a tu rama
git push origin feat/mi-nueva-feature

# Crea el Pull Request en GitHub
# Title: feat: Add product filtering by allergens (mismo que el commit)
# Description: Sigue la plantilla de abajo
```

### 📝 Estructura de Pull Request

```markdown
## 📝 Descripción
Breve descripción de qué hace este PR y por qué

## 🎯 Tipo de Cambio
- [x] Nueva feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentación

## 📸 Screenshots/Demo (si aplica)
Agrega screenshots para cambios visuales

## ✅ Checklist
- [ ] Tests pasan: `pytest` y `pnpm test`
- [ ] Código sigue las convenciones
- [ ] Documentación actualizada
- [ ] Sin console.logs ni prints en prod
- [ ] Sin TODOs pendientes
- [ ] Branch name sigue la convención
- [ ] Commits son descriptivos

## 💡 Notas
Información adicional que el revisor debería saber
```

### 🔍 Antes de hacer Push

```bash
# 1. Actualiza desde master
git fetch origin
git rebase origin/master

# 2. Ejecuta tests
pytest                          # Backend
# pnpm test                    # Frontend

# 3. Verifica que tu branch name sea correcto
git branch --show-current
# Output: feat/product-filters ✅

# 4. Push
git push origin feat/product-filters
```

---

## 📊 Estado del Proyecto (Actualizado: 27/01/2026)

**Calificación Global**: 🟢 **85/100** - Muy Bueno

- ✅ Arquitectura sólida (100% backend, 90% frontend)
- ✅ Seguridad correcta (sin credenciales hardcodeadas, JWT configurado)
- ⚠️ Testing parcial (backend 50%, frontend 0%)
- ⚠️ TypeScript con 10 usos de `any` (mejorando)

**Ver**: [Análisis Completo](docs/copilot-logs/status-logs/ANALISIS_PROFUNDO_2026-01-27.md)

---

## ⚖️ Notas Legales

### Disclaimer Médico

⚠️ **IMPORTANTE - LEE CUIDADOSAMENTE**

**HealthBytes NO es un dispositivo médico ni sustituye el consejo médico profesional.**

- ✋ La información de productos es **referencial** y debe ser verificada
- ✋ NO usar como única fuente para decisiones de salud críticas
- ✋ Clasificación de ingredientes y alérgenos en constante revisión
- ✋ **SIEMPRE** consulta a un profesional de la salud certificado ante dudas
- ✋ En caso de reacción alérgica o emergencia, busca atención médica inmediata

### Responsabilidad del Usuario

Al usar HealthBytes, el usuario acepta que:

- Es responsable de verificar la información de productos
- No utilizará la app como sustituto de consulta médica
- Leerá las etiquetas de productos físicos antes de consumir
- Reportará errores o inconsistencias en la información

### Privacidad y Datos

- Cumplimos con estándares de protección de datos
- No compartimos información médica sin consentimiento
- Ver [Política de Privacidad] para más detalles (en desarrollo)

---

## 📞 Contacto y Soporte

### Equipo de Desarrollo

- 📧 Email: staff@healthbytes.cl
- 🐛 Reportar bugs: [GitHub Issues](https://github.com/WindB3NJA/HealthBytes-dev/issues)
- 💡 Sugerencias: [GitHub Discussions](https://github.com/WindB3NJA/HealthBytes-dev/discussions)

### Enlaces Útiles

- 📖 [Documentación Completa](docs/)
- 🎯 [Roadmap del Proyecto](docs/Copilot-logs/status-logs/PLAN_ACCION.md)
- [📱 Wireframe / Diseño Figma](https://www.figma.com/design/0yTwgp5ddVCKM1SL1p2rIS/Wireframes---HealthBytes?node-id=11606-22516&t=VWSNkneVk6PCZnrh-1)
- [🔑 Llaves de acceso para .env  ](https://app.clickup.com/90131597357/v/dc/2ky4621d-2233)

---

## 📜 Licencia

[Pendiente de definir - En desarrollo privado]

---

<div align="center">

### 💚 HealthBytes

🛒 **E-commerce** • 💊 **Salud** • ❤️ **Bienestar**

---

Hecho con ❤️ por el equipo de HealthBytes

_Última actualización: 27 Enero 2026_

</div>
