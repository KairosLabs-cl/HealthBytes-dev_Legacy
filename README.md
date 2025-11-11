# 🛒💊 HealthBytes – Compras Inteligentes y Seguras (Alimentos y/o Medicamentos)

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![AWS](https://img.shields.io/badge/Amazon_AWS-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)](https://aws.amazon.com/)

> Plataforma enfocada en simplificar y hacer más seguras las decisiones de compra para personas con restricciones de salud.
> Exploramos un modelo híbrido: alimentos especializados y (en evaluación) productos / medicamentos OTC de bienestar. 🌱💊

HealthBytes comenzó centrado en alimentos para usuarios con restricciones (celiaquía, diabetes, alergias). Ahora evaluamos expandir el alcance hacia un catálogo mixto (alimentos funcionales y/o medicamentos OTC). Esta fase es exploratoria: la arquitectura y el dominio se están adaptando para soportar ambos casos, manteniendo criterios de seguridad y escalabilidad.

Estado actual (snapshot):

- ⚙️ API: **FastAPI (Python)** - Migrado de Node.js a FastAPI
- 🗄️ Base de datos: PostgreSQL compartida
- 👤 Autenticación: JWT (compatible con sistema anterior)
- 🐳 Docker: todavía NO en uso estándar (planeado)
- 🔄 Pivot: soporte experimental dual food | med (con modo híbrido)

⚠️ Disclaimer:

- No sustituye consejo médico profesional.
- La clasificación de productos está en evolución; no usar como única fuente clínica.

## Información General

🎯 Objetivos inmediatos:

- Catálogo filtrable (alérgenos, etiquetas dietéticas, clasificación preliminar)
- Extender modelo a soporte dual: alimentos / medicamentos OTC
- Carrito y flujo base de compra (checkout completo en roadmap)
- BackOffice inicial (gestión y normalización de datos)
- Base para recomendación y validaciones automáticas (ingredientes / riesgos)

🧩 Características clave:

- 🩺 Filtros de salud (alérgenos, ingredientes sensibles)
- 🔄 Dominio adaptable (food | med | hybrid)
- 👤 Auth centralizada con Clerk (sesiones seguras, roles)
- 📱 Mobile First (React Native)
- 🧱 Monolito modular evolutivo
- 🗃️ Drizzle: tipado end‑to‑end esquema ↔ dominio
- 🚀 Preparado para extraer servicios (FastAPI / ML / validación)

🛠️ Stack actual:

- Frontend: React Native + TypeScript
- Backend: **FastAPI + Python + SQLAlchemy** (async ORM)
- DB: PostgreSQL (compartida)
- Auth: JWT (HS256) - Tokens compatibles entre servicios
- Infra (futuro): Docker + AWS
- Servicios complementarios: Procesamiento, validaciones, recomendador

## Estructura de Carpetas (resumen, máx. 2 niveles)

```
HealthBytes/
├── Backend/
│   ├── fastapi-service/     # API FastAPI (Python) - ACTUAL
│   └── api/                 # API Node.js (legacy - deprecado)
├── Frontend/
│   └── shop/                # App React Native (pantallas, hooks, componentes)
├── Docs/
│   └── Diagramas/           # Diagramas de arquitectura / dominio
└── README.md
```

Notas:

- Servicios Python futuros: Backend/py-services/
- Posible módulo común: Backend/shared/ (DTOs, esquemas, eventos, utils)

## Configuración de Entorno

### 🔑 Prerrequisitos

- **Python 3.14+** (para API FastAPI)
- PostgreSQL 14+
- Node.js 18+ (para Frontend)
- npm o yarn
- (Roadmap) Docker / Docker Compose

### 🧬 Variables de Entorno

Archivo `.env` (Backend FastAPI):

```env
# --- Base de Datos ---
***REDACTED_DATABASE_URL***

# --- JWT Authentication ---
JWT_SECRET='your-secret'
JWT_ALGORITHM='HS256'
ACCESS_TOKEN_EXPIRE_MINUTES='43200'

# --- Environment ---
ENVIRONMENT='dev'

# --- Stripe (opcional - deshabilitado por ahora) ---
STRIPE_SECRET_KEY='sk_test_xxx'
STRIPE_WEBHOOK_SECRET='whsec_xxx'
```

**Nota:** El archivo `.env.example` está disponible en `Backend/fastapi-service/.env.example` como plantilla.

### 🔌 Conexión a la Base de Datos

La API FastAPI se conecta a una base de datos PostgreSQL compartida con las siguientes tablas:

- `products` - Catálogo de productos
- `users` - Usuarios del sistema
- `orders` - Órdenes de compra
- `order_items` - Items de cada orden

**Configuración:**

1. Crear archivo `.env` en `Backend/fastapi-service/` con el `***REDACTED_DATABASE_URL***
2. Las tablas se crean automáticamente si no existen
3. La conexión usa **psycopg** (driver async para PostgreSQL)

### 🚀 Instalación

Clonar repositorio:

```bash
git clone https://github.com/WindB3NJA/HealthBytes-dev.git
cd HealthBytes-dev
```

**Backend (FastAPI):**

```bash
cd Backend/fastapi-service

# Crear entorno virtual (recomendado)
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
# source venv/bin/activate    # Linux/Mac

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de base de datos
```

**Frontend:**

```bash
cd Frontend/shop
npm install
```

### ▶️ Ejecución

**Backend (API FastAPI):**

Windows (PowerShell):

```powershell
cd Backend\fastapi-service
./start.ps1
```

Unix/macOS (Bash/Zsh):

```bash
cd Backend/fastapi-service
chmod +x ./start.sh   # primera vez
./start.sh
```

Opción 2 (avanzado) – uvicorn directo:

```bash
uvicorn app.main:app --reload --port 3001
```

El servidor estará disponible en:

- API: `http://localhost:3001`
- Documentación interactiva: `http://localhost:3001/docs`

**Frontend (emulador / dispositivo):**

```bash
cd Frontend/shop
npm start
```

### 🧪 API Endpoints Disponibles

**Autenticación:**

- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/login` - Iniciar sesión (retorna JWT)

**Productos:**

- `GET /products` - Listar todos los productos
- `GET /products/{id}` - Obtener producto por ID
- `POST /products` - Crear producto (requiere rol seller)
- `PUT /products/{id}` - Actualizar producto (requiere rol seller)
- `DELETE /products/{id}` - Eliminar producto (requiere rol seller)

**Órdenes:**

- `POST /orders/` - Crear nueva orden (requiere autenticación)
- `GET /orders/` - Listar órdenes (requiere autenticación)
- `GET /orders/{id}` - Obtener detalle de orden (requiere autenticación)
- `PUT /orders/{id}` - Actualizar estado de orden (requiere autenticación)

Ver documentación completa en: `http://localhost:3001/docs`

---

## Contacto 💬

¿Ideas, dudas o colaboración?

- 📧 Email: staff@healthbyes.cl

## Notas Legales (Provisorio) ⚖️

El contenido es informativo y no constituye consejo médico.
La exactitud de composiciones y advertencias está en revisión continua.
Siempre consulta a un profesional de salud ante dudas.

---

<div align="center">

**HealthBytes** – Salud y conveniencia en un mismo lugar 🛒💊❤️
Construyendo un ecosistema seguro para decisiones de compra informadas.

</div>
