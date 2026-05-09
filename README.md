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
- [🗺️ Roadmap](#️-roadmap)
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

**Versión:** MVP en cierre técnico (90% del roadmap principal)
**Última actualización:** Abril 6, 2026
**Fuente de verdad:** [docs/development/PROJECT_STATUS.md](docs/development/PROJECT_STATUS.md)
**Auditoría técnica consolidada:** [docs/architecture/HealthBytes_Architecture_Review.md](docs/architecture/HealthBytes_Architecture_Review.md)

<!-- DOCSYNC:status-table -->
| Componente | Estado | Detalle |
| --- | --- | --- |
| 🎨 Frontend Mobile | ✅ Funcional | React Native + Expo — 130 tests pasando |
| ⚙️ Backend API | ✅ Funcional | FastAPI + SQLAlchemy async — 464 tests pasando |
| 🗄️ Base de Datos | ✅ Funcional | PostgreSQL con modelos core + índices optimizados |
| 🔐 Autenticación | ✅ Implementado | JWT + Clerk (dual auth), AuthGate en screens protegidos |
| 🧪 Tests | ✅ Estable | 594 tests (464 backend + 130 frontend) — 40% coverage |
| 🛡️ Security | ✅ Hardened | Bandit + Gitleaks + pnpm audit en CI |
| 🐳 Docker | ✅ Funcional | docker-compose con backend + DB |
| 🚀 CI/CD | ✅ Implementado | GitHub Actions (lint, test, SAST, secret-scan, deploy) |
| ☁️ AWS Infra | ✅ Scripts listos | ECR, ECS task definition, SSM secrets en `infra/` |
| 💾 Redis Cache | ✅ | `get_products_cached()` en product_service.py |
| 📲 OnboardingModal | ✅ | Cableado en `_layout.tsx` |
| 🧪 E2E Tests | ✅ | 10 tests en `backend/tests/e2e/` |
| 🔄 Rate Limiting | ✅ | slowapi en endpoints críticos |
| 📊 Sentry | ✅ | Error tracking en backend |
| 💳 MercadoPago | ✅ | Payment integration completa |
| 📧 Email (Resend) | ✅ | Emails de confirmación de órdenes |
<!-- /DOCSYNC:status-table -->

### 🛡️ Estado de Seguridad (Febrero 2026)

**Vulnerabilidades Resueltas:**

- ✅ **minimatch ReDoS** (HIGH) - Resuelto con glob 11.0.0 + minimatch 10.2.2 override
- ✅ **@clerk/clerk-expo** - Actualizado a 2.19.26 (reduce exposición bn.js)
- ⚠️ **ajv MEDIUM** - Deferred (ESLint 9 ecosystem pending v2.0 plugins, dev-only)
- ⚠️ **bn.js MEDIUM** - Upstream sin patch: @solana/web3.js max 1.98.4 con bn.js 5.2.3

**Validación**: `pnpm audit --prod` = "No known vulnerabilities found"

Ver [Security Documentation](docs/security/) para detalles técnicos y mitigation strategy.

---

⚠️ **Disclaimer Legal**: Este proyecto NO sustituye el consejo médico profesional. La información de productos es referencial y debe ser verificada. Consulta siempre a un profesional de la salud.

---

## 🚀 Quick Start

¿Quieres empezar a desarrollar en menos de 10 minutos? Sigue estos pasos:

### 🎯 Opción Recomendada: VS Code Workspace

Abre el proyecto con configuración multi-root optimizada:

```bash
# Después de clonar el repo
code HealthBytes.code-workspace
```

**Incluye**:

- ✅ Backend + Frontend + Docs en carpetas separadas
- ✅ Debugger preconfigured para FastAPI
- ✅ Tasks para iniciar servicios
- ✅ Formateo automático (Black + Prettier)
- ✅ Extensions recomendadas
- ✅ Terminal configurado por contexto

### Prerrequisitos

Asegúrate de tener instalado:

- **Git** ([Descargar](https://git-scm.com/downloads)) - Control de versiones
- **GitHub CLI (gh)** ([Descargar](https://cli.github.com/)) - Herramienta de línea de comandos para GitHub
- **Python 3.14+** ([Descargar](https://www.python.org/downloads/)) - Lenguaje para el backend (🆕 3.14.2 requerido por seguridad)
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

# Windows PowerShell (recomendado):
.\start.ps1

# O manual:
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python run_server.py
```

**Backend disponible en**: `http://localhost:3001`

**Configurar `.env`** (ver sección [Configuración](#-configuración) para más detalles)

### 3️⃣ Configurar Frontend (1 minuto) ⚡

```bash
cd ../frontend

# Instalar dependencias (usar pnpm)
pnpm install

# Configuración automática (detecta tu IP y configura .env)
.\setup-env.ps1
```

**El script te preguntará:**

- ¿Usarás solo Web, Expo Go, o ambos?
- ¿Actualizar CORS del backend?

✅ **Recomendado**: Selecciona "Ambos" (opción 3) para máxima flexibilidad

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

¿Problemas? Consulta la [documentación de setup](docs/setup/)

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

<!-- DOCSYNC:stack-frontend -->
| Tecnología | Versión | Propósito |
| ------------ | -------- | -------------------------------- |
| React Native | 0.81.5 | Framework mobile multiplataforma |
| TypeScript | 5.x | Type safety y mejor DX |
| Expo | 54.0.33 | Tooling y desarrollo |
| Zustand | 5.0.10 | State management ligero |
| Gluestack UI | Latest | Componentes UI consistentes |
<!-- /DOCSYNC:stack-frontend -->

### Backend

<!-- DOCSYNC:stack-backend -->
| Tecnología | Versión | Propósito |
| ----------- | -------- | ------------------------ |
| FastAPI | 0.136.1 | Framework web moderno |
| Python | 3.13.1 | Lenguaje principal |
| SQLAlchemy | 2.0.49 | ORM async |
| Pydantic | 2.13.4 | Validación de datos |
| PostgreSQL | 14+ | Base de datos relacional |
| pytest | Latest | Testing framework |
<!-- /DOCSYNC:stack-backend -->

### Autenticación & Seguridad

- **JWT** (HS256): Tokens stateless
- **Clerk** (en evaluación): Gestión avanzada de usuarios
- **bcrypt**: Hash de contraseñas
- **CORS**: Configuración para mobile apps

### DevOps

- ✅ Docker + Docker Compose (funcional)
- ✅ GitHub Actions CI/CD (lint, test, security, deploy)
- AWS (EC2, RDS, S3) — preparado

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
│   ├── architecture/         # Arquitectura y decisiones
│   ├── development/          # Roadmap, testing, guías, ESTADO
│   │   └── inspections/      # Reportes de inspección
│   ├── features/             # Documentación de features
│   ├── security/             # Seguridad
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

---

## 📚 Documentación

### Para Humanos 👨‍💻

| Documento                                                     | Para Qué                                   |
| ------------------------------------------------------------- | ------------------------------------------- |
| [frontend/README.md](frontend/README.md)                         | Guía completa del frontend                 |
| [backend/README.md](backend/README.md)                           | Guía completa del backend                  |
| [docs/README.md](docs/README.md)                                 | Índice centralizado de toda documentación  |
| [docs/setup/frontend-setup.md](docs/setup/frontend-setup.md)     | Configuración del frontend (setup-env.ps1) |
| [docs/security/security-improvements.md](docs/security/security-improvements.md) | Mejoras de seguridad implementadas |
| [docs/features/full-text-search.md](docs/features/full-text-search.md) | Full-Text Search implementado         |

### Para Asistentes de IA 🤖

| Documento                                                       | Para Qué                                               |
| --------------------------------------------------------------- | ------------------------------------------------------- |
| [backend/AI-README.md](backend/AI-README.md)                       | Patrones, reglas y arquitectura del backend             |
| [frontend/AI-README.md](frontend/AI-README.md)                     | Patrones, reglas y arquitectura del frontend            |
| [.cursorrules](.cursorrules)                                       | **CRÍTICO**: Reglas obligatorias y prohibiciones        |
| [.github/copilot-instructions.md](.github/copilot-instructions.md) | Instrucciones globales para IA                         |
| [docs/development/PROJECT_STATUS.md](docs/development/PROJECT_STATUS.md) | Estado + roadmap centralizados (fuente de verdad)      |
| [docs/architecture/HealthBytes_Architecture_Review.md](docs/architecture/HealthBytes_Architecture_Review.md) | Hallazgos tecnicos y plan de accion de arquitectura |

### Navegación Rápida

| Necesito...              | Ve a...                                   |
| ------------------------ | ----------------------------------------- |
| Documentación principal | [docs/README.md](docs/README.md)             |
| Ver estado del proyecto  | [docs/development/PROJECT_STATUS.md](docs/development/PROJECT_STATUS.md) |
| Backend info             | [backend/README.md](backend/README.md)       |
| Frontend info            | [frontend/README.md](frontend/README.md)     |
| Tools scripts            | [Tools/README.md](Tools/README.md)           |
| Reglas para IA           | [.cursorrules](.cursorrules)                 |
| Convención de branches  | [Sección Contribuir](#-contribuir)          |

---

## 🔧 Configuración

### ⚡ Configuración Automática del Frontend (Recomendado)

Usamos un script PowerShell que detecta automáticamente tu IP y configura el entorno:

```powershell
cd frontend
.\setup-env.ps1
```

**El script configurará automáticamente:**

- ✅ Detecta tu IP local de red (192.168.x.x)
- ✅ Configura el archivo `.env` según tu modo de desarrollo
- ✅ Actualiza el CORS del backend (opcional)
- ✅ Te da instrucciones claras de próximos pasos

**Opciones disponibles:**

- **[1] Solo Web**: Usa `localhost` (para desarrollo en navegador)
- **[2] Solo Expo Go**: Usa tu IP local (para celular/tablet)
- **[3] Ambos**: Usa tu IP local (funciona en ambos casos) ✨ **Recomendado**

**¿Por qué usar tu IP local?**

- ✅ `localhost` NO funciona en Expo Go (el celular busca su propio localhost)
- ✅ Tu IP local (ej: `192.168.1.127`) funciona tanto en web como en Expo Go
- ✅ Ambos dispositivos deben estar en la **misma red WiFi**

**Si tu IP cambia** (cambiar de red WiFi, reiniciar router):

```powershell
.\setup-env.ps1  # Vuelve a ejecutar el script
```

📖 **Más detalles**: Ver [frontend/SETUP.md](frontend/SETUP.md) para configuración manual y troubleshooting

---

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

Las credenciales y API keys (Clerk, Mercado Pago, etc.) están documentadas en ClickUp:

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

## ⚙️Herramientas de Desarrollo

### VS Code Workspace (Recomendado)

Este proyecto incluye un archivo de workspace multi-root (`HealthBytes.code-workspace`) que organiza el proyecto en carpetas específicas y proporciona configuraciones optimizadas.

**✨ Beneficios del Workspace:**

- **4 carpetas separadas**: Backend, Frontend, Docs y Root (organización clara)
- **Debugger preconfigurado**: Depurador de FastAPI listo para usar (F5)
- **Tasks integradas**: Comandos para iniciar backend/frontend desde el menú de tareas
- **Configuración por carpeta**: Formatters y linters específicos para Python/TypeScript
- **Extensiones recomendadas**: Lista automática de extensiones útiles

**🚀 Cómo usarlo:**

1. **Abrir el workspace** (en lugar del proyecto):

   ```bash
   # Opción 1: Desde la línea de comandos
   code HealthBytes.code-workspace

   # Opción 2: Desde VS Code
   File → Open Workspace from File → HealthBytes.code-workspace
   ```
2. **Instalar extensiones recomendadas**:

   - VS Code mostrará una notificación automáticamente
   - O ve a Extensions (Ctrl+Shift+X) y busca "Workspace Recommendations"
3. **Usar el debugger** (Backend):

   - Coloca breakpoints en tu código Python
   - Presiona `F5` o ve a Run → Start Debugging
   - El servidor arrancará en modo debug con hot reload
4. **Ejecutar tasks**:

   - `Ctrl+Shift+P` → "Tasks: Run Task"
   - Selecciona "Start Backend" o "Start Frontend"

**📁 Estructura del Workspace:**

```
HealthBytes (Workspace)
├── Backend    → backend/      (Python, FastAPI, pytest)
├── Frontend   → frontend/     (React Native, TypeScript, Jest)
├── Docs       → docs/         (Documentación del proyecto)
└── Root       → ./            (Configuración general)
```

**💡 Tip**: Si prefieres otro editor (WebStorm, Zed, etc.), la estructura del proyecto funciona igual sin el workspace.

---

### Pre-commit Hooks (Control de Calidad Automático)

Los pre-commit hooks ejecutan verificaciones automáticas **antes de cada commit** para mantener la calidad del código.

**🔧 Herramientas incluidas:**

| Tool             | Propósito                                    | Ejemplo                                      |
| ---------------- | --------------------------------------------- | -------------------------------------------- |
| **Black**  | Formateador automático (líneas máx: 100)   | Corrige indentación y espaciado             |
| **Flake8** | Linter que detecta errores y malas prácticas | "Variable no usada", "Import sin usar"       |
| **isort**  | Ordena y organiza imports automáticamente    | Agrupa imports en stdlib, third-party, local |
| **Bandit** | Escanea vulnerabilidades de seguridad         | Detecta `eval()`, contraseñas hardcoded   |

**📦 Instalación (una sola vez):**

```powershell
# Windows (PowerShell)
cd backend
.\setup-hooks.ps1

# Linux/Mac
cd backend
chmod +x setup-hooks.sh
./setup-hooks.sh
```

El script hace 3 cosas:

1. Instala `pre-commit` (si no lo tienes)
2. Instala los hooks en tu repositorio local
3. Verifica que todo funcione correctamente

**✅ Workflow diario con hooks:**

```bash
# 1. Haces cambios en tu código
vim app/api/v1/products.py

# 2. Agregas al staging
git add app/api/v1/products.py

# 3. Haces commit (los hooks se ejecutan AUTOMÁTICAMENTE)
git commit -m "feat: agregar búsqueda de productos"

# Si los hooks detectan problemas:
# - Black/isort los corrigen automáticamente → debes volver a agregar los archivos
# - Flake8/Bandit solo reportan → debes corregir manualmente
```

**🚨 Si un hook falla:**

```bash
# Ejemplo de salida cuando Flake8 encuentra un error
[INFO] Flake8..............................................Failed
- hook id: flake8
- exit code: 1

app/api/v1/products.py:15:1: F401 'random' imported but unused

# Corriges el error (eliminar el import)
# Vuelves a agregar y commit
git add app/api/v1/products.py
git commit -m "feat: agregar búsqueda de productos"
```

**⚙️ Configuración:**

Los hooks están configurados en:

- `backend/.pre-commit-config.yaml` - Qué herramientas ejecutar
- `backend/pyproject.toml` - Configuración de Black, pytest, isort y Bandit

**🔄 Actualizar hooks:**

```bash
cd backend
pre-commit autoupdate  # Actualiza a las últimas versiones
```

**⏭️ Saltarse hooks (solo en emergencias):**

```bash
git commit --no-verify -m "WIP: trabajo en progreso"
```

**⚠️ No se recomienda**: Los hooks existen para prevenir bugs y problemas de seguridad.

**💡 Formato adicional:**

Si quieres formatear archivos sin hacer commit:

```bash
cd backend

# Formatear todos los archivos
pre-commit run --all-files

# Formatear solo archivos específicos
pre-commit run --files app/api/v1/products.py
```

---

## 📚 Documentación

### Documentación del Proyecto

| Documento                                                                          | Descripción                                       | Audiencia |
| ---------------------------------------------------------------------------------- | -------------------------------------------------- | --------- |
| [Estado del Proyecto](docs/development/PROJECT_STATUS.md) | ⭐**Estado y roadmap unificados** - Fuente de verdad | Todos     |
| [docs/README.md](docs/README.md)                                                      | Índice general de documentación                  | Todos     |

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
- `b2b-product-insertion-flow.md` - Flujo B2B de inserción de productos (Mermaid diagram)

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

<!-- DOCSYNC:testing-table -->
| Suite | Tests | Estado |
| -------- | ----- | ------------ |
| Backend | 464 | ✅ Passing |
| Frontend | 130/130 (14 suites) | ✅ Passing |
| E2E | 10 | ✅ Passing |
| Smoke | 8 checks | ✅ Ready |
| **Total** | **594** | ✅ **All green** |

> Coverage backend: **40%** — API endpoints: **52** — TODOs pendientes: **1**
<!-- /DOCSYNC:testing-table -->

Ver más detalles en [tests/README.md](backend/tests/README.md)

### Frontend Tests

```bash
cd frontend
pnpm test  # Ejecutar tests (Jest + RNTL)
```

---

## 🗺️ Roadmap

### 🎯 Vision 2026

Convertir HealthBytes en la **plataforma líder** de e-commerce para personas con restricciones alimentarias en Latinoamérica.

### 📅 Hitos Principales

| Milestone                       | Target       | Status          | Progress |
| ------------------------------- | ------------ | --------------- | -------- |
| 🚀**MVP Launch**          | Abril 2026   | 🟢 En progreso  | 90%      |
| 💳**Payment Integration** | Febrero 2026 | ✅ Completado | 100%     |
| 📱**App Store Release**   | Mayo 2026    | 📋 Planeado     | 0%       |
| 👥**100 Beta Users**      | Abril 2026   | 📋 Planeado     | 0%       |

### 🔴 Prioridades Críticas (P0) - Febrero-Marzo 2026

**Bloqueadores para MVP Launch**:

#### Backend

- [X] **Payment Integration** (Mercado Pago) - ✅ Completado
- [X] **Address CRUD** - ✅ Completado
- [X] **Stock Management** - ✅ Completado (locking atómico)
- [X] **Webhooks Payment Confirmation** - ✅ Completado
- [X] **Order Emails** (Resend) - ✅ Completado (configurar RESEND_API_KEY en prod)
- [X] **AWS Infrastructure** (ECS, ECR, SSM) - ✅ Completado (scripts en infra/)
- [X] **E2E Tests** - ✅ Completado (8 tests)
- [X] **Redis Cache** - ✅ Completado (TTL 5min en products)

#### Frontend

- [X] **Checkout Flow Completo** - ✅ Completado
- [X] **Address Selection UI** - ✅ Completado
- [X] **Payment Method Selection** - ✅ Completado
- [X] **Order Success Screen** - ✅ Completado
- [X] **Onboarding Modal** - ✅ Completado (cableado en _layout.tsx)
- [X] **App Config Fixes** - ✅ Completado (slug, scheme, name, eas.json)

#### DevOps

- [X] **Docker Setup** - ✅ Completado
- [X] **CI/CD Pipeline** (GitHub Actions) - ✅ Completado
- [X] **AWS Scripts** - ✅ Completado (ecr-setup.sh, secrets-setup.sh, ecs-task-definition.json)
- [X] **pnpm version alignment** - ✅ Completado (v10 en CI)

### 🟠 Alta Prioridad (P1) - Abril 2026

**Post-MVP Features para engagement**:

- [ ] Push Notifications para órdenes
- [ ] Sistema de recomendaciones
- [ ] Reviews & Ratings (básico)
- [ ] Deep Linking

### 🟡 Media Prioridad (P2) - Mayo 2026

**Polish & Accesibilidad**:

- [ ] Dark Mode
- [ ] A11y Audit (WCAG 2.1 AA)
- [ ] Performance Optimization
- [ ] Offline Mode (básico)
- [ ] Image CDN

### 📊 Documentación Completa

- **UI/UX Roadmap**: [docs/development/UIUX_ROADMAP.md](docs/development/UIUX_ROADMAP.md) - Mejoras de experiencia de usuario
- **Estado del Proyecto**: [docs/development/PROJECT_STATUS.md](docs/development/PROJECT_STATUS.md) - Estado y roadmap centralizados

### 🚧 Seguimiento Actual

| Línea de trabajo | Ventana | Estado |
| ---------------- | ------- | ------ |
| MVP Launch | Abril 2026 | 🟢 En progreso (90%) |
| App Store Release | Mayo 2026 | 📋 Planeado |
| 100 Beta Users | Abril 2026 | 📋 Planeado |
| Push Notifications | Abril 2026 | 📋 Pendiente |
| Sistema de recomendaciones | Abril 2026 | 📋 Pendiente |
| Reviews & Ratings (básico) | Abril 2026 | 📋 Pendiente |
| Deep Linking | Abril 2026 | 📋 Pendiente |

### ❌ Features Descartadas

Por razones de **ROI vs esfuerzo**, estas features NO están en el roadmap:

- ❌ Historial de búsquedas (bajo impacto)
- ❌ Typeahead de búsqueda (premature optimization)
- ❌ 2FA avanzado (Clerk es suficiente para MVP)
- ❌ Feedback háptico (valor unclear)

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

| Tipo          | Descripción            | Ejemplo                       |
| ------------- | ----------------------- | ----------------------------- |
| `feat/`     | Nueva feature           | `feat/product-filters`      |
| `fix/`      | Bug fix                 | `fix/price-validation`      |
| `docs/`     | Documentación          | `docs/update-readme`        |
| `refactor/` | Mejora de código       | `refactor/cart-store`       |
| `test/`     | Agregar tests           | `test/add-auth-tests`       |
| `chore/`    | Tareas de mantenimiento | `chore/update-dependencies` |
| `perf/`     | Optimización           | `perf/optimize-images`      |

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

## 📊 Estado del Proyecto (Actualizado: 2026-04-06)

- ✅ MVP en cierre técnico con foco en release readiness.
- ✅ 580 tests en verde: 450 backend, 130 frontend, 10 E2E, smoke checks listos.
- ✅ Checkout, pagos, direcciones, CI/CD e infraestructura base ya están resueltos.
- 📋 El siguiente tramo del roadmap se concentra en play store, beta users y features P1 de engagement.
- ⚠️ La referencia canónica de estado y roadmap vive en `docs/development/PROJECT_STATUS.md`.

**Ver**: [Estado Completo](docs/development/PROJECT_STATUS.md)

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
- 🎯 [Roadmap del Proyecto](docs/development/PROJECT_STATUS.md)
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

<!-- DOCSYNC:last-updated -->
_Última actualización: 2026-05-09 — generado automáticamente por docsync_
<!-- /DOCSYNC:last-updated -->

</div>
