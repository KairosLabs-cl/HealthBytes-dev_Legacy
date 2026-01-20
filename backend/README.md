# ⚙️ Backend - HealthBytes

FastAPI + Python + SQLAlchemy REST API para HealthBytes.

## 📋 Tabla de Contenidos

- [Quick Start](#-quick-start)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Stack Tecnológico](#-stack-tecnológico)
- [Endpoints](#-endpoints)
- [Variables de Entorno](#-variables-de-entorno)
- [Base de Datos](#-base-de-datos)
- [Testing](#-testing)
- [Desarrollo](#-desarrollo)
- [Troubleshooting](#-troubleshooting)

---

## 🚀 Quick Start

### Windows (PowerShell)

```powershell
cd backend
.\start.ps1
```

El servidor estará en `http://localhost:3001`

### Linux/macOS (Bash)

```bash
cd backend
chmod +x start.sh
./start.sh
```

### Manual Setup

```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar (Windows)
.\venv\Scripts\Activate.ps1

# Activar (Linux/Mac)
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar .env (ver sección Variables de Entorno)
cp .env.example .env

# Ejecutar
python run_server.py
```

---

## 📂 Estructura del Proyecto

```
backend/
├── app/                          # Código principal de la aplicación
│   ├── api/v1/                   # Endpoints versionados
│   ├── services/                 # Business logic
│   ├── schemas/                  # Pydantic DTOs
│   ├── db/                       # Database models & config
│   ├── core/                     # Security, exceptions
│   ├── middleware/               # Auth middleware
│   ├── config.py                 # Configuración global
│   └── main.py                   # FastAPI app
│
├── tests/                        # Suite de tests
│   ├── test_api/                 # Tests de endpoints
│   ├── test_services/            # Tests de servicios
│   ├── conftest.py               # Fixtures pytest
│   └── README.md                 # Guía de testing
│
├── scripts/                      # Scripts utilitarios
├── migrations/                   # Alembic migrations
├── requirements.txt              # Dependencias
├── requirements-dev.txt          # Dependencias de desarrollo
├── pytest.ini                    # Configuración pytest
├── run_server.py                 # Script para ejecutar servidor
└── README.md                     # Este archivo
```

---

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **FastAPI** | 0.109+ | Framework web moderno |
| **Python** | 3.11+ | Lenguaje principal |
| **SQLAlchemy** | 2.x | ORM async |
| **Pydantic** | 2.x | Validación de datos |
| **PostgreSQL** | 14+ | Base de datos |
| **pytest** | Latest | Testing |

---

## 📡 Endpoints

### Health Check

```http
GET /
GET /health
```

Respuesta: `{"status": "ok"}`

### Autenticación

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
```

### Productos

```http
GET    /api/v1/products           # Listar todos
GET    /api/v1/products/{id}      # Obtener uno
POST   /api/v1/products           # Crear (auth required)
PUT    /api/v1/products/{id}      # Actualizar (auth required)
DELETE /api/v1/products/{id}      # Eliminar (auth required)
```

### Órdenes

```http
GET    /api/v1/orders             # Listar órdenes del usuario
GET    /api/v1/orders/{id}        # Obtener detalles
POST   /api/v1/orders             # Crear nueva orden
PUT    /api/v1/orders/{id}        # Actualizar estado
```

**📖 Ver documentación interactiva:**
- Swagger: http://localhost:3001/docs
- ReDoc: http://localhost:3001/redoc

---

## 🔧 Variables de Entorno

Crear archivo `.env` en `backend/` (ver `.env.example` como plantilla):

```env
# Database
***REDACTED_DATABASE_URL***

# JWT (authentication)
JWT_SECRET="tu-secreto-super-seguro-aqui"
JWT_ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=43200

# Clerk (autenticación externa - opcional)
CLERK_PUBLISHABLE_KEY="pk_test_..."
***REDACTED_CLERK_SECRET_KEY***

# Application
ENVIRONMENT="dev"
DEBUG=True
API_V1_PREFIX="/api/v1"
PROJECT_NAME="HealthBytes API"
```

⚠️ **IMPORTANTE**: Nunca commitear `.env` - está en `.gitignore`

### 🔑 Obtener Keys y Credenciales

Las credenciales y API keys están documentadas en ClickUp:

**📋 [Documento de Keys en ClickUp](https://app.clickup.com/90131597357/v/dc/2ky4621d-2233)**

> **⚠️ Nota:** Debes estar previamente invitado al workspace de ClickUp y haber aceptado la invitación para poder ver este documento.

Si no tienes acceso, contacta al líder del equipo.

---

## 🗄️ Base de Datos

### Requisitos

PostgreSQL 14+ instalado y corriendo

### Configuración Rápida con Docker

```bash
docker run --name healthbytes-postgres \
  -e POSTGRES_USER=healthbytes_user \
  -e POSTGRES_PASSWORD=password123 \
  -e POSTGRES_DB=healthbytes \
  -p 5432:5432 \
  -d postgres:14
```

### Conexión

Update en `.env`:
```env
***REDACTED_DATABASE_URL***
```

### Crear Tablas

Las tablas se crean automáticamente al iniciar el servidor (SQLAlchemy crea).

### Migraciones (Alembic)

```bash
# Ver estado de migraciones
alembic current

# Crear nueva migración
alembic revision --autogenerate -m "Descripción del cambio"

# Aplicar migraciones
alembic upgrade head

# Revertir última migración
alembic downgrade -1
```

---

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
pytest

# Con output detallado
pytest -v

# Tests específicos
pytest tests/test_api/test_products.py -v

# Un test específico
pytest tests/test_api/test_products.py::test_get_products -v

# Con cobertura
pytest --cov=app --cov-report=html
```

### Estado Actual

✅ **8/8 tests pasando**

```
test_auth.py::test_register_user ✅
test_auth.py::test_login_user ✅
test_health.py::test_health_check ✅
test_orders.py::test_get_orders ✅
test_orders.py::test_create_order ✅
test_products.py::test_get_products ✅
test_products.py::test_get_product_by_id ✅
test_products.py::test_create_product ✅
```

### Cobertura

Generar reporte:
```bash
pytest --cov=app --cov-html=htmlcov
```

Abrir `htmlcov/index.html` en navegador

### Escribir Tests Nuevos

1. Crear archivo en `tests/test_api/test_<feature>.py`
2. Importar fixture `client`
3. Escribir test:

```python
def test_my_endpoint(client):
    response = client.get("/api/v1/my-endpoint")
    assert response.status_code == 200
    assert response.json() == {...}
```

4. Ejecutar: `pytest tests/test_api/test_<feature>.py -v`

📖 **Guía completa:** [tests/README.md](tests/README.md)

---

## 👨‍💻 Desarrollo

### Scripts Útiles

```bash
# Format código
black .

# Lint
ruff check .

# Type checking
mypy .

# Ejecutar servidor con reload
python run_server.py
```

### Agregar Dependencia

```bash
pip install <package>
pip freeze > requirements.txt
git add requirements.txt && git commit -m "chore: add <package>"
```

### Flujo de Trabajo - Nueva Feature

1. **Crear schema** en `app/schemas/`
   ```python
   # app/schemas/my_feature.py
   class MyFeatureCreate(BaseModel):
       field: str
   ```

2. **Crear modelo DB** en `app/db/models/`
   ```python
   # app/db/models/my_feature.py
   class MyFeature(Base):
       __tablename__ = "my_features"
       id = Column(Integer, primary_key=True)
   ```

3. **Crear servicio** en `app/services/`
   ```python
   # app/services/my_feature_service.py
   async def get_my_feature(db, id):
       return db.query(MyFeature).filter(...).first()
   ```

4. **Crear endpoint** en `app/api/v1/`
   ```python
   # app/api/v1/my_feature.py
   @router.get("/my-feature/{id}")
   async def get_feature(id: int, db = Depends(...)):
       return await my_feature_service.get_my_feature(db, id)
   ```

5. **Crear tests** en `tests/test_api/` y `tests/test_services/`

6. **Ejecutar tests** `pytest`

7. **Commit**: 
   ```bash
   git commit -m "feat(my-feature): add new endpoint"
   ```

### Convenciones de Código

- **Python**: Seguir PEP 8
- **Type hints**: Obligatorios en funciones públicas
- **Docstrings**: En funciones de negocio
- **Max line length**: 100 caracteres

---

## 🔐 Autenticación

### JWT (Actual)

Token se envía en header:
```http
Authorization: Bearer <token>
```

JWT se valida contra `JWT_SECRET` en `.env`

### Clerk (En transición)

Sistema de autenticación externo para futuro soporte de sesiones más robustas.

---

## 🚨 Troubleshooting

### Error: "Module not found"

Asegúrate de estar en `backend/`:

```bash
cd backend
python run_server.py  # ✅ Correcto
```

### Error: "Port 3001 already in use"

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/macOS
lsof -i :3001
kill -9 <PID>
```

### Error: "Database connection failed"

1. Verifica PostgreSQL está corriendo
2. Verifica `***REDACTED_DATABASE_URL***
3. Verifica credenciales de base de datos

### Error: "JWT signature verification failed"

Verifica que `JWT_SECRET` es consistente entre cliente y servidor

### Los cambios no se reflejan

El servidor tiene `--reload` activado. Si no funciona:
1. Detén el servidor (Ctrl+C)
2. Inicia nuevamente `python run_server.py`

---

## 📖 Documentación Adicional

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [SQLAlchemy ORM](https://docs.sqlalchemy.org/en/20/)
- [Pydantic V2](https://docs.pydantic.dev/latest/)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [Pytest](https://docs.pytest.org/)

---

## 📞 Contacto

Para dudas sobre el backend, abre un [issue](https://github.com/WindB3NJA/HealthBytes-dev/issues) o [discussion](https://github.com/WindB3NJA/HealthBytes-dev/discussions).

---

## 🚀 Inicio Rápido

### Windows (PowerShell)

```powershell
cd Backend
./start.ps1
```

Para volver a instalar dependencias:

```powershell
./start.ps1 -Force
```

Para solo ejecutar sin instalar:

```powershell
./start.ps1 -NoInstall
```

### Linux/macOS (Bash)

```bash
cd Backend
chmod +x start.sh
./start.sh
```

Sin reinstalar dependencias:

```bash
NO_INSTALL=1 ./start.sh
```

### Manual Setup

```bash
# Crear venv
python -m venv .venv

# Activar (Windows PowerShell)
.\.venv\Scripts\Activate.ps1

# Activar (Linux/macOS)
source .venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servidor
python run_server.py
```

---

## 🧪 Testing

### Ejecutar Tests

```bash
# Ejecutar todos los tests
pytest tests/

# Con reporte de cobertura
pytest tests/ --cov=app

# Tests de un archivo específico
pytest tests/test_api/test_auth.py -v

# Test específico
pytest tests/test_api/test_products.py::test_create_product -v

# Ver output en tiempo real (print statements, logs)
pytest tests/ -s

# Output detallado si hay errores
pytest tests/ --tb=short
```

### Setup de Testing

Requiere dependencias de desarrollo:

```bash
pip install -r requirements-dev.txt
```

### Estructura de Tests

```
tests/
├── README.md                    # 📖 Guía detallada de tests (leer primero!)
├── conftest.py                  # Fixtures y configuración de pytest
├── pytest.ini                   # Configuración de pytest
└── test_api/
    ├── test_auth.py            # Tests de autenticación (2)
    ├── test_health.py          # Tests de health check (1)
    ├── test_orders.py          # Tests de órdenes (2)
    └── test_products.py        # Tests de productos (3)
```

### Estado Actual de Tests

✅ **8/8 tests pasando**

- ✅ test_register_user - Registro de usuario
- ✅ test_login_user - Login de usuario
- ✅ test_health_check - Health check endpoint
- ✅ test_get_orders - Obtener órdenes
- ✅ test_create_order - Crear orden
- ✅ test_get_products - Listar productos
- ✅ test_get_product_by_id - Obtener producto por ID
- ✅ test_create_product - Crear producto

### 📖 Para Entender los Tests

**Leer:** [tests/README.md](tests/README.md) - Contiene:

- Explicación detallada de qué prueba cada test
- Cómo interpretar resultados (✅ vs ❌)
- Problemas comunes y soluciones
- Cómo debuggear tests fallidos
- Checklist antes de deployar

### Cobertura de Código

Generar reporte:

```bash
pytest tests/ --cov=app --cov-html=htmlcov
```

Abrir: `htmlcov/index.html` en navegador

**Cobertura por módulo:**

- `app/api/v1/auth.py`: 67% ✅
- `app/api/v1/products.py`: 41%
- `app/api/v1/orders.py`: 19%
- `app/core/security.py`: 71% ✅

### Agregar Nuevo Test

1. Crear archivo `tests/test_api/test_<feature>.py`
2. Importar fixture `client`:

```python
def test_my_feature(client):
    response = client.get("/api/v1/endpoint")
    assert response.status_code == 200
```

3. Ejecutar: `pytest tests/test_api/test_<feature>.py -v`

---

## 📋 API Endpoints

### Health Check

```
GET /
GET /health
```

### Products

```
GET    /api/v1/products           # List all
GET    /api/v1/products/{id}      # Get one
POST   /api/v1/products           # Create (auth required)
PUT    /api/v1/products/{id}      # Update (auth required)
DELETE /api/v1/products/{id}      # Delete (auth required)
```

### Authentication

```
POST /api/v1/auth/register        # Register new user
POST /api/v1/auth/login           # Login
```

### Users

```
GET    /api/v1/users/{id}         # Get user
PUT    /api/v1/users/{id}         # Update user
```

### Orders

```
GET    /api/v1/orders             # List user's orders
GET    /api/v1/orders/{id}        # Get order details
POST   /api/v1/orders             # Create order ⚠️ Validate prices
PUT    /api/v1/orders/{id}        # Update order status
```

### Stripe (Disabled - 503)

```
GET    /api/v1/stripe/keys
POST   /api/v1/stripe/payment-intent
POST   /api/v1/stripe/webhook
```

---

## 🔐 Autenticación

### JWT (Legacy)

Token incluido en header:

```
Authorization: Bearer <token>
```

### Clerk (Nuevo)

Valida contra Clerk JWKS endpoint.

**Migrando:** Soportamos ambos métodos simultáneamente.

---

## 🛠️ Desarrollo

### Code Quality

```bash
# Format code
black .

# Lint
ruff check .

# Type checking
mypy .
```

### Agregar Dependencia

```bash
pip install <package>
pip freeze > requirements.txt
```

### Crear Migration (Alembic)

```bash
alembic revision --autogenerate -m "Descripción del cambio"
alembic upgrade head
```

---

## 📝 Flujo de Trabajo - Agregar Feature

1. **Crear Pydantic schema** en `app/schemas/`
2. **Crear servicio** en `app/services/`
3. **Crear endpoint** en `app/api/v1/`
4. **Crear tests** en `tests/test_api/` y `tests/test_services/`
5. **Ejecutar tests** `pytest`
6. **Commit y push**

---

## 🐛 Problemas Comunes

### Error: "Module not found"

Asegúrate de estar en directorio `/Backend`:

```bash
cd Backend
python run_server.py  # ✅ Correcto
```

No desde `/Backend/app`:

```bash
cd Backend/app
python run_server.py  # ❌ Incorrecto
```

### Port 3001 en uso

```bash
# Windows - find process
netstat -ano | findstr :3001

# Linux/macOS - kill process
lsof -i :3001
kill -9 <PID>
```

### CORS errors

Verificar `app/config.py` - CORS debe permitir frontend origen:

```python
"http://localhost:8081"  # Expo dev
"http://localhost:3000"  # Web dev
```

### JWT signature error

Verifica que `JWT_SECRET` en `.env` es consistente con el token que envía el cliente.

---

## 📚 Referencias

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [SQLAlchemy](https://docs.sqlalchemy.org/)
- [Pydantic](https://docs.pydantic.dev/)
- [Pytest](https://docs.pytest.org/)
